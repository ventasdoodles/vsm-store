
import type { InternalResolvedProduct } from '@/types/ai-capsule';
import { normalizeDecisionText } from "./searchDecisions";
import { CapsuleTruthSignals } from "./searchEvaluator";
import { normalizeSearchText } from "./searchIntents";

export const SPEC_KEY_ALIASES: Record<string, string[]> = {
      Sabor: ['Sabor', 'Sabores', 'Flavor', 'Perfil'],
      Nicotina: ['Nicotina', 'Concentracion de nicotina', 'Concentración de nicotina', 'Concentracion', 'Concentración'],
      Puffs: ['Puffs', 'Puff', 'Caladas'],
      Modelo: ['Modelo', 'Version', 'Versión', 'Modelo / Version', 'Modelo/Version', 'Linea', 'Línea', 'Serie'],
      Compatibilidad: ['Compatibilidad', 'Compatible con'],
      'Compatible con': ['Compatible con', 'Compatibilidad'],
      Rosca: ['Rosca', 'Thread'],
      Tipo: ['Tipo', 'Formato'],
      Variante: ['Variante', 'Version', 'Versión'],
      Presentacion: ['Presentacion', 'Presentación'],
      Tamano: ['Tamano', 'Tamaño', 'Size'],
      Contenido: ['Contenido', 'Capacidad'],
      Marca: ['Marca', 'Brand'],
      THC: ['THC'],
      Cantidad: ['Cantidad', 'Piezas'],
    };

export type ConcreteFactRequest = | { family: 'Puffs' }
      | { family: 'Nicotina' }
      | { family: 'Sabor' }
      | { family: 'Modelo'; requestedAs: 'modelo' | 'version' }
      | { family: 'Compatibilidad' };
export type ConcreteFactResolution = {
      request: ConcreteFactRequest;
      answer: string;
      directAnswerKind: NonNullable<CapsuleTruthSignals['direct_answer_kind']>;
    };

/**
 * Extract 1-2 interesting specs for semantic response justification.
 * Tries common vape keys first, then 420 keys. Keeps response focused.
 */
export function extractSpecsFact(product: InternalResolvedProduct): string | null {
    const keysToTry = ['Sabor', 'Nicotina', 'Puffs', 'Modelo', 'Cepa', 'THC', 'Tipo', 'Marca'];
    const found: string[] = [];
    for (const key of keysToTry) {
    const value = extractSpecValue(product, key);
    if (!value) continue;
    found.push(value);
    if (found.length >= 2) break;
    }

    if (found.length === 0) return null;
    if (!found[0]) return null;
    if (found.length === 1) {
    return `con ${found[0]?.toLowerCase()}`;
    }

    if (found[1]) {
    return `${found[0]?.toLowerCase()} y ${found[1]?.toLowerCase()}`;
    }

    return null;
}

/**
 * Extract brief semantic context from product description.
 * SEMANTIC-ONLY: Used only in fallback scenarios (no specs available).
 * Rejects generic/promotional boilerplate and category repetition.
 */
export function extractDescriptionContext(product: InternalResolvedProduct): string | null {
    const desc = product.description?.trim();
    if (!desc || desc.length === 0) return null;
    const firstSentenceMatch = desc.match(/^([^.!?]+[.!?]?)/);
    if (!firstSentenceMatch || !firstSentenceMatch[1]) return null;
    const sentence = firstSentenceMatch[1].trim();
    if (sentence.length < 15 || sentence.length > 80) return null;
    const lowerSentence = sentence.toLowerCase();
    const boilerplatePatterns = [
            /^(premium|best|high[- ]quality|amazing|incredible|excellent|perfect|top[- ]rated)/i,
            /\b(guaranteed|exclusive|special|limited|rare|unique|one of a kind)\b/i,
            /^(the )?(\w+)( vape| device| product| juice)?$/i,
            /^product (?:description|info|details?|overview)$/i,
          ];
    for (const pattern of boilerplatePatterns) {
    if (pattern.test(sentence)) return null;
    }

    const productName = product.name?.toLowerCase() || '';
    if (productName && sentence.toLowerCase() === productName) return null;
    return lowerSentence;
}

