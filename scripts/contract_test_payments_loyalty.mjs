import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// ==========================================
// CONTRACTS REPLICA FOR TEST RUNNER
// ==========================================
const CreatePaymentRequestSchema = z.object({
  body: z.object({
    order_id: z.string().uuid("order_id must be a valid UUID")
  })
});

const LoyaltyTransactionTypeSchema = z.enum(['earned', 'spent', 'expired', 'adjustment']);

const ProcessLoyaltyPointsRequestSchema = z.object({
  p_user_id: z.string().uuid("p_user_id must be a valid UUID"),
  p_amount: z.number().int("p_amount must be an integer"),
  p_type: LoyaltyTransactionTypeSchema,
  p_description: z.string().min(1, "Description cannot be empty"),
  p_order_id: z.string().uuid("p_order_id must be a UUID").nullable()
});

async function runContractTests() {
  console.log("==================================================");
  console.log("💳 PAYMENTS & LOYALTY CONTRACT TESTS");
  console.log("==================================================");

  let passed = true;

  console.log("1. Testing Mercado Pago Payment Contract...");
  try {
    CreatePaymentRequestSchema.parse({
      body: { order_id: "not-a-uuid" } // Invalid intentionally
    });
    console.error("❌ FAILURE: Contract allowed an invalid order_id");
    passed = false;
  } catch (err) {
    console.log("✅ SUCCESS: Contract successfully blocked invalid Payment payload:", err.issues[0].message);
  }

  console.log("\n2. Testing Loyalty (V-Coins) Contract...");
  try {
    ProcessLoyaltyPointsRequestSchema.parse({
      p_user_id: "123", // not a UUID
      p_amount: "50", // not a number
      p_type: "stolen", // not an enum match
      p_description: "", // empty
      p_order_id: null
    });
    console.error("❌ FAILURE: Contract allowed an invalid Loyalty payload");
    passed = false;
  } catch (err) {
    console.log("✅ SUCCESS: Contract successfully blocked invalid Loyalty payload.");
    console.log("   Caught issues:", err.issues.map(i => i.message).join(" | "));
  }

  const validPayload = {
    p_user_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    p_amount: 50,
    p_type: "earned",
    p_description: "Test points",
    p_order_id: null
  };

  try {
    ProcessLoyaltyPointsRequestSchema.parse(validPayload);
    console.log("✅ SUCCESS: Contract allowed a perfectly valid Loyalty payload.");
  } catch (err) {
    console.error("❌ FAILURE: Contract blocked a valid payload!", err);
    passed = false;
  }

  console.log("\n==================================================");
  if (passed) {
    console.log("🏆 ALL CONTRACT TESTS PASSED.");
    process.exit(0);
  } else {
    console.log("💥 CONTRACT TESTS FAILED.");
    process.exit(1);
  }
}

runContractTests();
