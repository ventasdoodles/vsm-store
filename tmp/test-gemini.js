// test-gemini.js
require('dotenv').config({ path: '.env' });
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

async function test() {
    console.log("Using API Key starting with:", GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) : "NONE");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
        })
    });
    const result = await response.json();
    console.log("Status:", response.status);
    console.log(JSON.stringify(result, null, 2));
}

test();
