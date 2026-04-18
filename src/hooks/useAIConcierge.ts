import { useState, useCallback, useRef, useEffect } from 'react';
import { conciergeService, type ConciergeMessage, type ConciergeTurnAnalysis } from '@/services';
import { buildConciergeCatalogGate } from '@/services/concierge.service';
import { useAuth } from '@/hooks/useAuth';
import { useTacticalUI } from '@/contexts/TacticalContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { SITE_CONFIG } from '@/config/site';
import {
    type CesarinActiveRecoveryState,
    buildCesarinHonestEscalation,
    buildCesarinRecoveryPrompt,
    shouldEscalateCesarinRecovery,
    shouldOfferCesarinApproximateRecovery,
} from '@/lib/cesarin-stage1';
import { getOrCreateCesarinSessionId } from '@/lib/conversion-measurement';

type RecoverySeed = Pick<
    CesarinActiveRecoveryState,
    'originalQuery' | 'failedAttempts' | 'rejectedProductIds' | 'rejectedProductNames'
>;

type PendingTurn = {
    displayContent: string;
    requestContent: string;
    recoverySeed?: RecoverySeed;
};

type ConciergeAssistantMessage = ConciergeMessage & {
    capsule_contract?: any;
};

function convertCartOperatorToAdvisoryCta(message: ConciergeAssistantMessage): void {
    const contract = message.capsule_contract;
    const proposal = contract?.mutation_proposal;

    if (
        contract?.match_strategy === 'EXACT_MUTATION_PROPOSED'
        && proposal?.type === 'ADD'
        && typeof proposal.resolved_product_id === 'string'
        && proposal.resolved_product_id.length > 0
    ) {
        const productName = typeof proposal.product_ref === 'string' && proposal.product_ref.trim().length > 0
            ? proposal.product_ref.trim()
            : 'este producto';
        const quantity = Number.isFinite(proposal.quantity) && proposal.quantity > 0
            ? Math.floor(proposal.quantity)
            : 1;

        message.intent = 'search';
        message.content = `Lo puedo preparar para carrito, pero solo se agrega si tu confirmas con el boton.`;
        message.capsule_contract = {
            ...contract,
            next_step_view: {
                family: 'ADD_READY',
                guidance: `Si ${productName} es el correcto, confirmalo desde el boton para agregarlo al carrito.`,
                surfaceKind: 'ACTIONABLE',
                primaryAction: {
                    kind: 'ADD_TO_CART',
                    label: quantity > 1 ? `Agregar ${quantity} x ${productName}` : `Agregar ${productName}`,
                    product: {
                        id: proposal.resolved_product_id,
                        name: productName,
                        slug: '',
                        section: 'vape',
                    },
                    quantity,
                    variantToken: proposal.resolved_variant_id
                        ? {
                            id: proposal.resolved_variant_id,
                            name: 'Variante',
                        }
                        : null,
                },
                secondaryAction: null,
                assistAction: null,
            },
        };
        return;
    }

    message.intent = 'info';
    message.content = 'No voy a mover tu carrito automaticamente. Dime el producto exacto o abre la ficha para confirmarlo.';
}

function isCurrentTurnClearlyNonSearch(content: string): boolean {
    const normalized = content
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    return /(envio|pedido|orden|tracking|rastre|politi|garanti|reembolso|devolu|cambio|cancel|factura|compatible|compatibilidad|postventa|whatsapp|soporte)/.test(normalized)
        && !/(recomi|busco|quiero ver|opciones|vape|pod|kit|cartucho|dispositivo|liquido|desechable)/.test(normalized);
}

/**
 * Extract turn_analysis from server response.
 * The service already normalizes turn_analysis via normalizeTurnAnalysis();
 * this function only provides a thin passthrough with capsule_contract fallback.
 */
function extractTurnAnalysis(response: {
    turn_analysis?: ConciergeTurnAnalysis | null;
    capsule_contract?: { turn_analysis?: ConciergeTurnAnalysis | null } | null;
}): ConciergeTurnAnalysis | undefined {
    return response.turn_analysis
        ?? response.capsule_contract?.turn_analysis
        ?? undefined;
}

function uniqueStringList(values: string[]): string[] {
    return [...new Set(values.filter((value) => value.trim().length > 0))];
}

