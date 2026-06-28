
import { CapsuleReplenishmentSignal } from "./searchEvaluator";
import { normalizeSearchText, REPLENISHMENT_HINTS } from "./searchIntents";

export function isReplenishmentIntent(query: string): boolean {
    const normalized = normalizeSearchText(query);
    return REPLENISHMENT_HINTS.some((hint) => normalized.includes(hint));
}

export function buildReplenishmentTarget(signal: CapsuleReplenishmentSignal): string {
    const baseName = signal.primary_product?.name ?? 'ese articulo';
    const variantLabel = signal.variant_label?.trim();
    return variantLabel ? `${baseName} (${variantLabel})` : baseName;
}

export function buildReplenishmentDraft(signal: CapsuleReplenishmentSignal): string {
    const target = buildReplenishmentTarget(signal);
    const quantityLabel = signal.quantity && signal.quantity > 1
            ? ` x${signal.quantity}`
            : '';
    if (signal.kind === 'PARTIAL') {
    return `Revise tu historial real y ${target} es lo que si sigue vigente en el catalogo actual para repetir${quantityLabel}. El resto de ese pedido ya requiere revision manual.`;
    }

    return `Revise tu historial real y ${target} sigue vigente en el catalogo actual para repetir${quantityLabel}.`;
}

export function buildReplenishmentHandoff(signal: CapsuleReplenishmentSignal): string | null {
    const quantityLabel = signal.quantity && signal.quantity > 1
            ? `${signal.quantity} pieza(s)`
            : 'una vez mas';
    if (signal.action_mode === 'ADD_TO_CART') {
    return `Si eso era lo de siempre, ya lo puedes volver a meter al carrito ${quantityLabel === 'una vez mas' ? 'de una vez' : `con ${quantityLabel}`}.`;
    }

    if (signal.action_mode === 'OPEN_PDP') {
    return 'Te lo dejo en ficha para confirmar la seleccion vigente antes de volver a agregarlo.';
    }

    return null;
}

export function buildUnavailableReplenishmentDraft(signal: CapsuleReplenishmentSignal): string {
    const base = 'Revise tu compra reciente, pero no puedo prometerte "lo mismo" tal cual con el catalogo actual.';
    return signal.blocked_reason_detail
    ? `${base} ${signal.blocked_reason_detail}`
    : base;
}

export function buildMissingReplenishmentDraft(query: string): string {
    return `No veo una compra reciente reordenable lo bastante clara para resolver "${query}" como "lo mismo" con verdad. Si me dices el producto o variante, te lo aterrizo con el catalogo actual.`;
}
