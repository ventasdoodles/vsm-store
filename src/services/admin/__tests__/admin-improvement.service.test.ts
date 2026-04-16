import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: mocks.from,
    },
}));

import { createImprovementItemFromRecommendation } from '../admin-improvement.service';
import type { InterventionRecommendation, InterventionSignal } from '@/types/cesarin';

const signal: InterventionSignal = {
    id: 'signal-1',
    signal_type: 'enrichment_gap',
    evidence_count: 4,
    evidence_window_days: 7,
    confidence: 'high',
    signal_detail: { product_name: 'Mango Ice' },
    created_at: new Date().toISOString(),
    first_occurrence_at: new Date().toISOString(),
    last_occurrence_at: new Date().toISOString(),
    status: 'acknowledged',
};

const recommendation: InterventionRecommendation = {
    id: 'rec-1',
    signal_id: 'signal-1',
    intervention_type: 'enrichment',
    rank: 1,
    diagnosis: {
        root_cause: 'Missing enriched metadata',
        reasoning: 'Customers keep asking about flavor profile.',
        effort_hours: 0.25,
        estimated_impact: 'medium',
        implementation_notes: 'Update ai_sales_note.',
    },
    operator_decision: 'approved',
    operator_id: 'operator-1',
    operator_notes: 'Approved',
    operator_decision_at: new Date().toISOString(),
    execution_status: 'not_started',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

function existingLookup(data: unknown[]) {
    return {
        select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data, error: null }),
            }),
        }),
    };
}

function insertChain(insertSpy: ReturnType<typeof vi.fn>, data: unknown) {
    return {
        insert: insertSpy.mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data, error: null }),
            }),
        }),
    };
}

describe('admin-improvement.service recommendation promotion', () => {
    beforeEach(() => {
        mocks.from.mockReset();
    });

    it('promotes an approved intervention recommendation into a linked improvement item', async () => {
        const insertSpy = vi.fn();
        const created = {
            id: 'item-1',
            analytics_id: null,
            evaluation_id: null,
            source_kind: 'intervention_recommendation',
            intervention_signal_id: 'signal-1',
            intervention_recommendation_id: 'rec-1',
            lane: 'knowledge',
            title: 'Enriquecimiento: Missing enriched metadata',
            summary: 'Customers keep asking about flavor profile.\n\nUpdate ai_sales_note.',
            severity: 'high',
            status: 'open',
            owner_id: null,
            execution_note: null,
            artifact_ref: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        mocks.from
            .mockReturnValueOnce(existingLookup([]))
            .mockReturnValueOnce(insertChain(insertSpy, created));

        const result = await createImprovementItemFromRecommendation({ recommendation, signal });

        expect(result).toEqual(created);
        expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
            analytics_id: null,
            source_kind: 'intervention_recommendation',
            intervention_signal_id: 'signal-1',
            intervention_recommendation_id: 'rec-1',
            lane: 'knowledge',
            severity: 'high',
            status: 'open',
        }));
    });

    it('returns an existing linked improvement item instead of creating a duplicate', async () => {
        const existing = {
            id: 'item-1',
            analytics_id: null,
            evaluation_id: null,
            source_kind: 'intervention_recommendation',
            intervention_signal_id: 'signal-1',
            intervention_recommendation_id: 'rec-1',
            lane: 'knowledge',
            title: 'Existing item',
            summary: null,
            severity: 'high',
            status: 'open',
            owner_id: null,
            execution_note: null,
            artifact_ref: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        mocks.from.mockReturnValueOnce(existingLookup([existing]));

        const result = await createImprovementItemFromRecommendation({ recommendation, signal });

        expect(result?.id).toBe('item-1');
        expect(mocks.from).toHaveBeenCalledTimes(1);
    });
});
