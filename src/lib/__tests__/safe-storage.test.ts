import { describe, it, expect, beforeEach } from 'vitest';
import { safeLocalStorage, safeSessionStorage } from '../safe-storage';

describe('Safe Storage Utility', () => {
    beforeEach(() => {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch {
            // noop
        }
    });

    describe('safeLocalStorage', () => {
        it('stores and retrieves string items', () => {
            safeLocalStorage.setItem('test_key', 'test_val');
            expect(safeLocalStorage.getItem('test_key')).toBe('test_val');
            safeLocalStorage.removeItem('test_key');
            expect(safeLocalStorage.getItem('test_key')).toBeNull();
        });

        it('stores and retrieves JSON objects with fallback', () => {
            const data = { user: 'tester', count: 42 };
            safeLocalStorage.setJSON('test_json', data);
            expect(safeLocalStorage.getJSON('test_json', {})).toEqual(data);
            expect(safeLocalStorage.getJSON('non_existent', { fallback: true })).toEqual({ fallback: true });
        });

        it('gracefully handles JSON parse corruption', () => {
            safeLocalStorage.setItem('corrupted', '{broken json');
            expect(safeLocalStorage.getJSON('corrupted', 'default')).toBe('default');
        });
    });

    describe('safeSessionStorage', () => {
        it('stores and retrieves string items', () => {
            safeSessionStorage.setItem('sess_key', 'sess_val');
            expect(safeSessionStorage.getItem('sess_key')).toBe('sess_val');
            safeSessionStorage.removeItem('sess_key');
            expect(safeSessionStorage.getItem('sess_key')).toBeNull();
        });

        it('stores and retrieves JSON objects with fallback', () => {
            const form = { name: 'Alex', step: 2 };
            safeSessionStorage.setJSON('sess_form', form);
            expect(safeSessionStorage.getJSON('sess_form', null)).toEqual(form);
        });
    });
});
