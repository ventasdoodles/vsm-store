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

async function runE2ESmokeQA() {
    console.log('--- STARTING E2E DB SMOKE QA ---');
    console.log('Target:', supabaseUrl);

    let testBrandId = null;
    let testCategoryId = null;
    let testProductId = null;

    try {
        // --- 1. BRANDS ---
        console.log('\n[1] Testing BRANDS...');
        const brandPayload = {
            name: 'QA Test Brand ' + Date.now(),
            is_active: true
        };
        // Create
        let { data: brand, error: brandErr } = await supabase.from('brands').insert(brandPayload).select().single();
        if (brandErr) throw new Error('Brand Insert Failed: ' + brandErr.message);
        testBrandId = brand.id;
        console.log('✅ Brand Created:', brand.id);

        // Read
        let { data: brandRead, error: brandReadErr } = await supabase.from('brands').select('*').eq('id', testBrandId).single();
        if (brandReadErr || brandRead.name !== brandPayload.name) throw new Error('Brand Read Failed');
        console.log('✅ Brand Read Verified');

        // Update
        let { data: brandUpdate, error: brandUpdErr } = await supabase.from('brands').update({ name: 'QA Test Brand Updated ' + Date.now() }).eq('id', testBrandId).select().single();
        if (brandUpdErr || !brandUpdate.name.includes('Updated')) throw new Error('Brand Update Failed');
        console.log('✅ Brand Update Verified');

        // --- 2. CATEGORIES ---
        console.log('\n[2] Testing CATEGORIES...');
        const categoryPayload = {
            name: 'QA Test Category ' + Date.now(),
            slug: 'qa-test-category-' + Date.now(),
            section: 'vape',
            description: 'Category for E2E testing',
            order_index: 999,
            is_active: true
        };
        // Create
        let { data: category, error: catErr } = await supabase.from('categories').insert(categoryPayload).select().single();
        if (catErr) throw new Error('Category Insert Failed: ' + catErr.message);
        testCategoryId = category.id;
        console.log('✅ Category Created:', category.id);

        // Read
        let { data: catRead, error: catReadErr } = await supabase.from('categories').select('*').eq('id', testCategoryId).single();
        if (catReadErr || catRead.name !== categoryPayload.name) throw new Error('Category Read Failed');
        console.log('✅ Category Read Verified');

        // Update
        let { data: catUpdate, error: catUpdErr } = await supabase.from('categories').update({ name: 'QA Test Category Updated ' + Date.now() }).eq('id', testCategoryId).select().single();
        if (catUpdErr || !catUpdate.name.includes('Updated')) throw new Error('Category Update Failed');
        console.log('✅ Category Update Verified');

        // --- 3. PRODUCTS ---
        console.log('\n[3] Testing PRODUCTS...');
        const productPayload = {
            name: 'QA Test Product ' + Date.now(),
            slug: 'qa-test-product-' + Date.now(),
            description: 'Product for E2E testing',
            short_description: 'Short desc',
            price: 99.99,
            stock: 100,
            sku: 'QA-123',
            section: 'vape',
            category_id: testCategoryId,
            status: 'active',
            images: [],
            is_featured: false,
            is_new: true,
            is_bestseller: false,
            is_active: true
        };
        
        let { data: prod, error: prodErr } = await supabase.from('products').insert(productPayload).select().single();

        if (prodErr) throw new Error('Product Insert Failed: ' + prodErr.message);
        testProductId = prod.id;
        console.log('✅ Product Created:', prod.id);

        // Read
        let { data: prodRead, error: prodReadErr } = await supabase.from('products').select('*').eq('id', testProductId).single();
        if (prodReadErr || prodRead.name !== productPayload.name) throw new Error('Product Read Failed');
        console.log('✅ Product Read Verified');

        // Update
        let { data: prodUpdate, error: prodUpdErr } = await supabase.from('products').update({ price: 49.99 }).eq('id', testProductId).select().single();
        if (prodUpdErr || prodUpdate.price !== 49.99) throw new Error('Product Update Failed');
        console.log('✅ Product Update Verified');

    } catch (error) {
        console.error('\n❌ QA TEST FAILED:', error.message);
    } finally {
        console.log('\n[4] Cleanup...');
        if (testProductId) {
            await supabase.from('products').delete().eq('id', testProductId);
            console.log('✅ Product Cleaned');
        }
        if (testCategoryId) {
            await supabase.from('categories').delete().eq('id', testCategoryId);
            console.log('✅ Category Cleaned');
        }
        if (testBrandId) {
            await supabase.from('brands').delete().eq('id', testBrandId);
            console.log('✅ Brand Cleaned');
        }
        console.log('\n--- E2E DB SMOKE QA COMPLETE ---');
    }
}

runE2ESmokeQA();
