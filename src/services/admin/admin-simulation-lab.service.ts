import type {
    PrivateCaseDraft,
    SimulationSession,
    SimulationSessionTurnRecord,
} from '@/types/cesarin';
import type { EvaluationData } from './admin-eval.service';
import type { ImprovementItem } from './admin-improvement.service';
import type { SignalStateRow } from './admin-signal-states.service';
import {
    buildAdminDecisionTraceView,
    type AdminDecisionTraceView,
} from './admin-decision-trace.service';
import {
    buildAdminImprovementWorkflowViewForInteraction,
    type AdminImprovementWorkflowView,
} from './admin-improvement-workflow.service';

export const ADMIN_SIMULATION_CONTEXT_MESSAGE_LIMIT = 12;

export interface BuildSimulationSessionTurnRecordInput {
    id?: string | null;
    query: string;
    response: string;
    createdAt?: string | null;
    interactionId?: string | null;
    aiLogicDebug?: Record<string, unknown> | null;
    sessionClosed?: boolean;
}

export interface AdminSimulationConversationTurnView {
    id: string;
    turnNumber: number;
    userMessage: string;
    assistantMessage: string;
    createdAt: string | null;
    interactionId: string | null;
    trace: AdminDecisionTraceView;
    workflow: AdminImprovementWorkflowView | null;
    canOpenReview: boolean;
    sessionClosedByTurn: boolean;
}

export interface AdminSimulationLabView {
    sessionId: string | null;
    state: 'draft' | 'active' | 'closed';
    stateLabel: string;
    stateDetail: string;
    contextWindowLabel: string;
    turns: AdminSimulationConversationTurnView[];
    selectedTurnId: string | null;
    selectedTurn: AdminSimulationConversationTurnView | null;
}

interface BuildAdminSimulationLabViewInput {
    sessionId: string | null;
    turns: SimulationSessionTurnRecord[];
    isSessionActive: boolean;
    selectedTurnId: string | null;
    evaluationMap?: Record<string, EvaluationData>;
    signalStateMap?: Record<string, SignalStateRow>;
    improvementMap?: Record<string, ImprovementItem>;
    caseDraftMap?: Record<string, PrivateCaseDraft>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0
        ? value.trim()
        : null;
}

function isSimulationSessionTurnRecord(value: unknown): value is SimulationSessionTurnRecord {
    const record = asRecord(value);
    if (!record) return false;

    return (
        typeof record.id === 'string' &&
        typeof record.query === 'string' &&
        typeof record.response === 'string' &&
        typeof record.created_at === 'string'
    );
}

export function createSimulationSessionTurnRecord({
    id,
    query,
    response,
    createdAt,
    interactionId,
    aiLogicDebug,
    sessionClosed = false,
}: BuildSimulationSessionTurnRecordInput): SimulationSessionTurnRecord {
    return {
        id: id && id.trim().length > 0 ? id : crypto.randomUUID(),
        query,
        response,
        created_at: createdAt && createdAt.trim().length > 0 ? createdAt : new Date().toISOString(),
        interaction_id: interactionId ?? null,
        ai_logic_debug: aiLogicDebug ?? null,
        session_closed: sessionClosed,
    };
}

