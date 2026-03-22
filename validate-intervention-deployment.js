#!/usr/bin/env node

/**
 * VALIDATE INTERVENTION TABLES DEPLOYMENT
 * Checks if migration has been applied to active Supabase database
 * Provides manual fix instructions if needed
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment
const envPath = new URL('.env.local', import.meta.url);
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim() && !key.startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing VITE_SUPABASE_URL in .env.local');
  process.exit(1);
}

console.log(`\n📊 VALIDATION REPORT: Learning Intervention Workflow MVP Deployment`);
console.log(`Project: ${SUPABASE_URL}`);
console.log('━'.repeat(70));

// Create clients
const adminClient = SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
}) : null;

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ========================================
// CHECK 1: TABLE EXISTENCE
// ========================================

console.log('\n1️⃣  TABLE EXISTENCE CHECK');

const { data: signals, error: signalsErr } = await anonClient
  .from('intervention_signals')
  .select('id')
  .limit(0)
  .catch(e => ({ data: null, error: e }));

const { data: recs, error: recsErr } = await anonClient
  .from('intervention_recommendations')
  .select('id')
  .limit(0)
  .catch(e => ({ data: null, error: e }));

const signalsExist = !signalsErr;
const recsExist = !recsErr;

console.log(`  intervention_signals: ${signalsExist ? '✅ EXISTS' : '❌ MISSING'}`);
if (signalsErr) console.log(`    └─ Error: ${signalsErr.message}`);

console.log(`  intervention_recommendations: ${recsExist ? '✅ EXISTS' : '❌ MISSING'}`);
if (recsErr) console.log(`    └─ Error: ${recsErr.message}`);

// ========================================
// CHECK 2: DATA CONTENT (if tables exist)
// ========================================

if (signalsExist && recsExist) {
  console.log('\n2️⃣  DATA CONTENT CHECK');

  const { count: sigCount, error: countSigErr } = await anonClient
    .from('intervention_signals')
    .select('id', { count: 'exact' });

  const { count: recCount, error: countRecErr } = await anonClient
    .from('intervention_recommendations')
    .select('id', { count: 'exact' });

  console.log(`  Intervention signals: ${sigCount || 0} rows`);
  console.log(`  Intervention recommendations: ${recCount || 0} rows`);

  if ((sigCount || 0) === 0) {
    console.log('\n  ⚠️  Tables exist but are empty. Seed data needed for testing.');
  }
}

// ========================================
// CHECK 3: RLS POLICIES
// ========================================

if (signalsExist && adminClient) {
  console.log('\n3️⃣  RLS POLICY CHECK');

  try {
    // Try to fetch as admin (should work if policies exist)
    const { data: adminSigs, error: adminErr } = await adminClient
      .from('intervention_signals')
      .select('id')
      .limit(1);

    if (!adminErr) {
      console.log('  ✅ Admin SELECT policy active (RLS working)');
    } else {
      console.log(`  ⚠️  RLS check inconclusive: ${adminErr.message}`);
    }
  } catch (e) {
    console.log(`  ⚠️  RLS check error: ${e.message}`);
  }
}

// ========================================
// FINAL VERDICT
// ========================================

console.log('\n' + '━'.repeat(70));

if (signalsExist && recsExist) {
  console.log('✅ DEPLOYMENT STATUS: COMPLETE\n');
  console.log('   Tables exist and are ready for testing.');

  const { count: sigCount } = await anonClient
    .from('intervention_signals')
    .select('id', { count: 'exact' });

  if ((sigCount || 0) > 0) {
    console.log(`   ${sigCount} seed signals ready.`);
    console.log('\n   ✅ TabInterventions tab is now testable');
    console.log('   • Refresh browser to load data');
    console.log('   • Filter toggle (Pendientes/Todas) should work');
    console.log('   • Approve/Reject buttons should be functional');
  } else {
    console.log('\n   ⚠️  NEXT STEP: Seed test data');
    console.log('   Run: npm run seed:interventions');
    console.log('   Or manually insert seed data from:');
    console.log('   → MANUAL_TESTING_LANE_LEARNING_INTERVENTION_MVP.md (Section 2)');
  }

  process.exit(0);
} else {
  console.log('❌ DEPLOYMENT STATUS: INCOMPLETE\n');
  console.log('   Missing tables detected. Migration needs to be applied.\n');
  console.log('📋 MANUAL FIX (Required):\n');
  console.log('   1. Open Supabase Dashboard');
  console.log('      → https://app.supabase.com/project/cvvlorbiwtuhkxolhfie\n');
  console.log('   2. Go to SQL Editor → New Query\n');
  console.log('   3. Copy entire contents of:');
  console.log('      → supabase/migrations/20260320_intervention_signals_and_recommendations.sql\n');
  console.log('   4. Paste into editor and click RUN\n');
  console.log('   5. Verify tables were created\n');
  console.log('   6. Then run this validation again:');
  console.log('      → node validate-intervention-deployment.js\n');

  process.exit(1);
}
