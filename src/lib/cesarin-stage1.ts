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
        'A ver, ya te ubiqué esa de volada.',
        'Va, esa sí la tengo más amarrada.',
    ],
    SEMANTIC: [
        'Te soy honesto, exacto exacto no me salió, pero sí vi cosas que van por ahí.',
        'A ver, no te lo quiero vender como exacto, pero sí encontré unas opciones cercanas.',
        'Esa me cayó medio en curva, pero sí te puedo enseñar lo más cercano que sí vi.',
    ],
    TOKEN_RECOVERY: [
        'Te soy honesto, no la vi tal cual, pero sí me aparecieron coincidencias por nombre que van cerca.',
        'A ver, exacta no me brincó, pero de volada te enseño lo más parecido por nombre.',
        'No te quiero inventar el exacto, pero sí te saqué unas cercanas por cómo viene escrito.',
    ],
    FEATURED_FALLBACK: [
        'No la traigo bien amarrada tal cual, pero sí te puedo dejar unas opciones que te saquen del apuro.',
        'A ver, esa no me quedó cerrada, pero sí tengo unas alternativas que valen la pena revisar.',
    ],
    OUT_OF_STOCK_ALTERNATIVE: [
        'Te soy honesto, esa sí la veo agotada ahorita, pero te dejo cercanas que sí traen movimiento.',
        'Esa justo no la tengo disponible, pero de volada te paso unas que te pueden resolver parecido.',
    ],
    NO_MATCH: [
        'Te soy honesto, esa sí me agarró en curva y no la vi tal cual.',
        'A ver, no te quiero inventar una coincidencia donde no la tengo.',
        'Todavía ando verde con algunos nombres raros, y esa no la pude confirmar tal cual.',
    ],
    UNKNOWN: [
        'Te soy honesto, ahí no traigo suficiente para cantártela con seguridad.',
        'A ver, no te quiero vender humo con eso.',
    ],
};

const APPROXIMATE_STRATEGY_NOTES: Partial<Record<SupportedMatchStrategy, string>> = {
    SEMANTIC: 'Te las estoy poniendo como cercanas, no como si ya te hubiera encontrado el exacto.',
    TOKEN_RECOVERY: 'Van por nombre y cercanía, no como confirmación total.',
    FEATURED_FALLBACK: 'Van como alternativas útiles, no como si fueran exactamente lo que pediste.',
    OUT_OF_STOCK_ALTERNATIVE: 'Van como reemplazo cercano porque la original no está disponible.',
};

const ESCALATION_PREFIXES = [
    'Para no hacerte perder más tiempo, aquí ya te conviene que lo vea alguien del equipo.',
    'Aquí sí prefiero no seguirte dando vueltas de más; mejor te paso a la salida real.',
    'Ya para no inventarte otra aproximación floja, mejor te llevo con alguien del equipo.',
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
    const note = APPROXIMATE_STRATEGY_NOTES[matchStrategy];

    return joinSegments(prefix, note, baseMessage);
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
