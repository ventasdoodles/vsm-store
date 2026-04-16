import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TabInterventions } from '../TabInterventions';

const mocks = vi.hoisted(() => {
    const signal = {
        id: 'signal-1',
        signal_type: 'enrichment_gap',
        product_id: 'prod-1',
        category: null,
        evidence_count: 3,
        evidence_window_days: 7,
        confidence: 'high',
        signal_detail: { product_name: 'Mango Ice' },
        created_at: '2026-04-15T00:00:00.000Z',
        first_occurrence_at: '2026-04-15T00:00:00.000Z',
        last_occurrence_at: '2026-04-15T00:00:00.000Z',
        status: 'pending',
    };

    const pendingRecommendation = {
        id: 'rec-1',
        signal_id: 'signal-1',
        intervention_type: 'enrichment',
        rank: 1,
        diagnosis: {
            root_cause: 'Missing enriched metadata',
            reasoning: 'Customers ask repeatedly for flavor context.',
            effort_hours: 0.25,
            estimated_impact: 'medium',
            implementation_notes: 'Update ai_sales_note',
        },
        operator_decision: 'pending',
        operator_id: null,
        operator_notes: null,
        operator_decision_at: null,
        execution_status: 'not_started',
        validation_date: null,
        signal_reduction_percent: null,
        created_at: '2026-04-15T00:00:00.000Z',
        updated_at: '2026-04-15T00:00:00.000Z',
        signal,
    };

    const approvedRecommendation = {
        ...pendingRecommendation,
        operator_decision: 'approved',
        operator_id: 'admin-1',
        operator_notes: 'Approved for manual execution',
        operator_decision_at: '2026-04-15T00:01:00.000Z',
    };

    return {
        signal,
        pendingRecommendation,
        approvedRecommendation,
        getRecommendations: vi.fn(),
        recordOperatorDecision: vi.fn(),
        acknowledgeSignal: vi.fn(),
        createImprovementItemFromRecommendation: vi.fn(),
        getImprovementItemsByRecommendationIds: vi.fn(),
        getUser: vi.fn(),
    };
});

vi.mock('@/services/admin/intervention-workflow.service', () => ({
    getRecommendations: mocks.getRecommendations,
    recordOperatorDecision: mocks.recordOperatorDecision,
    acknowledgeSignal: mocks.acknowledgeSignal,
}));

vi.mock('@/services/admin/admin-improvement.service', () => ({
    createImprovementItemFromRecommendation: mocks.createImprovementItemFromRecommendation,
    getImprovementItemsByRecommendationIds: mocks.getImprovementItemsByRecommendationIds,
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: mocks.getUser,
        },
    },
}));

describe('TabInterventions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getRecommendations.mockResolvedValue([mocks.pendingRecommendation]);
        mocks.getImprovementItemsByRecommendationIds.mockResolvedValue({});
        mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
        mocks.recordOperatorDecision.mockResolvedValue(mocks.approvedRecommendation);
        mocks.createImprovementItemFromRecommendation.mockResolvedValue({
            id: 'item-1',
            analytics_id: null,
            evaluation_id: null,
            source_kind: 'intervention_recommendation',
            intervention_signal_id: 'signal-1',
            intervention_recommendation_id: 'rec-1',
            lane: 'knowledge',
            title: 'Enriquecimiento: Missing enriched metadata',
            summary: 'Customers ask repeatedly for flavor context.',
            severity: 'high',
            status: 'open',
            owner_id: null,
            execution_note: null,
            artifact_ref: null,
            created_at: '2026-04-15T00:01:00.000Z',
            updated_at: '2026-04-15T00:01:00.000Z',
        });
        mocks.acknowledgeSignal.mockResolvedValue({ ...mocks.signal, status: 'acknowledged' });
    });

    it('renders the shared workflow panel for recommendations as intake before queue promotion', async () => {
        render(<TabInterventions />);

        await waitFor(() => {
            expect(screen.getByText(/Enriquecimiento de Producto/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Enriquecimiento de Producto/i }));

        await waitFor(() => {
            expect(screen.getAllByText(/Workflow de recomendaci/i).length).toBeGreaterThan(0);
        });
        expect(screen.getByText(/Pendiente de aprobaci/i)).toBeInTheDocument();
    });

    it('promotes an approved recommendation into the canonical improvement queue from the UI', async () => {
        render(<TabInterventions />);

        await waitFor(() => {
            expect(screen.getByText(/Enriquecimiento de Producto/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Aprobar/i }));

        await waitFor(() => {
            expect(mocks.recordOperatorDecision).toHaveBeenCalledWith({
                recommendation_id: 'rec-1',
                operator_decision: 'approved',
                operator_id: 'admin-1',
                notes: 'Approved for manual execution',
            });
        });
        expect(mocks.createImprovementItemFromRecommendation).toHaveBeenCalledWith({
            recommendation: mocks.approvedRecommendation,
            signal: mocks.signal,
        });
        expect(mocks.acknowledgeSignal).toHaveBeenCalledWith('signal-1');
    });
});
