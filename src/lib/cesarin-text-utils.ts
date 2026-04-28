/**
 * cesarin-text-utils.ts
 * 
 * Shared text normalization and comparison utilities for the Césarín assistant spine.
 * These functions were previously duplicated across concierge.service.ts and AIConcierge.tsx.
 * 
 * Single source of truth for text normalization, deduplication, and distinctness checks
 * used by the service layer and the UI renderer.
 */

export function normalizeCompactText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

export function isMeaningfullyDistinct(left: string, right: string): boolean {
    const normalizedLeft = normalizeCompactText(left);
    const normalizedRight = normalizeCompactText(right);

    if (!normalizedLeft || !normalizedRight) return true;
    if (normalizedLeft === normalizedRight) return false;
    if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) return false;

    return true;
}

export function splitIntoSentences(value: string): string[] {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) return [];

    return normalized.match(/[^.!?]+[.!?]*/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [normalized];
}

function isRedundantClosingSentence(sentence: string): boolean {
    const normalized = normalizeCompactText(sentence);
    return /^(si quieres|si ya te gusto|si te late|si gustas|te conviene|vete por|yo arrancaria|yo me iria|para no hacerla larga|para no alargarla|te dejo unas opciones|te dejo unas cercanas|te paso|te muestro|si quieres te muestro|si quieres te paso|si quieres te dejo|si quieres te saco)/.test(normalized);
}

export function compactCesarinCopy(value: string, maxSentences = 8): string {
    const seen = new Set<string>();
    const sentences: string[] = [];

    for (const sentence of splitIntoSentences(value)) {
        const normalized = normalizeCompactText(sentence);
        if (!normalized) continue;
        if (seen.has(normalized)) continue;
        if (isRedundantClosingSentence(sentence) && sentences.length > 0) continue;

        seen.add(normalized);
        sentences.push(sentence);

        if (sentences.length >= maxSentences) break;
    }

    return sentences.join(' ').replace(/\s+/g, ' ').trim();
}

export function mergeConversationalPrefix(
    message: string,
    prefix?: string | null,
    maxSentences = 8,
): string {
    const compactMessage = compactCesarinCopy(message, maxSentences) || message.trim();
    if (!prefix) return compactMessage;

    const compactPrefix = compactCesarinCopy(prefix, 1);
    if (!compactPrefix || !isMeaningfullyDistinct(compactPrefix, compactMessage)) {
        return compactMessage;
    }

    return compactCesarinCopy(`${compactPrefix} ${compactMessage}`, maxSentences) || `${compactPrefix} ${compactMessage}`.trim();
}

export function getEffectiveConversationalPrefix(input: {
    message: string;
    prefix?: string | null;
    turnAnalysis?: { current_turn_decision?: string | null; primary_intent?: string | null } | null;
    sourceContext?: { label: string } | null;
}): string | null {
    const { prefix, turnAnalysis, sourceContext } = input;
    if (!prefix?.trim()) return null;

    if (turnAnalysis?.current_turn_decision === 'ASK_CLARIFYING_QUESTION') {
        return null;
    }

    if (turnAnalysis?.primary_intent === 'PUBLIC_INFO' && sourceContext) {
        return null;
    }

    const compactPrefix = compactCesarinCopy(prefix, 1);
    const compactMessage = compactCesarinCopy(input.message, 8);

    if (!compactPrefix || !isMeaningfullyDistinct(compactPrefix, compactMessage)) {
        return null;
    }

    return compactPrefix;
}
