type TurnDecision = 'DIRECT_ANSWER' | 'ASK_CLARIFYING_QUESTION' | 'USE_CAPABILITY' | string | null | undefined;
type StorefrontIntent = string | null | undefined;

export interface ShapeCesarinResponseTextInput {
    text: string;
    primaryIntent?: StorefrontIntent;
    currentTurnDecision?: TurnDecision;
    hasProductSurfaces?: boolean;
    hasNextStep?: boolean;
    actionType?: 'whatsapp' | 'link' | string | null;
}

export interface SuppressConversationalPrefixInput {
    prefix: unknown;
    text: unknown;
    primaryIntent?: StorefrontIntent;
    currentTurnDecision?: TurnDecision;
    hasPublicSourceContext?: boolean;
}

export interface ClarificationFirstFallbackInput {
    text?: string | null;
    query?: string | null;
    primaryIntent?: StorefrontIntent;
    currentTurnDecision?: TurnDecision;
    catalogGateReason?: string | null;
    toolCallCount?: number;
    hasProductSurfaces?: boolean;
}

export interface ClarificationFirstFinalTextGuardInput extends ClarificationFirstFallbackInput {
    catalogGateOpen?: boolean;
    productCardCount?: number;
}

function normalizeSentence(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[¿?¡!.,;:]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function compactText(value: string): string {
    return value
        .replace(/\s+/g, ' ')
        .trim();
}

function splitIntoSentences(text: string): string[] {
    return text
        .replace(/\s+/g, ' ')
        .trim()
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);
}

function isQuestion(sentence: string): boolean {
    return sentence.includes('?') || sentence.includes('¿');
}

function isThinClarificationText(value: string): boolean {
    const compacted = compactText(value);
    if (!compacted) return true;
    if (isQuestion(compacted)) return false;

    const normalized = normalizeSentence(compacted);
    if (/^(claro|va|sale|ok|okay|perfecto|listo)(\s+para\s+darte\s+la\s+mejor\s+recomendacion)?$/.test(normalized)) {
        return true;
    }

    return compacted.length < 64;
}

