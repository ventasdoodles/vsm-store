import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildNeutralAnalystFallbackReport } from '../../../supabase/functions/customer-intelligence/analyst-fallback';

const TEST_VALID_INTENTS = ['CHIT_CHAT', 'PRODUCT_SEARCH', 'UNKNOWN'];
const TEST_DIRNAME = dirname(fileURLToPath(import.meta.url));
const CUSTOMER_INTELLIGENCE_INDEX = resolve(
  TEST_DIRNAME,
  '../../../supabase/functions/customer-intelligence/index.ts'
);

function readCustomerIntelligenceSource() {
  return readFileSync(CUSTOMER_INTELLIGENCE_INDEX, 'utf8');
}

function extractStringArray(source: string, pattern: RegExp) {
  const match = source.match(pattern);
  expect(match).not.toBeNull();

  const arraySource = match?.[1] ?? '';
  return Array.from(arraySource.matchAll(/'([^']+)'/g), ([, value]) => value);
}

function extractAnalystRequestBlock(source: string) {
  const analystCallStart = source.indexOf('analystResponse = await geminiGenerateContent({');
  const analystTimeoutStart = source.indexOf('clearTimeout(timeoutId);', analystCallStart);

  expect(analystCallStart).toBeGreaterThanOrEqual(0);
  expect(analystTimeoutStart).toBeGreaterThan(analystCallStart);

  return source.slice(analystCallStart, analystTimeoutStart);
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
    expect(source).toContain("reason: 'tool_calls_not_array'");
    expect(source).toContain("throw new Error('Analyst tool_calls not array')");
  });

  it('keeps the Analyst model fallback on gemini-2.5-pro', () => {
    const source = readCustomerIntelligenceSource();

    expect(source).toContain("const CONCIERGE_ANALYST_MODEL = Deno.env.get('CONCIERGE_ANALYST_MODEL') || 'gemini-2.5-pro';");
    expect(source).not.toContain("const CONCIERGE_ANALYST_MODEL = Deno.env.get('CONCIERGE_ANALYST_MODEL') || 'gemini-2.5-flash';");
  });

  it('preserves JSON response MIME type on the Analyst Gemini request', () => {
    const analystRequestBlock = extractAnalystRequestBlock(readCustomerIntelligenceSource());

    expect(analystRequestBlock).toContain('model: CONCIERGE_ANALYST_MODEL');
    expect(analystRequestBlock).toContain("response_mime_type: 'application/json'");
    expect(analystRequestBlock).toContain('response_schema: {');
  });

  it('keeps Analyst response_schema intent enum aligned with VALID_INTENTS', () => {
    const source = readCustomerIntelligenceSource();
    const validIntents = extractStringArray(
      source,
      /const VALID_INTENTS = \[([\s\S]*?)\];/
    );
    const schemaIntents = extractStringArray(
      source,
      /intent:\s*\{\s*type:\s*'STRING',\s*enum:\s*\[([\s\S]*?)\]/
    );

    expect(schemaIntents).toEqual(validIntents);
  });

  it('keeps Analyst response_schema required fields stable', () => {
    const source = readCustomerIntelligenceSource();
    const requiredFields = extractStringArray(
      source,
      /required:\s*\[([^\]]*'intent'[^\]]*'current_turn_decision'[^\]]*'tool_calls'[^\]]*)\]/
    );

    expect(requiredFields).toEqual(['intent', 'current_turn_decision', 'tool_calls']);
  });

  it('keeps tool_calls response_schema as an array of named tool objects with args', () => {
    const analystRequestBlock = extractAnalystRequestBlock(readCustomerIntelligenceSource());

    expect(analystRequestBlock).toContain('tool_calls: {');
    expect(analystRequestBlock).toContain("type: 'ARRAY'");
    expect(analystRequestBlock).toContain("name: { type: 'STRING' }");
    expect(analystRequestBlock).toContain("args: { type: 'OBJECT' }");
    expect(analystRequestBlock).toContain("required: ['name', 'args']");
  });
});
