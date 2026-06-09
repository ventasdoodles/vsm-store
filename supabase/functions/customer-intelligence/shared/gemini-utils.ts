import { invokeLLMWithFallback, LLMProviderConfig } from './llm-gateway.ts';

export async function invokeGeminiTextModel(
    apiKey: string,
    model: string,
    body: Record<string, unknown>,
    errorContext: string,
): Promise<any> {
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    const providers: LLMProviderConfig[] = [
        {
            name: 'gemini',
            apiKey: apiKey,
            model: model,
        }
    ];

    if (anthropicKey) {
        providers.push({
            name: 'anthropic',
            apiKey: anthropicKey,
            model: 'claude-3-5-sonnet-20241022', // Standard secondary model
        });
    }

    return await invokeLLMWithFallback(providers, body, errorContext);
}
