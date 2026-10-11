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
        it('purely converts an EXACT_MUTATION_PROPOSED ADD proposal without mutating input message', () => {
            const originalMessage: ConciergeAssistantMessage = {
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
                        variant_name: 'Negro Mate',
                        section: 'vape',
                        slug: 'caliburn-g3',
                    },
                },
            };

            const result = convertCartOperatorToAdvisoryCta(originalMessage);

            // Verify immutability
            expect(originalMessage.content).toBe('Original message');
            expect(originalMessage.intent).toBeUndefined();

            // Verify transformed result
            expect(result.intent).toBe('search');
            expect(result.content).toContain('solo se agrega si tú confirmas con el botón');
            expect(result.capsule_contract?.next_step_view).toEqual({
                family: 'ADD_READY',
                guidance: 'Si Caliburn G3 es el correcto, confírmalo desde el botón para agregarlo al carrito.',
                surfaceKind: 'ACTIONABLE',
                primaryAction: {
                    kind: 'ADD_TO_CART',
                    label: 'Agregar 2 x Caliburn G3',
                    product: {
                        id: 'prod-123',
                        name: 'Caliburn G3',
                        slug: 'caliburn-g3',
                        section: 'vape',
                    },
                    quantity: 2,
                    variantToken: {
                        id: 'var-456',
                        name: 'Negro Mate',
                    },
                },
                secondaryAction: null,
                assistAction: null,
            });
        });

        it('strictly clamps quantities: floor(0.5) falls back to 1, <=0 falls back to 1, and 1e6 clamps to 99', () => {
            const makeMsg = (quantity: number): ConciergeAssistantMessage => ({
                id: 'q-test',
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                capsule_contract: {
                    match_strategy: 'EXACT_MUTATION_PROPOSED',
                    mutation_proposal: {
                        type: 'ADD',
                        resolved_product_id: 'prod-1',
                        product_ref: 'Pod',
                        quantity,
                        section: 'vape',
                        slug: 'pod-test',
                    },
                },
            });

            // 0.5 must not become 0
            const res05 = convertCartOperatorToAdvisoryCta(makeMsg(0.5));
            const action05 = (res05.capsule_contract?.next_step_view as any)?.primaryAction;
            expect(action05.quantity).toBe(1);

            // 0 must fall back to 1
            const res0 = convertCartOperatorToAdvisoryCta(makeMsg(0));
            const action0 = (res0.capsule_contract?.next_step_view as any)?.primaryAction;
            expect(action0.quantity).toBe(1);

            // negative must fall back to 1
            const resNeg = convertCartOperatorToAdvisoryCta(makeMsg(-5));
            const actionNeg = (resNeg.capsule_contract?.next_step_view as any)?.primaryAction;
            expect(actionNeg.quantity).toBe(1);

            // 1e6 must clamp to 99
            const resMax = convertCartOperatorToAdvisoryCta(makeMsg(1_000_000));
            const actionMax = (resMax.capsule_contract?.next_step_view as any)?.primaryAction;
            expect(actionMax.quantity).toBe(99);
        });

        it('degrades to informational KEEP_EXPLORING without ADD_TO_CART when section or slug is missing or empty', () => {
            const missingSlugMsg: ConciergeAssistantMessage = {
                id: 'no-slug',
                role: 'assistant',
                content: 'Original',
                timestamp: new Date(),
                capsule_contract: {
                    match_strategy: 'EXACT_MUTATION_PROPOSED',
                    mutation_proposal: {
                        type: 'ADD',
                        resolved_product_id: 'prod-1',
                        product_ref: 'Pod',
                        quantity: 1,
                        section: 'vape',
                        slug: '',
                    },
                },
            };

            const resultSlug = convertCartOperatorToAdvisoryCta(missingSlugMsg);
            expect(resultSlug.intent).toBe('info');
            expect(resultSlug.capsule_contract?.next_step_view).toEqual({
                family: 'KEEP_EXPLORING',
                guidance: 'Dime el producto exacto o abre la ficha de producto para agregarlo al carrito.',
                surfaceKind: 'INFORMATIONAL',
                primaryAction: null,
                secondaryAction: null,
                assistAction: null,
            });

            const missingSectionMsg: ConciergeAssistantMessage = {
                id: 'no-section',
                role: 'assistant',
                content: 'Original',
                timestamp: new Date(),
                capsule_contract: {
                    match_strategy: 'EXACT_MUTATION_PROPOSED',
                    mutation_proposal: {
                        type: 'ADD',
                        resolved_product_id: 'prod-1',
                        product_ref: 'Pod',
                        quantity: 1,
                        slug: 'pod-test',
                    },
                },
            };

            const resultSection = convertCartOperatorToAdvisoryCta(missingSectionMsg);
            expect(resultSection.intent).toBe('info');
            expect(resultSection.capsule_contract?.next_step_view?.primaryAction).toBeNull();
        });

        it('degrades to informational KEEP_EXPLORING without ADD_TO_CART when proposal.quantity is non-numeric', () => {
            const stringQtyMsg: ConciergeAssistantMessage = {
                id: 'str-qty',
                role: 'assistant',
                content: 'Original',
                timestamp: new Date(),
                capsule_contract: {
                    match_strategy: 'EXACT_MUTATION_PROPOSED',
                    mutation_proposal: {
                        type: 'ADD',
                        resolved_product_id: 'prod-1',
                        product_ref: 'Pod',
                        quantity: '2' as any,
                        section: 'vape',
                        slug: 'pod-test',
                    },
                },
            };

            const result = convertCartOperatorToAdvisoryCta(stringQtyMsg);
            expect(result.intent).toBe('info');
            expect(result.capsule_contract?.next_step_view?.surfaceKind).toBe('INFORMATIONAL');
            expect(result.capsule_contract?.next_step_view?.primaryAction).toBeNull();
        });

        it('degrades to informational KEEP_EXPLORING without ADD_TO_CART when proposal.quantity is boolean', () => {
            const boolQtyMsg: ConciergeAssistantMessage = {
                id: 'bool-qty',
                role: 'assistant',
                content: 'Original',
                timestamp: new Date(),
                capsule_contract: {
                    match_strategy: 'EXACT_MUTATION_PROPOSED',
                    mutation_proposal: {
                        type: 'ADD',
                        resolved_product_id: 'prod-1',
                        product_ref: 'Pod',
                        quantity: true as any,
                        section: 'vape',
                        slug: 'pod-test',
                    },
                },
            };

            const result = convertCartOperatorToAdvisoryCta(boolQtyMsg);
            expect(result.intent).toBe('info');
            expect(result.capsule_contract?.next_step_view?.surfaceKind).toBe('INFORMATIONAL');
            expect(result.capsule_contract?.next_step_view?.primaryAction).toBeNull();
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

            const result = convertCartOperatorToAdvisoryCta(message);

            expect(result.intent).toBe('info');
            expect(result.content).toBe('No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.');
        });

        it('general fallback neutralizes any pre-existing ADD_TO_CART action in next_step_view', () => {
            const messageWithStaleAction: ConciergeAssistantMessage = {
                id: 'stale-cta',
                role: 'assistant',
                content: 'Previous action proposal',
                timestamp: new Date(),
                capsule_contract: {
                    match_strategy: 'EXPLORE',
                    mutation_proposal: {
                        type: 'REMOVE',
                    },
                    next_step_view: {
                        family: 'ADD_READY',
                        surfaceKind: 'ACTIONABLE',
                        primaryAction: {
                            kind: 'ADD_TO_CART',
                            label: 'Agregar',
                            product: { id: 'old-1', name: 'Old', slug: 'old', section: 'vape' },
                            quantity: 1,
                        },
                    },
                },
            };

            const result = convertCartOperatorToAdvisoryCta(messageWithStaleAction);

            expect(result.intent).toBe('info');
            expect(result.capsule_contract?.next_step_view?.surfaceKind).toBe('INFORMATIONAL');
            expect(result.capsule_contract?.next_step_view?.primaryAction).toBeNull();
        });
    });

    describe('isCurrentTurnClearlyNonSearch', () => {
        it('identifies shipping, warranty, and tracking questions as clearly non-search with accents and diacritics', () => {
            expect(isCurrentTurnClearlyNonSearch('¿Cuál es el estatus de mi envío?')).toBe(true);
            expect(isCurrentTurnClearlyNonSearch('rastreo de mi pedido por favor')).toBe(true);
            expect(isCurrentTurnClearlyNonSearch('necesito mi factura')).toBe(true);
            expect(isCurrentTurnClearlyNonSearch('política de garantía y devolución')).toBe(true);
        });

        it('correctly handles word boundaries without substring false negatives ("podrías", "podemos")', () => {
            expect(isCurrentTurnClearlyNonSearch('¿Podrías rastrear mi pedido?')).toBe(true);
            expect(isCurrentTurnClearlyNonSearch('¿Puedo cancelar? No podemos esperar el envío')).toBe(true);
        });

        it('does not classify queries mentioning search/product keywords as non-search', () => {
            expect(isCurrentTurnClearlyNonSearch('busco un vape')).toBe(false);
            expect(isCurrentTurnClearlyNonSearch('quiero ver opciones de pod')).toBe(false);
            expect(isCurrentTurnClearlyNonSearch('recomiéndame un líquido')).toBe(false);
            expect(isCurrentTurnClearlyNonSearch('busco un kit de inicio')).toBe(false);
        });

        it('safely handles empty strings and huge inputs', () => {
            expect(isCurrentTurnClearlyNonSearch('')).toBe(false);
            expect(isCurrentTurnClearlyNonSearch('a'.repeat(5000))).toBe(false);
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
        it('deduplicates and normalizes strings with leading/trailing whitespace', () => {
            expect(uniqueStringList(['a', ' a', 'a ', '', '   ', 'b'])).toEqual(['a', 'b']);
        });
    });

    describe('computeUpdatedConciergePreferences', () => {
        it('updates preferences with visual theme hint and accepts deterministic now timestamp', () => {
            const currentPrefs = {
                interests: ['pod', 'salt', 'liquid', 'kit', 'mesh'],
            };
            const currentContext = {
                last_intent: 'info',
            };
            const fixedTime = new Date('2026-10-11T12:00:00.000Z');

            const result = computeUpdatedConciergePreferences(
                currentPrefs,
                currentContext,
                'me interesa un vape recargable',
                'recommendation',
                fixedTime
            );

            expect(result.newPrefs.visual_theme_hint).toBe('vape');
            expect(result.newPrefs.interests).toHaveLength(5);
            expect(result.newPrefs.interests[4]).toBe('me interesa un vape recargable');
            expect(result.newIAContext.last_intent).toBe('recommendation');
            expect(result.newIAContext.last_query).toBe('me interesa un vape recargable');
            expect(result.newIAContext.last_update).toBe('2026-10-11T12:00:00.000Z');
        });
    });
});