export function extractSpecValue(product: InternalResolvedProduct, key: string): string | null {
    const specs = product.specs as Record<string, unknown> | null | undefined;
    if (!specs || Object.keys(specs).length === 0) return null;
    const aliases = SPEC_KEY_ALIASES[key] ?? [key];
    const normalizedAliases = aliases.map((alias) => normalizeSearchText(alias));
    for (const [specKey, rawValue] of Object.entries(specs)) {
    if (!normalizedAliases.includes(normalizeSearchText(specKey))) continue;
    const value = String(rawValue ?? '').trim();
    if (value.length > 0) {
      return value;
    }
    }

    return null;
}

export function detectConcreteFactRequest(query: string): ConcreteFactRequest | null {
    const normalizedQuery = normalizeSearchText(query);
    if (
    /\b(cuant[oa]s?|de cuantas?)\s+(caladas|puffs?)\b/.test(normalizedQuery)
    || /\b(trae|tiene|viene|rinde)\s+(.*\s)?(caladas|puffs?)\b/.test(normalizedQuery)
    ) {
    return { family: 'Puffs' };
    }

    if (
    /\b(que|cual|cuanta|de cuanta)\s+nicotina\b/.test(normalizedQuery)
    || /\b(trae|tiene|viene)\s+(.*\s)?nicotina\b/.test(normalizedQuery)
    ) {
    return { family: 'Nicotina' };
    }

    if (
    /\b(que|cual)\s+(es\s+el\s+)?sabor\b/.test(normalizedQuery)
    || /\bde que sabor\b/.test(normalizedQuery)
    || /\bsabor de\b/.test(normalizedQuery)
    ) {
    return { family: 'Sabor' };
    }

    if (
    /\b(que|cual)\s+modelo\b/.test(normalizedQuery)
    || /\bmodelo de\b/.test(normalizedQuery)
    ) {
    return { family: 'Modelo', requestedAs: 'modelo' };
    }

    if (
    /\b(que|cual)\s+version\b/.test(normalizedQuery)
    || /\bversion de\b/.test(normalizedQuery)
    ) {
    return { family: 'Modelo', requestedAs: 'version' };
    }

    if (
    /\bcompatible con\b/.test(normalizedQuery)
    || /\bcompatibilidad\b/.test(normalizedQuery)
    ) {
    return { family: 'Compatibilidad' };
    }

    return null;
}

export function resolveConcreteFactAnswer(query: string, product: InternalResolvedProduct): ConcreteFactResolution | null {
    const request = detectConcreteFactRequest(query);
    if (!request) return null;
    const productName = product.name.trim();
    switch (request.family) {
    case 'Puffs': {
      const value = extractSpecValue(product, 'Puffs');
      if (!value) {
        return {
          request,
          answer: `No veo las caladas exactas cargadas para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: `${productName} trae ${value} caladas.`,
        directAnswerKind: 'FACT',
      };
    }

    case 'Nicotina': {
      const value = extractSpecValue(product, 'Nicotina');
      if (!value) {
        return {
          request,
          answer: `No veo la nicotina exacta cargada para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: `${productName} viene con ${normalizeDecisionText(value)} de nicotina.`,
        directAnswerKind: 'FACT',
      };
    }

    case 'Sabor': {
      const value = extractSpecValue(product, 'Sabor');
      if (!value) {
        return {
          request,
          answer: `No veo un sabor exacto cargado para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: `El sabor de ${productName} es ${normalizeDecisionText(value)}.`,
        directAnswerKind: 'FACT',
      };
    }

    case 'Modelo': {
      const value = extractSpecValue(product, 'Modelo');
      if (!value) {
        const requestedLabel = request.requestedAs === 'version' ? 'la version exacta' : 'el modelo exacto';
        return {
          request,
          answer: `No veo ${requestedLabel} cargado para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: request.requestedAs === 'version'
          ? `La version de ${productName} es ${value.trim()}.`
          : `El modelo de ${productName} es ${value.trim()}.`,
        directAnswerKind: 'FACT',
      };
    }

    case 'Compatibilidad': {
      const value = extractSpecValue(product, 'Compatibilidad') ?? extractSpecValue(product, 'Compatible con');
      if (!value) {
        return {
          request,
          answer: `No veo una compatibilidad exacta cargada para ${productName}. Mejor revisa la ficha antes de tomarlo como dato exacto.`,
          directAnswerKind: 'HONEST_MISSING_FACT',
        };
      }
      return {
        request,
        answer: `La ficha de ${productName} indica compatibilidad con ${value.trim()}.`,
        directAnswerKind: 'FACT',
      };
    }
    }
}
