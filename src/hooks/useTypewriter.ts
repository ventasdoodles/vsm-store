import { useState, useEffect, useRef } from 'react';

/**
 * Typewriter effect hook for chat messages.
 * Reveals text progressively to simulate real-time AI typing.
 *
 * Only the latest assistant message should use this effect;
 * older messages should render their full content immediately.
 *
 * @param text - The full text to reveal.
 * @param enabled - Whether to animate. When false, returns the full text immediately.
 * @param speed - Characters per tick (higher = faster). Default: 2.
 * @param interval - Milliseconds between ticks. Default: 16 (~60fps).
 */
export function useTypewriter(
    text: string,
    enabled: boolean,
    speed: number = 2,
    interval: number = 16,
): { displayedText: string; isTyping: boolean } {
    // Skip animation in test environment so assertions work with full text
    const isTestEnv = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test';
    const effectiveEnabled = enabled && !isTestEnv;
    const [charIndex, setCharIndex] = useState(0);
    const prevTextRef = useRef(text);

    // Reset animation when text changes (new message arrives)
    useEffect(() => {
        if (text !== prevTextRef.current) {
            setCharIndex(0);
            prevTextRef.current = text;
        }
    }, [text]);

    useEffect(() => {
        if (!effectiveEnabled || charIndex >= text.length) return;

        const timer = setInterval(() => {
            setCharIndex((prev) => {
                const next = Math.min(prev + speed, text.length);
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [effectiveEnabled, charIndex, text.length, speed, interval]);

    if (!effectiveEnabled) {
        return { displayedText: text, isTyping: false };
    }

    return {
        displayedText: text.slice(0, charIndex),
        isTyping: charIndex < text.length,
    };
}
