import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Desmonta los árboles DOM modificados tras cada test
afterEach(() => {
    cleanup();
});

// Mock para obviar problemas de IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Provide a global default for the VerticalPack context hook to prevent widespread test failures
// caused by components requiring config metadata that aren't wrapped in a VerticalPackProvider in isolated tests.
vi.mock('@/contexts/VerticalPackContext', async () => {
    const { vape420VerticalPackConfig } = await import('../config/productization');
    return {
        useActiveVerticalPack: () => ({
            config: vape420VerticalPackConfig,
            isLoading: false,
        }),
    };
});

import React from 'react';
vi.mock('framer-motion', () => {
    const componentMock = (element: string) => {
        return React.forwardRef((props: any, ref) => {
            const {
                initial, animate, exit, transition, variants,
                whileHover, whileTap, whileInView, viewport,
                layoutId, layout, custom, onAnimationComplete,
                onHoverStart, onHoverEnd, drag, dragConstraints,
                ...rest
            } = props;
            return React.createElement(element, { ...rest, ref });
        });
    };

    const mMock = new Proxy({}, {
        get: (_, element: string) => componentMock(element),
    });

    return {
        motion: mMock,
        m: mMock,
        LazyMotion: ({ children }: any) => children,
        AnimatePresence: ({ children }: any) => children,
        Reorder: {
            Group: React.forwardRef(({ children, ...props }: any, ref) => React.createElement('div', { ...props, ref }, children)),
            Item: React.forwardRef(({ children, ...props }: any, ref) => React.createElement('div', { ...props, ref }, children)),
        },
        useMotionValue: (v: any) => ({ get: () => v, set: vi.fn(), onChange: vi.fn() }),
        useMotionTemplate: () => '',
        useSpring: (v: any) => v,
        useTransform: () => '',
        useInView: () => true,
        useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
        useScroll: () => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } }),
    };
});
