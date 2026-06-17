import { geminiGenerateContent } from '../../_shared/gemini-api.ts';

export type LLMProviderConfig = {
    name: 'gemini' | 'anthropic';
    apiKey?: string;
    model: string;
};

export async function invokeLLMWithFallback(
    providers: LLMProviderConfig[],
    body: Record<string, any>,
    errorContext: string
): Promise<any> {
    const errors: unknown[] = [];
    
    for (const provider of providers) {
        if (!provider.apiKey) {
            console.warn(`[LLM Gateway] Skipping ${provider.name} due to missing API key.`);
            continue;
        }

        try {
            console.log(`[LLM Gateway] Attempting with ${provider.name} (${provider.model})...`);
            
            if (provider.name === 'gemini') {
                const response = await geminiGenerateContent({
                    apiKey: provider.apiKey,
                    model: provider.model,
                    body,
                });

                const result = await response.json();
                if (!response.ok) {
                    if (response.status === 429 || response.status >= 500) {
                        throw new Error(`Rate limit or Server Error from Gemini: HTTP ${response.status}`);
                    }
                    // Non-retriable error
                    throw new Error(result?.error?.message || errorContext);
                }
                
                console.log(`[LLM Gateway] Success with ${provider.name}.`);
                return result;
            } 
            else if (provider.name === 'anthropic') {
                // Future Implementation for Claude
                // Adapter: Transform Gemini `body` to Anthropic `body`
                // Fetch Claude API
                // Adapter: Transform Claude response to Gemini `result` format
                console.warn(`[LLM Gateway] Anthropic adapter not fully implemented yet, skipping.`);
                throw new Error("Anthropic not fully implemented");
            }
            
        } catch (e: unknown) {
            console.warn(`[LLM Gateway] Provider ${provider.name} failed: ${e.message}`);
            errors.push({ provider: provider.name, error: e.message });
            // Continue to the next provider in the fallback chain
        }
    }

    // If all providers failed
    console.error(`[LLM Gateway] All LLM providers failed for ${errorContext}. Errors:`, errors);
    throw new Error(`LLM Gateway Exhausted: ${errors.map(e => `${e.provider}=${e.error}`).join(' | ')}`);
}
