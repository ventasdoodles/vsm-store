import { describe, expect, it } from 'vitest';
import type { SimulationSession } from '@/types/cesarin';
import {
    ADMIN_SIMULATION_CONTEXT_MESSAGE_LIMIT,
    buildAdminSimulationLabView,
    createSimulationSessionTurnRecord,
    extractSimulationSessionTurnRecords,
} from '../admin-simulation-lab.service';

describe('admin-simulation-lab.service', () => {
    it('reconstructs legacy simulation sessions and keeps persisted evidence on the last turn', () => {
        const session: SimulationSession = {
            id: 'session-1',
            history: [
                { role: 'user', content: 'Hola Cesarin' },
                { role: 'assistant', content: 'Hola, dime que buscas.' },
                { role: 'user', content: 'Quiero algo de mango' },
                { role: 'assistant', content: 'Te recomiendo Mango Ice.' },
            ],
            metadata: {
                last_intent: 'PRODUCT_SEARCH',
                last_interaction_id: 'analytics-2',
                debug: {
                    intent: 'PRODUCT_SEARCH',
                    should_close_session: true,
                },
            },
            is_active: false,
            created_at: '2026-03-27T12:00:00.000Z',
            expires_at: '2026-04-03T12:00:00.000Z',
        };

        const turns = extractSimulationSessionTurnRecords(session);

        expect(turns).toHaveLength(2);
        expect(turns[0]).toMatchObject({
            query: 'Hola Cesarin',
            response: 'Hola, dime que buscas.',
            interaction_id: null,
            session_closed: false,
        });
        expect(turns[1]).toMatchObject({
            query: 'Quiero algo de mango',
            response: 'Te recomiendo Mango Ice.',
            interaction_id: 'analytics-2',
            session_closed: true,
        });
        expect(turns[1]?.ai_logic_debug).toMatchObject({
            intent: 'PRODUCT_SEARCH',
            should_close_session: true,
        });
    });

    it('builds the selected conversation turn with simulated trace and hydrated workflow truth', () => {
        const turn = createSimulationSessionTurnRecord({
            id: 'turn-1',
            query: 'Busco algo tropical',
            response: 'Te muestro Mango Ice.',
            createdAt: '2026-03-27T13:00:00.000Z',
            interactionId: 'analytics-1',
            aiLogicDebug: {
                is_simulation: true,
                detected_intent: 'PRODUCT_SEARCH',
                sommelier_routed_capsule: 'product_search_integrity',
                injected_tools: ['product_search_integrity'],
            },
        });

        const view = buildAdminSimulationLabView({
            sessionId: 'session-1',
            turns: [turn],
            isSessionActive: true,
            selectedTurnId: 'turn-1',
            evaluationMap: {
                'analytics-1': {
                    analytics_id: 'analytics-1',
                    score: 2,
                    primary_tag: 'knowledge_gap',
                    severity: 'high',
                },
            },
        });

        expect(view.state).toBe('active');
        expect(view.contextWindowLabel).toContain(String(ADMIN_SIMULATION_CONTEXT_MESSAGE_LIMIT));
        expect(view.selectedTurn).not.toBeNull();
        expect(view.selectedTurn?.trace.evidenceKind).toBe('simulated');
        expect(view.selectedTurn?.trace.routedCapsule).toBe('product_search_integrity');
        expect(view.selectedTurn?.workflow?.currentStatus).toBe('triaged');
        expect(view.selectedTurn?.workflow?.evidenceKind).toBe('authoritative');
        expect(view.selectedTurn?.canOpenReview).toBe(true);
    });
});
