import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabImprovements } from '../TabImprovements';

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: 'operator-1' } },
            }),
        },
    },
}));

vi.mock('@/services/admin/admin-improvement.service', () => ({
    getImprovementItems: vi.fn().mockResolvedValue([
        {
            id: 'item-1',
            analytics_id: 'analytics-1',
            evaluation_id: 'eval-1',
            lane: 'knowledge',
            title: 'Completar metadata de Mango Ice',
            summary: 'Agregar contexto de sabor',
            severity: 'medium',
            status: 'resolved',
            owner_id: 'operator-1',
            execution_note: 'Se actualizó la ficha.',
            artifact_ref: 'rule://knowledge/mango-ice',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            source_query: 'algo de mango',
        },
    ]),
    updateImprovementItem: vi.fn(),
}));

vi.mock('@/services/admin/admin-eval.service', () => ({
    getEvaluationsByIds: vi.fn().mockResolvedValue({
        'analytics-1': {
            analytics_id: 'analytics-1',
            score: 2,
            primary_tag: 'knowledge_gap',
            severity: 'medium',
        },
    }),
}));

vi.mock('@/services/admin/admin-case-drafts.service', () => ({
    getCaseDraftsByInteractionIds: vi.fn().mockResolvedValue([]),
}));

describe('TabImprovements', () => {
    it('shows the shared workflow panel for persisted improvement items', async () => {
        render(<TabImprovements />);

        await waitFor(() => {
            expect(screen.getByText(/Completar metadata de Mango Ice/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Completar metadata de Mango Ice/i }));

        expect(await screen.findByText(/Workflow de mejora y cierre/i)).toBeInTheDocument();
        expect(screen.getByText(/Promovida a mejora/i)).toBeInTheDocument();
    });
});
