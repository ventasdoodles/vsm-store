import { geminiGenerateContent } from '../../_shared/gemini-api.ts';
import { logTelemetryEvent, logTelemetryError } from './telemetry-utils.ts';

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
            logTelemetryEvent('llm_skip', { provider: provider.name, reason: 'missing_api_key' });
            continue;
        }

        const startTime = Date.now();
        try {
            if (provider.name === 'gemini') {
                const response = await geminiGenerateContent({
                    apiKey: provider.apiKey,
                    model: provider.model,
                    body,
                });

                const result = await response.json();
                const latency_ms = Date.now() - startTime;

                if (!response.ok) {
                    if (response.status === 429 || response.status >= 500) {
                        throw new Error(`Rate limit or Server Error from Gemini: HTTP ${response.status}`);
                    }
                    // Non-retriable error
                    throw new Error(result?.error?.message || errorContext);
                }
                
                logTelemetryEvent('llm_invoke', {
                    provider: provider.name,
                    model: provider.model,
                    latency_ms,
                    tokens: {
                        prompt: result?.usageMetadata?.promptTokenCount,
                        candidates: result?.usageMetadata?.candidatesTokenCount,
                        total: result?.usageMetadata?.totalTokenCount
                    },
                    status: 'success'
                });
                
                return result;
            } 
            else if (provider.name === 'anthropic') {
                // Future Implementation for Claude
                throw new Error("Anthropic not fully implemented");
            }
            
        } catch (e: unknown) {
            const latency_ms = Date.now() - startTime;
            const msg = e instanceof Error ? e.message : String(e);
            
            logTelemetryError('llm_invoke_failed', e, {
                provider: provider.name,
                model: provider.model,
                latency_ms,
                errorContext
            });
            
            errors.push({ provider: provider.name, error: msg });
            // Continue to the next provider in the fallback chain
        }
    }

    // If all providers failed
    logTelemetryError('llm_gateway_exhausted', new Error(`All LLM providers failed for ${errorContext}`), {
        errors,
        errorContext
    });
    
    throw new Error(`LLM Gateway Exhausted: ${errors.map((e: any) => `${e.provider}=${e.error}`).join(' | ')}`);
}
