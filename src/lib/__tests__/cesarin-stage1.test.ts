import { describe, expect, it } from 'vitest';
import {
    buildCesarinHonestEscalation,
    buildCesarinHumanizedSearchMessage,
    buildCesarinRecoveryPrompt,
    shouldEscalateCesarinRecovery,
    shouldOfferCesarinApproximateRecovery,
    type CesarinActiveRecoveryState,
} from '../cesarin-stage1';

const recoveryState: CesarinActiveRecoveryState = {
    originalQuery: 'waka somatch mb6000',
    messageId: 'assistant-1',
    failedAttempts: 1,
    rejectedProductIds: [],
    rejectedProductNames: [],
    suggestedProducts: [
        { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape' },
        { id: 'prod-2', name: 'Waka Somatch Mango', slug: 'waka-somatch-mango', section: 'vape' },
    ],
};

describe('Cesarin Stage 1 storefront helpers', () => {
    it('humanizes approximate search answers without hiding the original capsule draft', () => {
        const message = buildCesarinHumanizedSearchMessage({
            query: 'waka somatch mb6000',
            baseMessage: 'No encontre "waka somatch mb6000" tal cual, pero te dejo opciones cercanas.',
            matchStrategy: 'TOKEN_RECOVERY',
            suggestedProducts: recoveryState.suggestedProducts,
        });

        expect(message).toContain('No encontre "waka somatch mb6000" tal cual');
        expect(message).toMatch(/No localicé ese término|Estos artículos comparten|Te presento los resultados/i);
        expect(message).not.toContain('Van por nombre y cercania');
    });

    it('avoids opaque amarrada phrasing on active fallback copy', () => {
        const message = buildCesarinHumanizedSearchMessage({
            query: 'waka raro',
            baseMessage: 'No encontre una coincidencia exacta, pero te dejo opciones cercanas.',
            matchStrategy: 'FEATURED_FALLBACK',
            suggestedProducts: recoveryState.suggestedProducts,
        });

        expect(message).not.toMatch(/amarrad/i);
        expect(message).toMatch(/No pude confirmar|He seleccionado algunas/i);
    });

    it('offers approximate recovery only on bounded nearby-match strategies', () => {
        expect(shouldOfferCesarinApproximateRecovery(
            { match_strategy: 'SEMANTIC' } as never,
            recoveryState.suggestedProducts,
        )).toBe(true);

        expect(shouldOfferCesarinApproximateRecovery(
            { match_strategy: 'EXACT' } as never,
            recoveryState.suggestedProducts,
        )).toBe(false);
    });

    it('builds a closest-match refinement prompt that keeps the original search and discarded options', () => {
        const prompt = buildCesarinRecoveryPrompt(recoveryState, {
            kind: 'closest',
            product: recoveryState.suggestedProducts[0]!,
        });

        expect(prompt).toContain('Waka Somatch Menta');
        expect(prompt).toContain('waka somatch mb6000');
        expect(prompt).toContain('Waka Somatch Mango');
    });

    it('escalates honestly after repeated dead-end recovery or clear frustration', () => {
        expect(shouldEscalateCesarinRecovery({
            failedAttempts: 2,
            repeatedNoneSignal: true,
        })).toBe(true);

        expect(shouldEscalateCesarinRecovery({
            failedAttempts: 1,
            userMessage: 'ninguna, mejor pasame con alguien',
        })).toBe(true);

        expect(shouldEscalateCesarinRecovery({
            failedAttempts: 1,
            repeatedNoneSignal: false,
        })).toBe(false);
    });

    it('builds a real WhatsApp handoff without fake callback promises', () => {
        const escalation = buildCesarinHonestEscalation({
            query: 'waka somatch mb6000',
            whatsappNumber: '5212281234567',
            rejectedProductNames: ['Waka Somatch Menta'],
        });

        expect(escalation.content).toContain('WhatsApp');
        expect(escalation.action.label).toBe('Seguir por WhatsApp');
        expect(escalation.action.url).toContain('wa.me/5212281234567');
        expect(decodeURIComponent(escalation.action.url)).toContain('waka somatch mb6000');
    });
});
