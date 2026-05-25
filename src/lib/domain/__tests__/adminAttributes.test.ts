import { describe, expect, it } from 'vitest';
import {
    buildAttributeUpdatePayload,
    clearAttributeCategories,
    normalizeAttributeTextInput,
    toggleAttributeCategory,
    toggleAttributeSection,
} from '../adminAttributes';

describe('adminAttributes', () => {
    it('normalizes attribute text inputs', () => {
        expect(normalizeAttributeTextInput('  Color  ')).toBe('Color');
        expect(normalizeAttributeTextInput('   ')).toBeNull();
    });

    it('toggles sections immutably and preserves categories', () => {
        const base = {
            sections: ['vape'] as ['vape'],
            categories: ['cat-1'],
        };

        const updated = toggleAttributeSection(base, '420');
        const removed = toggleAttributeSection(updated, 'vape');

        expect(updated).toEqual({
            sections: ['vape', '420'],
            categories: ['cat-1'],
        });
        expect(removed).toEqual({
            sections: ['420'],
            categories: ['cat-1'],
        });
    });

    it('toggles categories and clears filters without mutating the source', () => {
        const base = { sections: ['vape'] as ['vape'], categories: ['cat-1'] };
        const toggled = toggleAttributeCategory(base, 'cat-2');
        const cleared = clearAttributeCategories(toggled);

        expect(base).toEqual({ sections: ['vape'], categories: ['cat-1'] });
        expect(toggled).toEqual({ sections: ['vape'], categories: ['cat-1', 'cat-2'] });
        expect(cleared).toEqual({ sections: ['vape'], categories: [] });
    });

    it('builds the same update payload shape used by the page', () => {
        expect(
            buildAttributeUpdatePayload('attr-1', {
                is_variant_capable: true,
                applicability: { sections: ['vape'] },
            }),
        ).toEqual({
            id: 'attr-1',
            updates: {
                is_variant_capable: true,
                applicability: { sections: ['vape'] },
            },
        });
    });
});
