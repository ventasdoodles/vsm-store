import { geminiGenerateContent } from '../../_shared/gemini-api.ts';

export async function invokeGeminiTextModel(
    apiKey: string,
    model: string,
    body: Record<string, unknown>,
    errorContext: string,
): Promise<any> {
    const response = await geminiGenerateContent({
        apiKey,
        model,
        body,
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result?.error?.message || errorContext);
    }

    return result;
}
