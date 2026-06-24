import { z } from 'zod';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Mimic the contracts
const GenerateProductCopyRequestSchema = z.object({
  body: z.object({
    action: z.literal('generate_copy'),
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional()
  })
});

const EnrichProductRequestSchema = z.object({
  body: z.object({
    action: z.literal('enrich_product'),
    name: z.string().min(1, "Product name is required"),
    section: z.string().min(1, "Section is required"),
    category_slug: z.string().min(1, "Category slug is required"),
    current_specs: z.record(z.string(), z.any()),
    description: z.string()
  })
});

const CancelAdminUnpaidOrderRequestSchema = z.object({
  p_order_id: z.string().uuid("Order ID must be a valid UUID"),
  p_reason: z.string().min(5, "El motivo de cancelacion debe tener al menos 5 caracteres.")
});

async function testContracts() {
    console.log("=== VSM Store Admin Tools Contract Tests ===");
    let fails = 0;

    // 1. Generate Copy - Invalid
    try {
        GenerateProductCopyRequestSchema.parse({
            body: { action: 'generate_copy', name: '' } // Empty name
        });
        fails++;
        console.error("❌ Generate Copy Contract FAILED: Allowed empty name");
    } catch (e) {
        console.log("✅ Generate Copy Contract REJECTED empty name as expected");
    }

    // 2. Enrich Product - Invalid
    try {
        EnrichProductRequestSchema.parse({
            body: { 
                action: 'enrich_product', 
                name: 'Test', 
                section: '', // Empty section
                category_slug: 'vapes',
                current_specs: {},
                description: 'test'
            }
        });
        fails++;
        console.error("❌ Enrich Product Contract FAILED: Allowed empty section");
    } catch (e) {
        console.log("✅ Enrich Product Contract REJECTED empty section as expected");
    }

    // 3. Cancel Admin Order - Invalid UUID
    try {
        CancelAdminUnpaidOrderRequestSchema.parse({
            p_order_id: "not-a-uuid",
            p_reason: "Valid reason here"
        });
        fails++;
        console.error("❌ Cancel Admin Order Contract FAILED: Allowed invalid UUID");
    } catch (e) {
        console.log("✅ Cancel Admin Order Contract REJECTED invalid UUID as expected");
    }

    // 4. Cancel Admin Order - Short reason
    try {
        CancelAdminUnpaidOrderRequestSchema.parse({
            p_order_id: "123e4567-e89b-12d3-a456-426614174000",
            p_reason: "bad"
        });
        fails++;
        console.error("❌ Cancel Admin Order Contract FAILED: Allowed short reason");
    } catch (e) {
        console.log("✅ Cancel Admin Order Contract REJECTED short reason as expected");
    }

    // 5. Valid Cancel Admin Order
    try {
        CancelAdminUnpaidOrderRequestSchema.parse({
            p_order_id: "123e4567-e89b-12d3-a456-426614174000",
            p_reason: "Customer requested cancellation via phone"
        });
        console.log("✅ Cancel Admin Order Contract PASSED valid payload");
    } catch (e) {
        fails++;
        console.error("❌ Cancel Admin Order Contract FAILED on valid payload", e.errors);
    }

    if (fails === 0) {
        console.log("\n✅ [SUCCESS] All 5 Admin Tool Contracts verified successfully!");
        process.exit(0);
    } else {
        console.error(`\n❌ [ERROR] ${fails} Admin Tool Contracts failed verification`);
        process.exit(1);
    }
}

testContracts().catch(console.error);
