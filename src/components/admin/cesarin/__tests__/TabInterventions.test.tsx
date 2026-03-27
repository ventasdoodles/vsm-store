import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabInterventions } from '../TabInterventions';

vi.mock('@/services/admin/intervention-workflow.service', () => ({
    getRecommendations: vi.fn().mockResolvedValue([
        {
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            signal: {
                id: 'signal-1',
                signal_type: 'enrichment_gap',
                product_id: 'prod-1',
                category: null,
                evidence_count: 3,
                evidence_window_days: 7,
                confidence: 'high',
                signal_detail: { product_name: 'Mango Ice' },
                created_at: new Date().toISOString(),
                first_occurrence_at: new Date().toISOString(),
                last_occurrence_at: new Date().toISOString(),
                status: 'pending',
            },
        },
    ]),
    recordOperatorDecision: vi.fn(),
    acknowledgeSignal: vi.fn(),
}));

describe('TabInterventions', () => {
    it('renders the shared workflow panel for recommendations', async () => {
        render(<TabInterventions />);

        await waitFor(() => {
            expect(screen.getByText(/Enriquecimiento de Producto/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Enriquecimiento de Producto/i }));

        expect(await screen.findByText(/Workflow de recomendación a cierre/i)).toBeInTheDocument();
        expect(screen.getByText(/Sin item enlazado/i)).toBeInTheDocument();
    });
});
