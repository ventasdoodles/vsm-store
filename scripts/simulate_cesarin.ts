import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/customer-intelligence`;

interface Scenario {
  id: string;
  scenario_type: string;
  description: string;
  user_message: string;
  context: any;
  expectations: {
    accepted_intents: string[];
    required_tools: string[];
    forbidden_tools: string[];
    max_latency_ms: number;
    rag_optional?: boolean;
    required_assertions?: string[];
  };
  validation_hints: string[];
}

type SimulationStatus = 'PASS' | 'DEGRADED' | 'FAIL' | 'BLOCKED';

interface SimulationResult {
  scenario_id: string;
  status: SimulationStatus;
  passed: boolean;
  detected_intent: string;
  tools_called: string[];
  latency_ms: number;
  reasons: string[];
  response: string;
  capsule_name?: string;
  fallback_used?: boolean;
}

async function createAuthUser(): Promise<{ accessToken: string; userId: string }> {
  console.log('\n🔐 Provisioning Live Authenticated Test User...');
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

  const testEmail = `eval-auto-${Date.now()}@vsm-store.test`;
  const testPassword = 'SimulationPassword123!';

  const { data: userObj, error: createErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });
  
  if (createErr || !userObj.user) {
    throw new Error(`Failed to create test user: ${createErr?.message}`);
  }

  const { data: sessionObj, error: signInErr } = await authClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (signInErr || !sessionObj.session) {
    await adminClient.auth.admin.deleteUser(userObj.user.id);
    throw new Error(`Failed to authenticate test user: ${signInErr?.message}`);
  }

  console.log(`✅ Authenticated with token for ${testEmail}`);
  return { accessToken: sessionObj.session.access_token, userId: userObj.user.id };
}

async function cleanupUser(userId: string) {
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  await adminClient.auth.admin.deleteUser(userId);
  console.log(`\n🧹 Cleaned up target test user (${userId}).`);
}

async function runSimulation() {
  console.log('\n🚀 Starting Cesarin Acceptance Harness (Phase 1 Canonical)\n');
  console.log(`Target Endpoint: ${ENDPOINT}`);

  if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing required Supabase keys - Required for authenticated evaluations.');
    process.exitCode = 1;
    return;
  }

  const scenarioFile = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'cesarin_scenarios.json';
  const scenariosPath = path.join(process.cwd(), 'src/__tests__/scenarios', scenarioFile);
  if (!fs.existsSync(scenariosPath)) {
    console.error(`❌ Scenarios file not found at: ${scenariosPath}`);
    process.exitCode = 1;
    return;
  }

  const { scenarios } = JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'));
  const results = [];

  const counts = { PASS: 0, DEGRADED: 0, FAIL: 0, BLOCKED: 0 };
  let testUser: { accessToken: string; userId: string } | null = null;

  try {
    testUser = await createAuthUser();

    console.log('\n======================================================');
    console.log('                 EVALUATING SCENARIOS                 ');
    console.log('======================================================\n');

    for (const scenario of scenarios) {
      process.stdout.write(`⏳ [${scenario.id}] ${scenario.description.substring(0, 40)}... `);

      const startTime = Date.now();
      let status: SimulationStatus = 'PASS';
      let reasons: string[] = [];
      let latency = 0;
      
      let detectedIntent = 'UNKNOWN';
      let toolsExecuted: string[] = [];
      let plannedToolNames: string[] = [];
      let responseText = '';
      let capsuleName = undefined;
      let fallbackUsed = false;

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testUser.accessToken}`
          },
          body: JSON.stringify({
            action: 'concierge_chat',
            query: scenario.user_message,
            customer_context: { ...scenario.context, customer_id: testUser.userId }
          })
        });

        latency = Date.now() - startTime;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const debug = data.debug || {};
        const analyst = debug.analyst_report || {};
        
        detectedIntent = debug.detected_intent || debug.intent || 'UNKNOWN';
        const requiresCapsule = !!data.requires_client_capsule;
        toolsExecuted = (debug.tools_executed || []).map((t: string) => {
          if (t === 'storefront_inventory_outlook') return 'get_inventory_outlook';
          return t;
        });

        const plannedTools = debug.tool_calls || (analyst.tool_calls_requested ? analyst.tool_results : []) || [];
        
        plannedToolNames = plannedTools.map((t: any) => {
          const name = t.name || t.tool;
          if (name === 'product_search_integrity') return 'search_products';
          if (name === 'knowledge_rag_foundation') return 'get_store_policy';
          if (name === 'storefront_inventory_outlook') return 'get_inventory_outlook';
          return name;
        });

        responseText = data.text || data.message || '';
        capsuleName = data.capsule_name || debug.sommelier_routed_capsule;
        fallbackUsed = !!debug.fallback_used;

        const expectedIntents = scenario.expectations?.accepted_intents || [];
        const reqTools = scenario.expectations?.required_tools || [];
        const forbTools = scenario.expectations?.forbidden_tools || [];
        const maxLatencyMs = scenario.expectations?.max_latency_ms || 10000;

        const isExactIntent = expectedIntents.length === 0 || expectedIntents.includes(detectedIntent);
        
        const foundToolsCount = reqTools.filter((t: string) => toolsExecuted.includes(t) || (requiresCapsule && plannedToolNames.includes(t))).length;
        const missingTools = reqTools.length > foundToolsCount;
        const hasForbiddenTools = forbTools.some((t: string) => toolsExecuted.includes(t));

        if (hasForbiddenTools) {
          status = 'FAIL';
          reasons.push(`Forbidden tool executed: ${toolsExecuted.join(', ')}`);
        } else if (missingTools) {
          status = 'FAIL';
          reasons.push(`Missing required tools. Expected: ${reqTools.join(', ')}`);
        } else if (requiresCapsule && !plannedToolNames.length && reqTools.length > 0) {
          status = 'FAIL';
          reasons.push(`Capsule contract violation: Required tool planned but absent.`);
        }

        if (status !== 'FAIL' && !isExactIntent) {
            status = 'DEGRADED';
            reasons.push(`Soft drift: Expected ${expectedIntents.join('/')} but got ${detectedIntent}`);
        }

        if (status !== 'FAIL') {
          if (latency > maxLatencyMs + 4000) {
            status = 'FAIL';
            reasons.push(`Latency Hard Violation: ${latency}ms > ${maxLatencyMs + 4000}ms`);
          } else if (latency > maxLatencyMs) {
            status = 'DEGRADED';
            reasons.push(`Latency Degraded: ${latency}ms > ${maxLatencyMs}ms limit`);
          }
        }

      } catch (e: any) {
        latency = Date.now() - startTime;
        const msg = (e.message || '').toLowerCase();
        
        if (msg.includes('429') || msg.includes('timeout') || msg.includes('500') || msg.includes('network') || msg.includes('fetch')) {
          status = 'BLOCKED';
          reasons.push(`Infrastructure Blocked: ${e.message}`);
        } else {
          status = 'FAIL';
          reasons.push(`Execution Error: ${e.message}`);
        }
      }

      counts[status]++;
      const statusStyle = (status === 'PASS' ? '✅ PASS    ' : status === 'DEGRADED' ? '〽️ DEGRADED' : status === 'FAIL' ? '❌ FAIL    ' : '🛑 BLOCKED ');

      process.stdout.write(`\r${statusStyle} | ${latency}ms | [${scenario.id}] ${scenario.description.substring(0, 40)}...\n`);
      if (reasons.length > 0) reasons.forEach(r => console.log(`     ↳ ${r}`));

      results.push({
        scenario_id: scenario.id,
        status,
        passed: status === 'PASS' || status === 'DEGRADED',
        detected_intent: detectedIntent,
        tools_called: Array.from(new Set([...toolsExecuted, ...plannedToolNames])),
        latency_ms: latency,
        reasons,
        response: responseText,
        capsule_name: capsuleName,
        fallback_used: fallbackUsed
      });

        await new Promise(r => setTimeout(r, 62000));
    }

    console.log('\n======================================================');
    console.log('                 ACCEPTANCE GATES                     ');
    console.log('======================================================');
    console.log(`✅ PASS     : ${counts.PASS}`);
    console.log(`〽️ DEGRADED : ${counts.DEGRADED}`);
    console.log(`❌ FAIL     : ${counts.FAIL}`);
    console.log(`🛑 BLOCKED  : ${counts.BLOCKED}`);
    console.log('======================================================\n');

    const reportData = {
      scenario_file_name: scenarioFile,
      threshold_pack: 'phase-1-strict',
      timestamp: new Date().toISOString(),
      overall_counts: {
        total: scenarios.length,
        ...counts
      },
      results
    };

    const reportPath = path.join(process.cwd(), 'simulation_report.json');        
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Canonical Baseline saved to: ${reportPath}`);

    if (counts.FAIL > 0 || counts.BLOCKED > 0) {
      process.exitCode = 1;
    }
  } catch(error: any) {
     console.error('❌ Critical Harness Failure:', error.message);
     process.exitCode = 1;
  } finally {
    if (testUser) {
      console.log('\n======================================================');
      await cleanupUser(testUser.userId);
    }
  }
}

runSimulation();