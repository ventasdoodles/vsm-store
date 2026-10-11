import type { ConciergeMessage, ConciergeTurnAnalysis } from './types';

export type ConciergeAssistantMessage = ConciergeMessage & {
    capsule_contract?: Record<string, unknown>;
};

export interface AddMutationProposal {
    type: 'ADD';
    resolved_product_id: string;
    product_ref?: string;
    quantity?: number;
    resolved_variant_id?: string;
    variant_name?: string;
    section?: string;
    product_section?: string;
    slug?: string;
    product_slug?: string;
}

function isAddMutationProposal(value: unknown): value is AddMutationProposal {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return (
        candidate.type === 'ADD'
        && typeof candidate.resolved_product_id === 'string'
        && candidate.resolved_product_id.trim().length > 0
    );
}

/**
 * Transforms an automatic cart operator proposal into an advisory CTA that requires
 * explicit user interaction before mutating the cart.
 * Pure function: returns a new message object without mutating the input message.
 */
export function convertCartOperatorToAdvisoryCta(message: ConciergeAssistantMessage): ConciergeAssistantMessage {
    const contract = message.capsule_contract;
    const proposal = contract?.mutation_proposal;

    if (
        contract?.match_strategy === 'EXACT_MUTATION_PROPOSED'
        && isAddMutationProposal(proposal)
    ) {
        const productName = typeof proposal.product_ref === 'string' && proposal.product_ref.trim().length > 0
            ? proposal.product_ref.trim().slice(0, 100)
            : 'este producto';

        // Floor first, then validate strictly >= 1 and clamp to max 99
        const rawQuantity = Number(proposal.quantity);
        const flooredQuantity = Math.floor(rawQuantity);
        const quantity = Number.isFinite(flooredQuantity) && flooredQuantity >= 1
            ? Math.min(flooredQuantity, 99)
            : 1;

        const variantId = typeof proposal.resolved_variant_id === 'string' && proposal.resolved_variant_id.trim().length > 0
            ? proposal.resolved_variant_id.trim()
            : null;

        const section = typeof (proposal.section ?? proposal.product_section) === 'string'
            && String(proposal.section ?? proposal.product_section).trim().length > 0
            ? String(proposal.section ?? proposal.product_section).trim()
            : 'catalogo';

        const slug = typeof (proposal.slug ?? proposal.product_slug) === 'string'
            ? String(proposal.slug ?? proposal.product_slug).trim()
            : '';

        const variantName = typeof proposal.variant_name === 'string' && proposal.variant_name.trim().length > 0
            ? proposal.variant_name.trim()
            : 'Opción seleccionada';

        return {
            ...message,
            intent: 'search',
            content: 'Lo puedo preparar para carrito, pero solo se agrega si tú confirmas con el botón.',
            capsule_contract: {
                ...contract,
                next_step_view: {
                    family: 'ADD_READY',
                    guidance: `Si ${productName} es el correcto, confírmalo desde el botón para agregarlo al carrito.`,
                    surfaceKind: 'ACTIONABLE',
                    primaryAction: {
                        kind: 'ADD_TO_CART',
                        label: quantity > 1 ? `Agregar ${quantity} x ${productName}` : `Agregar ${productName}`,
                        product: {
                            id: proposal.resolved_product_id.trim(),
                            name: productName,
                            slug,
                            section,
                        },
                        quantity,
                        variantToken: variantId
                            ? {
                                id: variantId,
                                name: variantName,
                            }
                            : null,
                    },
                    secondaryAction: null,
                    assistAction: null,
                },
            },
        };
    }

    return {
        ...message,
        intent: 'info',
        content: 'No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.',
    };
}

const NON_SEARCH_SUPPORT_REGEX = /\b(envio|envios|pedido|pedidos|orden|ordenes|tracking|rastreo|rastrear|politica|politicas|garantia|garantias|reembolso|reembolsos|devolucion|devoluciones|cambio|cambios|cancelar|cancelacion|factura|facturacion|compatible|compatibilidad|postventa|whatsapp|soporte)\b/i;

const DISCOVERY_INTENT_REGEX = /\b(recomienda|recomiendame|recomendar|busco|buscar|opciones|catalogo|vape|vapes|vapeador|vapeadores|pod|pods|kit|kits|cartucho|cartuchos|dispositivo|dispositivos|liquido|liquidos|desechable|desechables)\b/i;

/**
 * Lexical heuristic to determine if a turn is unambiguous support / post-sale / policy inquiry
 * rather than a product discovery search query.
 * Uses bounded length and word boundary tokens to prevent ReDoS and substring false negatives.
 */
export function isCurrentTurnClearlyNonSearch(content: string): boolean {
    if (!content || typeof content !== 'string') return false;
    const truncated = content.slice(0, 2000);
    const normalized = truncated
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    return NON_SEARCH_SUPPORT_REGEX.test(normalized) && !DISCOVERY_INTENT_REGEX.test(normalized);
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
 * Filters out empty and duplicate strings with pre-trimming normalization.
 */
export function uniqueStringList(values: string[]): string[] {
    if (!Array.isArray(values)) return [];
    const trimmed = values
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => v.length > 0);
    return [...new Set(trimmed)];
}

/**
 * Computes updated preferences and AI conversation context when a user interacts with product recommendations.
 * Allows passing an optional clock/date parameter for deterministic testing.
 */
export function computeUpdatedConciergePreferences(
    currentPrefs: Record<string, any> | null | undefined,
    currentIAContext: Record<string, any> | null | undefined,
    displayContent: string,
    lastIntent: string,
    now: Date = new Date()
) {
    const loweredContent = (typeof displayContent === 'string' ? displayContent : '').toLowerCase();
    const hint = loweredContent.includes('vape') || loweredContent.includes('vapeador')
        ? 'vape'
        : loweredContent.includes('herbal')
            ? 'herbal'
            : undefined;

    const existingInterests = Array.isArray(currentPrefs?.interests) ? currentPrefs.interests : [];
    const sanitizedInterest = typeof displayContent === 'string' ? displayContent.trim().slice(0, 150) : '';

    const newPrefs = {
        ...currentPrefs,
        visual_theme_hint: hint || currentPrefs?.visual_theme_hint,
        interests: uniqueStringList([...existingInterests, sanitizedInterest]).slice(-5),
    };

    const newIAContext = {
        ...currentIAContext,
        last_intent: lastIntent,
        last_query: sanitizedInterest,
        last_update: now.toISOString(),
    };

    return { newPrefs, newIAContext };
}
