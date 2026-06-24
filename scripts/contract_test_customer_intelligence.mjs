import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// ==========================================
// 1. IMPORT/DEFINE THE CONTRACT
// ==========================================
const CustomerIntelligenceResponseSchema = z.object({
  response: z.string(),
  metadata: z.record(z.any()).optional(),
  error: z.string().optional()
});

const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!ANON_KEY) {
  console.error("❌ No VITE_SUPABASE_ANON_KEY found in .env.local");
  process.exit(1);
}

async function runContractTest() {
  console.log("==================================================");
  console.log("🛡️ AI EDGE FUNCTION - CONSUMER-DRIVEN CONTRACT TEST");
  console.log("==================================================");

  console.log("1. Validating Backend Response Contract (stream: false)...");

  // A payload that perfectly matches CustomerIntelligenceRequestSchema
  const validRequest = {
    action: 'concierge_chat',
    message: 'Hola, dame una recomendación de equipos',
    history: [],
    stream: false, // Force JSON response to validate the pure Contract
    isTest: true
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/customer-intelligence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(validRequest)
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Edge Function falló: ${res.status} - ${text}`);
    }

    const rawJson = await res.json();
    console.log("📥 Raw JSON Response:", JSON.stringify(rawJson, null, 2).substring(0, 300) + '...');

    // === CONTRACT ENFORCEMENT ===
    console.log("🔍 Running Zod Contract Validation...");
    const validatedData = CustomerIntelligenceResponseSchema.parse(rawJson);
    
    console.log("✅ CONTRACT MET: The Backend honored the Consumer-Driven Contract.");
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ CONTRACT BROKEN! The Edge Function violated the expected shape:");
      console.error(error.issues);
    } else {
      console.error("❌ UNEXPECTED ERROR:", error.message);
    }
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("🏆 ALL CONTRACT TESTS PASSED.");
  console.log("==================================================");
}

runContractTest();
