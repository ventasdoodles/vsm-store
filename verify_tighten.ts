
import { executeTools } from './supabase/functions/customer-intelligence/tools.ts';

// Mock Supabase
const mockSupabase = {
    rpc: async (name: string, args: any) => {
        console.log(`[MOCK] Calling RPC: ${name}`, args);
        if (name === 'match_knowledge') return { data: [{ category: 'Test', content: 'Policy Match' }], error: null };
        if (name === 'match_products') return { data: [{ name: 'Test Vape', price: 10, stock: 100 }], error: null };
        return { data: [], error: null };
    },
    from: (table: string) => ({
        select: () => ({
            eq: () => ({
                eq: () => ({
                    limit: () => Promise.resolve({ data: [] })
                })
            })
        })
    })
};

const mockGeminiKey = "MOCK_KEY";

async function runTest() {
    console.log("--- STARTING TIGHTEN PASS VERIFICATION ---");

    const toolCalls = [
        { name: 'get_store_policy', args: { query: 'envios' } },
        { name: 'search_products', args: { query: 'vape fresa' } }
    ];

    const sharedEmbedding = Array(1536).fill(0.1); // Mock embedding

    console.log("1. Testing executeTools with shared embedding...");
    const results = await executeTools(toolCalls, mockSupabase, mockGeminiKey, sharedEmbedding);

    console.log("Results Enrichment Check:");
    results.forEach(r => {
        console.log(`- Tool: ${r.name}`);
        console.log(`  Status: ${r.status}`);
        console.log(`  Summary: ${r.summary}`);
        console.log(`  Args: ${JSON.stringify(r.args)}`);
        console.log(`  Latency: ${r.latency_ms}ms`);
        
        if (!r.summary) console.error("FAILED: Missing summary");
        if (!r.args) console.error("FAILED: Missing args");
    });

    const hasErrors = results.some(r => r.status === 'error');
    if (hasErrors) {
        console.error("VERIFICATION FAILED: Error in tool execution");
    } else {
        console.log("VERIFICATION SUCCESSFUL: Shared embeddings and enrichment working.");
    }
}

runTest();
