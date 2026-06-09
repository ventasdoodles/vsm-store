const fs = require('fs');

const file = 'handlers/concierge-chat.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove serve import
code = code.replace("import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'", "");

// Import corsHeaders and telemetry utils
code = `import { corsHeaders } from '../shared/cors.ts';
import { buildGeminiTokenUsageTelemetry, buildTelemetryContract, extractTelemetryNextStepTruth, resolveTelemetryRetrievalSource } from '../shared/telemetry-utils.ts';
import { buildPublicSourceContext, formatCompactSourceLines } from '../shared/source-utils.ts';
import { invokeGeminiTextModel } from '../shared/gemini-utils.ts';
` + code;

// Remove the utility functions that we extracted (we can use regex or just leave them if they don't hurt, but better to remove)
code = code.replace(/type GeminiTokenUsageTelemetry[\s\S]*?function formatCompactSourceLines[\s\S]*?\n\}/m, '');

// The `serve` block starts at: `serve(async (req) => {`
// We want to replace that with `export async function handleConciergeChat(req: Request, body: any, supabase: any, _GEMINI_API_KEY: string, _SUPABASE_URL: string, _SUPABASE_SERVICE_ROLE_KEY: string, noWriteSmoke: any, noWriteSmokeForError: any) {`
const serveStart = code.indexOf('serve(async (req) => {');
if (serveStart === -1) throw new Error("Could not find serve start");

// Find the start of concierge_chat
const conciergeStart = code.indexOf("if (action === 'concierge_chat' || action === 'semantic_search') {");
// Find the end of concierge_chat (right before proactive insights)
const conciergeEnd = code.indexOf("if (action === 'generate_proactive_insights') {");

if (conciergeStart === -1 || conciergeEnd === -1) throw new Error("Could not find concierge chat bounds");

const topImportsAndConstants = code.substring(0, serveStart);
const conciergeBody = code.substring(conciergeStart, conciergeEnd);

// Instead of the whole `if`, we just want the body of the `if`.
// But we can keep the `if` or just strip it.
// Actually, let's keep the `if` and just wrap it.

const newContent = topImportsAndConstants + `

export async function handleConciergeChat(
    req: Request,
    body: any,
    supabase: any,
    _GEMINI_API_KEY: string,
    _SUPABASE_URL: string,
    _SUPABASE_SERVICE_ROLE_KEY: string,
    noWriteSmoke: any,
    noWriteSmokeForError: any
) {
    const { customerId, action, context, query, history, customerContext: cContext, customer_context, product_ids, cart_product_ids } = body;
    const customerContext = cContext || customer_context;

    ${conciergeBody}
    
    throw new Error('Action was not concierge_chat or semantic_search');
}
`;

fs.writeFileSync(file, newContent, 'utf8');
console.log("Refactored handlers/concierge-chat.ts successfully.");
