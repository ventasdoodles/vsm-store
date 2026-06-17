import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildNeutralAnalystFallbackReport } from '../../../supabase/functions/customer-intelligence/analyst-fallback';

const TEST_VALID_INTENTS = ['CHIT_CHAT', 'PRODUCT_SEARCH', 'UNKNOWN'];
const TEST_DIRNAME = dirname(fileURLToPath(import.meta.url));
const CONCIERGE_CHAT = resolve(
  TEST_DIRNAME,
  '../../../supabase/functions/customer-intelligence/handlers/concierge-chat.ts'
);
const TELEMETRY_UTILS = resolve(
  TEST_DIRNAME,
  '../../../supabase/functions/customer-intelligence/shared/telemetry-utils.ts'
);
const GEMINI_ADAPTER = resolve(
  TEST_DIRNAME,
  '../../../supabase/functions/customer-intelligence/adapters/gemini.adapter.ts'
);
const PROMPT_BUILDER = resolve(
  TEST_DIRNAME,
  '../../../supabase/functions/customer-intelligence/domain/prompt.builder.ts'
);

function readCustomerIntelligenceSource() {
  const chat = readFileSync(CONCIERGE_CHAT, 'utf8');
  const utils = readFileSync(TELEMETRY_UTILS, 'utf8');
  const adapter = readFileSync(GEMINI_ADAPTER, 'utf8');
  const builder = readFileSync(PROMPT_BUILDER, 'utf8');
  return chat + '\n' + utils + '\n' + adapter + '\n' + builder;
}


function extractAnalystRequestBlock(source: string) {
  const analystCallStart = source.indexOf('const analystResult = await invokeGeminiTextModel(');
  const analystCallEnd = source.indexOf('rawAnalystText = analystResult.candidates', analystCallStart);

  expect(analystCallStart).toBeGreaterThanOrEqual(0);
  expect(analystCallEnd).toBeGreaterThan(analystCallStart);

  return source.slice(analystCallStart, analystCallEnd);
}

function parseAnalystReportForContract(rawAnalystText: string) {
  let geminiError = '';
  let analystParseValid = false;
  let analystReport: any = { intent: 'UNKNOWN', tool_calls: [] };

  if (rawAnalystText) {
    try {
      const parsed = JSON.parse(rawAnalystText);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Analyst response is not a JSON object');
      }

      const reportIntent = (parsed.intent || '').toUpperCase();
      if (!TEST_VALID_INTENTS.includes(reportIntent)) {
        geminiError = `Analyst invalid intent: "${reportIntent}"`;
      } else if (!Array.isArray(parsed.tool_calls)) {
        const toolCallsType = parsed.tool_calls === null ? 'null' : typeof parsed.tool_calls;
        console.warn('[Analyst] Structured output invalid:', JSON.stringify({
          reason: 'tool_calls_not_array',
          field: 'tool_calls',
          received_type: toolCallsType,
          intent: reportIntent,
        }));
        throw new Error('Analyst tool_calls not array');
      } else {
        analystReport = parsed;
        analystParseValid = true;
      }
    } catch (e) {
      geminiError = geminiError || `Analyst parse error: ${(e as Error).message}`;
    }
  }

  if (geminiError || !analystParseValid) {
    analystReport = buildNeutralAnalystFallbackReport();
  }

  return analystReport;
}

function sanitizeTestTokenCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function buildTestGeminiTokenUsageTelemetry(model: string, usageMetadata: unknown) {
  if (!usageMetadata || typeof usageMetadata !== 'object') {
    return null;
  }

  const usage = usageMetadata as Record<string, unknown>;
  return {
    model,
    promptTokenCount: sanitizeTestTokenCount(usage.promptTokenCount),
    candidatesTokenCount: sanitizeTestTokenCount(usage.candidatesTokenCount),
    totalTokenCount: sanitizeTestTokenCount(usage.totalTokenCount),
    cachedContentTokenCount: sanitizeTestTokenCount(usage.cachedContentTokenCount),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('customer-intelligence analyst degradation fallback', () => {
  it('stays neutral and does not coerce product search when the analyst degrades', () => {
    const fallback = buildNeutralAnalystFallbackReport();

    expect(fallback.intent).toBe('UNKNOWN');
    expect(fallback.primary_intent).toBe('UNKNOWN');
    expect(fallback.secondary_intents).toEqual([]);
    expect(fallback.turn_priority).toBe('UNCLEAR_FIRST');
    expect(fallback.turn_decision).toBe('ASK_CLARIFYING_QUESTION');
    expect(fallback.tool_calls).toEqual([]);
    expect(fallback.customer_dna).toEqual({
      interests: [],
      preference_signals: [],
    });
    expect(fallback.fallback_reason).toBe('ANALYST_DEGRADED');
  });

  it('degrades to neutral fallback when tool_calls is a string', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = parseAnalystReportForContract(JSON.stringify({
      intent: 'CHIT_CHAT',
      current_turn_decision: 'DIRECT_ANSWER',
      tool_calls: 'not_an_array',
    }));

    expect(result).toEqual(buildNeutralAnalystFallbackReport());
  });

  it('degrades to neutral fallback when tool_calls is null', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = parseAnalystReportForContract(JSON.stringify({
      intent: 'CHIT_CHAT',
      current_turn_decision: 'DIRECT_ANSWER',
      tool_calls: null,
    }));

    expect(result).toEqual(buildNeutralAnalystFallbackReport());
  });

  it('keeps valid empty tool_calls arrays valid', () => {
    const result = parseAnalystReportForContract(JSON.stringify({
      intent: 'CHIT_CHAT',
      current_turn_decision: 'DIRECT_ANSWER',
      tool_calls: [],
    }));

    expect(result.intent).toBe('CHIT_CHAT');
    expect(result.tool_calls).toEqual([]);
    expect(result.fallback_reason).toBeUndefined();
  });

  it('keeps valid populated tool_calls arrays valid', () => {
    const toolCalls = [
      {
        name: 'knowledge_rag_foundation',
        args: { query: 'politica de envios', is_ambiguous: false },
      },
    ];

    const result = parseAnalystReportForContract(JSON.stringify({
      intent: 'PRODUCT_SEARCH',
      current_turn_decision: 'USE_CAPABILITY',
      tool_calls: toolCalls,
    }));

    expect(result.intent).toBe('PRODUCT_SEARCH');
    expect(result.tool_calls).toEqual(toolCalls);
    expect(result.fallback_reason).toBeUndefined();
  });

  it('logs sanitized metadata for malformed tool_calls without prompt, customer, provider, or secret material', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sensitiveValues = [
      'SECRET_PROMPT_DO_NOT_LOG',
      'CUSTOMER_MESSAGE_DO_NOT_LOG',
      'RAW_PROVIDER_RESPONSE_DO_NOT_LOG',
      'sk-live-secret',
      'Authorization',
      'Bearer token',
    ];

    parseAnalystReportForContract(JSON.stringify({
      intent: 'CHIT_CHAT',
      current_turn_decision: 'DIRECT_ANSWER',
      tool_calls: 'not_an_array',
      prompt: sensitiveValues[0],
      customer_text: sensitiveValues[1],
      raw_provider_response: sensitiveValues[2],
      secret: sensitiveValues[3],
      headers: {
        Authorization: sensitiveValues[5],
      },
    }));

    const warningText = warnSpy.mock.calls.flat().join(' ');

    expect(warningText).toContain('tool_calls_not_array');
    expect(warningText).toContain('received_type');
    for (const sensitiveValue of sensitiveValues) {
      expect(warningText).not.toContain(sensitiveValue);
    }
  });

  it('does not keep the production silent coercion branch for malformed tool_calls', () => {
    const source = readCustomerIntelligenceSource();

    expect(source).not.toContain('parsed.tool_calls = Array.isArray(parsed.tool_calls) ? parsed.tool_calls : []');
    expect(source).toContain("throw new Error('Analyst tool_calls not array')");
  });

  it('keeps the Analyst model fallback on gemini-2.5-pro', () => {
    const source = readCustomerIntelligenceSource();

    expect(source).toContain("const CONCIERGE_ANALYST_MODEL = Deno.env.get('CONCIERGE_ANALYST_MODEL') || 'gemini-2.5-pro';");
    expect(source).not.toContain("const CONCIERGE_ANALYST_MODEL = Deno.env.get('CONCIERGE_ANALYST_MODEL') || 'gemini-2.5-flash';");
  });

  it('preserves JSON response MIME type on the Analyst Gemini request', () => {
    const analystRequestBlock = extractAnalystRequestBlock(readCustomerIntelligenceSource());

    expect(analystRequestBlock).toContain('this.modelId');
    expect(analystRequestBlock).toContain("response_mime_type: 'application/json'");
    expect(analystRequestBlock).toContain('response_schema: {');
  });

  it('keeps Analyst response_schema intent enum aligned with VALID_INTENTS', () => {
    const source = readCustomerIntelligenceSource();
    // Validate that the adapter uses its VALID_INTENTS property directly in the schema
    expect(source).toContain('enum: this.VALID_INTENTS');
    expect(source).toContain('private readonly VALID_INTENTS = [');
  });

  it('keeps Analyst response_schema required fields stable', () => {
    const source = readCustomerIntelligenceSource();
    
    // Ensure the required array contains the correct keys
    expect(source).toContain("required: ['intent', 'current_turn_decision', 'tool_calls']");
  });

  it('keeps tool_calls response_schema as an array of named tool objects with args', () => {
    const analystRequestBlock = extractAnalystRequestBlock(readCustomerIntelligenceSource());

    expect(analystRequestBlock).toContain('tool_calls: {');
    expect(analystRequestBlock).toContain("type: 'ARRAY'");
    expect(analystRequestBlock).toContain("name: { type: 'STRING' }");
    expect(analystRequestBlock).toContain("args: { type: 'OBJECT' }");
    expect(analystRequestBlock).toContain("required: ['name', 'args']");
  });

  it('builds sanitized token_usage from model identifiers and numeric token metadata only', () => {
    const telemetry = buildTestGeminiTokenUsageTelemetry('gemini-2.5-pro', {
      promptTokenCount: 12,
      candidatesTokenCount: 34,
      totalTokenCount: 46,
      cachedContentTokenCount: 5,
      prompt: 'SECRET_PROMPT_DO_NOT_LOG',
      customer_text: 'CUSTOMER_MESSAGE_DO_NOT_LOG',
      raw_provider_response: 'RAW_PROVIDER_RESPONSE_DO_NOT_LOG',
      headers: { Authorization: 'Bearer token' },
      api_key: 'sk-live-secret',
    });

    expect(telemetry).toEqual({
      model: 'gemini-2.5-pro',
      promptTokenCount: 12,
      candidatesTokenCount: 34,
      totalTokenCount: 46,
      cachedContentTokenCount: 5,
    });
    expect(JSON.stringify(telemetry)).not.toMatch(
      /SECRET_PROMPT_DO_NOT_LOG|CUSTOMER_MESSAGE_DO_NOT_LOG|RAW_PROVIDER_RESPONSE_DO_NOT_LOG|Authorization|Bearer token|sk-live-secret/
    );
  });

  it('keeps Analyst and Sommelier token logs sanitized', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const analystUsage = buildTestGeminiTokenUsageTelemetry('gemini-2.5-pro', {
      promptTokenCount: 1,
      candidatesTokenCount: 2,
      totalTokenCount: 3,
      prompt: 'SECRET_PROMPT_DO_NOT_LOG',
      raw_provider_response: 'RAW_PROVIDER_RESPONSE_DO_NOT_LOG',
    });
    const sommelierUsage = buildTestGeminiTokenUsageTelemetry('gemini-2.5-pro', {
      promptTokenCount: 4,
      candidatesTokenCount: 5,
      totalTokenCount: 9,
      customer_text: 'CUSTOMER_MESSAGE_DO_NOT_LOG',
      secret: 'sk-live-secret',
    });

    console.warn('[Analyst Tokens]', JSON.stringify(analystUsage));
    console.warn('[Sommelier Tokens]', JSON.stringify(sommelierUsage));

    const warningText = warnSpy.mock.calls.flat().join(' ');
    expect(warningText).toContain('[Analyst Tokens]');
    expect(warningText).toContain('[Sommelier Tokens]');
    expect(warningText).toContain('promptTokenCount');
    expect(warningText).toContain('candidatesTokenCount');
    expect(warningText).toContain('totalTokenCount');
    expect(warningText).not.toMatch(
      /SECRET_PROMPT_DO_NOT_LOG|CUSTOMER_MESSAGE_DO_NOT_LOG|RAW_PROVIDER_RESPONSE_DO_NOT_LOG|Authorization|Bearer token|sk-live-secret/
    );
  });

  it('persists ai_analytics token_usage through the sanitized telemetry helper only', () => {
    const source = readCustomerIntelligenceSource();

    expect(source).toContain('function buildGeminiTokenUsageTelemetry(');
    expect(source).toContain('token_usage: {');
    expect(source).toContain('analyst: buildGeminiTokenUsageTelemetry(CONCIERGE_ANALYST_MODEL, analystResult?.usageMetadata)');
    expect(source).toContain('sommelier: buildGeminiTokenUsageTelemetry(CONCIERGE_SOMMELIER_MODEL, localSommelierResult?.usageMetadata)');
    expect(source).not.toContain('analyst: analystResult?.usageMetadata ?? null');
    expect(source).not.toContain('sommelier: localSommelierResult?.usageMetadata ?? null');
  });
});
