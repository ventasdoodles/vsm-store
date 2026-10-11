import { describe, it, expect, vi } from 'vitest';
import { dispatchClientCapsule } from '@/services/concierge/capsule-dispatcher';
import { capsuleHandlers } from '@/services/concierge/handlers';
import * as orchestrator from '@/services/ai-capsule-orchestrator.service';
import type { DispatchClientCapsuleParams } from '@/services/concierge/dispatch.types';

describe('CapsuleDispatcher resilience and security', () => {
    const baseParams: DispatchClientCapsuleParams = {
        data: {
            capsule_name: 'product_search_integrity',
            message: 'Server unvalidated message that must never leak on failure',
        },
        query: 'test query',
        history: [],
        catalogGate: {
            is_open: true,
            reason: 'explicit_product_request',
            primary_intent: 'search',
            explicit_product_request: true,
            search_leading: true,
            needs_clarification: false,
        },
        turnAnalysis: {
            turn_priority: 'primary',
            primary_intent: 'search',
            secondary_intents: [],
            commercial_move: 'KEEP_EXPLORING',
            turn_focus: 'catalog',
            current_turn_decision: 'USE_CAPABILITY',
        },
        invokeStart: Date.now(),
        effectiveTelemetrySessionId: 'sess-123',
    };

    it('returns null and does not execute for prototype pollution attempts', async () => {
        const protoNames = ['constructor', '__proto__', 'toString', 'valueOf', 'hasOwnProperty'];
        for (const badName of protoNames) {
            const res = await dispatchClientCapsule({
                ...baseParams,
                data: { capsule_name: badName },
            });
            expect(res).toBeNull();
        }
    });

    it('returns null for unknown capsule names', async () => {
        const res = await dispatchClientCapsule({
            ...baseParams,
            data: { capsule_name: 'non_existent_special_capsule' },
        });
        expect(res).toBeNull();
    });

    it('verifies that the capsule handlers registry is strictly frozen against prototype pollution or tampering', () => {
        expect(Object.isFrozen(capsuleHandlers)).toBe(true);
    });

    it('safely catches handler exceptions and returns neutral error fallback without leaking data.message', async () => {
        const spy = vi.spyOn(orchestrator, 'executeProductSearchCapsule').mockRejectedValueOnce(
            new Error('Boom! Internal handler fault')
        );

        const res = await dispatchClientCapsule({
            ...baseParams,
            data: {
                capsule_name: 'product_search_integrity',
                message: '¡Felicidades, se agregó al carrito con éxito!', // potentially deceptive success message
            },
        });

        expect(spy).toHaveBeenCalled();
        expect(res).not.toBeNull();
        expect(res?.message).toBe(
            'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.'
        );
        expect(res?.intent).toBe('info');
        expect(res?.turn_analysis).toEqual(baseParams.turnAnalysis);
        expect(res?.catalog_gate).toEqual(baseParams.catalogGate);

        spy.mockRestore();
    });

    it('safely handles exceptions thrown during preparation (e.g. malformed params)', async () => {
        const malformedParams = {
            ...baseParams,
            data: {
                capsule_name: 'product_search_integrity',
                get no_write_smoke() {
                    throw new Error('Preparation getter fault');
                },
            },
        };

        const res = await dispatchClientCapsule(malformedParams as any);
        expect(res).not.toBeNull();
        expect(res?.message).toBe(
            'No fue posible completar la acción especializada de la consulta, pero sigo disponible para ayudarte a encontrar refacciones o resolver tus dudas.'
        );
    });
});
