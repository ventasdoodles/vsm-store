import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

vi.mock('@/services', () => ({
    conciergeService: {
        chat: (...args: unknown[]) => chatMock(...args),
        updatePreferences: (...args: unknown[]) => updatePreferencesMock(...args),
    },
}));

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: { id: 'user-1' },
        profile: {
            id: 'profile-1',
            full_name: 'Juan Perez',
            ai_preferences: { interests: [] },
            ia_context: {},
        },
    }),
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

vi.mock('@/stores/cart.store', () => ({
    useCartStore: {
        getState: () => ({
            addItem: addItemMock,
            removeItem: removeItemMock,
            updateQuantity: updateQuantityMock,
        }),
    },
}));

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
});
