import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
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
vi.mock('@/contexts/VerticalPackContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/contexts/VerticalPackContext')>();
    const { vape420VerticalPackConfig } = await import('../config/productization');
    return {
        ...actual,
        useActiveVerticalPack: () => {
            const ctx = React.useContext(actual.VerticalPackContext);
            return (ctx && ctx.config) ? ctx : {
                config: vape420VerticalPackConfig,
                isLoading: false,
            };
        },
    };
});

// Global default mock for @tanstack/react-router to provide safe defaults for Link, useLocation, useMatch, and useNavigate in isolated UI component tests
vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tanstack/react-router')>();
    const { TestRouterContext } = await import('@/lib/test-router');
    return {
        ...actual,
        Link: React.forwardRef(({ to, children, className, onClick, ...props }: any, ref: any) => {
            return React.createElement('a', {
                href: typeof to === 'string' ? to : (to?.to || '#'),
                className,
                onClick,
                ref,
                ...props,
            }, children);
        }),
        useLocation: () => {
            const ctx = React.useContext(TestRouterContext);
            return {
                pathname: ctx?.pathname || '/',
                search: ctx?.search || {},
                hash: '',
                href: ctx?.pathname || '/',
            };
        },
        useNavigate: () => vi.fn(),
        useMatch: () => {
            const ctx = React.useContext(TestRouterContext);
            return {
                params: ctx?.params || {},
                search: ctx?.search || {},
                pathname: ctx?.pathname || '/',
            };
        },
        useParams: () => {
            const ctx = React.useContext(TestRouterContext);
            return ctx?.params || {};
        },
        useSearch: () => {
            const ctx = React.useContext(TestRouterContext);
            return ctx?.search || {};
        },
    };
});

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
