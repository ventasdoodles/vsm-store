/**
 * Accessibility utilities for VSM Store
 * Helpers for WCAG AA compliance
 */

/**
 * Generate unique ID for form inputs (accessibility requirement)
 */
export const generateA11yId = (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Announce to screen readers (for dynamic content updates)
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Screen reader only class
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after screen reader has processed (1 second)
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

/**
 * Trap focus within modal (accessibility requirement)
 */
export const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                lastFocusable?.focus();
                e.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                firstFocusable?.focus();
                e.preventDefault();
            }
        }
    };

    element.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstFocusable?.focus();

    // Return cleanup function
    return () => {
        element.removeEventListener('keydown', handleTabKey);
    };
};
