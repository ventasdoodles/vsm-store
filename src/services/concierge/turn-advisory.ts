import type { ConciergeMessage, ConciergeTurnAnalysis } from './types';

export type ConciergeAssistantMessage = ConciergeMessage & {
    capsule_contract?: Record<string, any>;
};

/**
 * Transforms an automatic cart operator proposal into an advisory CTA that requires
 * explicit user interaction before mutating the cart.
 */
export function convertCartOperatorToAdvisoryCta(message: ConciergeAssistantMessage): void {
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
        message.content = 'Lo puedo preparar para carrito, pero solo se agrega si tu confirmas con el boton.';
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

/**
 * Lexical heuristic to determine if a turn is unambiguous support / post-sale / policy inquiry
 * rather than a product discovery search query.
 */
export function isCurrentTurnClearlyNonSearch(content: string): boolean {
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
export function extractTurnAnalysis(response: {
    turn_analysis?: ConciergeTurnAnalysis | null;
    capsule_contract?: { turn_analysis?: ConciergeTurnAnalysis | null } | null;
}): ConciergeTurnAnalysis | undefined {
    return response.turn_analysis
        ?? response.capsule_contract?.turn_analysis
        ?? undefined;
}

/**
 * Filters out empty and duplicate strings.
 */
export function uniqueStringList(values: string[]): string[] {
    return [...new Set(values.filter((value) => value.trim().length > 0))];
}

/**
 * Computes updated preferences and AI conversation context when a user interacts with product recommendations.
 */
export function computeUpdatedConciergePreferences(
    currentPrefs: Record<string, any> | null | undefined,
    currentIAContext: Record<string, any> | null | undefined,
    displayContent: string,
    lastIntent: string
) {
    const loweredContent = displayContent.toLowerCase();
    const hint = loweredContent.includes('vape')
        ? 'vape'
        : loweredContent.includes('herbal')
            ? 'herbal'
            : undefined;

    const newPrefs = {
        ...currentPrefs,
        visual_theme_hint: hint || currentPrefs?.visual_theme_hint,
        interests: [...(currentPrefs?.interests || []), displayContent].slice(-5),
    };

    const newIAContext = {
        ...currentIAContext,
        last_intent: lastIntent,
        last_query: displayContent,
        last_update: new Date().toISOString(),
    };

    return { newPrefs, newIAContext };
}
