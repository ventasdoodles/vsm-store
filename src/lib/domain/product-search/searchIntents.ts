
import type { InternalResolvedProduct } from '@/types/ai-capsule';
import { ActionStrength } from "./searchDecisions";

export const FLAVOR_HINTS = ['menta', 'mango', 'uva', 'frutal', 'fruta', 'dulce', 'ice', 'hielo', 'sandia', 'fresa', 'melon', 'mora', 'cereza', 'tabaco', 'caramelo'];
export const DEVICE_HINTS = ['desechable', 'pod', 'pods', 'cartucho', 'cartuchos', 'kit', 'mod', 'vape', 'pipa', 'bateria', 'baterias', 'extracto', 'extractos', 'wax', 'pluma', '510'];
export const BUDGET_HINTS = ['barato', 'economico', 'economico', 'precio', 'presupuesto', 'menos', 'maximo', 'maximo', '$'];
export const EFFECT_HINTS = ['suave', 'fuerte', 'relajar', 'relaje', 'rico', 'dia', 'dia', 'noche', 'pegar', 'tranqui', 'intenso'];
export const BEGINNER_HINTS = ['empezar', 'empiezo', 'inicio', 'primera', 'nuevo', 'nueva', 'principiante', 'novato'];
export const CONVENIENCE_HINTS = ['facil', 'simple', 'sencillo', 'sencilla', 'practico', 'practica', 'comodidad', 'rapido'];
export const EXPLORATION_HINTS = ['algo', 'recomiendame', 'quiero', 'quiero probar', 'que me conviene', 'busco', 'buscame'];
export const HESITATION_HINTS = ['no se', 'no me convence', 'no me convence tanto', 'mmm', 'mm', 'duda', 'dudas'];
export const WORTH_HINTS = ['vale la pena', 'realmente vale', 'si conviene', 'conviene'];
export const ALTERNATIVE_HINTS = ['otra opcion', 'otra alternativa', 'alternativa', 'otra cercana', 'otra parecida'];
export const PROMOTION_HINTS = ['promo', 'promocion', 'promociones', 'descuento', 'descuentos', 'oferta', 'ofertas', 'cupon', 'coupon', 'codigo', 'sale'];
export const READY_CLOSE_HINTS = ['me lo llevo', 'me llevo', 'me conviene', 'cierro', 'cerramos', 'listo', 'comprar', 'lo compro'];
export const REPLENISHMENT_HINTS = ['lo de siempre', 'lo mismo', 'mis pods', 'quiero repetir', 'repetir', 'volver a pedir'];

export function normalizeSearchText(value: string): string {
    return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function hasAnyHint(value: string, hints: string[]): boolean {
    return hints.some((hint) => value.includes(hint));
}

export function hasModelCue(value: string): boolean {
    return /\b[a-z]*\d+[a-z\d-]*\b/i.test(value);
}

export function joinSentences(...parts: Array<string | null | undefined>): string {
    return parts
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildHandoffLine(mode: 'single' | 'options', products: InternalResolvedProduct[] = [], hasSupportedComparison = false, actionStrength: ActionStrength = 'review_only'): string {
    if (mode === 'single') {
    return actionStrength === 'review_then_cart'
      ? 'Abre la ficha para confirmarlo; si ya es el que quieres, agregalo al carrito.'
      : 'Abre la ficha para revisarlo bien antes de decidir.';
    }

    const first = products[0];
    const second = products[1];
    if (first && second) {
    return hasSupportedComparison
      ? actionStrength === 'review_then_cart'
        ? `Abre primero la opcion que mejor te encaje; compara la otra solo si te queda una duda real. Si la primera ya es la que quieres, agregala al carrito.`
        : `Abre primero la opcion que mejor te encaje; compara la otra solo si te queda una duda real.`
      : actionStrength === 'review_then_cart'
        ? `Abre primero la ficha que mas te haga sentido; si al verla ya es la que quieres, agregala al carrito.`
        : `Empieza por la ficha que mas te haga sentido; si todavia te queda una duda puntual, revisa la otra.`;
    }

    if (first) {
    return actionStrength === 'review_then_cart'
      ? `Abre primero la ficha de ${first.name}; si al verla ya es la que quieres, agregala al carrito.`
      : `Abre primero la ficha de ${first.name} para revisarla bien.`;
    }

    return actionStrength === 'review_then_cart'
    ? 'Abre primero la opcion que mejor te encaje; si al verla ya es la que quieres, agregala al carrito.'
    : 'Abre primero la opcion que mas te haga sentido y revisala con calma.';
}
