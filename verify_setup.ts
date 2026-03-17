import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY

async function verify() {
    console.log('🔍 Verifying Environment...')
    console.log(`URL: ${SUPABASE_URL}`)
    console.log(`Service Key: ${SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'MISSING'}`)
    console.log(`Gemini Key: ${GEMINI_API_KEY ? 'Present' : 'MISSING'}`)

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing core credentials.')
        return
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    console.log('\n📡 Checking Supabase Connection & Table...')
    try {
        const { count, data, error } = await supabase
            .from('store_knowledge')
            .select('title', { count: 'exact', head: false })
            .limit(5)
        
        if (error) {
            if (error.code === '42P01') {
                console.log('❌ Table "store_knowledge" does NOT exist.')
            } else {
                console.error('❌ Supabase Error:', error.message)
            }
        } else {
            console.log(`✅ Table "store_knowledge" exists. Row count: ${count}`)
            if (data && data.length > 0) {
                console.log('📄 Sample records:')
                data.forEach(row => console.log(` - ${row.title}`))
            }
        }
    } catch (err) {
        console.error('❌ Connection failed:', err)
    }

    console.log('\n🧠 Testing Gemini API Key...')
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-2-preview',
                content: { parts: [{ text: "test" }] },
                outputDimensionality: 1536
            })
        })
        if (res.ok) {
            console.log('✅ Gemini API Key is VALID.')
        } else {
            const errBody = await res.text()
            console.error('❌ Gemini API Error:', errBody)
        }
    } catch (err) {
        console.error('❌ Gemini connection failed:', err)
    }
}

verify()
