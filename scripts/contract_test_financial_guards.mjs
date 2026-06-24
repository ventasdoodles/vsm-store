import { z } from 'zod';
import { CreateOrderRequestSchema } from '../src/lib/contracts/storefront-orders-contract.ts';
import { AdminCouponRequestSchema } from '../src/lib/contracts/admin-coupons-contract.ts';
import { FlashDealRequestSchema } from '../src/lib/contracts/admin-flash-deals-contract.ts';
import { WheelPrizeRequestSchema } from '../src/lib/contracts/admin-wheel-contract.ts';
import { AdminProductRequestSchema } from '../src/lib/contracts/admin-products-contract.ts';
import { SyncVariantsRequestSchema } from '../src/lib/contracts/admin-variants-contract.ts';

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

// Test 5: Admin Flash Deals Guard (Invalid Date Range & Negative Price)
try {
    FlashDealRequestSchema.parse({
        product_id: "123e4567-e89b-12d3-a456-426614174000",
        flash_price: -10, // Invalid negative price
        max_qty: 0, // Invalid max qty (min 1)
        starts_at: "2027-01-02T00:00:00Z",
        ends_at: "2027-01-01T00:00:00Z", // Invalid ends_at before starts_at
        is_active: true,
        priority: 1
    });
    console.error("❌ ERROR: Flash Deals Guard FAILED to catch negative prices and inverted dates");
    process.exit(1);
} catch (e) {
    const errorStr = String(e);
    if (errorStr.includes("posterior") || errorStr.includes("positivo")) {
        console.log("✅ Admin Flash Deals Guard REJECTED destructive payload as expected");
    } else {
        console.error("❌ ERROR: Flash Deals Guard failed with unexpected error:", e);
        process.exit(1);
    }
}

// Test 6: Admin Wheel Prizes Guard (1,000,000 Points)
try {
    WheelPrizeRequestSchema.parse({
        label: "Jackpot Infinito",
        type: "points",
        value: { amount: 1000000 }, // Invalid amount > 1000
        probability: 5,
        color: "#FFD700",
        is_active: true
    });
    console.error("❌ ERROR: Wheel Prizes Guard FAILED to catch destructive points amount");
    process.exit(1);
} catch (e) {
    const errorStr = String(e);
    if (errorStr.includes("entre 1 y 1000")) {
        console.log("✅ Admin Wheel Prizes Guard REJECTED economy destruction as expected");
    } else {
        console.error("❌ ERROR: Wheel Prizes Guard failed with unexpected error:", e);
        process.exit(1);
    }
}

// Test 7: Admin Products Guard (Negative Price)
try {
    AdminProductRequestSchema.parse({
        name: "Test Product",
        slug: "test-product-123",
        price: -50, // Invalid negative price
        stock: 10,
        category_id: "123e4567-e89b-12d3-a456-426614174000",
        section: "vape",
        status: "active"
    });
    console.error("❌ ERROR: Admin Products Guard FAILED to catch negative price");
    process.exit(1);
} catch (e) {
    const errorStr = String(e);
    if (errorStr.includes("no puede ser negativo")) {
        console.log("✅ Admin Products Guard REJECTED negative price as expected");
    } else {
        console.error("❌ ERROR: Admin Products Guard failed with unexpected error:", e);
        process.exit(1);
    }
}

// Test 8: Admin Variants Guard (Negative Price in Sync Array)
try {
    SyncVariantsRequestSchema.parse([
        {
            sku: "VAR-1",
            price: 100,
            stock: 10
        },
        {
            sku: "VAR-2",
            price: -10, // Invalid negative variant price
            stock: 5
        }
    ]);
    console.error("❌ ERROR: Admin Variants Guard FAILED to catch negative price in variant array");
    process.exit(1);
} catch (e) {
    const errorStr = String(e);
    if (errorStr.includes("no puede ser negativo")) {
        console.log("✅ Admin Variants Guard REJECTED negative variant price as expected");
    } else {
        console.error("❌ ERROR: Admin Variants Guard failed with unexpected error:", e);
        process.exit(1);
    }
}

console.log("\n✅ [SUCCESS] All Financial Guards verified successfully!");
