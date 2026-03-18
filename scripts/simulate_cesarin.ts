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
      const toolResults = analyst.tool_results || [];
      const toolsExecuted = debug.tools_executed || [];
      const detectedIntent = debug.detected_intent;
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

      // -----------------------------------------------------------------------
      // [PHASE 3.4C] DETERMINISTIC SCORING LOGIC
      // -----------------------------------------------------------------------
      const scoreProfile = {
        'RAG_POLICY': { intent: 0.2, tools: 0.2, rag: 0.5, latency: 0.1 },
        'PRODUCT_SEARCH': { intent: 0.3, tools: 0.3, rag: 0.3, latency: 0.1 },
        'INVENTORY_PREDICTION': { intent: 0.3, tools: 0.4, rag: 0.2, latency: 0.1 },
        'COMPLEX_MIXED': { intent: 0.25, tools: 0.4, rag: 0.25, latency: 0.1 }
      }[scenario.scenario_type] || { intent: 0.3, tools: 0.4, rag: 0.2, latency: 0.1 };

      let intentScore = scenario.expectations.accepted_intents.includes(detectedIntent) ? 1 : 0;
      
      const reqToolsCount = scenario.expectations.required_tools.length;
      const foundToolsCount = scenario.expectations.required_tools.filter(t => toolsExecuted.includes(t)).length;
      let toolsScore = reqToolsCount > 0 ? (foundToolsCount / reqToolsCount) : 1;
      // Penalize for forbidden tools
      if (scenario.expectations.forbidden_tools.some(t => toolsExecuted.includes(t))) toolsScore = 0;

      const ragScore = (knowledgeChunks > 0 || scenario.expectations.required_tools.length === 0 || scenario.expectations.rag_optional) ? 1 : 0;
      const latencyScore = latency <= scenario.expectations.max_latency_ms ? 1 : 0;

      const overallScore = (
        (intentScore * scoreProfile.intent) +
        (toolsScore * scoreProfile.tools) +
        (ragScore * scoreProfile.rag) +
        (latencyScore * scoreProfile.latency)
      );

      let status = 'PASS';
      if (overallScore < 0.7) status = 'FAIL';
      else if (overallScore < 0.9) status = 'PASS_WITH_WARNING';
      if (!passed) status = 'FAIL'; // Hard fail if requirements aren't met

      const result: SimulationResult & { score: number; status: string; dimension_scores: any } = {
        scenario_id: scenario.id,
        passed,
        detected_intent: detectedIntent,
        tools_called: toolsExecuted,
        latency_ms: latency,
        knowledge_chunks: knowledgeChunks,
        reasons,
        response: data.text || data.message || '',
        score: Number(overallScore.toFixed(2)),
        status,
        dimension_scores: {
          intent: intentScore,
          tools: toolsScore,
          rag: ragScore,
          latency: latencyScore
        },
        memory_trace: memoryTrace,
        validation_hints: scenario.validation_hints
      };
      results.push(result);

      if (passed) {
        console.log(`✅ PASS (${status}) - Score: ${result.score}`);
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
