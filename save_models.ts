import * as dotenv from 'dotenv'
import * as fs from 'fs'
dotenv.config()
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY

async function test() {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    )
    const result = await res.json()
    fs.writeFileSync('models.json', JSON.stringify(result, null, 2))
}
test()
