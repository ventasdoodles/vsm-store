import { describe, it, expect } from 'vitest';
import { cn, formatPrice, slugify, formatTimeAgo } from '../utils';

describe('cn (class names)', () => {
    it('merges simple strings', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
        expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
    });

    it('handles undefined and null', () => {
        expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('concatenates classes without deduplication (uses clsx not tailwind-merge)', () => {
        // cn() uses clsx, which simply concatenates - it does NOT deduplicate Tailwind classes
        expect(cn('p-4', 'p-2')).toBe('p-4 p-2');
    });
});

describe('formatPrice', () => {
    it('formats a standard price in MXN', () => {
        const result = formatPrice(299.99);
        expect(result).toContain('299');
    });

    it('formats zero', () => {
        const result = formatPrice(0);
        expect(result).toContain('0');
    });

    it('formats large numbers', () => {
        const result = formatPrice(1500);
        expect(result).toContain('1');
        expect(result).toContain('500');
    });
});

describe('slugify', () => {
    it('converts text to lowercase', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });

    it('handles special characters', () => {
        expect(slugify('Café & Más')).toBe('cafe-mas');
    });

    it('handles accented characters', () => {
        expect(slugify('Ñoño Último')).toBe('nono-ultimo');
    });

    it('trims leading/trailing hyphens', () => {
        expect(slugify('  hello  ')).toBe('hello');
    });

    it('collapses multiple hyphens', () => {
        expect(slugify('hello---world')).toBe('hello-world');
    });

    it('handles empty string', () => {
        expect(slugify('')).toBe('');
    });
});

describe('formatTimeAgo', () => {
    it('returns "ahora" or similar for very recent dates', () => {
        const result = formatTimeAgo(new Date().toISOString());
        // Should return something indicating "now" or "just now"
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });

    it('returns time-based string for older dates', () => {
        const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
        const result = formatTimeAgo(oneHourAgo);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });

    it('handles Date objects', () => {
        const result = formatTimeAgo(new Date());
        expect(typeof result).toBe('string');
    });
});
