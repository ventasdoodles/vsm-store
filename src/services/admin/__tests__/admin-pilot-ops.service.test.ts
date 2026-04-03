import { beforeEach, describe, expect, it, vi } from 'vitest';

type QueryResult = {
    data: unknown[] | null;
    error: unknown;
};

let queryResult: QueryResult = { data: [], error: null };
let lastSelect = '';
let lastFrom = '';

function makeBuilder() {
    const builder: any = {
        select: vi.fn((fields: string) => {
            lastSelect = fields;
            return builder;
        }),
        gte: vi.fn(() => builder),
        lte: vi.fn(() => builder),
        or: vi.fn(() => builder),
        order: vi.fn(() => builder),
        limit: vi.fn(() => builder),
        then: (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
            Promise.resolve(queryResult).then(resolve, reject),
    };

    return builder;
}

const fromMock = vi.fn((table: string) => {
    lastFrom = table;
    return makeBuilder();
});

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: (...args: unknown[]) => fromMock(args[0] as string),
    },
}));

import { getPilotQueryLog } from '../admin-pilot-ops.service';

describe('admin pilot ops telemetry reader', () => {
    beforeEach(() => {
        queryResult = { data: [], error: null };
        lastSelect = '';
        lastFrom = '';
        fromMock.mockClear();
    });

    it('prefers bounded top-level telemetry columns when they are present', async () => {
        queryResult = {
            data: [{
                id: 'row-1',
                query: 'cuantas caladas trae mint fresh',
                response_text: 'Mint Fresh trae 6000 caladas.',
                created_at: '2026-04-02T10:00:00.000Z',
                frustration_detected: false,
                primary_intent: 'PRODUCT_SEARCH',
                current_turn_decision: 'DIRECT_ANSWER',
                turn_focus: 'product_fact',
                catalog_gate_open: true,
                catalog_gate_reason: 'search_leading',
                next_step_family: null,
                assist_action_present: false,
                source_context_present: false,
                retrieval_source: 'DIRECT_EXACT',
                ai_logic_debug: {
                    detected_intent: 'PRODUCT_SEARCH',
                    sommelier_routed_capsule: 'product_search_integrity',
                    semantic_match_success: true,
                    fallback_used: false,
                    product_card_count: 1,
                    policy_match_count: 0,
                    product_match_count: 1,
                    latency_ms: 180,
                    cart_action_detected: false,
                    raw_analyst_report: { intent: 'PRODUCT_SEARCH' },
                },
            }],
            error: null,
        };

        const rows = await getPilotQueryLog('2026-04-01T00:00:00.000Z', '2026-04-03T00:00:00.000Z');

        expect(lastFrom).toBe('ai_analytics');
        expect(lastSelect).toContain('primary_intent');
        expect(lastSelect).toContain('current_turn_decision');
        expect(lastSelect).toContain('next_step_family');
        expect(lastSelect).toContain('retrieval_source');
        expect(rows[0]).toMatchObject({
            primary_intent: 'PRODUCT_SEARCH',
            current_turn_decision: 'DIRECT_ANSWER',
            turn_focus: 'product_fact',
            catalog_gate_open: true,
            catalog_gate_reason: 'search_leading',
            next_step_family: null,
            assist_action_present: false,
            source_context_present: false,
            retrieval_source: 'DIRECT_EXACT',
        });
    });

    it('falls back to historical ai_logic_debug telemetry when top-level columns are absent', async () => {
        queryResult = {
            data: [{
                id: 'row-2',
                query: 'es compatible con xros',
                response_text: 'No veo compatibilidad confirmada con XROS.',
                created_at: '2026-04-02T10:05:00.000Z',
                frustration_detected: false,
                primary_intent: null,
                current_turn_decision: null,
                turn_focus: null,
                catalog_gate_open: null,
                catalog_gate_reason: null,
                next_step_family: null,
                assist_action_present: null,
                source_context_present: null,
                retrieval_source: null,
                ai_logic_debug: {
                    detected_intent: 'PRODUCT_SEARCH',
                    sommelier_routed_capsule: 'product_search_integrity',
                    semantic_match_success: true,
                    fallback_used: false,
                    product_card_count: 1,
                    policy_match_count: 0,
                    product_match_count: 1,
                    latency_ms: 210,
                    cart_action_detected: false,
                    primary_intent: 'PRODUCT_SEARCH',
                    current_turn_decision: 'DIRECT_ANSWER',
                    turn_focus: 'product_fact',
                    catalog_gate_open: true,
                    catalog_gate_reason: 'search_leading',
                    next_step_family: null,
                    assist_action_present: false,
                    source_context_present: false,
                    retrieval_source: 'DIRECT_EXACT',
                    raw_analyst_report: { intent: 'PRODUCT_SEARCH' },
                },
            }],
            error: null,
        };

        const rows = await getPilotQueryLog('2026-04-01T00:00:00.000Z', '2026-04-03T00:00:00.000Z');

        expect(rows[0]).toMatchObject({
            primary_intent: 'PRODUCT_SEARCH',
            current_turn_decision: 'DIRECT_ANSWER',
            turn_focus: 'product_fact',
            catalog_gate_open: true,
            catalog_gate_reason: 'search_leading',
            next_step_family: null,
            assist_action_present: false,
            source_context_present: false,
            retrieval_source: 'DIRECT_EXACT',
        });
    });
});
