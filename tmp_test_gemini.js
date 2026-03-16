
const GEMINI_API_KEY = '***REMOVED***';
const MODEL = 'gemini-3.1-flash-lite-preview';

async function testModel() {
    console.log(`Testing model: ${MODEL}`);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hola, di 'test 3.1' si me escuchas." }] }],
                generationConfig: { 
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            })
        });

        const status = response.status;
        const body = await response.text();
        
        console.log(`Status: ${status}`);
        console.log(`Body: ${body}`);
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testModel();
