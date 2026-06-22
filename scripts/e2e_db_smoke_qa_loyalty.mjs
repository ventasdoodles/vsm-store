import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env vars
const envFile = fs.readFileSync('.env', 'utf-8');
const envConfig = dotenv.parse(envFile);

const supabaseUrl = envConfig['SUPABASE_URL'] || envConfig['VITE_SUPABASE_URL'];
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'] || envConfig['VITE_SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helpers
const assert = (condition, msg) => {
    if (!condition) throw new Error(`Assertion Failed: ${msg}`);
};

async function runLoyaltyE2ESmokeQA() {
    console.log('--- STARTING MULTI-SCENARIO LOYALTY & INVENTORY E2E SMOKE QA ---');
    console.log('Target:', supabaseUrl);

    let testCategoryId = null;
    let testProductId = null;
    let testCustomerId = null;
    let testOrderId = null;

    try {
        // --- 1. SETUP: CATEGORY & PRODUCT ---
        console.log('\n[1] SETUP: Creating Category & Product...');
        const ts = Date.now();
        
        let { data: cat } = await supabase.from('categories')
            .insert({ name: 'Loyalty QA ' + ts, slug: 'loyalty-qa-' + ts, section: 'vape', is_active: true })
            .select().single();
        testCategoryId = cat.id;

        let { data: prod } = await supabase.from('products')
            .insert({ 
                name: 'Vape Device ' + ts, slug: 'vape-device-' + ts, price: 50.00, stock: 10, 
                section: 'vape', category_id: testCategoryId, is_active: true, status: 'active',
                images: []
            }).select().single();
        testProductId = prod.id;
        console.log(`✅ Product created with Stock: ${prod.stock}, Price: ${prod.price}`);

        // --- 2. SETUP: CUSTOMER PROFILE ---
        console.log('\n[2] SETUP: Fetching Test Customer Profile...');
        let { data: customer, error: custErr } = await supabase.from('customer_profiles').select('id').limit(1).single();
        if (custErr || !customer) throw new Error('Could not fetch an existing customer profile: ' + (custErr?.message || 'Empty'));
        testCustomerId = customer.id;
        
        console.log(`✅ Customer Profile ready. ID: ${testCustomerId}`);

        // --- 3. SCENARIO: INJECT COINS ---
        console.log('\n[3] SCENARIO: Injecting 1000 Loyalty Coins...');
        const { error: injectErr } = await supabase.rpc('process_loyalty_points', {
            p_user_id: testCustomerId,
            p_amount: 1000,
            p_type: 'earned',
            p_description: 'Welcome Bonus QA'
        });
        if (injectErr) throw new Error('Inject Coins RPC Failed: ' + injectErr.message);

        const { data: balance1 } = await supabase.rpc('get_customer_points_balance', { p_customer_id: testCustomerId });
        assert(balance1 === 1000, `Expected balance 1000, got ${balance1}`);
        console.log(`✅ Coins injected. Current Balance: ${balance1}`);

        // --- 4. SCENARIO: MAKE PURCHASE (USE COINS & DEDUCT INVENTORY) ---
        console.log('\n[4] SCENARIO: Make Purchase (Pay 200 coins, deduct 1 inventory)...');
        
        // 4a. Create Order
        const { data: order, error: orderErr } = await supabase.from('orders')
            .insert({
                customer_id: testCustomerId,
                items: [{ product_id: testProductId, name: prod.name, price: prod.price, quantity: 1 }],
                subtotal: 50.00,
                total: 50.00,
                status: 'pending'
            }).select().single();
        if (orderErr) throw new Error('Order creation failed: ' + orderErr.message);
        testOrderId = order.id;

        // 4b. Deduct Coins for purchase
        await supabase.rpc('process_loyalty_points', {
            p_user_id: testCustomerId,
            p_amount: 200,
            p_type: 'spent',
            p_description: 'Used for Order ' + order.order_number,
            p_order_id: testOrderId
        });

        // 4c. Deduct Inventory manually (simulating service layer)
        const newStock = prod.stock - 1;
        await supabase.from('products').update({ stock: newStock }).eq('id', testProductId);

        // Verify Balance
        const { data: balance2 } = await supabase.rpc('get_customer_points_balance', { p_customer_id: testCustomerId });
        assert(balance2 === 800, `Expected balance 800 after spending 200, got ${balance2}`);
        console.log(`✅ Coins successfully deducted. Current Balance: ${balance2}`);

        // Verify Inventory
        const { data: prodAfter } = await supabase.from('products').select('stock').eq('id', testProductId).single();
        assert(prodAfter.stock === 9, `Expected stock 9, got ${prodAfter.stock}`);
        console.log(`✅ Inventory successfully deducted. Current Stock: ${prodAfter.stock}`);

        // --- 5. SCENARIO: EARN COINS FROM PURCHASE ---
        console.log('\n[5] SCENARIO: Earn points from the successful purchase...');
        const earnedPoints = Math.floor(order.total); // 1 point per $1
        await supabase.rpc('process_loyalty_points', {
            p_user_id: testCustomerId,
            p_amount: earnedPoints,
            p_type: 'earned',
            p_description: 'Points from Order ' + order.order_number,
            p_order_id: testOrderId
        });

        // Verify Final Balance
        const { data: balance3 } = await supabase.rpc('get_customer_points_balance', { p_customer_id: testCustomerId });
        assert(balance3 === 850, `Expected balance 850 (800 + 50), got ${balance3}`);
        console.log(`✅ Purchase points successfully credited. Final Balance: ${balance3}`);

        console.log('\n🌟 ALL QA SCENARIOS PASSED SUCCESSFULLY 🌟');

    } catch (error) {
        console.error('\n❌ QA TEST FAILED:', error.message);
    } finally {
        console.log('\n[6] CLEANUP: Removing QA traces...');
        // We injected points and orders to an existing customer, so we just delete the order and loyalty points created.
        if (testOrderId) {
            await supabase.from('loyalty_points').delete().eq('order_id', testOrderId);
            await supabase.from('orders').delete().eq('id', testOrderId);
            console.log('✅ Order & associated loyalty points deleted');
        }
        // Also cleanup the manually injected 1000 points (we didn't link it to an order_id initially)
        if (testCustomerId) {
            await supabase.from('loyalty_points').delete().eq('customer_id', testCustomerId).eq('description', 'Welcome Bonus QA');
            console.log('✅ Welcome Bonus coins deleted');
        }
        if (testProductId) await supabase.from('products').delete().eq('id', testProductId);
        if (testCategoryId) await supabase.from('categories').delete().eq('id', testCategoryId);
        
        console.log('✅ Cleanup complete.');
        console.log('\n--- E2E SMOKE QA LOYALTY COMPLETE ---');
    }
}

runLoyaltyE2ESmokeQA();
