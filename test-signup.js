import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    console.log("Testing Supabase Signup...");

    const randomEmail = `test.error.${Date.now()}@test.com`;
    console.log(`Email: ${randomEmail}`);

    const { data, error } = await supabase.auth.signUp({
        email: randomEmail,
        password: "Password123!",
        options: {
            data: {
                full_name: "Test Error User",
                phone: "1234567890"
            },
            emailRedirectTo: "http://localhost:5173/login",
        },
    });

    if (error) {
        console.error("\n❌ Signup Failed!");
        console.error("Status:", error.status);
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        console.error("Full Error Object:", JSON.stringify(error, null, 2));
    } else {
        console.log("\n✅ Signup Succeeded!");
        console.log("User ID:", data.user?.id);
    }
}

testSignup();
