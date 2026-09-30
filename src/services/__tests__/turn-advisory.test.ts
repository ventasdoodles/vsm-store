import { describe, it, expect } from 'vitest';
import {
    convertCartOperatorToAdvisoryCta,
    isCurrentTurnClearlyNonSearch,
    extractTurnAnalysis,
    uniqueStringList,
    computeUpdatedConciergePreferences,
    type ConciergeAssistantMessage,
} from '@/services/concierge/turn-advisory';

describe('turn-advisory service', () => {
    describe('convertCartOperatorToAdvisoryCta', () => {
        it('converts an EXACT_MUTATION_PROPOSED ADD proposal into an actionable ADD_READY CTA', () => {
            const message: ConciergeAssistantMessage = {
                id: '1',
                role: 'assistant',
                content: 'Original message',
                timestamp: new Date(),
                capsule_contract: {
                    match_strategy: 'EXACT_MUTATION_PROPOSED',
                    mutation_proposal: {
                        type: 'ADD',
                        resolved_product_id: 'prod-123',
                        product_ref: 'Caliburn G3',
                        quantity: 2,
                        resolved_variant_id: 'var-456',
                    },
                },
            };

            convertCartOperatorToAdvisoryCta(message);

            expect(message.intent).toBe('search');
            expect(message.content).toContain('solo se agrega si tu confirmas');
            expect(message.capsule_contract?.next_step_view).toEqual({
                family: 'ADD_READY',
                guidance: 'Si Caliburn G3 es el correcto, confirmalo desde el boton para agregarlo al carrito.',
                surfaceKind: 'ACTIONABLE',
                primaryAction: {
                    kind: 'ADD_TO_CART',
                    label: 'Agregar 2 x Caliburn G3',
                    product: {
                        id: 'prod-123',
                        name: 'Caliburn G3',
                        slug: '',
                        section: 'vape',
                    },
                    quantity: 2,
                    variantToken: {
                        id: 'var-456',
                        name: 'Variante',
                    },
                },
                secondaryAction: null,
                assistAction: null,
            });
        });

        it('falls back to informational message when proposal is not an exact ADD mutation', () => {
            const message: ConciergeAssistantMessage = {
                id: '2',
                role: 'assistant',
                content: 'Original message',
                timestamp: new Date(),
                capsule_contract: {
                    match_strategy: 'EXPLORE',
                    mutation_proposal: {
                        type: 'REMOVE',
                    },
                },
            };

            convertCartOperatorToAdvisoryCta(message);

            expect(message.intent).toBe('info');
            expect(message.content).toBe('No voy a mover tu carrito automaticamente. Dime el producto exacto o abre la ficha para confirmarlo.');
        });
    });

    describe('isCurrentTurnClearlyNonSearch', () => {
        it('identifies shipping and tracking questions as clearly non-search', () => {
            expect(isCurrentTurnClearlyNonSearch('¿Cual es el estatus de mi envio?')).toBe(true);
            expect(isCurrentTurnClearlyNonSearch('rastreo de mi pedido por favor')).toBe(true);
            expect(isCurrentTurnClearlyNonSearch('necesito mi factura')).toBe(true);
            expect(isCurrentTurnClearlyNonSearch('politica de garantia')).toBe(true);
        });

        it('does not classify queries mentioning search/product keywords as non-search', () => {
            expect(isCurrentTurnClearlyNonSearch('busco un vape')).toBe(false);
            expect(isCurrentTurnClearlyNonSearch('quiero ver opciones de pod')).toBe(false);
            expect(isCurrentTurnClearlyNonSearch('recomiendame un liquido')).toBe(false);
        });
    });

    describe('extractTurnAnalysis', () => {
        it('extracts top-level turn_analysis if present', () => {
            const analysis = { turn_priority: 'primary', primary_intent: 'search' } as any;
            expect(extractTurnAnalysis({ turn_analysis: analysis })).toBe(analysis);
        });

        it('falls back to capsule_contract turn_analysis', () => {
            const analysis = { turn_priority: 'secondary', primary_intent: 'support' } as any;
            expect(extractTurnAnalysis({ capsule_contract: { turn_analysis: analysis } })).toBe(analysis);
        });

        it('returns undefined if neither is present', () => {
            expect(extractTurnAnalysis({})).toBeUndefined();
        });
    });

    describe('uniqueStringList', () => {
        it('deduplicates and removes empty or whitespace-only strings', () => {
            expect(uniqueStringList(['a', 'b', 'a', '', '   ', 'c'])).toEqual(['a', 'b', 'c']);
        });
    });

    describe('computeUpdatedConciergePreferences', () => {
        it('updates preferences with visual theme hint and limits interests to 5', () => {
            const currentPrefs = {
                interests: ['pod', 'salt', 'liquid', 'kit', 'mesh'],
            };
            const currentContext = {
                last_intent: 'info',
            };

            const result = computeUpdatedConciergePreferences(
                currentPrefs,
                currentContext,
                'me interesa un vape recargable',
                'recommendation'
            );

            expect(result.newPrefs.visual_theme_hint).toBe('vape');
            expect(result.newPrefs.interests).toHaveLength(5);
            expect(result.newPrefs.interests[4]).toBe('me interesa un vape recargable');
            expect(result.newIAContext.last_intent).toBe('recommendation');
            expect(result.newIAContext.last_query).toBe('me interesa un vape recargable');
        });
    });
});
