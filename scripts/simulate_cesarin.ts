import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
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
}

async function runSimulation() {
  console.log('\n🚀 Starting Cesarin Simulator CLI v1\n');
  console.log(`Target Endpoint: ${ENDPOINT}\n`);

  const scenariosPath = path.join(process.cwd(), 'src/__tests__/scenarios/cesarin_scenarios.json');
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
      
      // Respect Rate Limits (EXTREME Free Tier) - Wait 15s between scenarios
      // Mitigation for 429 (Too Many Requests) observed in March 2026 Free Tier environment.
      await new Promise(resolve => setTimeout(resolve, 15000));

      const latency = Date.now() - startTime;
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const debug = data.debug || {};
      const analyst = debug.analyst_report || {};
      const toolResults = analyst.tool_results || [];
      const toolsExecuted = debug.tools_executed || [];
      const detectedIntent = debug.detected_intent;
      const knowledgeChunks = debug.knowledge_chunks_count || 0;

      const reasons: string[] = [];
      let passed = true;

      // Validate Intent
      if (!scenario.expectations.accepted_intents.includes(detectedIntent)) {
        passed = false;
        reasons.push(`Unexpected intent: ${detectedIntent}. Expected one of: ${scenario.expectations.accepted_intents.join(', ')}`);
      }

      // Validate Required Tools
      for (const reqTool of scenario.expectations.required_tools) {
        if (!toolsExecuted.includes(reqTool)) {
          passed = false;
          reasons.push(`Missing required tool: ${reqTool}`);
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

      const result: SimulationResult = {
        scenario_id: scenario.id,
        passed,
        detected_intent: detectedIntent,
        tools_called: toolsExecuted,
        latency_ms: latency,
        knowledge_chunks: knowledgeChunks,
        reasons,
        response: data.answer?.slice(0, 100) + (data.answer?.length > 100 ? '...' : '')
      };
      results.push(result);

      if (passed) {
        console.log('✅ PASS');
      } else {
        console.log('❌ FAIL');
        reasons.forEach(r => console.log(`    - ${r}`));
      }

    } catch (error: any) {
      console.log('💥 ERROR');
      console.error(`    - Execution failed: ${error.message}`);
      results.push({
        scenario_id: scenario.id,
        passed: false,
        detected_intent: 'ERROR',
        tools_called: [],
        latency_ms: 0,
        knowledge_chunks: 0,
        reasons: [`Connection/Execution error: ${error.message}`],
        response: ''
      });
    }
  }

  // Generate Report Artifact
  const reportPath = path.join(process.cwd(), 'simulation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: scenarios.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  }, null, 2));

  console.log(`\n📊 Simulation Summary: ${results.filter(r => r.passed).length}/${scenarios.length} Passed`);
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
}

runSimulation();
