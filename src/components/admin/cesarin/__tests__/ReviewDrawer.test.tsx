import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewDrawer } from '../ReviewDrawer';
import { buildAdminDecisionTraceView } from '@/services/admin/admin-decision-trace.service';

vi.mock('@/services/admin/admin-eval.service', () => ({
    getEvaluation: vi.fn().mockResolvedValue(null),
    saveEvaluation: vi.fn(),
}));

vi.mock('@/services/admin/admin-signal-states.service', () => ({
    getSignalStatesByIds: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/services/admin/admin-improvement.service', () => ({
    createImprovementItem: vi.fn(),
    laneFromPrimaryTag: vi.fn(() => 'other'),
}));

vi.mock('@/services/admin/admin-case-drafts.service', () => ({
    createCaseDraft: vi.fn(),
    deriveCaseDraftReadiness: vi.fn(() => 'draft'),
}));

describe('ReviewDrawer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the coherent causal panel with runtime evidence labels', async () => {
        const trace = buildAdminDecisionTraceView({
            responseText: 'Te llevare por la ruta de producto.',
            aiLogicDebug: {
                detected_intent: 'PRODUCT_SEARCH',
                sommelier_routed_capsule: 'product_search_integrity',
                routing_path: 'pre_routed',
                analyst_intent: 'UNKNOWN',
                guardrail_overrides: ['TERMINAL_RECOVERY'],
                injected_tools: ['product_search_integrity'],
                capsule_execution_status: 'SUCCESS',
            },
        });

        render(
            <ReviewDrawer
                isOpen
                onClose={() => {}}
                interaction={{
                    id: 'analytics-1',
                    query: 'quiero algo de mango',
                    response: 'Te llevare por la ruta de producto.',
                    created_at: new Date().toISOString(),
                    capsule: 'product_search_integrity',
                    detected_intent: 'PRODUCT_SEARCH',
                    decision_trace: trace,
                }}
            />,
        );

        expect(screen.getByText(/Traza causal/i)).toBeInTheDocument();
        expect(screen.getByText(/Evidencia runtime/i)).toBeInTheDocument();
        expect(screen.getByText(/TERMINAL_RECOVERY/i)).toBeInTheDocument();
        expect(screen.getByText(/product_search_integrity/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Te llevare por la ruta de producto\./i).length).toBeGreaterThan(0);
    });
});
