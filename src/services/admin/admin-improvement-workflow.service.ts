import type { EvaluationData } from './admin-eval.service';
import type { ImprovementItem } from './admin-improvement.service';
import type {
    InterventionRecommendation,
    InterventionSignal,
    PrivateCaseDraft,
    SimulationResult,
} from '@/types/cesarin';

export type AdminWorkflowEvidenceKind =
    | 'authoritative'
    | 'partial'
    | 'simulated'
    | 'missing';

export type AdminWorkflowSourceKind =
    | 'review_interaction'
    | 'qa_simulation'
    | 'intervention_recommendation'
    | 'improvement_item';

export type AdminWorkflowLifecycleStatus =
    | 'detected'
    | 'triaged'
    | 'approved'
    | 'rejected'
    | 'implemented'
    | 'validated'
    | 'closed';

export type AdminWorkflowStepKey =
    | 'detected'
    | 'triaged'
    | 'recommendation'
    | 'improvement'
    | 'validation'
    | 'closure';

export type AdminWorkflowStepState =
    | 'complete'
    | 'current'
    | 'partial'
    | 'missing';

export interface AdminWorkflowStepView {
    key: AdminWorkflowStepKey;
    label: string;
    state: AdminWorkflowStepState;
    statusLabel: string;
    detail: string;
    evidenceKind: AdminWorkflowEvidenceKind;
    evidenceLabel: string;
}

export interface AdminImprovementWorkflowView {
    sourceKind: AdminWorkflowSourceKind;
    sourceLabel: string;
    headline: string;
    currentStatus: AdminWorkflowLifecycleStatus;
    currentStatusLabel: string;
    currentStatusDetail: string;
    evidenceKind: AdminWorkflowEvidenceKind;
    evidenceLabel: string;
    evidenceDetail: string;
    hasRecommendation: boolean;
    hasImprovementItem: boolean;
    steps: AdminWorkflowStepView[];
}

type EvaluationSummary = Pick<EvaluationData, 'score' | 'primary_tag' | 'severity'>;
type SignalStateSummary = {
    status: 'revisada' | 'descartada' | 'convertida_regla' | 'convertida_mejora' | 'resuelta';
    handled_at: string;
    handled_by?: string | null;
    ref_label?: string | null;
};

type InteractionInput = {
    analyticsId: string;
    evaluation?: EvaluationSummary | null;
    signalState?: SignalStateSummary | null;
    improvementItem?: ImprovementItem | null;
    caseDraft?: PrivateCaseDraft | null;
};

type SimulationInput = {
    result: SimulationResult;
    caseDraft?: PrivateCaseDraft | null;
};

type RecommendationInput = {
    recommendation: InterventionRecommendation;
    signal: InterventionSignal;
};

type ImprovementInput = {
    item: ImprovementItem;
    evaluation?: EvaluationSummary | null;
    caseDraft?: PrivateCaseDraft | null;
};

function evidenceLabel(kind: AdminWorkflowEvidenceKind): string {
    switch (kind) {
        case 'authoritative':
            return 'Evidencia completa';
        case 'partial':
            return 'Evidencia parcial';
        case 'simulated':
            return 'Evidencia simulada';
        case 'missing':
            return 'Evidencia faltante';
        default:
            return 'Evidencia parcial';
    }
}

