import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/customer-intelligence`;

interface Scenario {
  id: string;
  category: string;
  scenario_type: string;
  description: string;
  user_message: string;
  history?: { role: string; content: string }[];
  context: any;
  expectations: {
    accepted_intents: string[];
    required_tools: string[];
    forbidden_tools: string[];
    max_latency_ms: number;
    required_assertions?: string[];
    forbidden_assertions?: string[];
  };
}

interface TestResult {
  scenario_id: string;
  category: string;
  status: 'PASS' | 'WEAK PASS' | 'FAIL';
  score: number;
  latency_ms: number;
  detected_intent: string;
  reasons: string[];
  response: string;
}

async function runQASuite() {
  console.log('\n🛡️  CESARIN AUTOMATED QA TEST SUITE v1\n');
  const scenarioFile = process.argv[2] || 'cesarin_qa_suite.json';
  const scenariosPath = path.join(process.cwd(), 'src/__tests__/scenarios', scenarioFile);

  if (!fs.existsSync(scenariosPath)) {
    console.error('❌ Scenarios file not found:', scenariosPath);
    process.exit(1);
  }

  const { scenarios } = JSON.parse(fs.readFileSync(scenariosPath, 'utf-8'));
  const results: TestResult[] = [];

  for (const scenario of scenarios) {
    process.stdout.write(`CASE [${scenario.id}] ${scenario.category}... `);
    
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
          history: scenario.history || [],
          customer_context: scenario.context
        })
      });

      const data = await response.json();
      const latency = Date.now() - startTime;
      const debug = data.debug || {};
      const detectedIntent = debug.detected_intent || debug.intent || 'UNKNOWN';
      const responseText = data.text || data.message || '';
      const reasons: string[] = [];

      // ─── Behavioral Scoring ───
      let intentScore = scenario.expectations.accepted_intents.includes(detectedIntent) ? 1 : 0;
      if (!intentScore) reasons.push(`Mismatched intent: ${detectedIntent}`);

      let assertionScore = 1;
      if (scenario.expectations.required_assertions) {
        const found = scenario.expectations.required_assertions.filter((a: string) => 
          responseText.toLowerCase().includes(a.toLowerCase())
        );
        assertionScore = found.length / scenario.expectations.required_assertions.length;
        if (assertionScore < 1) {
            const missing = scenario.expectations.required_assertions.filter((a: string) => !found.includes(a));
            reasons.push(`Missing required assertions: ${missing.join(', ')}`);
        }
      }

      if (scenario.expectations.forbidden_assertions) {
        const foundForbidden = scenario.expectations.forbidden_assertions.filter((a: string) => 
          responseText.toLowerCase().includes(a.toLowerCase())
        );
        if (foundForbidden.length > 0) {
          assertionScore = 0;
          reasons.push(`Contained forbidden assertions: ${foundForbidden.join(', ')}`);
        }
      }

      const overallScore = (intentScore * 0.4) + (assertionScore * 0.6);
      
      let status: 'PASS' | 'WEAK PASS' | 'FAIL' = 'PASS';
      if (overallScore < 0.6) status = 'FAIL';
      else if (overallScore < 0.9 || latency > scenario.expectations.max_latency_ms) status = 'WEAK PASS';

      if (latency > scenario.expectations.max_latency_ms) {
          reasons.push(`Latency threshold exceeded: ${latency}ms > ${scenario.expectations.max_latency_ms}ms`);
      }

      results.push({
        scenario_id: scenario.id,
        category: scenario.category,
        status,
        score: overallScore,
        latency_ms: latency,
        detected_intent: detectedIntent,
        reasons,
        response: responseText
      });

      console.log(status === 'PASS' ? '✅ PASS' : status === 'WEAK PASS' ? '⚠️  WEAK' : '❌ FAIL');

      // Rate limiting mitigation (10s delay between tests)
      await new Promise(r => setTimeout(r, 10000));

    } catch (e: any) {
      console.log('💥 ERROR');
      results.push({
        scenario_id: scenario.id,
        category: scenario.category,
        status: 'FAIL',
        score: 0,
        latency_ms: 0,
        detected_intent: 'ERROR',
        reasons: [e.message],
        response: ''
      });
    }
  }

  // ─── Summary Report ───
  const summary = {
    total: results.length,
    passes: results.filter(r => r.status === 'PASS').length,
    weak: results.filter(r => r.status === 'WEAK PASS').length,
    fails: results.filter(r => r.status === 'FAIL').length,
  };

  const categories = Array.from(new Set(results.map(r => r.category)));
  
  console.log('\n📊 AGGREGATE SUMMARY:');
  console.log(`PASS: ${summary.passes} | WEAK: ${summary.weak} | FAIL: ${summary.fails}`);
  console.log('──────────────────────────────');
  
  categories.forEach(cat => {
      const catResults = results.filter(r => r.category === cat);
      const catPass = catResults.every(r => r.status === 'PASS');
      console.log(`${catPass ? '✅' : '❌'} ${cat.padEnd(30)} | ${catResults[0].status}`);
  });

  const reportPath = path.join(process.cwd(), 'qa_suite_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date(), summary, results }, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}\n`);
}

runQASuite();
