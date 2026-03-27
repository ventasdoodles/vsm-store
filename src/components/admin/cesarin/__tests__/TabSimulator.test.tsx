import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SimulationSession } from '@/types/cesarin';
import {
    buildAdminSimulationLabView,
    createSimulationSessionTurnRecord,
} from '@/services/admin/admin-simulation-lab.service';
import { TabSimulator } from '../TabSimulator';

const sessions: SimulationSession[] = [{
    id: 'session-1',
    history: [
        { role: 'user', content: 'Hola Cesarin' },
        { role: 'assistant', content: 'Hola, dime que buscas.' },
    ],
    metadata: {
        last_intent: 'GREETING',
    },
    is_active: true,
    created_at: '2026-03-27T12:00:00.000Z',
    expires_at: '2026-04-03T12:00:00.000Z',
}];

function buildView(selectedTurnId: string | null) {
    const turnOne = createSimulationSessionTurnRecord({
        id: 'turn-1',
        query: 'Hola Cesarin',
        response: 'Hola, dime que buscas.',
        createdAt: '2026-03-27T12:00:00.000Z',
        aiLogicDebug: {
            is_simulation: true,
            detected_intent: 'GREETING',
            routing_path: 'direct_reply',
        },
    });
    const turnTwo = createSimulationSessionTurnRecord({
        id: 'turn-2',
        query: 'Quiero un regalo de mango',
        response: 'Te recomiendo Mango Ice como punto de partida.',
        createdAt: '2026-03-27T12:02:00.000Z',
        interactionId: 'analytics-2',
        aiLogicDebug: {
            is_simulation: true,
            detected_intent: 'PRODUCT_SEARCH',
            sommelier_routed_capsule: 'product_search_integrity',
            injected_tools: ['product_search_integrity'],
        },
    });

    return buildAdminSimulationLabView({
        sessionId: 'session-1',
        turns: [turnOne, turnTwo],
        isSessionActive: true,
        selectedTurnId,
        evaluationMap: {
            'analytics-2': {
                analytics_id: 'analytics-2',
                score: 2,
                primary_tag: 'knowledge_gap',
                severity: 'high',
            },
        },
    });
}

describe('TabSimulator', () => {
    it('renders the conversation lab, exposes trace/workflow, and routes review from the selected turn', () => {
        const onSelectTurn = vi.fn();
        const onReviewTurn = vi.fn();
        const onSendMessage = vi.fn();
        const onLoadSession = vi.fn();
        const onNewSession = vi.fn();
        const setSimQuery = vi.fn();

        const { rerender } = render(
            <TabSimulator
                simQuery=""
                setSimQuery={setSimQuery}
                sessionView={buildView('turn-1')}
                errorMessage="La sesión perdió contexto parcial."
                isLoading={false}
                onSendMessage={onSendMessage}
                sessions={sessions}
                currentSessionId="session-1"
                onLoadSession={onLoadSession}
                onNewSession={onNewSession}
                onSelectTurn={onSelectTurn}
                onReviewTurn={onReviewTurn}
            />,
        );

        expect(screen.getByText(/Conversation Lab/i)).toBeInTheDocument();
        expect(screen.getByText(/La sesión perdió contexto parcial\./i)).toBeInTheDocument();
        expect(screen.getByText(/Workflow no disponible/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Hola, dime que buscas\./i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Te recomiendo Mango Ice como punto de partida\./i).length).toBeGreaterThan(0);

        fireEvent.click(screen.getByRole('button', { name: /Te recomiendo Mango Ice como punto de partida\./i }));
        expect(onSelectTurn).toHaveBeenCalledWith('turn-2');

        rerender(
            <TabSimulator
                simQuery=""
                setSimQuery={setSimQuery}
                sessionView={buildView('turn-2')}
                errorMessage="La sesión perdió contexto parcial."
                isLoading={false}
                onSendMessage={onSendMessage}
                sessions={sessions}
                currentSessionId="session-1"
                onLoadSession={onLoadSession}
                onNewSession={onNewSession}
                onSelectTurn={onSelectTurn}
                onReviewTurn={onReviewTurn}
            />,
        );

        expect(screen.getByText(/Traza del turno seleccionado/i)).toBeInTheDocument();
        expect(screen.getByText(/Workflow del turno seleccionado/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Abrir turno en review/i }));
        expect(onReviewTurn).toHaveBeenCalledWith('turn-2');
    });
});
