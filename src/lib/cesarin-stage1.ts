import type { InternalCapsuleContract, InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';

export type CesarinSuggestedProduct = Pick<Product, 'id' | 'name' | 'slug' | 'section'> |
    Pick<InternalResolvedProduct, 'id' | 'name' | 'slug'> & { section?: 'vape' | '420' };

export interface CesarinActiveRecoveryState {
    originalQuery: string;
    messageId: string;
    failedAttempts: number;
    rejectedProductIds: string[];
    rejectedProductNames: string[];
    suggestedProducts: CesarinSuggestedProduct[];
}

export interface CesarinCartMutationVisibleResult {
    executed: boolean;
    code: 'ADDED' | 'REMOVED' | 'UPDATED' | 'AMBIGUOUS' | 'UNSAFE' | 'NOT_FOUND' | 'ERROR';
    product?: string;
    qty?: number;
}

type SupportedMatchStrategy =
    | InternalCapsuleContract['match_strategy']
    | 'UNKNOWN';

type RecoverySelection =
    | { kind: 'closest'; product: CesarinSuggestedProduct }
    | { kind: 'none' };

const APPROXIMATE_MATCH_STRATEGIES = new Set<SupportedMatchStrategy>([
    'SEMANTIC',
    'TOKEN_RECOVERY',
    'FEATURED_FALLBACK',
    'OUT_OF_STOCK_ALTERNATIVE',
]);

const HUMANIZED_PREFIXES: Record<SupportedMatchStrategy, string[]> = {
    EXACT: [
        'Aquí tienes el producto que solicitaste.',
        'He encontrado exactamente lo que buscabas.',
    ],
    SEMANTIC: [
        'No encontré una coincidencia exacta, pero aquí tienes opciones muy similares.',
        'Estos son los productos que más se acercan a lo que nos describes.',
        'Te muestro las alternativas más relevantes basadas en tu búsqueda.',
    ],
    TOKEN_RECOVERY: [
        'No localicé ese término con exactitud, pero encontré coincidencias por nombre.',
        'Estos artículos comparten similitudes con el nombre que ingresaste.',
        'Te presento los resultados que coinciden parcialmente con tu consulta.',
    ],
    FEATURED_FALLBACK: [
        'No pude confirmar ese artículo, pero aquí tienes unas opciones destacadas que podrían interesarte.',
        'He seleccionado algunas recomendaciones útiles mientras seguimos buscando.',
    ],
    OUT_OF_STOCK_ALTERNATIVE: [
        'El artículo exacto se encuentra agotado en este momento, pero estas alternativas están disponibles.',
        'Actualmente no tenemos existencias, pero te sugiero estas opciones similares.',
    ],
    NO_MATCH: [
        'Lo lamento, no logré encontrar un artículo que coincida con tu búsqueda.',
        'No tenemos resultados para esa consulta en este momento.',
        'Tuve un inconveniente interpretando tu búsqueda. ¿Podrías ser un poco más específico?',
    ],
    UNKNOWN: [
        'Por el momento no cuento con la información necesaria para procesar esta solicitud.',
        'No puedo darte una respuesta concluyente sobre este artículo.',
    ],
};

export const APPROXIMATE_STRATEGY_NOTES: Partial<Record<SupportedMatchStrategy, string>> = {
    SEMANTIC: 'Estas opciones se muestran por similitud de características.',
    TOKEN_RECOVERY: 'Estos resultados se muestran por similitud en el nombre.',
    FEATURED_FALLBACK: 'Estas son sugerencias alternativas de nuestro catálogo.',
    OUT_OF_STOCK_ALTERNATIVE: 'Sugerencias basadas en productos actualmente en existencia.',
};

const ESCALATION_PREFIXES = [
    'Para brindarte un mejor servicio, te comunicaré con un ejecutivo de cuenta.',
    'Te transferiré con nuestro equipo de atención para revisar este detalle a fondo.',
    'Permíteme conectarte con un especialista que podrá asistirte de inmediato.',
];

function normalizeForHash(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function selectDeterministicVariant(seed: string, variants: string[]): string {
    if (variants.length === 0) return '';
    const normalizedSeed = normalizeForHash(seed);
    const hash = Array.from(normalizedSeed).reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
    return variants[hash % variants.length] ?? variants[0] ?? '';
}

function joinSegments(...parts: Array<string | null | undefined>): string {
    return parts
        .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function dedupeNames(names: string[]): string[] {
    return [...new Set(names.map((name) => name.trim()).filter((name) => name.length > 0))];
}

export function isCesarinApproximateMatchStrategy(matchStrategy?: string | null): boolean {
    return APPROXIMATE_MATCH_STRATEGIES.has((matchStrategy ?? 'UNKNOWN') as SupportedMatchStrategy);
}

export function shouldOfferCesarinApproximateRecovery(
    capsuleContract: Pick<InternalCapsuleContract, 'match_strategy'> | null | undefined,
    suggestedProducts: CesarinSuggestedProduct[] | null | undefined,
): boolean {
    return isCesarinApproximateMatchStrategy(capsuleContract?.match_strategy) && (suggestedProducts?.length ?? 0) > 0;
}

export function buildCesarinHumanizedSearchMessage(input: {
    query: string;
    baseMessage: string;
    matchStrategy?: string | null;
    suggestedProducts?: CesarinSuggestedProduct[] | null;
}): string {
    const matchStrategy = (input.matchStrategy ?? 'UNKNOWN') as SupportedMatchStrategy;
    const baseMessage = input.baseMessage?.trim();

    if (!baseMessage) return '';
    if (matchStrategy === 'EXACT') return baseMessage;

    const prefixPool = HUMANIZED_PREFIXES[matchStrategy] ?? HUMANIZED_PREFIXES.UNKNOWN;
    const prefix = selectDeterministicVariant(`${matchStrategy}:${input.query}`, prefixPool);
    return joinSegments(prefix, baseMessage);
}

export function getCesarinApproximateRecoveryHint(matchStrategy?: string | null): string | null {
    const normalized = (matchStrategy ?? 'UNKNOWN') as SupportedMatchStrategy;

    switch (normalized) {
        case 'TOKEN_RECOVERY':
            return 'Son coincidencias cercanas por nombre; tú dime cuál va más por ahí.';
        case 'SEMANTIC':
            return 'Estas van por parecido de intención o perfil, no por confirmación exacta.';
        case 'FEATURED_FALLBACK':
            return 'Te las dejo como alternativas para rescatar la búsqueda, no como match exacto.';
        case 'OUT_OF_STOCK_ALTERNATIVE':
            return 'La original no está disponible; estas van como reemplazos cercanos.';
        default:
            return null;
    }
}

export function buildCesarinRecoveryPrompt(
    state: CesarinActiveRecoveryState,
    selection: RecoverySelection,
): string {
    const rejectedNames = dedupeNames([
        ...state.rejectedProductNames,
        ...(
            selection.kind === 'none'
                ? state.suggestedProducts.map((product) => product.name)
                : state.suggestedProducts
                    .filter((product) => product.id !== selection.product.id)
                    .map((product) => product.name)
        ),
    ]);

    if (selection.kind === 'closest') {
        const rejectedBlock = rejectedNames.length > 0
            ? ` Ya descarte ${rejectedNames.join(', ')}.`
            : '';

        return [
            `De las opciones cercanas, la que mas se parece es "${selection.product.name}".`,
            `Mi busqueda original era "${state.originalQuery}".`,
            'Quiero que sigas por esa linea y me ensenes algo igual de cercano o mas preciso sin inventar certeza.',
            rejectedBlock.trim(),
        ].filter(Boolean).join(' ');
    }

    const rejectedBlock = rejectedNames.length > 0
        ? ` Ya vi y descarte ${rejectedNames.join(', ')}.`
        : '';

    return [
        `Ninguna de esas se parece bien a "${state.originalQuery}".`,
        'No me repitas las mismas opciones.',
        'Si ves otra aproximacion real, ensename solo las mas cercanas y dilo como aproximacion, no como certeza.',
        rejectedBlock.trim(),
    ].filter(Boolean).join(' ');
}

export function detectCesarinFrustrationSignal(message: string): boolean {
    const normalized = normalizeForHash(message);
    return /(ninguna|ninguno|nada que ver|no sirve|no me sirve|no me late|no era|no es|mejor pasame|pasame con alguien|humano|asesor|agente|ya mejor|no me entendiste|no me entiendes|me estas dando vueltas)/.test(normalized);
}

export function shouldEscalateCesarinRecovery(input: {
    failedAttempts: number;
    userMessage?: string;
    repeatedNoneSignal?: boolean;
}): boolean {
    if (input.repeatedNoneSignal && input.failedAttempts >= 2) return true;
    if (input.failedAttempts >= 3) return true;
    if (input.userMessage && detectCesarinFrustrationSignal(input.userMessage) && input.failedAttempts >= 1) return true;
    return false;
}

export function buildCesarinHonestEscalation(input: {
    query: string;
    whatsappNumber: string;
    rejectedProductNames?: string[];
}): {
    content: string;
    action: {
        label: string;
        url: string;
        type: 'whatsapp';
    };
} {
    const rejected = dedupeNames(input.rejectedProductNames ?? []);
    const prefix = selectDeterministicVariant(input.query, ESCALATION_PREFIXES);
    const rejectedBlock = rejected.length > 0
        ? ` Ya vimos ${rejected.join(', ')} y no te cerraron.`
        : '';
    const content = joinSegments(
        prefix,
        'Yo aquí ya no te quiero inventar otra coincidencia floja.',
        'Si quieres, seguimos por WhatsApp para que lo vea alguien del equipo con más contexto.',
        rejectedBlock,
    );
    const message = [
        'Hola, vengo del chat de Cesarin y necesito ayuda con una busqueda.',
        `Buscaba: ${input.query}.`,
        rejected.length > 0 ? `Ya descarte: ${rejected.join(', ')}.` : '',
    ].filter(Boolean).join(' ');

    return {
        content,
        action: {
            label: 'Seguir por WhatsApp',
            url: `https://wa.me/${input.whatsappNumber}?text=${encodeURIComponent(message)}`,
            type: 'whatsapp',
        },
    };
}

export function buildCesarinCartOperatorVisibleMessage(
    result: CesarinCartMutationVisibleResult,
): { content: string; intent: 'search' | 'info' } {
    if (result.executed) {
        if (result.code === 'ADDED') {
            return {
                intent: 'search',
                content: `Va, ya te deje ${result.qty}x ${result.product} en el carrito.`,
            };
        }

        if (result.code === 'REMOVED') {
            return {
                intent: 'search',
                content: `Listo, saque ${result.product} del carrito.`,
            };
        }

        return {
            intent: 'search',
            content: `Va, ${result.product} ya quedo en ${result.qty}.`,
        };
    }

    if (result.code === 'AMBIGUOUS') {
        return {
            intent: 'info',
            content: 'A ver, ahi si dime bien cual producto o variante era para no mover el carrito a ciegas.',
        };
    }

    if (result.code === 'UNSAFE') {
        return {
            intent: 'info',
            content: 'Te soy honesto, esa cantidad asi no la puedo correr. Dime cuantas ocupas y lo ajustamos.',
        };
    }

    if (result.code === 'NOT_FOUND') {
        return {
            intent: 'info',
            content: 'No lo ubique bien en catalogo. Dime como venia escrito y lo buscamos de volada.',
        };
    }

    return {
        intent: 'info',
        content: 'Se me atoro ese movimiento del carrito. Lo intentamos otra vez de volada.',
    };
}

