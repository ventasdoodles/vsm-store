/**
 * VSM — Embedding API Endpoint Diagnostic
 * Tests v1 and v1beta for gemini-embedding-001 with outputDimensionality:3072
 */
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
const BASE = 'https://generativelanguage.googleapis.com'
const MODEL = 'gemini-embedding-001'
const PAYLOAD = JSON.stringify({
    model: `models/${MODEL}`,
    content: { parts: [{ text: 'vapes de uva sabor fruta' }] },
    outputDimensionality: 3072
})

async function test(version: string) {
    const url = `${BASE}/${version}/models/${MODEL}:embedContent?key=${KEY}`
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: PAYLOAD })
    const body = await r.json()
    const dims = body.embedding?.values?.length || 0
    console.warn(`${version}: HTTP ${r.status} | dims=${dims} | error=${body.error?.message || 'none'}`)
    return { version, ok: r.status === 200, dims }
}

const v1    = await test('v1')
const v1b   = await test('v1beta')

if (v1.ok && v1.dims === 3072)   console.warn('✅ v1 is WORKING (3072d)')
else                              console.warn('❌ v1 FAILED')
if (v1b.ok && v1b.dims === 3072) console.warn('✅ v1beta is WORKING (3072d)')
else                              console.warn('❌ v1beta FAILED')

const winner = v1.ok ? 'v1' : v1b.ok ? 'v1beta' : 'NONE'
console.warn(`\n→ Canonical endpoint to use: ${winner}`)