function normalizeQueryFragment(value: string | null | undefined): string {
    return compactText(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[¿?¡!.,;:]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function isCutMessageFragment(input: string | null | undefined): boolean {
    const raw = compactText(input ?? '').toLowerCase();
    const normalized = normalizeQueryFragment(input);

    if (!raw) return false;
    if (/^[¿?]+$/.test(raw)) return true;
    if (/^(q|qu|que|mmm)$/.test(normalized)) return true;
    if (/^[a-z0-9]{1,2}$/.test(normalized) && !/^(ok|va)$/.test(normalized)) return true;

    return false;
}

function isTienesFragment(input: string | null | undefined): boolean {
    return normalizeQueryFragment(input) === 'tienes';
}

function isUncertainNoSeFragment(input: string | null | undefined): boolean {
    return /^(no se|nose)$/.test(normalizeQueryFragment(input));
}

function isExplicitNonMicroFragment(input: string | null | undefined): boolean {
    return /^(hola|buen dia|buenas|ayuda|ayudame|help)$/.test(normalizeQueryFragment(input));
}

function buildMicroInputRecoveryText(input: ClarificationFirstFallbackInput): string | null {
    if (input.currentTurnDecision !== 'ASK_CLARIFYING_QUESTION') return null;
    if (input.catalogGateReason !== 'clarification_first') return null;
    if ((input.toolCallCount ?? 0) !== 0) return null;
    if (input.hasProductSurfaces) return null;
    if (isExplicitNonMicroFragment(input.query)) return null;

    if (isTienesFragment(input.query)) {
        return 'S\u00ed, \u00bfqu\u00e9 producto o sabor est\u00e1s buscando?';
    }

    if (isUncertainNoSeFragment(input.query)) {
        return 'No pasa nada. \u00bfQuieres que te oriente por equipo, l\u00edquido o algo econ\u00f3mico para empezar?';
    }

    if (isCutMessageFragment(input.query)) {
        return 'Parece que se te cort\u00f3 el mensaje, \u00bfqu\u00e9 quer\u00edas decirme?';
    }

    return null;
}

function shouldRepairClarificationFirstFallback(input: ClarificationFirstFallbackInput): boolean {
    return input.primaryIntent === 'PRODUCT_SEARCH'
        && input.currentTurnDecision === 'ASK_CLARIFYING_QUESTION'
        && input.catalogGateReason === 'clarification_first'
        && (input.toolCallCount ?? 0) === 0
        && !input.hasProductSurfaces
        && isThinClarificationText(input.text ?? '');
}

function isRoboticClosingSentence(
    sentence: string,
    input: ShapeCesarinResponseTextInput,
): boolean {
    const normalized = normalizeSentence(sentence);

    // Only remove very explicit and repetitive sales pushes.
    // "si quieres", "te muestro", "te enseño" are polite and natural, so we no longer remove them!
    const hasInlineClosePattern =
        /(te dejo .*cerquita|comparar rapido|te saco algo parecido|paso mas derecho)/.test(normalized);

    if (!hasInlineClosePattern) return false;

    if (input.currentTurnDecision === 'ASK_CLARIFYING_QUESTION') return true;
    if (input.primaryIntent && input.primaryIntent !== 'PRODUCT_SEARCH') return true;
    if (input.hasNextStep || input.hasProductSurfaces || input.actionType === 'whatsapp') return true;

    return false;
}

function keepAtMostOneQuestion(sentences: string[]): string[] {
    let questionSeen = false;

    return sentences.filter((sentence) => {
        if (!isQuestion(sentence)) return true;
        if (questionSeen) return false;
        questionSeen = true;
        return true;
    });
}

export function shapeCesarinResponseText(input: ShapeCesarinResponseTextInput): string {
    const rawText = input.text?.replace(/\s+/g, ' ').trim();
    if (!rawText) return '';

    const seen = new Set<string>();
    let sentences = splitIntoSentences(rawText).filter((sentence) => {
        const normalized = normalizeSentence(sentence);
        if (!normalized) return false;
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });

    if (sentences.length === 0) return rawText;

    const leadingSentence = sentences[0] ?? rawText;
    const trailingSentences = sentences
        .slice(1)
        .filter((sentence) => !isRoboticClosingSentence(sentence, input));

    sentences = [leadingSentence, ...trailingSentences];
    sentences = keepAtMostOneQuestion(sentences);

    if (input.currentTurnDecision === 'ASK_CLARIFYING_QUESTION') {
        const firstQuestion = sentences.find((sentence) => isQuestion(sentence));
        const statements = sentences.filter((sentence) => !isQuestion(sentence));
        // We put statements first, then the question
        return [...statements, firstQuestion]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    return sentences
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function buildClarificationFirstFallbackText(input: ClarificationFirstFallbackInput): string {
    const rawText = compactText(input.text ?? '');
    const microInputRecoveryText = buildMicroInputRecoveryText(input);
    if (microInputRecoveryText) return microInputRecoveryText;

    if (!shouldRepairClarificationFirstFallback(input)) return rawText;

    return 'Claro. ¿Buscas algo económico, algo de mejor calidad o algo específico por sabor/presentación?';
}

export function guardClarificationFirstFinalText(input: ClarificationFirstFinalTextGuardInput): string {
    const rawText = compactText(input.text ?? '');
    const hasProductSurfaces = Boolean(input.hasProductSurfaces)
        || input.catalogGateOpen === true
        || (input.productCardCount ?? 0) > 0;

    if (input.catalogGateOpen === true || (input.productCardCount ?? 0) > 0) {
        return rawText;
    }

    return buildClarificationFirstFallbackText({
        ...input,
        toolCallCount: input.toolCallCount ?? 0,
        hasProductSurfaces,
    });
}

export function shouldSuppressCesarinConversationalPrefix(input: SuppressConversationalPrefixInput): boolean {
    if (typeof input.prefix !== 'string' || !compactText(input.prefix)) return true;
    if (input.currentTurnDecision === 'ASK_CLARIFYING_QUESTION') return true;
    if (input.primaryIntent === 'PUBLIC_INFO' && input.hasPublicSourceContext) return true;
    if (typeof input.text !== 'string' || !compactText(input.text)) return false;

    const normalizedPrefix = normalizeSentence(compactText(input.prefix));
    const normalizedText = normalizeSentence(compactText(input.text));

    if (!normalizedPrefix || !normalizedText) return false;
    return normalizedText.includes(normalizedPrefix);
}
