// Tests para react-query.ts — getErrorMessage helper
import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../react-query';

describe('getErrorMessage', () => {
    it('returns connection error message for "Failed to fetch"', () => {
        const error = new Error('Failed to fetch');
        expect(getErrorMessage(error)).toBe('Error de conexión. Verifica tu red.');
    });

    it('returns session expired message for JWT errors', () => {
        const error = new Error('JWT expired');
        expect(getErrorMessage(error)).toBe('Tu sesión expiró. Vuelve a iniciar sesión.');
    });

    it('returns the error message for generic Error objects', () => {
        const error = new Error('Algo salió mal en el servidor');
        expect(getErrorMessage(error)).toBe('Algo salió mal en el servidor');
    });

    it('returns fallback message for non-Error values', () => {
        expect(getErrorMessage('string error')).toBe('Ocurrió un error inesperado.');
        expect(getErrorMessage(42)).toBe('Ocurrió un error inesperado.');
        expect(getErrorMessage(null)).toBe('Ocurrió un error inesperado.');
        expect(getErrorMessage(undefined)).toBe('Ocurrió un error inesperado.');
    });

    it('detects JWT in various formats', () => {
        expect(getErrorMessage(new Error('Invalid JWT token')))
            .toBe('Tu sesión expiró. Vuelve a iniciar sesión.');
        expect(getErrorMessage(new Error('JWT claim validation failed')))
            .toBe('Tu sesión expiró. Vuelve a iniciar sesión.');
    });
});
