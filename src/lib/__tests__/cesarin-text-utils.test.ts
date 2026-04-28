import { describe, it, expect } from 'vitest';
import {
    normalizeCompactText,
    isMeaningfullyDistinct,
    splitIntoSentences,
    compactCesarinCopy,
    mergeConversationalPrefix,
    getEffectiveConversationalPrefix,
} from '../cesarin-text-utils';
import { resolveGroundedProductSearchMessage } from '../../services/concierge.service';

describe('normalizeCompactText', () => {
    it('strips diacritics and lowercases', () => {
        expect(normalizeCompactText('César Ín')).toBe('cesar in');
    });

    it('replaces non-alphanum with spaces', () => {
        expect(normalizeCompactText('¿Hola, qué tal?')).toBe('hola que tal');
    });

    it('trims whitespace', () => {
        expect(normalizeCompactText('  hello  ')).toBe('hello');
    });
});

describe('isMeaningfullyDistinct', () => {
    it('detects identical strings', () => {
        expect(isMeaningfullyDistinct('hello world', 'hello world')).toBe(false);
    });

    it('detects containment', () => {
        expect(isMeaningfullyDistinct('hello', 'hello world foo bar')).toBe(false);
    });

    it('detects real differences', () => {
        expect(isMeaningfullyDistinct('vape de menta', 'kit de fresa')).toBe(true);
    });

    it('handles empty strings', () => {
        expect(isMeaningfullyDistinct('', 'something')).toBe(true);
    });
});

describe('splitIntoSentences', () => {
    it('splits on sentence boundaries', () => {
        expect(splitIntoSentences('Hola. ¿Cómo estás?')).toEqual(['Hola.', '¿Cómo estás?']);
    });

    it('handles single sentence', () => {
        expect(splitIntoSentences('Sin punto')).toEqual(['Sin punto']);
    });

    it('handles empty string', () => {
        expect(splitIntoSentences('')).toEqual([]);
    });
});

describe('compactCesarinCopy', () => {
    it('removes duplicate sentences', () => {
        const input = 'Te ayudo. Te ayudo. ¿Qué necesitas?';
        const result = compactCesarinCopy(input);
        expect(result).toBe('Te ayudo. ¿Qué necesitas?');
    });

    it('respects maxSentences limit', () => {
        const input = 'Uno. Dos. Tres. Cuatro.';
        const result = compactCesarinCopy(input, 2);
        expect(result.split('.').filter(Boolean).length).toBeLessThanOrEqual(2);
    });

    it('strips redundant closing sentences', () => {
        const input = 'Tu pedido va bien. Si quieres te muestro más opciones.';
        const result = compactCesarinCopy(input);
        expect(result).not.toContain('Si quieres te muestro');
    });
});

describe('mergeConversationalPrefix', () => {
    it('returns message when prefix is null', () => {
        expect(mergeConversationalPrefix('Hola mundo.', null)).toBe('Hola mundo.');
    });

    it('merges distinct prefix', () => {
        const result = mergeConversationalPrefix('Tenemos vapers de menta.', '¡Buena elección!');
        expect(result).toContain('Buena');
        expect(result).toContain('menta');
    });

    it('skips redundant prefix', () => {
        const result = mergeConversationalPrefix('Tenemos vapers de menta.', 'Tenemos vapers de menta.');
        expect(result).toBe('Tenemos vapers de menta.');
    });
});

