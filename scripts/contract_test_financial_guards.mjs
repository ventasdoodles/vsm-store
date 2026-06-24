import { z } from 'zod';
import { CreateOrderRequestSchema } from '../src/lib/contracts/storefront-orders-contract.ts';
import { AdminCouponRequestSchema } from '../src/lib/contracts/admin-coupons-contract.ts';

console.log("=== VSM Store Financial Guards Tests ===");

// Test 1: Storefront Orders Guard (Math Consistency)
try {
    CreateOrderRequestSchema.parse({
        customer_id: "123e4567-e89b-12d3-a456-426614174000",
        items: [{
            product_id: "123e4567-e89b-12d3-a456-426614174001",
            name: "Test Item",
            price: 1000,
            quantity: 1
        }],
        subtotal: 1000,
        shipping_cost: 0,
        discount: 0,
        total: 10, // Maliciously altered total
        payment_method: "mercadopago"
    });
    console.error("❌ ERROR: Order Guard FAILED to catch malicious total alteration");
    process.exit(1);
} catch (e) {
    const errorStr = String(e);
    if (errorStr.includes("inconsistente")) {
        console.log("✅ Storefront Orders Guard REJECTED math inconsistency as expected");
    } else {
        console.error("❌ ERROR: Order Guard failed with unexpected error:", e);
        process.exit(1);
    }
}

// Test 2: Admin Coupons Guard (150% discount)
try {
    AdminCouponRequestSchema.parse({
        code: "SUPERPROMO",
        discount_type: "percentage",
        discount_value: 150, // Invalid percentage
        min_purchase: 0,
        is_active: true
    });
    console.error("❌ ERROR: Coupon Guard FAILED to catch >100% discount");
    process.exit(1);
} catch (e) {
    const errorStr = String(e);
    if (errorStr.includes("no puede exceder")) {
        console.log("✅ Admin Coupons Guard REJECTED >100% discount as expected");
    } else {
        console.error("❌ ERROR: Coupon Guard failed with unexpected error:", e);
        process.exit(1);
    }
}

// Test 3: Admin Coupons Guard (Valid Pass)
try {
    AdminCouponRequestSchema.parse({
        code: "VALIDPROMO",
        discount_type: "percentage",
        discount_value: 50,
        min_purchase: 0,
        is_active: true
    });
    console.log("✅ Admin Coupons Guard PASSED valid payload");
} catch (e) {
    console.error("❌ ERROR: Coupon Guard rejected valid payload:", e);
    process.exit(1);
}

// Test 4: Storefront Orders Guard (Valid Pass)
try {
    CreateOrderRequestSchema.parse({
        customer_id: "123e4567-e89b-12d3-a456-426614174000",
        items: [{
            product_id: "123e4567-e89b-12d3-a456-426614174001",
            name: "Test Item",
            price: 1000,
            quantity: 1
        }],
        subtotal: 1000,
        shipping_cost: 150,
        discount: 50,
        total: 1100, // 1000 + 150 - 50 = 1100
        payment_method: "mercadopago"
    });
    console.log("✅ Storefront Orders Guard PASSED valid payload");
} catch (e) {
    console.error("❌ ERROR: Order Guard rejected valid payload:", e);
    process.exit(1);
}

console.log("\n✅ [SUCCESS] All Financial Guards verified successfully!");
