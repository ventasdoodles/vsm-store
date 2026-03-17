import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function applyMigration() {
    const migrationPath = path.join(__dirname, 'supabase/migrations/20260317_store_knowledge.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Applying migration: 20260317_store_knowledge.sql')

    // Since we don't have a direct 'query' method in the client, 
    // we'll try to split the SQL and execute it if possible, 
    // or use the rest API's internal ability if enabled.
    // However, the standard way in a script like this is to use a PG client 
    // OR if Supabase has an exec_sql RPC.
    
    // Let's try to see if we can use the 'supabase' client for some basic DDL 
    // although it's not officially supported for raw SQL without RPC.
    
    // Fallback: Instruct the user to run it in the SQL editor if this fails.
    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
        if (error) {
            console.error('❌ RPC Error (exec_sql might not exist):', error.message)
            console.log('💡 Please apply the migration manually in the Supabase SQL Editor.')
        } else {
            console.log('✅ Migration applied successfully via RPC!')
        }
    } catch (err) {
        console.error('❌ Execution failed:', err)
        console.log('💡 Please apply the migration manually in the Supabase SQL Editor.')
    }
}

applyMigration()