describe('getEffectiveConversationalPrefix', () => {
    it('returns null for empty prefix', () => {
        expect(getEffectiveConversationalPrefix({
            message: 'Hello',
            prefix: '',
        })).toBeNull();
    });

    it('returns null for ASK_CLARIFYING_QUESTION', () => {
        expect(getEffectiveConversationalPrefix({
            message: 'Hello',
            prefix: 'Prefix',
            turnAnalysis: { current_turn_decision: 'ASK_CLARIFYING_QUESTION', primary_intent: 'UNKNOWN' },
        })).toBeNull();
    });

    it('returns null for PUBLIC_INFO with source context', () => {
        expect(getEffectiveConversationalPrefix({
            message: 'Data found.',
            prefix: 'Nice question!',
            turnAnalysis: { current_turn_decision: 'USE_CAPABILITY', primary_intent: 'PUBLIC_INFO' },
            sourceContext: { label: 'Contexto publico' },
        })).toBeNull();
    });

    it('returns prefix for valid product search turn', () => {
        const result = getEffectiveConversationalPrefix({
            message: 'Tenemos vapers de uva disponibles.',
            prefix: '¡Buena elección!',
            turnAnalysis: { current_turn_decision: 'USE_CAPABILITY', primary_intent: 'PRODUCT_SEARCH' },
        });
        expect(result).toBeTruthy();
    });
});

describe('Response Compaction Regression Tests (Commit 3faaae0)', () => {
    it('compactCesarinCopy default preserves a 5-sentence non-duplicative Césarín draft', () => {
        const draft = 'Esta es la oración uno. Esta es la oración dos, con más detalle. Aquí tienes la oración tres que explica algo. La oración cuatro añade contexto. Y la oración cinco finaliza la idea.';
        const result = compactCesarinCopy(draft);
        expect(result.split('.').filter(Boolean).length).toBe(5);
        expect(result).toBe(draft);
    });

    it('compactCesarinCopy still caps rambling/repetitive text safely at 8 sentences by default', () => {
        const rambling = 'Uno. Dos. Tres. Cuatro. Cinco. Seis. Siete. Ocho. Nueve. Diez.';
        const result = compactCesarinCopy(rambling);
        const sentences = result.split('.').filter(Boolean);
        expect(sentences.length).toBe(8);
        expect(result).not.toContain('Nueve');
        expect(result).not.toContain('Diez');
    });

    it('mergeConversationalPrefix preserves a distinct prefix plus a 5-sentence message without collapsing to 2/3 sentences', () => {
        const prefix = '¡Excelente elección!';
        const message = 'Esta es la oración uno. Esta es la oración dos, con más detalle. Aquí tienes la oración tres que explica algo. La oración cuatro añade contexto. Y la oración cinco finaliza la idea.';
        const result = mergeConversationalPrefix(message, prefix);
        const sentences = result.split(/!|\./).filter(s => s.trim().length > 0);
        // Prefix (1) + Message (5) = 6 distinct sentence segments
        expect(sentences.length).toBe(6);
        expect(result).toContain('Excelente elección');
        expect(result).toContain('cinco finaliza la idea');
    });

    it('resolveGroundedProductSearchMessage preserves a 5-sentence customer_response_draft without truncating to 2 sentences', () => {
        const draft = 'He analizado tu solicitud. Estos vapes de uva son excelentes opciones. Tienen buena duración de batería. Además, el sabor es muy intenso. Espero que te gusten.';
        const result = resolveGroundedProductSearchMessage({
            capsuleDraft: draft,
            candidateMessage: draft,
            products: [{ name: 'Vape Uva' }],
            shouldShowCatalogSurfaces: true,
            executionStatus: 'SUCCESS',
            maxSentences: 8,
        });
        const sentences = result.split('.').filter(s => s.trim().length > 0);
        expect(sentences.length).toBe(5);
        expect(result).toBe(draft);
    });

    it('resolveGroundedProductSearchMessage reverts to compactDraft if candidate drops a product anchor', () => {
        const draft = 'Te sugiero el Kit de Fresa. Es muy bueno.';
        const candidate = 'Te sugiero algo diferente. Es muy bueno.';
        const result = resolveGroundedProductSearchMessage({
            capsuleDraft: draft,
            candidateMessage: candidate,
            products: [{ name: 'Kit de Fresa' }],
            shouldShowCatalogSurfaces: true,
            executionStatus: 'SUCCESS',
            maxSentences: 8,
        });
        // Since candidate drops 'Kit de Fresa', it should fall back to draft
        expect(result).toBe(draft);
    });
});
