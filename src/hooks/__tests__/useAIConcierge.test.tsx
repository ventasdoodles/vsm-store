import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAIConcierge } from '../useAIConcierge';

const chatMock = vi.fn();
const updatePreferencesMock = vi.fn();
const playClickMock = vi.fn();
const playSuccessMock = vi.fn();
const playTickMock = vi.fn();
const playErrorMock = vi.fn();
const triggerHapticMock = vi.fn();
const speakMock = vi.fn();
const executeCartMutationMock = vi.fn();
const addItemMock = vi.fn();
const removeItemMock = vi.fn();
const updateQuantityMock = vi.fn();
type AuthState = {
    user: { id: string } | null;
    profile: {
        id: string;
        full_name: string;
        ai_preferences: { interests: string[] };
        ia_context: Record<string, unknown>;
    } | null;
    loading: boolean;
};

let authState: AuthState = {
    user: { id: 'user-1' },
    profile: {
        id: 'profile-1',
        full_name: 'Juan Perez',
        ai_preferences: { interests: [] },
        ia_context: {},
    },
    loading: false,
};

vi.mock('@/services', () => ({
    conciergeService: {
        chat: (...args: unknown[]) => chatMock(...args),
        updatePreferences: (...args: unknown[]) => updatePreferencesMock(...args),
    },
}));

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => authState,
}));

vi.mock('@/hooks/useStoreSettings', () => ({
    useStoreSettings: () => ({
        data: {
            whatsapp_number: '5212281234567',
        },
    }),
}));

vi.mock('@/contexts/TacticalContext', () => ({
    useTacticalUI: () => ({
        playClick: playClickMock,
        playSuccess: playSuccessMock,
        playTick: playTickMock,
        playError: playErrorMock,
        triggerHaptic: triggerHapticMock,
        speak: speakMock,
    }),
}));

vi.mock('@/lib/cart-operator-executor', () => ({
    executeCartMutation: (...args: unknown[]) => executeCartMutationMock(...args),
}));

vi.mock('@/lib/conversion-measurement', () => ({
    getOrCreateCesarinSessionId: () => 'session-hook-1',
}));

vi.mock('@/stores/cart.store', () => ({
    useCartStore: {
        getState: () => ({
            addItem: addItemMock,
            removeItem: removeItemMock,
            updateQuantity: updateQuantityMock,
        }),
    },
}));

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function createNoWriteSmokeResponse(message: string, chunks = 1) {
    return {
        message,
        intent: 'info',
        suggestedProducts: [],
        capsule_contract: {
            capsule_name: 'knowledge_rag_foundation',
            ui_render_hint: message,
            match_strategy: 'HIGH_CONFIDENCE_POLICY_MATCH',
            resolved_chunks: Array.from({ length: chunks }, (_, index) => ({ id: `chunk-${index + 1}` })),
            no_write_smoke: {
                active: true,
                contract: 'customer_intelligence_no_write_v1',
                scope: 'concierge_chat_knowledge_path',
                suppressed_writes: ['ai_customer_memory', 'ai_analytics'],
                suppressed_calls: ['cesarin-qa-judge'],
            },
        },
    };
}

