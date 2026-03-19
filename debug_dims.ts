import * as dotenv from 'dotenv'
dotenv.config()
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

async function test() {
    const text = "test"
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-001',
                content: { parts: [{ text }] }
            })
        }
    )
    const result = await res.json()
    console.warn('Embedding size:', result.embedding.values.length)
}
test()
