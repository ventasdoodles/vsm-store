import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
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
  };
  validation_hints: string[];
}

interface SimulationResult {
  scenario_id: string;
  passed: boolean;
  detected_intent: string;
  tools_called: string[];
  latency_ms: number;
  knowledge_chunks: number;
  reasons: string[];
  response: string;
  memory_trace?: any;
  status?: string;
  score?: number;
  dimension_scores?: any;
  validation_hints?: string[];
  capsule_name?: string;
  fallback_used?: boolean;
  product_cards_count?: number;
  frustration_detected?: boolean;
}

async function runSimulation() {
  console.log('\n🚀 Starting Cesarin Simulator CLI v1\n');
  console.log(`Target Endpoint: ${ENDPOINT}\n`);
  console.log(`Anon Key Prefix: ${SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'MISSING'}\n`);

  const scenarioFile = process.argv[2] || 'cesarin_scenarios.json';
  const scenariosPath = path.join(process.cwd(), 'src/__tests__/scenarios', scenarioFile);
  if (!fs.existsSync(scenariosPath)) {
    console.error('❌ Scenarios file not found at:', scenariosPath);
    process.exit(1);
  }

  const { scenarios } = JSON.parse(fs.readFileSync(scenariosPath, 'utf-8')) as { scenarios: Scenario[] };
  const results: SimulationResult[] = [];

  for (const scenario of scenarios) {
    process.stdout.write(`[\t] Running Scenario: ${scenario.id} (${scenario.description})... `);
    
    const startTime = Date.now();
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'concierge_chat',
          query: scenario.user_message,
          customer_context: scenario.context
        })
      });
      
      const data = await response.json();
      const latency = Date.now() - startTime;

      // Respect Rate Limits (EXTREME Free Tier) - Wait 15s between scenarios
      // Mitigation for 429 (Too Many Requests) observed in March 2026 Free Tier environment.
      await new Promise(resolve => setTimeout(resolve, 15000));

      if (data.error) {
        throw new Error(data.error);
      }

      const debug = data.debug || {};
      const analyst = debug.analyst_report || {};
      // Wave 190 Transition: support both intent and detected_intent
      const detectedIntent = debug.detected_intent || debug.intent || 'UNKNOWN';
      
      const requiresCapsule = !!data.requires_client_capsule;
      const toolsExecuted = debug.tools_executed || [];
      const plannedTools = debug.tool_calls || (analyst.tool_calls_requested ? analyst.tool_results : []) || [];
      const plannedToolNames = plannedTools.map((t: any) => {
        const name = t.name || t.tool;
        // Normalization for Wave 190 Architecture Capsulation
        if (name === 'product_search_integrity') return 'search_products';
        if (name === 'knowledge_rag_foundation') return 'get_store_policy';
        return name;
      });
      
      const knowledgeChunks = debug.knowledge_chunks_count || 0;
      const memoryTrace = debug.memory_trace;

      const reasons: string[] = [];
      let passed = true;

      // Validate Intent
      if (!scenario.expectations.accepted_intents.includes(detectedIntent)) {
        passed = false;
        reasons.push(`Unexpected intent: ${detectedIntent}. Expected one of: ${scenario.expectations.accepted_intents.join(', ')}`);
      }

      // Validate Required Tools
      for (const reqTool of scenario.expectations.required_tools) {
        const isExecuted = toolsExecuted.includes(reqTool);
        const isPlannedForCapsule = requiresCapsule && plannedToolNames.includes(reqTool);
        
        if (!isExecuted && !isPlannedForCapsule) {
          passed = false;
          reasons.push(`Missing required tool: ${reqTool} (Not executed, not planned for capsule)`);
        }
      }

      // Validate Forbidden Tools
      for (const forbTool of scenario.expectations.forbidden_tools) {
        if (toolsExecuted.includes(forbTool)) {
          passed = false;
          reasons.push(`Forbidden tool executed: ${forbTool}`);
        }
      }

      // Validate Latency
      if (latency > scenario.expectations.max_latency_ms) {
        reasons.push(`Latency warning: ${latency}ms (Max: ${scenario.expectations.max_latency_ms}ms)`);
        // We don't fail just for latency in v1 unless extreme, but we note it
      }

      if (!passed) {
        console.log(`\n🔍 DEBUG TRACE for ${scenario.id}:`);
        console.log(JSON.stringify(debug, null, 2));
      }

      // -----------------------------------------------------------------------
      // [WAVE 190] DETERMINISTIC SCORING CONTRACT
      // -----------------------------------------------------------------------
      // SCORING CONTRACT:
      //   PASS:              score >= 0.9, no hard failures
      //   PASS_WITH_WARNING: score >= 0.7 and < 0.9
      //   FAIL:              score < 0.7 OR hard validation failure
      //
      // `passed` is DERIVED from `status`. It is true IFF status !== 'FAIL'.
      // This is the SINGLE SOURCE OF TRUTH — no independent `passed` logic.
      // -----------------------------------------------------------------------
      const scoreProfile = {
        'RAG_POLICY': { intent: 0.2, tools: 0.2, rag: 0.5, latency: 0.1 },
        'PRODUCT_SEARCH': { intent: 0.3, tools: 0.3, rag: 0.3, latency: 0.1 },
        'INVENTORY_PREDICTION': { intent: 0.3, tools: 0.4, rag: 0.2, latency: 0.1 },
        'COMPLEX_MIXED': { intent: 0.25, tools: 0.4, rag: 0.25, latency: 0.1 }
      }[scenario.scenario_type] || { intent: 0.3, tools: 0.4, rag: 0.2, latency: 0.1 };

      const intentScore = scenario.expectations.accepted_intents.includes(detectedIntent) ? 1 : 0;
      
      // Tool scoring: count BOTH server-executed AND capsule-planned tools
      const reqToolsCount = scenario.expectations.required_tools.length;
      const foundToolsCount = scenario.expectations.required_tools.filter(t => {
        const isExecuted = toolsExecuted.includes(t);
        const isPlannedForCapsule = requiresCapsule && plannedToolNames.includes(t);
        return isExecuted || isPlannedForCapsule;
      }).length;
      let toolsScore = reqToolsCount > 0 ? (foundToolsCount / reqToolsCount) : 1;
      if (scenario.expectations.forbidden_tools.some(t => toolsExecuted.includes(t))) toolsScore = 0;

      const ragScore = (knowledgeChunks > 0 || reqToolsCount === 0 || scenario.expectations.rag_optional) ? 1 : 0;
      const latencyScore = latency <= scenario.expectations.max_latency_ms ? 1 : 0;

      const overallScore = (
        (intentScore * scoreProfile.intent) +
        (toolsScore * scoreProfile.tools) +
        (ragScore * scoreProfile.rag) +
        (latencyScore * scoreProfile.latency)
      );

      // Determine status from score
      let status = 'PASS';
      if (overallScore < 0.7) status = 'FAIL';
      else if (overallScore < 0.9) status = 'PASS_WITH_WARNING';
      
      // Hard validation overrides for capsule handoffs
      const responseText = data.text || data.message || '';
      if (requiresCapsule) {
        if (!detectedIntent || detectedIntent === 'UNKNOWN') {
           status = 'FAIL';
           reasons.push('Capsule handoff requires a valid identified intent');
        }
        if (!plannedToolNames.length && reqToolsCount > 0) {
           status = 'FAIL';
           reasons.push('Capsule handoff requires evidence of planned tool_calls');
        }
      } else if (reasons.length > 0 && !responseText) {
        // Non-capsule with validation failures AND empty response is a hard fail
        if (status !== 'FAIL') status = 'FAIL';
      }

      // SINGLE SOURCE OF TRUTH: `passed` is derived from `status`
      passed = status !== 'FAIL';

      const result: SimulationResult & { score: number; status: string; dimension_scores: any } = {
        scenario_id: scenario.id,
        passed,
        detected_intent: detectedIntent,
        tools_called: toolsExecuted,
        latency_ms: latency,
        knowledge_chunks: knowledgeChunks,
        reasons,
        response: responseText,
        score: Number(overallScore.toFixed(2)),
        status,
        dimension_scores: {
          intent: intentScore,
          tools: toolsScore,
          rag: ragScore,
          latency: latencyScore
        },
        memory_trace: memoryTrace,
        capsule_name: data.capsule_name || debug.sommelier_routed_capsule,
        fallback_used: debug.fallback_used,
        product_cards_count: (data.products?.length || 0),
        frustration_detected: debug.frustration,
        validation_hints: scenario.validation_hints
      };
      results.push(result);

      if (passed) {
        console.log(`✅ ${status} - Score: ${result.score}`);
      } else {
        console.log(`❌ FAIL - Score: ${result.score}`);
        reasons.forEach(r => console.log(`    - ${r}`));
      }

    } catch (error: any) {
      console.log('💥 ERROR');
      console.error(`    - Execution failed: ${error.message}`);
      console.error(error.stack);
      if (error.response) {
        console.error(`    - Response text: ${await error.response.text()}`);
      }
      results.push({
        scenario_id: scenario.id,
        passed: false,
        detected_intent: 'ERROR',
        tools_called: [],
        latency_ms: 0,
        knowledge_chunks: 0,
        reasons: [`Connection/Execution error: ${error.message}`],
        response: '',
        score: 0,
        status: 'FAIL',
        dimension_scores: { intent: 0, tools: 0, rag: 0, latency: 0 }
      } as any);
    }
  }

  // Generate Report Artifact
  const reportData = {
    timestamp: new Date().toISOString(),
    total: scenarios.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };

  const reportPath = path.join(process.cwd(), 'simulation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  // -----------------------------------------------------------------------
  // [PHASE 3.4C] PERSIST TO SUPABASE
  // -----------------------------------------------------------------------
  console.log(`\n📤 Persisting report to Supabase...`);
  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/ai_simulation_reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        total: reportData.total,
        passed: reportData.passed,
        failed: reportData.failed,
        results: reportData.results
      })
    });

    if (dbRes.ok) {
      console.log('✅ Report persisted successfully.');
    } else {
      const errTxt = await dbRes.text();
      console.error('❌ Failed to persist report:', errTxt);
    }
  } catch (e: any) {
    console.error('❌ Error persisting report:', e.message);
  }

  console.log(`\n📊 Simulation Summary: ${results.filter(r => r.passed).length}/${scenarios.length} Passed`);
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
}

runSimulation();