export function extractSimulationSessionTurnRecords(
    session: SimulationSession,
): SimulationSessionTurnRecord[] {
    const persistedTurns = Array.isArray(session.metadata?.turns)
        ? session.metadata.turns.filter(isSimulationSessionTurnRecord)
        : [];

    if (persistedTurns.length > 0) {
        return persistedTurns;
    }

    const fallbackTurns: SimulationSessionTurnRecord[] = [];
    let pendingUserMessage: string | null = null;

    for (const message of session.history) {
        if (message.role === 'user') {
            pendingUserMessage = message.content;
            continue;
        }

        if (message.role !== 'assistant') continue;

        const isLastAssistantTurn = fallbackTurns.length === Math.max(
            session.history.filter((entry) => entry.role === 'assistant').length - 1,
            0,
        );

        fallbackTurns.push(createSimulationSessionTurnRecord({
            id: `legacy-${session.id}-${fallbackTurns.length + 1}`,
            query: pendingUserMessage ?? '',
            response: message.content,
            createdAt: session.created_at,
            interactionId: isLastAssistantTurn
                ? session.metadata?.last_interaction_id ?? null
                : null,
            aiLogicDebug: isLastAssistantTurn
                ? asRecord(session.metadata?.debug) ?? { is_simulation: true }
                : { is_simulation: true },
            sessionClosed: isLastAssistantTurn
                ? !session.is_active || session.metadata?.debug?.should_close_session === true
                : false,
        }));

        pendingUserMessage = null;
    }

    return fallbackTurns;
}

export function buildAdminSimulationLabView({
    sessionId,
    turns,
    isSessionActive,
    selectedTurnId,
    evaluationMap = {},
    signalStateMap = {},
    improvementMap = {},
    caseDraftMap = {},
}: BuildAdminSimulationLabViewInput): AdminSimulationLabView {
    const conversationTurns = turns.map<AdminSimulationConversationTurnView>((turn, index) => {
        const trace = buildAdminDecisionTraceView({
            responseText: turn.response,
            aiLogicDebug: turn.ai_logic_debug ?? { is_simulation: true },
            forceEvidenceKind: turn.ai_logic_debug ? null : 'simulated',
        });

        const workflow = turn.interaction_id
            ? buildAdminImprovementWorkflowViewForInteraction({
                analyticsId: turn.interaction_id,
                evaluation: evaluationMap[turn.interaction_id] ?? null,
                signalState: signalStateMap[turn.interaction_id] ?? null,
                improvementItem: improvementMap[turn.interaction_id] ?? null,
                caseDraft: caseDraftMap[turn.interaction_id] ?? null,
            })
            : null;

        return {
            id: turn.id,
            turnNumber: index + 1,
            userMessage: turn.query,
            assistantMessage: turn.response,
            createdAt: turn.created_at,
            interactionId: turn.interaction_id,
            trace,
            workflow,
            canOpenReview: Boolean(turn.interaction_id),
            sessionClosedByTurn: turn.session_closed,
        };
    });

    const selectedTurn = conversationTurns.find((turn) => turn.id === selectedTurnId)
        ?? conversationTurns[conversationTurns.length - 1]
        ?? null;

    const state: AdminSimulationLabView['state'] = conversationTurns.length === 0
        ? 'draft'
        : (!isSessionActive || conversationTurns[conversationTurns.length - 1]?.sessionClosedByTurn)
            ? 'closed'
            : 'active';

    const stateLabel = state === 'draft'
        ? 'Sesión nueva'
        : state === 'closed'
            ? 'Sesión cerrada'
            : 'Sesión activa';

    const stateDetail = state === 'draft'
        ? 'La sesión nace al enviar el primer turno. No existe memoria implícita entre sesiones.'
        : state === 'closed'
            ? 'Cesarin cerró esta simulación o la sesión quedó marcada como inactiva. Inicia una nueva para seguir probando.'
            : 'Cesarin mantiene contexto acotado dentro de esta sesión simulada y no promete continuidad fuera de ella.';

    return {
        sessionId,
        state,
        stateLabel,
        stateDetail,
        contextWindowLabel: `Contexto acotado a los últimos ${ADMIN_SIMULATION_CONTEXT_MESSAGE_LIMIT} mensajes enviados al runtime.`,
        turns: conversationTurns,
        selectedTurnId: selectedTurn?.id ?? null,
        selectedTurn,
    };
}

export function buildSimulationSessionPreviewLabel(session: SimulationSession): string {
    return asString(session.history.find((message) => message.role === 'user')?.content)
        ?? 'Sin mensajes';
}