export function useAIConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ConciergeMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Que onda, soy Cesarin. Te ayudo a ubicar algo de volada y si no me la se, te lo digo derecho.',
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<{ message: string; type: 'timeout' | 'quota' | 'generic' } | null>(null);
    const [activeRecovery, setActiveRecovery] = useState<CesarinActiveRecoveryState | null>(null);
    const { user, profile } = useAuth();
    const { data: settings } = useStoreSettings();
    const { playClick, playSuccess, playTick, playError, triggerHaptic } = useTacticalUI();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const cesarinSessionIdRef = useRef(getOrCreateCesarinSessionId());
    const welcomeProcessed = useRef(false);
    const messagesRef = useRef(messages);
    const pendingTurnRef = useRef<PendingTurn | null>(null);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (profile?.full_name && !welcomeProcessed.current) {
            const firstName = profile.full_name.split(' ')[0];
            setMessages((prev) =>
                prev.map((message) =>
                    message.id === 'welcome'
                        ? {
                            ...message,
                            content: `Que onda ${firstName}. Soy Cesarin; te ayudo a encontrar algo y, si algo me agarra en curva, te lo digo sin inventarte cosas.`,
                        }
                        : message,
                ),
            );
            welcomeProcessed.current = true;
        }
    }, [profile]);

    const addMessage = useCallback((msg: Partial<ConciergeMessage>) => {
        const fullMsg: ConciergeMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            ...msg,
        };
        setMessages((prev) => [...prev, fullMsg]);
    }, []);

    const appendHonestEscalation = useCallback(
        (displayContent: string, recoveryState: CesarinActiveRecoveryState) => {
            const whatsappNumber = settings?.whatsapp_number || SITE_CONFIG.whatsapp.number;
            const escalation = buildCesarinHonestEscalation({
                query: recoveryState.originalQuery,
                whatsappNumber,
                rejectedProductNames: recoveryState.rejectedProductNames,
            });

            const userMsg: ConciergeMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: displayContent,
                timestamp: new Date(),
            };
            const assistantMsg: ConciergeMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: escalation.content,
                timestamp: new Date(),
                intent: 'whatsapp',
                action: escalation.action,
            };

            setError(null);
            setMessages((prev) => [...prev, userMsg, assistantMsg]);
            setActiveRecovery(null);
            pendingTurnRef.current = null;
            playSuccess();
            triggerHaptic([10, 30, 10]);
        },
        [playSuccess, settings?.whatsapp_number, triggerHaptic],
    );

    const runAssistantTurn = useCallback(
        async ({
            displayContent,
            requestContent,
            audio,
            recoverySeed,
        }: {
            displayContent: string;
            requestContent: string;
            audio?: string;
            recoverySeed?: RecoverySeed;
        }) => {
            if (!requestContent.trim() && !audio) return;

            setError(null);
            pendingTurnRef.current = { displayContent, requestContent, recoverySeed };

            const userMsg: ConciergeMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: displayContent || 'Mensaje de voz',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsLoading(true);
            playTick();
            triggerHaptic(10);

            try {
                let timeoutId: NodeJS.Timeout;
                const timeoutPromise = new Promise<never>((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 25000);
                });

                const executeRequest = async () => {
                    const history = [...messagesRef.current.slice(-5), userMsg].map((message) => ({
                        role: message.role,
                        content: message.content,
                    }));

                    return await conciergeService.chat(
                        requestContent,
                        history,
                        profile || undefined,
                        audio,
                        undefined,
                        cesarinSessionIdRef.current,
                    );
                };

                const response = await Promise.race([executeRequest(), timeoutPromise]);
                clearTimeout(timeoutId!);

                const assistantMsg: ConciergeAssistantMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.message,
                    timestamp: new Date(),
                    suggestedProducts: response.suggestedProducts,
                    intent: response.intent,
                    turn_analysis: extractTurnAnalysis(response) ?? undefined,
                    source_context: response.source_context,
                    action: response.action,
                    capsule_contract: (response as any).capsule_contract,
                };
                const turnAnalysis = assistantMsg.turn_analysis ?? assistantMsg.capsule_contract?.turn_analysis ?? null;
                const catalogGate = (response as any).catalog_gate
                    ?? assistantMsg.capsule_contract?.catalog_gate
                    ?? buildConciergeCatalogGate({
                        query: requestContent,
                        turnAnalysis,
                        intent: response.intent,
                        assistantMessage: response.message,
                        capsuleContract: assistantMsg.capsule_contract,
                        has_catalog_content: Boolean((response.suggestedProducts?.length ?? 0) > 0 || assistantMsg.capsule_contract?.next_step_view),
                    });
                assistantMsg.catalog_gate = catalogGate;
                assistantMsg.suggestedProducts = catalogGate.is_open ? (response.suggestedProducts ?? []) : [];

                if (assistantMsg.intent === 'whatsapp' && !assistantMsg.action) {
                    assistantMsg.action = buildCesarinHonestEscalation({
                        query: recoverySeed?.originalQuery ?? requestContent,
                        whatsappNumber: settings?.whatsapp_number || SITE_CONFIG.whatsapp.number,
                        rejectedProductNames: recoverySeed?.rejectedProductNames ?? [],
                    }).action;
                }

                if (assistantMsg.capsule_contract && assistantMsg.capsule_contract.capsule_name === 'cart_operator') {
                    convertCartOperatorToAdvisoryCta(assistantMsg);
                }

                setMessages((prev) => [...prev, assistantMsg]);

                const nextStepView = assistantMsg.capsule_contract?.next_step_view ?? null;
                if (catalogGate.is_open && !nextStepView && shouldOfferCesarinApproximateRecovery(
                    assistantMsg.capsule_contract,
                    (assistantMsg.suggestedProducts ?? []) as CesarinActiveRecoveryState['suggestedProducts'],
                )) {
                    setActiveRecovery({
                        originalQuery: recoverySeed?.originalQuery ?? requestContent,
                        messageId: assistantMsg.id,
                        failedAttempts: recoverySeed?.failedAttempts ?? 0,
                        rejectedProductIds: recoverySeed?.rejectedProductIds ?? [],
                        rejectedProductNames: recoverySeed?.rejectedProductNames ?? [],
                        suggestedProducts: ((assistantMsg.suggestedProducts ?? []) as CesarinActiveRecoveryState['suggestedProducts']).slice(0, 3),
                    });
                } else {
                    setActiveRecovery(null);
                }

                pendingTurnRef.current = null;
                playSuccess();
                triggerHaptic([10, 30, 10]);

                if (user && response.intent === 'recommendation' && catalogGate.is_open) {
                    const loweredContent = displayContent.toLowerCase();
                    const hint = loweredContent.includes('vape')
                        ? 'vape'
                        : loweredContent.includes('herbal')
                            ? 'herbal'
                            : undefined;

                    const newPrefs = {
                        ...profile?.ai_preferences,
                        visual_theme_hint: hint || profile?.ai_preferences?.visual_theme_hint,
                        interests: [...(profile?.ai_preferences?.interests || []), displayContent].slice(-5),
                    };

                    const newIAContext = {
                        ...profile?.ia_context,
                        last_intent: response.intent,
                        last_query: displayContent,
                        last_update: new Date().toISOString(),
                    };

                    await conciergeService.updatePreferences(user.id, newPrefs, newIAContext);
                }
            } catch (error: unknown) {
                playError();
                triggerHaptic(80);

                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error('[AIConcierge Diag] CATCH BLOCK - raw error:', error);
                console.error('[AIConcierge Diag] CATCH BLOCK - errorMsg:', errorMsg);
                const isQuota = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
                const isTimeout = errorMsg === 'REQUEST_TIMEOUT';

                if (isTimeout) {
                    setError({ type: 'timeout', message: 'La respuesta tardo demasiado. Intenta nuevamente.' });
                } else if (isQuota) {
                    setError({ type: 'quota', message: 'Estoy recibiendo muchas solicitudes en este momento. Intenta de nuevo en un momento.' });
                } else {
                    setError({ type: 'generic', message: 'Hubo un problema al responder. Intenta nuevamente.' });
                }
            } finally {
                setIsLoading(false);
            }
        },
        [playTick, triggerHaptic, profile, settings?.whatsapp_number, playSuccess, user, playError],
    );

    const sendMessage = useCallback(
        async (content: string, _isNeural: boolean = false, audio?: string) => {
            if (!content.trim() && !audio) return;

            const recoveryBlockedByCurrentTurn = !audio && activeRecovery && isCurrentTurnClearlyNonSearch(content);
            if (recoveryBlockedByCurrentTurn) {
                setActiveRecovery(null);
            }

            if (!audio && activeRecovery && !recoveryBlockedByCurrentTurn && shouldEscalateCesarinRecovery({
                failedAttempts: activeRecovery.failedAttempts,
                userMessage: content,
            })) {
                appendHonestEscalation(content, activeRecovery);
                return;
            }

            await runAssistantTurn({
                displayContent: content || 'Mensaje de voz',
                requestContent: content,
                audio,
            });
        },
        [activeRecovery, appendHonestEscalation, runAssistantTurn],
    );

    const handleRecoverySelection = useCallback(
        async (kind: 'closest' | 'none', productId?: string) => {
            if (!activeRecovery) return;

            if (kind === 'closest') {
                const selectedProduct = activeRecovery.suggestedProducts.find((product) => product.id === productId);
                if (!selectedProduct) return;

                const otherProducts = activeRecovery.suggestedProducts.filter((product) => product.id !== selectedProduct.id);
                await runAssistantTurn({
                    displayContent: `Esta se parece mas: ${selectedProduct.name}`,
                    requestContent: buildCesarinRecoveryPrompt(activeRecovery, {
                        kind: 'closest',
                        product: selectedProduct,
                    }),
                    recoverySeed: {
                        originalQuery: activeRecovery.originalQuery,
                        failedAttempts: activeRecovery.failedAttempts,
                        rejectedProductIds: uniqueStringList([
                            ...activeRecovery.rejectedProductIds,
                            ...otherProducts.map((product) => product.id),
                        ]),
                        rejectedProductNames: uniqueStringList([
                            ...activeRecovery.rejectedProductNames,
                            ...otherProducts.map((product) => product.name),
                        ]),
                    },
                });
                return;
            }

            const nextRejectedIds = uniqueStringList([
                ...activeRecovery.rejectedProductIds,
                ...activeRecovery.suggestedProducts.map((product) => product.id),
            ]);
            const nextRejectedNames = uniqueStringList([
                ...activeRecovery.rejectedProductNames,
                ...activeRecovery.suggestedProducts.map((product) => product.name),
            ]);
            const nextFailedAttempts = activeRecovery.failedAttempts + 1;

            if (shouldEscalateCesarinRecovery({
                failedAttempts: nextFailedAttempts,
                repeatedNoneSignal: true,
            })) {
                appendHonestEscalation('Ninguna', {
                    ...activeRecovery,
                    failedAttempts: nextFailedAttempts,
                    rejectedProductIds: nextRejectedIds,
                    rejectedProductNames: nextRejectedNames,
                });
                return;
            }

            await runAssistantTurn({
                displayContent: 'Ninguna',
                requestContent: buildCesarinRecoveryPrompt(activeRecovery, { kind: 'none' }),
                recoverySeed: {
                    originalQuery: activeRecovery.originalQuery,
                    failedAttempts: nextFailedAttempts,
                    rejectedProductIds: nextRejectedIds,
                    rejectedProductNames: nextRejectedNames,
                },
            });
        },
        [activeRecovery, appendHonestEscalation, runAssistantTurn],
    );

    const retryLastMessage = useCallback(() => {
        if (!pendingTurnRef.current) return;

        const pendingTurn = pendingTurnRef.current;
        setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'user') {
                newMessages.pop();
            }
            return newMessages;
        });

        setTimeout(() => {
            void runAssistantTurn({
                displayContent: pendingTurn.displayContent,
                requestContent: pendingTurn.requestContent,
                recoverySeed: pendingTurn.recoverySeed,
            });
        }, 0);
    }, [runAssistantTurn]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    void sendMessage('', false, base64);
                };
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            playTick();
        } catch (err) {
            console.error('[Concierge] Voice Error:', err);
            playError();
            addMessage({ content: 'No pude acceder al microfono. Por favor, revisa tus permisos.' });
        }
    }, [addMessage, playError, playTick, sendMessage]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
            playClick();
        }
    }, [playClick]);

    const sendProactiveMessage = useCallback(
        async (content: string) => {
            if (isOpen) return;

            playTick();
            triggerHaptic(5);

            const assistantMsg: ConciergeMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content,
                timestamp: new Date(),
                intent: 'recommendation',
            };

            setMessages((prev) => [...prev, assistantMsg]);
        },
        [isOpen, playTick, triggerHaptic],
    );

    const toggleOpen = useCallback(() => {
        playClick();
        triggerHaptic(20);
        setIsOpen((prev) => !prev);
    }, [playClick, triggerHaptic]);

    return {
        isOpen,
        messages,
        isLoading,
        isListening,
        error,
        activeRecovery,
        cesarinSessionId: cesarinSessionIdRef.current,
        toggleOpen,
        sendMessage,
        handleRecoverySelection,
        sendProactiveMessage,
        retryLastMessage,
        startRecording,
        stopRecording,
    };
}