function formatIsoShort(value?: string | null): string {
    if (!value) return 'sin fecha';
    try {
        return new Date(value).toLocaleString('es-MX', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

function buildClosureStepFromSignalState(
    signalState?: SignalStateSummary | null
): AdminWorkflowStepView {
    if (!signalState) {
        return {
            key: 'closure',
            label: 'Cierre',
            state: 'missing',
            statusLabel: 'Sin cierre registrado',
            detail: 'No existe una marca persistida de cierre o resolución para este hallazgo.',
            evidenceKind: 'missing',
            evidenceLabel: evidenceLabel('missing'),
        };
    }

    if (signalState.status === 'resuelta') {
        return {
            key: 'closure',
            label: 'Cierre',
            state: 'complete',
            statusLabel: 'Resuelta',
            detail: `La señal quedó resuelta el ${formatIsoShort(signalState.handled_at)}.`,
            evidenceKind: 'authoritative',
            evidenceLabel: evidenceLabel('authoritative'),
        };
    }

    if (signalState.status === 'descartada') {
        return {
            key: 'closure',
            label: 'Cierre',
            state: 'complete',
            statusLabel: 'Descartada',
            detail: `La señal fue descartada el ${formatIsoShort(signalState.handled_at)}.`,
            evidenceKind: 'authoritative',
            evidenceLabel: evidenceLabel('authoritative'),
        };
    }

    return {
        key: 'closure',
        label: 'Cierre',
        state: 'partial',
        statusLabel: 'Aún abierta',
        detail: `Existe gestión (${signalState.status}) pero no un cierre persistido final.`,
        evidenceKind: 'partial',
        evidenceLabel: evidenceLabel('partial'),
    };
}

function buildImprovementSteps(item: ImprovementItem): {
    currentStatus: AdminWorkflowLifecycleStatus;
    currentStatusLabel: string;
    currentStatusDetail: string;
    improvementStep: AdminWorkflowStepView;
    validationStep: AdminWorkflowStepView;
    closureStep: AdminWorkflowStepView;
} {
    const baseDetail = item.owner_id
        ? `Ítem ${item.status} con responsable asignado.`
        : `Ítem ${item.status} sin responsable asignado.`;

    if (item.status === 'wont_fix') {
        return {
            currentStatus: 'rejected',
            currentStatusLabel: 'Rechazada',
            currentStatusDetail: 'La mejora fue descartada explícitamente como wont_fix.',
            improvementStep: {
                key: 'improvement',
                label: 'Ítem de mejora',
                state: 'complete',
                statusLabel: 'Descartado',
                detail: item.execution_note || item.summary || baseDetail,
                evidenceKind: item.execution_note || item.artifact_ref ? 'authoritative' : 'partial',
                evidenceLabel: evidenceLabel(item.execution_note || item.artifact_ref ? 'authoritative' : 'partial'),
            },
            validationStep: {
                key: 'validation',
                label: 'Validación',
                state: 'missing',
                statusLabel: 'No aplica',
                detail: 'No hay validación adicional porque la mejora fue descartada.',
                evidenceKind: 'missing',
                evidenceLabel: evidenceLabel('missing'),
            },
            closureStep: {
                key: 'closure',
                label: 'Cierre',
                state: 'complete',
                statusLabel: 'Cerrado',
                detail: item.execution_note || 'El cierre quedó registrado como wont_fix.',
                evidenceKind: item.execution_note ? 'authoritative' : 'partial',
                evidenceLabel: evidenceLabel(item.execution_note ? 'authoritative' : 'partial'),
            },
        };
    }

    if (item.status === 'resolved') {
        const hasArtifact = Boolean(item.artifact_ref);
        return {
            currentStatus: hasArtifact ? 'validated' : 'closed',
            currentStatusLabel: hasArtifact ? 'Validada' : 'Cerrada',
            currentStatusDetail: hasArtifact
                ? 'La mejora quedó resuelta con artefacto persistido como evidencia.'
                : 'La mejora quedó resuelta, pero la validación depende solo de la nota persistida.',
            improvementStep: {
                key: 'improvement',
                label: 'Ítem de mejora',
                state: 'complete',
                statusLabel: 'Resuelto',
                detail: item.execution_note || item.summary || baseDetail,
                evidenceKind: 'authoritative',
                evidenceLabel: evidenceLabel('authoritative'),
            },
            validationStep: {
                key: 'validation',
                label: 'Validación',
                state: hasArtifact ? 'complete' : 'partial',
                statusLabel: hasArtifact ? 'Con evidencia' : 'Sin artefacto',
                detail: hasArtifact
                    ? `Artefacto: ${item.artifact_ref}`
                    : 'Existe cierre persistido, pero no un artefacto de validación enlazado.',
                evidenceKind: hasArtifact ? 'authoritative' : 'partial',
                evidenceLabel: evidenceLabel(hasArtifact ? 'authoritative' : 'partial'),
            },
            closureStep: {
                key: 'closure',
                label: 'Cierre',
                state: 'complete',
                statusLabel: 'Cerrado',
                detail: `El ítem fue cerrado el ${formatIsoShort(item.updated_at)}.`,
                evidenceKind: 'authoritative',
                evidenceLabel: evidenceLabel('authoritative'),
            },
        };
    }

    if (item.status === 'in_progress') {
        const hasExecutionEvidence = Boolean(item.execution_note || item.artifact_ref);
        return {
            currentStatus: hasExecutionEvidence ? 'implemented' : 'approved',
            currentStatusLabel: hasExecutionEvidence ? 'Implementándose' : 'Aprobada',
            currentStatusDetail: hasExecutionEvidence
                ? 'Hay evidencia persistida de ejecución, pero el cierre aún no existe.'
                : 'La mejora ya existe como trabajo aceptado, pero aún no tiene evidencia de implementación.',
            improvementStep: {
                key: 'improvement',
                label: 'Ítem de mejora',
                state: 'current',
                statusLabel: 'En curso',
                detail: item.execution_note || item.summary || baseDetail,
                evidenceKind: hasExecutionEvidence ? 'authoritative' : 'partial',
                evidenceLabel: evidenceLabel(hasExecutionEvidence ? 'authoritative' : 'partial'),
            },
            validationStep: {
                key: 'validation',
                label: 'Validación',
                state: hasExecutionEvidence ? 'partial' : 'missing',
                statusLabel: hasExecutionEvidence ? 'Pendiente' : 'Sin evidencia',
                detail: hasExecutionEvidence
                    ? 'Existe trabajo en progreso, pero aún no hay validación ni cierre.'
                    : 'Todavía no hay evidencia de implementación o validación.',
                evidenceKind: hasExecutionEvidence ? 'partial' : 'missing',
                evidenceLabel: evidenceLabel(hasExecutionEvidence ? 'partial' : 'missing'),
            },
            closureStep: {
                key: 'closure',
                label: 'Cierre',
                state: 'missing',
                statusLabel: 'Abierta',
                detail: 'El ítem sigue abierto; no existe cierre persistido.',
                evidenceKind: 'missing',
                evidenceLabel: evidenceLabel('missing'),
            },
        };
    }

    return {
        currentStatus: 'approved',
        currentStatusLabel: 'Aprobada',
        currentStatusDetail: 'El hallazgo ya fue promovido a una mejora persistida, pero aún no inició ejecución.',
        improvementStep: {
            key: 'improvement',
            label: 'Ítem de mejora',
            state: 'current',
            statusLabel: 'Abierto',
            detail: item.summary || baseDetail,
            evidenceKind: 'authoritative',
            evidenceLabel: evidenceLabel('authoritative'),
        },
        validationStep: {
            key: 'validation',
            label: 'Validación',
            state: 'missing',
            statusLabel: 'Pendiente',
            detail: 'Aún no existe evidencia de implementación o validación.',
            evidenceKind: 'missing',
            evidenceLabel: evidenceLabel('missing'),
        },
        closureStep: {
            key: 'closure',
            label: 'Cierre',
            state: 'missing',
            statusLabel: 'Abierta',
            detail: 'El ítem sigue abierto; no existe cierre persistido.',
            evidenceKind: 'missing',
            evidenceLabel: evidenceLabel('missing'),
        },
    };
}

export function buildAdminImprovementWorkflowViewForInteraction(
    input: InteractionInput
): AdminImprovementWorkflowView {
    const detectedStep: AdminWorkflowStepView = {
        key: 'detected',
        label: 'Detección',
        state: 'complete',
        statusLabel: 'Hallazgo real',
        detail: `La interacción ${input.analyticsId.slice(0, 8)} quedó persistida para revisión operatoria.`,
        evidenceKind: 'authoritative',
        evidenceLabel: evidenceLabel('authoritative'),
    };

    const triagedStep: AdminWorkflowStepView = input.evaluation
        ? {
            key: 'triaged',
            label: 'Triage',
            state: 'complete',
            statusLabel: 'Evaluada',
            detail: `Score ${input.evaluation.score}/5 · ${input.evaluation.primary_tag} · severidad ${input.evaluation.severity}.`,
            evidenceKind: 'authoritative',
            evidenceLabel: evidenceLabel('authoritative'),
        }
        : input.caseDraft
            ? {
                key: 'triaged',
                label: 'Triage',
                state: 'partial',
                statusLabel: input.caseDraft.readiness_status === 'ready' ? 'Borrador listo' : 'Borrador parcial',
                detail: `Existe borrador ${input.caseDraft.readiness_status} desde review para esta interacción.`,
                evidenceKind: 'partial',
                evidenceLabel: evidenceLabel('partial'),
            }
            : {
                key: 'triaged',
                label: 'Triage',
                state: 'missing',
                statusLabel: 'Sin evaluación',
                detail: 'Todavía no hay evaluación persistida ni borrador de caso para este hallazgo.',
                evidenceKind: 'missing',
                evidenceLabel: evidenceLabel('missing'),
            };

    const recommendationStep: AdminWorkflowStepView = {
        key: 'recommendation',
        label: 'Intervención / recomendación',
        state: 'partial',
        statusLabel: 'Sin vínculo directo',
        detail: 'No existe un enlace persistido directo desde esta interacción hacia intervention_recommendations.',
        evidenceKind: 'partial',
        evidenceLabel: evidenceLabel('partial'),
    };

    const improvementBundle = input.improvementItem
        ? buildImprovementSteps(input.improvementItem)
        : null;

    const improvementStep: AdminWorkflowStepView = input.improvementItem
        ? improvementBundle!.improvementStep
        : {
            key: 'improvement',
            label: 'Ítem de mejora',
            state: 'missing',
            statusLabel: input.signalState?.status === 'convertida_mejora' ? 'Sin fila encontrada' : 'No promovida',
            detail: input.signalState?.status === 'convertida_mejora'
                ? 'La señal indica promoción a mejora, pero no se recuperó un ítem persistido en esta lectura.'
                : 'Todavía no existe un ítem de mejora persistido para esta interacción.',
            evidenceKind: input.signalState?.status === 'convertida_mejora' ? 'partial' : 'missing',
            evidenceLabel: evidenceLabel(input.signalState?.status === 'convertida_mejora' ? 'partial' : 'missing'),
        };

    const validationStep: AdminWorkflowStepView = input.improvementItem
        ? improvementBundle!.validationStep
        : {
            key: 'validation',
            label: 'Validación',
            state: 'missing',
            statusLabel: 'Sin evidencia',
            detail: 'No existe evidencia de implementación o validación mientras no haya mejora abierta.',
            evidenceKind: 'missing',
            evidenceLabel: evidenceLabel('missing'),
        };

    const closureStep: AdminWorkflowStepView = input.improvementItem
        ? improvementBundle!.closureStep
        : buildClosureStepFromSignalState(input.signalState);

    const current = input.improvementItem
        ? {
            status: improvementBundle!.currentStatus,
            label: improvementBundle!.currentStatusLabel,
            detail: improvementBundle!.currentStatusDetail,
        }
        : input.signalState?.status === 'descartada'
            ? {
                status: 'rejected' as const,
                label: 'Descartada',
                detail: 'La señal fue descartada sin convertirse en una mejora persistida.',
            }
            : input.evaluation || input.caseDraft
                ? {
                    status: 'triaged' as const,
                    label: 'Triaged',
                    detail: 'El hallazgo ya tiene evaluación o borrador operativo, pero no cierre aún.',
                }
                : {
                    status: 'detected' as const,
                    label: 'Detectada',
                    detail: 'El hallazgo existe, pero todavía no tiene triage persistido.',
                };

    const topEvidence: AdminWorkflowEvidenceKind = input.improvementItem
        ? input.improvementItem.artifact_ref || input.improvementItem.execution_note
            ? 'authoritative'
            : 'partial'
        : input.evaluation
            ? 'authoritative'
            : input.caseDraft || input.signalState
                ? 'partial'
                : 'authoritative';

    return {
        sourceKind: 'review_interaction',
        sourceLabel: 'Review de interacción real',
        headline: 'Workflow de mejora sobre interacción revisada',
        currentStatus: current.status,
        currentStatusLabel: current.label,
        currentStatusDetail: current.detail,
        evidenceKind: topEvidence,
        evidenceLabel: evidenceLabel(topEvidence),
        evidenceDetail: input.improvementItem
            ? 'La lectura combina evaluación, signal-state e ítem de mejora persistidos.'
            : input.evaluation
                ? 'La lectura se sostiene sobre evaluación persistida y contexto operatorio.'
                : input.caseDraft || input.signalState
                    ? 'La lectura es parcial: existe gestión operatoria, pero no un ítem de mejora cerrado.'
                    : 'El hallazgo está persistido, pero aún no hay triage adicional.',
        hasRecommendation: false,
        hasImprovementItem: Boolean(input.improvementItem),
        steps: [
            detectedStep,
            triagedStep,
            recommendationStep,
            improvementStep,
            validationStep,
            closureStep,
        ],
    };
}

export function buildAdminImprovementWorkflowViewFromSimulationResult(
    input: SimulationInput
): AdminImprovementWorkflowView {
    const detectedStep: AdminWorkflowStepView = {
        key: 'detected',
        label: 'Detección',
        state: 'complete',
        statusLabel: input.result.status === 'PASS' ? 'Sin hallazgo' : 'Hallazgo QA',
        detail: input.result.status === 'PASS'
            ? 'El escenario quedó aprobado; no abrió un hallazgo operativo.'
            : `Escenario ${input.result.scenario_id} no aprobado en simulación.`,
        evidenceKind: 'simulated',
        evidenceLabel: evidenceLabel('simulated'),
    };

    const triagedStep: AdminWorkflowStepView = input.caseDraft
        ? {
            key: 'triaged',
            label: 'Triage',
            state: input.caseDraft.readiness_status === 'ready' ? 'complete' : 'partial',
            statusLabel: input.caseDraft.readiness_status === 'ready' ? 'Borrador listo' : 'Borrador parcial',
            detail: `Existe un caso privado ${input.caseDraft.readiness_status} para este escenario.`,
            evidenceKind: 'simulated',
            evidenceLabel: evidenceLabel('simulated'),
        }
        : input.result.judge_eval
            ? {
                key: 'triaged',
                label: 'Triage',
                state: 'partial',
                statusLabel: 'Auditado',
                detail: 'Existe judge_eval, pero todavía no hay un borrador/caso persistido para cierre.',
                evidenceKind: 'simulated',
                evidenceLabel: evidenceLabel('simulated'),
            }
            : {
                key: 'triaged',
                label: 'Triage',
                state: 'missing',
                statusLabel: 'Sin seguimiento',
                detail: 'La simulación aún no se convirtió en borrador o triage reutilizable.',
                evidenceKind: 'missing',
                evidenceLabel: evidenceLabel('missing'),
            };

    const missingStep = (key: AdminWorkflowStepKey, label: string, detail: string): AdminWorkflowStepView => ({
        key,
        label,
        state: 'missing',
        statusLabel: 'Sin vínculo persistido',
        detail,
        evidenceKind: 'missing',
        evidenceLabel: evidenceLabel('missing'),
    });

    const current = input.caseDraft
        ? {
            status: 'triaged' as const,
            label: 'Triaged',
            detail: 'La simulación ya se convirtió en un caso operatorio reutilizable.',
        }
        : {
            status: 'detected' as const,
            label: 'Detectada',
            detail: 'El hallazgo de QA existe, pero todavía no abrió seguimiento operatorio persistido.',
        };

    return {
        sourceKind: 'qa_simulation',
        sourceLabel: 'QA / simulación',
        headline: 'Workflow desde simulación hasta mejora',
        currentStatus: current.status,
        currentStatusLabel: current.label,
        currentStatusDetail: current.detail,
        evidenceKind: input.caseDraft ? 'simulated' : 'partial',
        evidenceLabel: evidenceLabel(input.caseDraft ? 'simulated' : 'partial'),
        evidenceDetail: input.caseDraft
            ? 'La trazabilidad se sostiene en un caso privado persistido, no en runtime real.'
            : 'Sólo existe la evidencia de simulación; falta convertirla en seguimiento operatorio persistido.',
        hasRecommendation: false,
        hasImprovementItem: false,
        steps: [
            detectedStep,
            triagedStep,
            missingStep('recommendation', 'Intervención / recomendación', 'No existe un enlace persistido desde qa_simulation hacia intervention_recommendations.'),
            missingStep('improvement', 'Ítem de mejora', 'La simulación no crea por sí sola un item de mejora persistido en el modelo actual.'),
            missingStep('validation', 'Validación', 'No hay evidencia de implementación mientras el hallazgo siga sólo en simulación/caso.'),
            missingStep('closure', 'Cierre', 'No existe un cierre persistido de mejora derivado directamente desde este escenario de QA.'),
        ],
    };
}

export function buildAdminImprovementWorkflowViewFromRecommendation(
    input: RecommendationInput
): AdminImprovementWorkflowView {
    const { recommendation, signal } = input;

    const detectedStep: AdminWorkflowStepView = {
        key: 'detected',
        label: 'Detección',
        state: 'complete',
        statusLabel: 'Señal detectada',
        detail: `${signal.evidence_count} evidencias en ${signal.evidence_window_days} días para ${signal.signal_type}.`,
        evidenceKind: 'authoritative',
        evidenceLabel: evidenceLabel('authoritative'),
    };

    const triagedStep: AdminWorkflowStepView = {
        key: 'triaged',
        label: 'Triage',
        state: 'complete',
        statusLabel: 'Diagnosticada',
        detail: recommendation.diagnosis.root_cause,
        evidenceKind: 'authoritative',
        evidenceLabel: evidenceLabel('authoritative'),
    };

    const recommendationStep: AdminWorkflowStepView = recommendation.operator_decision === 'pending'
        ? {
            key: 'recommendation',
            label: 'Intervención / recomendación',
            state: 'current',
            statusLabel: 'Pendiente de decisión',
            detail: 'La recomendación existe, pero todavía espera aprobación o rechazo operatorio.',
            evidenceKind: 'authoritative',
            evidenceLabel: evidenceLabel('authoritative'),
        }
        : recommendation.operator_decision === 'rejected'
            ? {
                key: 'recommendation',
                label: 'Intervención / recomendación',
                state: 'complete',
                statusLabel: 'Rechazada',
                detail: recommendation.operator_notes || 'El operador rechazó la recomendación.',
                evidenceKind: 'authoritative',
                evidenceLabel: evidenceLabel('authoritative'),
            }
            : {
                key: 'recommendation',
                label: 'Intervención / recomendación',
                state: 'complete',
                statusLabel: 'Aprobada',
                detail: recommendation.operator_notes || 'La recomendación fue aprobada para ejecución manual.',
                evidenceKind: 'authoritative',
                evidenceLabel: evidenceLabel('authoritative'),
            };

    const improvementStep: AdminWorkflowStepView = {
        key: 'improvement',
        label: 'Ítem de mejora',
        state: 'partial',
        statusLabel: 'Sin item enlazado',
        detail: 'No existe un vínculo persistido entre esta recomendación y cesarin_improvement_items; el seguimiento permanece en intervention_recommendations.',
        evidenceKind: 'partial',
        evidenceLabel: evidenceLabel('partial'),
    };

    const validationStep: AdminWorkflowStepView = recommendation.validation_date
        ? {
            key: 'validation',
            label: 'Validación',
            state: 'complete',
            statusLabel: 'Validada',
            detail: recommendation.signal_reduction_percent != null
                ? `Validada el ${formatIsoShort(recommendation.validation_date)} · reducción de señal ${recommendation.signal_reduction_percent}%.`
                : `Validada el ${formatIsoShort(recommendation.validation_date)}.`,
            evidenceKind: 'authoritative',
            evidenceLabel: evidenceLabel('authoritative'),
        }
        : recommendation.execution_status === 'completed'
            ? {
                key: 'validation',
                label: 'Validación',
                state: 'partial',
                statusLabel: 'Sin validación',
                detail: 'La ejecución quedó como completed, pero no hay validation_date persistida.',
                evidenceKind: 'partial',
                evidenceLabel: evidenceLabel('partial'),
            }
            : {
                key: 'validation',
                label: 'Validación',
                state: 'missing',
                statusLabel: 'Pendiente',
                detail: 'No existe validación persistida para esta recomendación.',
                evidenceKind: 'missing',
                evidenceLabel: evidenceLabel('missing'),
            };

    const closureStep: AdminWorkflowStepView = signal.status === 'closed'
        ? {
            key: 'closure',
            label: 'Cierre',
            state: 'complete',
            statusLabel: 'Cerrada',
            detail: 'La señal asociada ya fue cerrada de forma persistida.',
            evidenceKind: 'authoritative',
            evidenceLabel: evidenceLabel('authoritative'),
        }
        : recommendation.operator_decision === 'rejected'
            ? {
                key: 'closure',
                label: 'Cierre',
                state: 'complete',
                statusLabel: 'Cerrada por rechazo',
                detail: 'El rechazo operatorio cerró esta ruta sin ejecución posterior.',
                evidenceKind: 'authoritative',
                evidenceLabel: evidenceLabel('authoritative'),
            }
            : {
                key: 'closure',
                label: 'Cierre',
                state: 'partial',
                statusLabel: 'Sin cierre final',
                detail: signal.status === 'acknowledged'
                    ? 'La señal quedó acknowledged, pero no cerrada.'
                    : 'No existe un cierre persistido final para esta recomendación.',
                evidenceKind: signal.status === 'acknowledged' ? 'partial' : 'missing',
                evidenceLabel: evidenceLabel(signal.status === 'acknowledged' ? 'partial' : 'missing'),
            };

    const current =
        signal.status === 'closed'
            ? {
                status: 'closed' as const,
                label: 'Cerrada',
                detail: 'La recomendación ya cerró su ciclo operativo.',
            }
            : recommendation.operator_decision === 'rejected'
                ? {
                    status: 'rejected' as const,
                    label: 'Rechazada',
                    detail: 'El operador descartó esta recomendación.',
                }
                : recommendation.validation_date
                    ? {
                        status: 'validated' as const,
                        label: 'Validada',
                        detail: 'La recomendación tiene validación persistida.',
                    }
                    : recommendation.execution_status === 'completed'
                        ? {
                            status: 'implemented' as const,
                            label: 'Implementada',
                            detail: 'La ejecución quedó completada, pero falta cierre/validación final.',
                        }
                        : recommendation.operator_decision === 'approved'
                            ? {
                                status: 'approved' as const,
                                label: 'Aprobada',
                                detail: 'La recomendación fue aprobada para ejecución manual.',
                            }
                            : {
                                status: 'triaged' as const,
                                label: 'Triaged',
                                detail: 'La señal ya tiene diagnóstico, pero aún espera decisión operatoria.',
                            };

    const topEvidence: AdminWorkflowEvidenceKind = recommendation.validation_date
        ? 'authoritative'
        : recommendation.operator_decision === 'approved' || signal.status === 'acknowledged'
            ? 'partial'
            : 'authoritative';

    return {
        sourceKind: 'intervention_recommendation',
        sourceLabel: 'Intervención / recomendación',
        headline: 'Workflow de recomendación operatoria',
        currentStatus: current.status,
        currentStatusLabel: current.label,
        currentStatusDetail: current.detail,
        evidenceKind: topEvidence,
        evidenceLabel: evidenceLabel(topEvidence),
        evidenceDetail: 'La lectura se sostiene en intervention_signals + intervention_recommendations persistidos.',
        hasRecommendation: true,
        hasImprovementItem: false,
        steps: [
            detectedStep,
            triagedStep,
            recommendationStep,
            improvementStep,
            validationStep,
            closureStep,
        ],
    };
}

export function buildAdminImprovementWorkflowViewFromImprovementItem(
    input: ImprovementInput
): AdminImprovementWorkflowView {
    const improvementBundle = buildImprovementSteps(input.item);

    const detectedStep: AdminWorkflowStepView = {
        key: 'detected',
        label: 'Detección',
        state: 'complete',
        statusLabel: 'Fuente persistida',
        detail: input.item.source_query
            ? `La mejora nace de la interacción: "${input.item.source_query}".`
            : `La mejora está enlazada a analytics_id ${input.item.analytics_id.slice(0, 8)}.`,
        evidenceKind: 'authoritative',
        evidenceLabel: evidenceLabel('authoritative'),
    };

    const triagedStep: AdminWorkflowStepView = input.evaluation
        ? {
            key: 'triaged',
            label: 'Triage',
            state: 'complete',
            statusLabel: 'Evaluada',
            detail: `Score ${input.evaluation.score}/5 · ${input.evaluation.primary_tag} · severidad ${input.evaluation.severity}.`,
            evidenceKind: 'authoritative',
            evidenceLabel: evidenceLabel('authoritative'),
        }
        : input.caseDraft
            ? {
                key: 'triaged',
                label: 'Triage',
                state: 'partial',
                statusLabel: 'Borrador parcial',
                detail: `Existe un borrador ${input.caseDraft.readiness_status}, pero no una evaluación enlazada.`,
                evidenceKind: 'partial',
                evidenceLabel: evidenceLabel('partial'),
            }
            : {
                key: 'triaged',
                label: 'Triage',
                state: 'partial',
                statusLabel: 'Sin evaluación enlazada',
                detail: 'El ítem existe, pero no trae evaluación o borrador de origen enlazado en esta lectura.',
                evidenceKind: 'partial',
                evidenceLabel: evidenceLabel('partial'),
            };

    const approvedStep: AdminWorkflowStepView = {
        key: 'recommendation',
        label: 'Aprobación / decisión',
        state: 'complete',
        statusLabel: 'Promovida a mejora',
        detail: 'La creación del item ya representa aceptación operatoria explícita para trabajo.',
        evidenceKind: 'authoritative',
        evidenceLabel: evidenceLabel('authoritative'),
    };

    return {
        sourceKind: 'improvement_item',
        sourceLabel: 'Ítem de mejora',
        headline: 'Workflow de mejora persistida',
        currentStatus: improvementBundle.currentStatus,
        currentStatusLabel: improvementBundle.currentStatusLabel,
        currentStatusDetail: improvementBundle.currentStatusDetail,
        evidenceKind: input.item.artifact_ref || input.item.execution_note ? 'authoritative' : 'partial',
        evidenceLabel: evidenceLabel(input.item.artifact_ref || input.item.execution_note ? 'authoritative' : 'partial'),
        evidenceDetail: input.item.artifact_ref || input.item.execution_note
            ? 'El ítem tiene evidencia persistida de ejecución/cierre.'
            : 'El ítem existe, pero la evidencia de implementación/cierre todavía es limitada.',
        hasRecommendation: false,
        hasImprovementItem: true,
        steps: [
            detectedStep,
            triagedStep,
            approvedStep,
            improvementBundle.improvementStep,
            improvementBundle.validationStep,
            improvementBundle.closureStep,
        ],
    };
}

export function buildLatestDraftMap<T extends string>(
    drafts: PrivateCaseDraft[],
    selector: (draft: PrivateCaseDraft) => T | null | undefined
): Record<T, PrivateCaseDraft> {
    const map = {} as Record<T, PrivateCaseDraft>;

    for (const draft of drafts) {
        const key = selector(draft);
        if (!key || map[key]) continue;
        map[key] = draft;
    }

    return map;
}
