
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

async function debug() {
    const scenarios = [
        '¿qué vapes tienes?',
        '¿cuál es la política de envíos?',
        'hola'
    ]

    for (const query of scenarios) {
        console.log(`--- Query: ${query} ---`)
        const res = await fetch(`${SUPABASE_URL}/functions/v1/customer-intelligence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ 
                action: 'concierge_chat',
                query: query,
                history: []
            })
        })

        const data = await res.json()
        console.log('Status:', res.status)
        console.log('Data:', JSON.stringify(data, null, 2))
    }
}

debug().catch(console.error)
