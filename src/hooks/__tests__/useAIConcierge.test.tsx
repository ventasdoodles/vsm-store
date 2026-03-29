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

    it('aligns cart operator visible copy with the Stage 1 voice instead of the old fixed rewrite', async () => {
        chatMock.mockResolvedValueOnce({
            message: 'Actualizando tu carrito...',
            intent: 'search',
            capsule_contract: {
                capsule_name: 'cart_operator',
            },
        });
        executeCartMutationMock.mockResolvedValueOnce({
            executed: false,
            code: 'NOT_FOUND',
        });

        const { result } = renderHook(() => useAIConcierge());

        await act(async () => {
            await result.current.sendMessage('agrega el waka raro');
        });

        const assistantMessage = result.current.messages.at(-1);

        expect(assistantMessage?.content).toBe(
            'No lo ubique bien en catalogo. Si quieres, dime como venia escrito y lo buscamos de volada.',
        );
        expect(assistantMessage?.content).not.toBe('No encontre ese producto en catalogo.');
        expect(assistantMessage?.intent).toBe('info');
    });
});
