import { useEffect, useCallback, type RefObject } from 'react';

/**
 * Hook to trap focus within a container element, crucial for modal accessibility.
 * Cycles the focus using Tab and Shift+Tab between the first and last focusable elements.
 * 
 * @param containerRef Reference to the DOM element to trap focus inside
 * @param isActive Boolean indicating whether the trap should be active
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
    const handleFocusTrap = useCallback((e: KeyboardEvent) => {
        if (!isActive || e.key !== 'Tab' || !containerRef.current) return;

        // Select all potentially focusable elements
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0]!;
        const lastElement = focusableElements[focusableElements.length - 1]!;

        // Shift + Tab -> Trying to go backwards from the first element
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
        // Tab -> Trying to go forwards from the last element
        else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }, [isActive, containerRef]);

    useEffect(() => {
        if (!isActive) return;

        document.addEventListener('keydown', handleFocusTrap);

        // Auto-focus the first element when activated after a small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (containerRef.current) {
                const firstBtn = containerRef.current.querySelector<HTMLElement>('button');
                firstBtn?.focus();
            }
        }, 100);

        return () => {
            document.removeEventListener('keydown', handleFocusTrap);
            clearTimeout(timer);
        };
    }, [isActive, handleFocusTrap, containerRef]);
}
