import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from '../Footer';

vi.mock('framer-motion', () => ({
    motion: new Proxy(
        {},
        {
            get: () =>
                ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
                    <div {...props}>{children}</div>
                ),
        },
    ),
    useMotionValue: () => ({ set: vi.fn() }),
    useMotionTemplate: () => '',
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    }),
}));

describe('Footer trust copy', () => {
    it('uses evidence-safe footer trust wording', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>,
        );

        expect(screen.getByTitle('Transacciones revisadas')).toBeInTheDocument();
        expect(screen.queryByTitle(/Transacciones Seguras/i)).not.toBeInTheDocument();
    });
});
