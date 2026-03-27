import { describe, expect, it } from 'vitest';
import {
    buildAdminDecisionTraceView,
    buildAdminDecisionTraceViewFromSimulationResult,
} from '../admin-decision-trace.service';

describe('buildAdminDecisionTraceView', () => {
    it('builds authoritative runtime trace from persisted decision evidence', () => {
        const trace = buildAdminDecisionTraceView({
            responseText: 'Te recomendaria revisar estas opciones.',
            aiLogicDebug: {
                detected_intent: 'PRODUCT_SEARCH',
                sommelier_routed_capsule: 'product_search_integrity',
                routing_path: 'pre_routed',
                analyst_intent: 'UNKNOWN',
                guardrail_overrides: ['TERMINAL_RECOVERY'],
                injected_tools: ['product_search_integrity'],
                capsule_execution_status: 'SUCCESS',
                capsule_match_strategy: 'SEMANTIC',
                capsule_retrieval_source: 'EMBEDDING_SEMANTIC',
                offered_products: [{ id: 'p1', name: 'Mango Ice', slug: 'mango-ice' }],
            },
        });

        expect(trace.evidenceKind).toBe('authoritative_runtime');
        expect(trace.analystIntent).toBe('UNKNOWN');
        expect(trace.finalIntent).toBe('PRODUCT_SEARCH');
        expect(trace.routeKind).toBe('capsule');
        expect(trace.guardrailOverrides).toEqual(['TERMINAL_RECOVERY']);
        expect(trace.injectedTools).toEqual(['product_search_integrity']);
        expect(trace.retrievalSource).toBe('EMBEDDING_SEMANTIC');
        expect(trace.matchStrategy).toBe('SEMANTIC');
        expect(trace.offeredProducts).toHaveLength(1);
    });

    it('marks rows with no causal evidence as partial runtime', () => {
        const trace = buildAdminDecisionTraceView({
            responseText: 'Hola',
            aiLogicDebug: null,
        });

        expect(trace.evidenceKind).toBe('partial_runtime');
        expect(trace.routeKind).toBe('unknown');
        expect(trace.analystIntent).toBeNull();
        expect(trace.finalIntent).toBeNull();
    });
});

describe('buildAdminDecisionTraceViewFromSimulationResult', () => {
    it('marks QA simulation evidence as simulated without inventing runtime certainty', () => {
        const trace = buildAdminDecisionTraceViewFromSimulationResult({
            scenario_id: 'sim-1',
            score: 0.5,
            passed: false,
            status: 'FAIL',
            detected_intent: 'POLICY_INQUIRY',
            response: 'Necesito revisar la politica exacta.',
            latency_ms: 1200,
            knowledge_chunks: 0,
            tools_called: ['knowledge_rag_foundation'],
            reasons: ['low_confidence_fallback'],
            capsule_name: 'knowledge_rag_foundation',
            fallback_used: true,
            product_cards_count: 0,
        });

        expect(trace.evidenceKind).toBe('simulated');
        expect(trace.finalIntent).toBe('POLICY_INQUIRY');
        expect(trace.routedCapsule).toBe('knowledge_rag_foundation');
        expect(trace.injectedTools).toEqual(['knowledge_rag_foundation']);
        expect(trace.degradedReason).toBe('low_confidence_fallback');
    });
});
