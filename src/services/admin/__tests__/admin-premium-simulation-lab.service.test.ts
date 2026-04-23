import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: mocks.from,
    },
}));

import {
    buildPremiumLabArtifactSnapshot,
    createPremiumLabComment,
    createPremiumLabTurn,
    linkPremiumLabTurnToCaseDraft,
    linkPremiumLabTurnToImprovement,
    savePremiumLabTurnReview,
} from '../admin-premium-simulation-lab.service';

function insertChain(insertSpy: ReturnType<typeof vi.fn>, data: unknown) {
    return {
        insert: insertSpy.mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data, error: null }),
            }),
        }),
    };
}

function upsertChain(upsertSpy: ReturnType<typeof vi.fn>, data: unknown) {
    return {
        upsert: upsertSpy.mockReturnValue({
            select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data, error: null }),
            }),
        }),
    };
}

describe('admin-premium-simulation-lab.service', () => {
    beforeEach(() => {
        mocks.from.mockReset();
    });

    it('builds authoritative snapshots for storefront-equivalent turns with real runtime linkage', () => {
        const snapshot = buildPremiumLabArtifactSnapshot({
            mode_identity: 'storefront-equivalent',
            assistant_answer_snapshot: 'Te recomiendo Mango Ice.',
            runtime_interaction_id: 'analytics-1',
            ai_logic_debug: {
                detected_intent: 'PRODUCT_SEARCH',
                sommelier_routed_capsule: 'product_search_integrity',
                routing_path: 'pre_routed',
                offered_products: [{ id: 'prod-1', name: 'Mango Ice', slug: 'mango-ice' }],
            },
        });

        expect(snapshot.mode_identity).toBe('storefront-equivalent');
        expect(snapshot.execution_kind).toBe('storefront_runtime');
        expect(snapshot.runtime_interaction_id).toBe('analytics-1');
        expect(snapshot.trace.evidence_kind).toBe('authoritative_runtime');
        expect(snapshot.trace.routed_capsule).toBe('product_search_integrity');
        expect(snapshot.trace.offered_products).toHaveLength(1);
    });

    it('builds simulated snapshots for admin-simulated turns without runtime claims', () => {
        const snapshot = buildPremiumLabArtifactSnapshot({
            mode_identity: 'admin-simulated',
            assistant_answer_snapshot: 'Necesito una aclaracion antes de recomendar.',
            ai_logic_debug: {
                detected_intent: 'UNKNOWN',
            },
        });

        expect(snapshot.mode_identity).toBe('admin-simulated');
        expect(snapshot.execution_kind).toBe('lab_simulation');
        expect(snapshot.runtime_interaction_id).toBeNull();
        expect(snapshot.trace.evidence_kind).toBe('simulated');
    });

    it('builds replay snapshots that stay inspection-only instead of claiming live runtime', () => {
        const snapshot = buildPremiumLabArtifactSnapshot({
            mode_identity: 'replay',
            assistant_answer_snapshot: 'Respuesta replay',
            replay_source_interaction_id: 'analytics-9',
            ai_logic_debug: {
                detected_intent: 'ORDER_TRACKING',
                routing_path: 'fallback_handled',
            },
        });

        expect(snapshot.mode_identity).toBe('replay');
        expect(snapshot.execution_kind).toBe('replay_snapshot');
        expect(snapshot.replay_source_interaction_id).toBe('analytics-9');
        expect(snapshot.trace.evidence_kind).toBe('partial_runtime');
    });

    it('persists storefront-equivalent turns with runtime linkage and bounded history snapshots', async () => {
        const insertSpy = vi.fn();
        const created = {
            id: 'turn-1',
            session_id: 'session-1',
            turn_number: 1,
            mode_identity: 'storefront-equivalent',
            execution_kind: 'storefront_runtime',
            prompt_query: 'Quiero algo de mango',
            history_snapshot: [
                { role: 'user', content: 'Hola' },
                { role: 'assistant', content: 'Que buscas?' },
            ],
            history_message_count: 2,
            assistant_answer_snapshot: 'Te recomiendo Mango Ice.',
            artifact_snapshot: {
                mode_identity: 'storefront-equivalent',
            },
            evidence_summary: 'summary',
            runtime_interaction_id: 'analytics-1',
            replay_source_turn_id: null,
            replay_source_interaction_id: null,
            created_by: 'admin-1',
            created_at: new Date().toISOString(),
        };

        mocks.from.mockReturnValueOnce(insertChain(insertSpy, created));

        const result = await createPremiumLabTurn({
            session_id: 'session-1',
            turn_number: 1,
            mode_identity: 'storefront-equivalent',
            prompt_query: 'Quiero algo de mango',
            history_snapshot: [
                { role: 'user', content: 'Hola' },
                { role: 'assistant', content: 'Que buscas?' },
            ],
            assistant_answer_snapshot: 'Te recomiendo Mango Ice.',
            runtime_interaction_id: 'analytics-1',
            created_by: 'admin-1',
            ai_logic_debug: {
                detected_intent: 'PRODUCT_SEARCH',
                sommelier_routed_capsule: 'product_search_integrity',
            },
        });

        expect(result).toEqual(created);
        expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({
            session_id: 'session-1',
            turn_number: 1,
            mode_identity: 'storefront-equivalent',
            execution_kind: 'storefront_runtime',
            history_message_count: 2,
            runtime_interaction_id: 'analytics-1',
        }));
    });

    it('rejects admin-simulated turns that try to claim runtime_interaction_id', async () => {
        await expect(createPremiumLabTurn({
            session_id: 'session-2',
            turn_number: 1,
            mode_identity: 'admin-simulated',
            prompt_query: 'Prueba interna',
            history_snapshot: [],
            assistant_answer_snapshot: 'Respuesta simulada',
            runtime_interaction_id: 'analytics-2',
        })).rejects.toThrow('admin-simulated turns cannot claim runtime_interaction_id');

        expect(mocks.from).not.toHaveBeenCalled();
    });

    it('rejects replay turns that try to claim runtime_interaction_id', async () => {
        await expect(createPremiumLabTurn({
            session_id: 'session-3',
            turn_number: 1,
            mode_identity: 'replay',
            prompt_query: 'Replay',
            history_snapshot: [],
            assistant_answer_snapshot: 'Respuesta replay',
            runtime_interaction_id: 'analytics-3',
            replay_source_interaction_id: 'analytics-9',
        })).rejects.toThrow('replay turns cannot claim runtime_interaction_id');

        expect(mocks.from).not.toHaveBeenCalled();
    });

    it('persists linked evaluations, comments, case drafts, and improvement links on saved turns', async () => {
        const reviewUpsertSpy = vi.fn();
        const commentInsertSpy = vi.fn();
        const caseDraftInsertSpy = vi.fn();
        const improvementInsertSpy = vi.fn();

        mocks.from
            .mockReturnValueOnce(upsertChain(reviewUpsertSpy, {
                id: 'review-1',
                turn_id: 'turn-1',
                review_source: 'linked_ai_evaluation',
                ai_evaluation_id: 'eval-1',
                score: null,
                primary_tag: null,
                secondary_tags: [],
                severity: null,
                expected_outcome: null,
                comment: null,
                reviewer_id: 'admin-1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }))
            .mockReturnValueOnce(insertChain(commentInsertSpy, {
                id: 'comment-1',
                scope: 'turn',
                session_id: null,
                turn_id: 'turn-1',
                body: 'Worth comparing with the live storefront run.',
                created_by: 'admin-1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }))
            .mockReturnValueOnce(insertChain(caseDraftInsertSpy, {
                id: 'link-1',
                turn_id: 'turn-1',
                case_draft_id: 'draft-1',
                link_kind: 'derived_case_draft',
                created_by: 'admin-1',
                created_at: new Date().toISOString(),
            }))
            .mockReturnValueOnce(insertChain(improvementInsertSpy, {
                id: 'improvement-link-1',
                turn_id: 'turn-1',
                link_kind: 'improvement_item',
                improvement_item_id: 'improvement-1',
                intervention_signal_id: null,
                intervention_recommendation_id: null,
                created_by: 'admin-1',
                created_at: new Date().toISOString(),
            }));

        const review = await savePremiumLabTurnReview({
            turn_id: 'turn-1',
            review_source: 'linked_ai_evaluation',
            ai_evaluation_id: 'eval-1',
            reviewer_id: 'admin-1',
        });

        const comment = await createPremiumLabComment({
            scope: 'turn',
            turn_id: 'turn-1',
            body: 'Worth comparing with the live storefront run.',
            created_by: 'admin-1',
        });

        const caseDraftLink = await linkPremiumLabTurnToCaseDraft({
            turn_id: 'turn-1',
            case_draft_id: 'draft-1',
            created_by: 'admin-1',
        });

        const improvementLink = await linkPremiumLabTurnToImprovement({
            turn_id: 'turn-1',
            link_kind: 'improvement_item',
            improvement_item_id: 'improvement-1',
            created_by: 'admin-1',
        });

        expect(review.review_source).toBe('linked_ai_evaluation');
        expect(comment.scope).toBe('turn');
        expect(caseDraftLink.link_kind).toBe('derived_case_draft');
        expect(improvementLink.link_kind).toBe('improvement_item');
        expect(reviewUpsertSpy).toHaveBeenCalledWith(expect.objectContaining({
            turn_id: 'turn-1',
            ai_evaluation_id: 'eval-1',
        }), { onConflict: 'turn_id' });
        expect(commentInsertSpy).toHaveBeenCalledWith(expect.objectContaining({
            scope: 'turn',
            turn_id: 'turn-1',
        }));
        expect(caseDraftInsertSpy).toHaveBeenCalledWith(expect.objectContaining({
            turn_id: 'turn-1',
            case_draft_id: 'draft-1',
        }));
        expect(improvementInsertSpy).toHaveBeenCalledWith(expect.objectContaining({
            turn_id: 'turn-1',
            link_kind: 'improvement_item',
            improvement_item_id: 'improvement-1',
        }));
    });
});
