import * as dotenv from 'dotenv'
dotenv.config()
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

async function test() {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    )
    const result = await res.json()
    console.warn('Available models:', JSON.stringify(result.models.map((m: any) => m.name), null, 2))
}
test()
