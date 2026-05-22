import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useTypewriter } from '../useTypewriter';

describe('useTypewriter', () => {
    it('returns full text immediately when disabled', () => {
        const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

        const { result } = renderHook(() => useTypewriter('Respuesta completa.', false));

        expect(result.current).toEqual({
            displayedText: 'Respuesta completa.',
            isTyping: false,
        });
        expect(setIntervalSpy).not.toHaveBeenCalled();

        setIntervalSpy.mockRestore();
    });

    it('bypasses animation in test mode for deterministic assertions', () => {
        const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

        const { result } = renderHook(() => useTypewriter('Texto visible en tests.', true));

        expect(result.current.displayedText).toBe('Texto visible en tests.');
        expect(result.current.isTyping).toBe(false);
        expect(setIntervalSpy).not.toHaveBeenCalled();

        setIntervalSpy.mockRestore();
    });

    it('updates the displayed text when the source text changes', () => {
        const { result, rerender } = renderHook(
            ({ text }) => useTypewriter(text, true),
            { initialProps: { text: 'Primera respuesta.' } },
        );

        expect(result.current.displayedText).toBe('Primera respuesta.');

        rerender({ text: 'Segunda respuesta.' });

        expect(result.current.displayedText).toBe('Segunda respuesta.');
        expect(result.current.isTyping).toBe(false);
    });
});
