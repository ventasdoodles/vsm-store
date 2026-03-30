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

function isRoboticClosingSentence(
    sentence: string,
    input: ShapeCesarinResponseTextInput,
): boolean {
    const normalized = normalizeSentence(sentence);

    const hasInlineClosePattern =
        /(si quieres|si ya|yo arrancaria|yo me iria|te conviene|vete por|paso mas derecho|llevartelo|de aqui|te dejo .*cerquita|comparar rapido|te saco algo parecido|te muestro|te enseno|te enseño)/.test(normalized);

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
        const firstStatement = sentences.find((sentence) => !isQuestion(sentence));
        return [firstStatement, firstQuestion]
            .filter(Boolean)
            .slice(0, 2)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    return sentences
        .slice(0, 2)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
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
