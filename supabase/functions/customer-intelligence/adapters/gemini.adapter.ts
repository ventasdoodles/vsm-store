import { invokeGeminiTextModel } from '../../_shared/gemini-utils.ts';
import { buildGeminiTokenUsageTelemetry } from '../../_shared/telemetry-utils.ts';
import { buildNeutralAnalystFallbackReport } from '../analyst-fallback.ts';
import { ToolCall } from '../tools.ts';

const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];

export interface AnalystReport {
    intent: string;
    primary_intent?: string;
    secondary_intents?: string[];
    turn_priority?: string[];
    current_turn_decision?: string;
    turn_decision?: string;
    turn_focus?: string;
    doubts?: string[];
    tool_calls: ToolCall[];
    customer_dna?: {
        interests?: string[];
        preference_signals?: Record<string, unknown>[];
    };
    conversational_prefix?: string;
}

export class GeminiAnalystAdapter {
    private readonly VALID_INTENTS = [
        'CART_OPERATION', 'CHECKOUT_READINESS', 'KIT_ASSEMBLY', 'BUDGET_RESCUE', 
        'WARRANTY_SUPPORT', 'LOYALTY_SUPPORT', 'POLICY_INQUIRY', 'PUBLIC_INFO', 
        'PRODUCT_SEARCH', 'ORDER_TRACKING', 'INVENTORY_OUTLOOK', 'COMPATIBILITY_CHECK', 
        'CHIT_CHAT', 'UNKNOWN', 'OUT_OF_DOMAIN'
    ];

    constructor(private apiKey: string, private modelId: string) {}

    async analyzeTurn(systemPrompt: string, userBlocks: string, history: { role: string; content: string }[]): Promise<{ report: AnalystReport, rawText: string, error: string | null }> {
        const formattedHistory = Array.isArray(history) 
            ? history.slice(-6).map((h) => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }]
            })) 
            : [];

        let geminiError: string | null = null;
        let rawAnalystText = '';
        let analystReport: AnalystReport = { intent: 'UNKNOWN', tool_calls: [] };
        let analystParseValid = false;

        try {
            const analystResult = await invokeGeminiTextModel(
                this.apiKey,
                this.modelId,
                {
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [
                        ...formattedHistory,
                        { role: 'user', parts: [{ text: userBlocks }] }
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        response_mime_type: 'application/json',
                        response_schema: {
                            type: 'OBJECT',
                            properties: {
                                intent: {
                                    type: 'STRING',
                                    enum: this.VALID_INTENTS,
                                },
                                primary_intent: { type: 'STRING' },
                                secondary_intents: { type: 'ARRAY', items: { type: 'STRING' } },
                                turn_priority: { type: 'ARRAY', items: { type: 'STRING' } },
                                current_turn_decision: {
                                    type: 'STRING',
                                    enum: ['DIRECT_ANSWER', 'ASK_CLARIFYING_QUESTION', 'USE_CAPABILITY'],
                                },
                                turn_decision: { type: 'STRING' },
                                doubts: { type: 'ARRAY', items: { type: 'STRING' } },
                                tool_calls: {
                                    type: 'ARRAY',
                                    items: {
                                        type: 'OBJECT',
                                        properties: {
                                            name: { type: 'STRING' },
                                            args: { type: 'OBJECT' },
                                            reason: { type: 'STRING' },
                                        },
                                        required: ['name', 'args'],
                                    },
                                },
                                customer_dna: {
                                    type: 'OBJECT',
                                    properties: {
                                        interests: { type: 'ARRAY', items: { type: 'STRING' } },
                                        preference_signals: { type: 'ARRAY', items: { type: 'OBJECT' } },
                                    },
                                },
                                conversational_prefix: { type: 'STRING' },
                            },
                            required: ['intent', 'current_turn_decision', 'tool_calls'],
                        },
                    },
                    safetySettings: SAFETY_SETTINGS,
                },
                "Analyst text model execution"
            );

            rawAnalystText = analystResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const analystUsage = buildGeminiTokenUsageTelemetry(this.modelId, analystResult.usageMetadata);
            if (analystUsage) {
                console.warn('[Analyst Tokens]', JSON.stringify(analystUsage));
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(`[Analyst] Gateway error: ${msg}`);
            geminiError = msg;
        }

        if (rawAnalystText) {
            try {
                const parsed = JSON.parse(rawAnalystText);
                if (!parsed || typeof parsed !== 'object') {
                    throw new Error('Analyst response is not a JSON object');
                }

                const reportIntent = (parsed.intent || '').toUpperCase();
                if (!this.VALID_INTENTS.includes(reportIntent)) {
                    geminiError = `Analyst invalid intent: "${reportIntent}"`;
                } else if (!Array.isArray(parsed.tool_calls)) {
                    throw new Error('Analyst tool_calls not array');
                } else {
                    analystReport = parsed as AnalystReport;
                    analystParseValid = true;
                }
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                geminiError = geminiError || `Analyst parse error: ${msg}`;
            }
        }

        if (geminiError || !analystParseValid) {
            console.warn(`[Analyst] Degradation fallback active due to: ${geminiError || 'contract validation failed'}`);
            analystReport = buildNeutralAnalystFallbackReport();
        }

        return { report: analystReport, rawText: rawAnalystText, error: geminiError };
    }
}