describe('useAIConcierge Stage 1 recovery loop', () => {
    beforeEach(() => {
        chatMock.mockReset();
        updatePreferencesMock.mockReset();
        playClickMock.mockReset();
        playSuccessMock.mockReset();
        playTickMock.mockReset();
        playErrorMock.mockReset();
        triggerHapticMock.mockReset();
        speakMock.mockReset();
        executeCartMutationMock.mockReset();
        addItemMock.mockReset();
        removeItemMock.mockReset();
        updateQuantityMock.mockReset();
        authState = {
            user: { id: 'user-1' },
            profile: {
                id: 'profile-1',
                full_name: 'Juan Perez',
                ai_preferences: { interests: [] },
                ia_context: {},
            },
            loading: false,
        };
        window.history.pushState({}, '', '/');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('keeps one cesarin session id and attaches it to concierge requests', async () => {
        chatMock.mockResolvedValueOnce({
            message: 'Te sigo.',
            intent: 'info',
            suggestedProducts: [],
        });

        const { result } = renderHook(() => useAIConcierge());

        expect(result.current.cesarinSessionId).toBe('session-hook-1');

        await act(async () => {
            await result.current.sendMessage('hola');
        });

        expect(chatMock).toHaveBeenCalledWith(
            'hola',
            expect.any(Array),
            expect.any(Object),
            undefined,
            undefined,
            'session-hook-1',
        );
    });

    it('does not enable no-write smoke for normal sendMessage calls', async () => {
        chatMock.mockResolvedValueOnce({
            message: 'Te sigo.',
            intent: 'info',
            suggestedProducts: [],
        });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('hola');
        });

        expect(chatMock).toHaveBeenCalledWith(
            'hola',
            expect.any(Array),
            expect.any(Object),
            undefined,
            undefined,
            'session-hook-1',
        );
        expect(chatMock.mock.calls[0]).toHaveLength(6);
    });

    it('requires the exact no-write smoke contract query params before auto-triggering', async () => {
        window.history.pushState({}, '', '/?ci_no_write_smoke=true&smoke_contract=random');

        renderHook(() => useAIConcierge());

        await Promise.resolve();

        expect(chatMock).not.toHaveBeenCalled();
    });

    it('auto-triggers the authenticated no-write smoke with the fixed policy question when explicitly armed', async () => {
        window.history.pushState(
            {},
            '',
            '/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1',
        );
        chatMock.mockResolvedValueOnce({
            message: 'Puedes pagar con tarjeta y transferencia.',
            intent: 'info',
            suggestedProducts: [],
            capsule_contract: {
                capsule_name: 'knowledge_rag_foundation',
                ui_render_hint: 'Puedes pagar con tarjeta y transferencia.',
                match_strategy: 'HIGH_CONFIDENCE_POLICY_MATCH',
                resolved_chunks: [{ id: 'chunk-1' }],
                no_write_smoke: {
                    active: true,
                    contract: 'customer_intelligence_no_write_v1',
                    scope: 'concierge_chat_knowledge_path',
                    suppressed_writes: ['ai_customer_memory', 'ai_analytics'],
                    suppressed_calls: ['cesarin-qa-judge'],
                },
            },
        });

        const { result } = renderHook(() => useAIConcierge());

        await waitFor(() => expect(chatMock).toHaveBeenCalledTimes(1));

        expect(chatMock).toHaveBeenCalledWith(
            '¿Cuáles son las opciones de envío o pago?',
            expect.any(Array),
            expect.any(Object),
            undefined,
            undefined,
            'session-hook-1',
            { noWriteSmoke: true },
        );
        await waitFor(() => {
            expect(result.current.messages.at(-1)?.content).toContain('tarjeta');
        });
        expect((result.current.messages.at(-1) as { capsule_contract?: { no_write_smoke_audit?: unknown } }).capsule_contract?.no_write_smoke_audit).toMatchObject({
            prompt_category: 'combined_payment_shipping',
            metadata_present: true,
            contract: 'customer_intelligence_no_write_v1',
            capsule_name: 'knowledge_rag_foundation',
            knowledge_answer_present: true,
            main_message_present: true,
            match_strategy: 'HIGH_CONFIDENCE_POLICY_MATCH',
            resolved_chunk_count: 1,
        });
    });

    it('auto-triggers the multi-prompt RAG quality smoke only with the exact contract and mode flag', async () => {
        window.history.pushState(
            {},
            '',
            '/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1&ci_rag_quality_smoke=true',
        );
        const expectedPrompts = [
            '¿Aceptan tarjeta o cómo puedo pagar?',
            '¿Hacen envíos a todo México y es a domicilio?',
            '¿Cuánto cuesta el envío por DHL?',
            '¿Cuáles son las opciones de envío o pago?',
            '¿A qué hora abren hoy?',
            '¿Me garantizas entrega mañana a domicilio?',
        ];
        expectedPrompts.forEach((prompt) => {
            chatMock.mockResolvedValueOnce(createNoWriteSmokeResponse(`Respuesta para ${prompt}`, 2));
        });

        const { result } = renderHook(() => useAIConcierge());

        await waitFor(() => expect(chatMock).toHaveBeenCalledTimes(6));

        expectedPrompts.forEach((prompt, index) => {
            expect(chatMock.mock.calls[index]).toEqual([
                prompt,
                expect.any(Array),
                expect.any(Object),
                undefined,
                undefined,
                'session-hook-1',
                { noWriteSmoke: true },
            ]);
        });
        const auditMessages = result.current.messages.filter((message) =>
            Boolean((message as { capsule_contract?: { no_write_smoke_audit?: unknown } }).capsule_contract?.no_write_smoke_audit),
        );
        expect(auditMessages).toHaveLength(6);
        expect((auditMessages[0] as { capsule_contract?: { no_write_smoke_audit?: unknown } }).capsule_contract?.no_write_smoke_audit).toMatchObject({
            prompt_category: 'payment_method',
            prompt_label: expectedPrompts[0],
            status: 'ok',
            metadata_present: true,
            contract: 'customer_intelligence_no_write_v1',
            resolved_chunk_count: 2,
        });
    });

    it('does not activate the multi-prompt RAG quality smoke for missing or incorrect mode params', async () => {
        window.history.pushState(
            {},
            '',
            '/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1&ci_rag_quality_smoke=random',
        );

        renderHook(() => useAIConcierge());

        await Promise.resolve();

        expect(chatMock).not.toHaveBeenCalled();
    });

    it('represents a multi-prompt smoke failure as sanitized audit status', async () => {
        window.history.pushState(
            {},
            '',
            '/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1&ci_rag_quality_smoke=true',
        );
        chatMock
            .mockRejectedValueOnce(new Error('network unavailable'))
            .mockResolvedValue(createNoWriteSmokeResponse('Respuesta segura.', 1));

        const { result } = renderHook(() => useAIConcierge());

        await waitFor(() => expect(chatMock).toHaveBeenCalledTimes(6));

        const firstAudit = result.current.messages.find((message) =>
            (message as { capsule_contract?: { no_write_smoke_audit?: { status?: string } } }).capsule_contract?.no_write_smoke_audit?.status === 'error',
        ) as { capsule_contract?: { no_write_smoke_audit?: Record<string, unknown> } } | undefined;
        expect(firstAudit?.capsule_contract?.no_write_smoke_audit).toMatchObject({
            prompt_category: 'payment_method',
            status: 'error',
            error_type: 'request_failed',
            metadata_present: false,
            contract: 'customer_intelligence_no_write_v1',
        });
        const serializedAudit = JSON.stringify(firstAudit?.capsule_contract?.no_write_smoke_audit);
        expect(serializedAudit).not.toContain('access_token');
        expect(serializedAudit).not.toContain('refresh_token');
        expect(serializedAudit).not.toContain('Authorization');
        expect(serializedAudit).not.toContain('cookie');
        expect(serializedAudit).not.toContain('apikey');
    });

    it('blocks the explicit no-write smoke trigger without an authenticated app user', async () => {
        window.history.pushState(
            {},
            '',
            '/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1',
        );
        authState = {
            user: null,
            profile: null,
            loading: false,
        };

        const { result } = renderHook(() => useAIConcierge());

        await waitFor(() => {
            expect(result.current.messages.at(-1)?.content).toContain('authenticated session required');
        });

        expect(chatMock).not.toHaveBeenCalled();
        expect((result.current.messages.at(-1) as { capsule_contract?: { no_write_smoke_audit?: unknown } }).capsule_contract?.no_write_smoke_audit).toMatchObject({
            metadata_present: false,
            contract: 'customer_intelligence_no_write_v1',
            blocked_reason: 'authenticated_session_required',
        });
    });

    it('preserves approximate recovery context and uses selected similarity as the next query signal', async () => {
        chatMock
            .mockResolvedValueOnce({
                message: 'Te dejo unas cercanas.',
                intent: 'search',
                suggestedProducts: [
                    { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape' },
                    { id: 'prod-2', name: 'Waka Somatch Mango', slug: 'waka-somatch-mango', section: 'vape' },
                ],
                capsule_contract: {
                    capsule_name: 'product_search_integrity',
                    match_strategy: 'TOKEN_RECOVERY',
                },
            })
            .mockResolvedValueOnce({
                message: 'Va, ya voy mas por ahi.',
                intent: 'search',
                suggestedProducts: [],
                capsule_contract: {
                    capsule_name: 'product_search_integrity',
                    match_strategy: 'EXACT',
                },
            });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('waka somatch mb6000');
        });

        expect(result.current.activeRecovery?.originalQuery).toBe('waka somatch mb6000');
        expect(result.current.activeRecovery?.suggestedProducts).toHaveLength(2);

        await act(async () => {
            await result.current.handleRecoverySelection('closest', 'prod-1');
        });

        expect(chatMock).toHaveBeenCalledTimes(2);
        expect(chatMock.mock.calls[1]?.[0]).toContain('Waka Somatch Menta');
        expect(chatMock.mock.calls[1]?.[0]).toContain('waka somatch mb6000');
        expect(result.current.activeRecovery).toBeNull();
    });

    it('lets a clearly different current turn bypass stale recovery escalation and continue the new lane', async () => {
        chatMock
            .mockResolvedValueOnce({
                message: 'Te dejo unas cercanas.',
                intent: 'search',
                suggestedProducts: [
                    { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape' },
                ],
                turn_analysis: {
                    primary_intent: 'PRODUCT_SEARCH',
                    secondary_intents: [],
                    turn_priority: 'primary',
                    current_turn_decision: 'SEARCH_FIRST',
                },
                capsule_contract: {
                    capsule_name: 'product_search_integrity',
                    match_strategy: 'TOKEN_RECOVERY',
                    turn_analysis: {
                        primary_intent: 'PRODUCT_SEARCH',
                        secondary_intents: [],
                        turn_priority: 'primary',
                        current_turn_decision: 'SEARCH_FIRST',
                    },
                },
            })
            .mockResolvedValueOnce({
                message: 'Claro, te confirmo el envio.',
                intent: 'support',
                suggestedProducts: [],
                turn_analysis: {
                    primary_intent: 'POLICY_INQUIRY',
                    secondary_intents: [],
                    turn_priority: 'primary',
                    current_turn_decision: 'ANSWER_POLICY_FIRST',
                },
                capsule_contract: {
                    turn_analysis: {
                        primary_intent: 'POLICY_INQUIRY',
                        secondary_intents: [],
                        turn_priority: 'primary',
                        current_turn_decision: 'ANSWER_POLICY_FIRST',
                    },
                },
            });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('waka somatch mb6000');
        });

        await act(async () => {
            await result.current.sendMessage('y el envio como va?');
        });

        expect(chatMock).toHaveBeenCalledTimes(2);
        expect(result.current.activeRecovery).toBeNull();
        expect(result.current.messages.at(-1)?.intent).toBe('support');
        expect(result.current.messages.at(-1)?.content).toContain('envio');
    });

    it('suppresses product surfacing and recovery state when the policy lane closes the catalog gate', async () => {
        chatMock.mockResolvedValueOnce({
            message: 'Primero te aclaro el envio.',
            intent: 'support',
            suggestedProducts: [
                { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape' },
            ],
            turn_analysis: {
                primary_intent: 'POLICY_INQUIRY',
                secondary_intents: ['PRODUCT_SEARCH'],
                turn_priority: 'mixed',
                current_turn_decision: 'ANSWER_POLICY_FIRST',
            },
            capsule_contract: {
                capsule_name: 'product_search_integrity',
                turn_analysis: {
                    primary_intent: 'POLICY_INQUIRY',
                    secondary_intents: ['PRODUCT_SEARCH'],
                    turn_priority: 'mixed',
                    current_turn_decision: 'ANSWER_POLICY_FIRST',
                },
            },
        });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('y cuanto tarda el envio, recomiendame algo ligero');
        });

        expect(result.current.activeRecovery).toBeNull();
        expect(result.current.messages.at(-1)?.suggestedProducts).toEqual([]);
        expect(result.current.messages.at(-1)?.catalog_gate?.is_open).toBe(false);
    });

    it('does not keep an approximate recovery surface open when the next-step block already carries the useful move', async () => {
        chatMock.mockResolvedValueOnce({
            message: 'Te dejo unas cercanas. Primero revisaria Mint Fresh.',
            intent: 'search',
            suggestedProducts: [
                { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape' },
            ],
            turn_analysis: {
                primary_intent: 'PRODUCT_SEARCH',
                secondary_intents: [],
                turn_priority: 'primary',
                current_turn_decision: 'SEARCH_FIRST',
            },
            capsule_contract: {
                capsule_name: 'product_search_integrity',
                match_strategy: 'TOKEN_RECOVERY',
                next_step_view: {
                    family: 'REVIEW_ONE',
                    guidance: 'Primero revisaria Mint Fresh.',
                    primaryAction: {
                        kind: 'OPEN_PDP',
                        label: 'Abrir Mint Fresh',
                        product: {
                            id: 'prod-1',
                            name: 'Mint Fresh',
                            slug: 'mint-fresh',
                            section: 'vape',
                        },
                    },
                },
            },
        });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('waka somatch mb6000');
        });

        expect(result.current.activeRecovery).toBeNull();
        expect(result.current.messages.at(-1)?.content).toContain('Mint Fresh');
        expect(result.current.messages.at(-1)?.capsule_contract?.next_step_view?.guidance).toBe('Primero revisaria Mint Fresh.');
    });

    it('stops insisting after repeated none-of-these signals and opens honest WhatsApp escalation locally', async () => {
        chatMock
            .mockResolvedValueOnce({
                message: 'Te dejo unas cercanas.',
                intent: 'search',
                suggestedProducts: [
                    { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape' },
                    { id: 'prod-2', name: 'Waka Somatch Mango', slug: 'waka-somatch-mango', section: 'vape' },
                ],
                capsule_contract: {
                    capsule_name: 'product_search_integrity',
                    match_strategy: 'SEMANTIC',
                },
            })
            .mockResolvedValueOnce({
                message: 'A ver, van otras cercanas.',
                intent: 'search',
                suggestedProducts: [
                    { id: 'prod-3', name: 'Waka Ice Mint', slug: 'waka-ice-mint', section: 'vape' },
                ],
                capsule_contract: {
                    capsule_name: 'product_search_integrity',
                    match_strategy: 'SEMANTIC',
                },
            });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('waka somatch mb6000');
        });

        await act(async () => {
            await result.current.handleRecoverySelection('none');
        });

        expect(result.current.activeRecovery?.failedAttempts).toBe(1);

        await act(async () => {
            await result.current.handleRecoverySelection('none');
        });

        expect(chatMock).toHaveBeenCalledTimes(2);
        expect(result.current.activeRecovery).toBeNull();
        expect(result.current.messages.at(-1)?.intent).toBe('whatsapp');
        expect(result.current.messages.at(-1)?.action?.type).toBe('whatsapp');
        expect(result.current.messages.at(-1)?.content).toContain('WhatsApp');
    });

    it('converts cart_operator add proposals into CTA signals without automatic cart mutation', async () => {
        chatMock.mockResolvedValueOnce({
            message: 'Actualizando tu carrito...',
            intent: 'search',
            capsule_contract: {
                capsule_name: 'cart_operator',
                match_strategy: 'EXACT_MUTATION_PROPOSED',
                mutation_proposal: {
                    type: 'ADD',
                    product_ref: 'Mint Fresh',
                    resolved_product_id: 'prod-1',
                    resolved_variant_id: null,
                    quantity: 2,
                },
            },
        });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('agrega el waka raro');
        });

        const assistantMessage = result.current.messages.at(-1);

        expect(executeCartMutationMock).not.toHaveBeenCalled();
        expect(addItemMock).not.toHaveBeenCalled();
        expect(removeItemMock).not.toHaveBeenCalled();
        expect(updateQuantityMock).not.toHaveBeenCalled();
        expect(assistantMessage?.content).toContain('solo se agrega si tu confirmas');
        expect(assistantMessage?.intent).toBe('search');
        expect(assistantMessage?.capsule_contract?.next_step_view?.primaryAction).toMatchObject({
            kind: 'ADD_TO_CART',
            label: 'Agregar 2 x Mint Fresh',
            quantity: 2,
            product: {
                id: 'prod-1',
                name: 'Mint Fresh',
            },
        });
    });

    it('keeps storefront chat text-only and does not auto-speak assistant replies', async () => {
        chatMock.mockResolvedValueOnce({
            message: 'No veo una coincidencia clara con eso, pero te dejo opciones cercanas.',
            intent: 'search',
            suggestedProducts: [
                { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape' },
            ],
            capsule_contract: {
                capsule_name: 'product_search_integrity',
                match_strategy: 'FEATURED_FALLBACK',
            },
        });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('waka raro');
        });

        const assistantMessage = result.current.messages.at(-1);

        expect(assistantMessage?.content).toContain('No veo una coincidencia clara con eso');
        expect(assistantMessage?.content).not.toMatch(/amarrad/i);
        expect(speakMock).not.toHaveBeenCalled();
    });

    it('does not time out at 25 seconds, surfaces slow-response state around 20 seconds, and still accepts a late success before 60 seconds', async () => {
        vi.useFakeTimers();
        const deferred = createDeferred<{
            message: string;
            intent: string;
            suggestedProducts: [];
        }>();
        chatMock.mockImplementation(() => deferred.promise);

        const { result } = renderHook(() => useAIConcierge());

        act(() => {
            void result.current.sendMessage('quiero algo barato');
        });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.isSlowResponse).toBe(false);
        expect(result.current.error).toBeNull();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(19_999);
        });

        expect(result.current.isSlowResponse).toBe(false);
        expect(result.current.error).toBeNull();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1);
        });

        expect(result.current.isSlowResponse).toBe(true);
        expect(result.current.error).toBeNull();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(5_000);
        });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();

        deferred.resolve({
            message: 'Te ayudo a afinar precio y sabor.',
            intent: 'recommendation',
            suggestedProducts: [],
        });

        await act(async () => {
            await deferred.promise;
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSlowResponse).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.messages.at(-1)?.content).toBe('Te ayudo a afinar precio y sabor.');
    });

    it('times out at 60 seconds and keeps the timeout error classification for retry UX', async () => {
        vi.useFakeTimers();
        const deferred = createDeferred<never>();
        chatMock.mockImplementation(() => deferred.promise);

        const { result } = renderHook(() => useAIConcierge());

        act(() => {
            void result.current.sendMessage('quiero algo barato');
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(60_000);
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSlowResponse).toBe(false);
        expect(result.current.error).toEqual({
            type: 'timeout',
            message: 'La respuesta tardo demasiado. Intenta nuevamente.',
        });
    });
});
