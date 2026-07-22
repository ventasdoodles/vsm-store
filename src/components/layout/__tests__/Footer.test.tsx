import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TestRouter } from "@/lib/test-router";
import { Footer } from '../Footer';


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
            <TestRouter>
                <Footer />
            </TestRouter>,
        );

        expect(screen.getByTitle('Transacciones revisadas')).toBeInTheDocument();
        expect(screen.queryByTitle(/Transacciones Seguras/i)).not.toBeInTheDocument();
    });
});
