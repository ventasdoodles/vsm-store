import { describe, expect, it } from 'vitest';
import {
    buildAdminImprovementWorkflowViewForInteraction,
    buildAdminImprovementWorkflowViewFromImprovementItem,
    buildAdminImprovementWorkflowViewFromRecommendation,
    buildAdminImprovementWorkflowViewFromSimulationResult,
} from '../admin-improvement-workflow.service';

const now = () => new Date().toISOString();

describe('admin-improvement-workflow.service', () => {
    it('marks reviewed interactions as triaged without inventing recommendation linkage', () => {
        const view = buildAdminImprovementWorkflowViewForInteraction({
            analyticsId: 'analytics-1',
            evaluation: {
                score: 2,
                primary_tag: 'knowledge_gap',
                severity: 'high',
            },
            signalState: null,
            improvementItem: null,
            caseDraft: null,
        });

        expect(view.currentStatus).toBe('triaged');
        expect(view.hasRecommendation).toBe(false);
        expect(view.hasImprovementItem).toBe(false);
        expect(view.steps.find((step) => step.key === 'recommendation')?.statusLabel).toBe('Sin vínculo directo');
    });

    it('marks reviewed interactions with linked improvement items as canonical queue work', () => {
        const view = buildAdminImprovementWorkflowViewForInteraction({
            analyticsId: 'analytics-1',
            evaluation: {
                score: 2,
                primary_tag: 'knowledge_gap',
                severity: 'high',
            },
            signalState: {
                status: 'convertida_mejora',
                handled_at: now(),
                ref_label: 'Completar metadata',
            },
            improvementItem: {
                id: 'item-1',
                analytics_id: 'analytics-1',
                evaluation_id: 'eval-1',
                source_kind: 'review_interaction',
                intervention_signal_id: null,
                intervention_recommendation_id: null,
                lane: 'knowledge',
                title: 'Completar metadata',
                summary: 'Agregar sabor y perfil',
                severity: 'high',
                status: 'open',
                owner_id: null,
                execution_note: null,
                artifact_ref: null,
                created_at: now(),
                updated_at: now(),
            },
            caseDraft: null,
        });

        expect(view.currentStatus).toBe('approved');
        expect(view.hasRecommendation).toBe(false);
        expect(view.hasImprovementItem).toBe(true);
        expect(view.steps.find((step) => step.key === 'improvement')?.statusLabel).toBe('Abierto');
    });

    it('marks simulation findings as simulated until they become a reusable case', () => {
        const view = buildAdminImprovementWorkflowViewFromSimulationResult({
            result: {
                scenario_id: 'sim-1',
                score: 0.2,
                passed: false,
                status: 'FAIL',
                detected_intent: 'PRODUCT_SEARCH',
                response: 'No encontre nada.',
                latency_ms: 800,
                knowledge_chunks: 0,
                tools_called: [],
                reasons: ['zero_product_cards'],
            },
            caseDraft: {
                id: 'draft-1',
                source_type: 'qa_simulation',
                source_ref_id: 'sim-1',
                source_session_id: 'report-1',
                source_interaction_id: null,
                input: 'busco algo',
                observed_response: 'No encontre nada.',
                evaluation_summary: 'zero cards',
                expected_outcome: null,
                route_or_capsule: 'product_search_integrity',
                detected_intent: 'PRODUCT_SEARCH',
                evaluation_score: 2,
                failure_reason: 'zero_product_cards',
                readiness_status: 'needs_expected_outcome',
                created_at: now(),
                updated_at: now(),
            },
        });

        expect(view.currentStatus).toBe('triaged');
        expect(view.evidenceKind).toBe('simulated');
        expect(view.steps.find((step) => step.key === 'triaged')?.statusLabel).toBe('Borrador parcial');
    });

    it('tracks pending recommendations as intake before queue promotion', () => {
        const view = buildAdminImprovementWorkflowViewFromRecommendation({
            signal: {
                id: 'signal-1',
                signal_type: 'enrichment_gap',
                evidence_count: 4,
                evidence_window_days: 7,
                confidence: 'high',
                signal_detail: { product_name: 'Mango Ice' },
                created_at: now(),
                first_occurrence_at: now(),
                last_occurrence_at: now(),
                status: 'pending',
            },
            recommendation: {
                id: 'rec-1',
                signal_id: 'signal-1',
                intervention_type: 'enrichment',
                rank: 1,
                diagnosis: {
                    root_cause: 'Missing enriched metadata',
                    reasoning: 'Customers keep asking about flavor profile.',
                    effort_hours: 0.25,
                    estimated_impact: 'medium',
                },
                operator_decision: 'pending',
                execution_status: 'not_started',
                created_at: now(),
                updated_at: now(),
            },
        });

        expect(view.currentStatus).toBe('triaged');
        expect(view.hasRecommendation).toBe(true);
        expect(view.hasImprovementItem).toBe(false);
        expect(view.steps.find((step) => step.key === 'recommendation')?.statusLabel).toBe('Pendiente de decisión');
        expect(view.steps.find((step) => step.key === 'improvement')?.statusLabel).toBe('Pendiente de aprobación');
    });

    it('shows approved intervention recommendations promoted into linked improvement items', () => {
        const view = buildAdminImprovementWorkflowViewFromRecommendation({
            signal: {
                id: 'signal-1',
                signal_type: 'enrichment_gap',
                evidence_count: 4,
                evidence_window_days: 7,
                confidence: 'high',
                signal_detail: { product_name: 'Mango Ice' },
                created_at: now(),
                first_occurrence_at: now(),
                last_occurrence_at: now(),
                status: 'acknowledged',
            },
            recommendation: {
                id: 'rec-1',
                signal_id: 'signal-1',
                intervention_type: 'enrichment',
                rank: 1,
                diagnosis: {
                    root_cause: 'Missing enriched metadata',
                    reasoning: 'Customers keep asking about flavor profile.',
                    effort_hours: 0.25,
                    estimated_impact: 'medium',
                },
                operator_decision: 'approved',
                operator_id: 'operator-1',
                operator_notes: 'Approved',
                operator_decision_at: now(),
                execution_status: 'not_started',
                created_at: now(),
                updated_at: now(),
            },
            improvementItem: {
                id: 'item-1',
                analytics_id: null,
                evaluation_id: null,
                source_kind: 'intervention_recommendation',
                intervention_signal_id: 'signal-1',
                intervention_recommendation_id: 'rec-1',
                lane: 'knowledge',
                title: 'Enriquecimiento: Missing enriched metadata',
                summary: 'Customers keep asking about flavor profile.',
                severity: 'high',
                status: 'open',
                owner_id: null,
                execution_note: null,
                artifact_ref: null,
                created_at: now(),
                updated_at: now(),
            },
        });

        expect(view.currentStatus).toBe('approved');
        expect(view.hasRecommendation).toBe(true);
        expect(view.hasImprovementItem).toBe(true);
        expect(view.evidenceDetail).toMatch(/cesarin_improvement_items/);
        expect(view.steps.find((step) => step.key === 'improvement')?.statusLabel).toBe('Abierto');
    });

    it('treats resolved improvements with artifact evidence as validated and closed', () => {
        const view = buildAdminImprovementWorkflowViewFromImprovementItem({
            item: {
                id: 'item-1',
                analytics_id: 'analytics-1',
                evaluation_id: 'eval-1',
                source_kind: 'review_interaction',
                intervention_signal_id: null,
                intervention_recommendation_id: null,
                lane: 'knowledge',
                title: 'Completar metadata',
                summary: 'Agregar sabor y perfil',
                severity: 'medium',
                status: 'resolved',
                owner_id: 'operator-1',
                execution_note: 'Metadata merged into product copy.',
                artifact_ref: 'rule://knowledge/mango-ice',
                created_at: now(),
                updated_at: now(),
                source_query: 'algo de mango',
            },
            evaluation: {
                score: 2,
                primary_tag: 'knowledge_gap',
                severity: 'medium',
            },
            caseDraft: null,
        });

        expect(view.currentStatus).toBe('validated');
        expect(view.hasImprovementItem).toBe(true);
        expect(view.steps.find((step) => step.key === 'validation')?.statusLabel).toBe('Con evidencia');
        expect(view.steps.find((step) => step.key === 'closure')?.statusLabel).toBe('Cerrado');
    });
});
