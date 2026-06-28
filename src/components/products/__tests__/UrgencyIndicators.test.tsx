import { createElement, forwardRef, type PropsWithChildren, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UrgencyIndicators } from '../UrgencyIndicators';

vi.mock('framer-motion', () => {
    const MotionElement =
        (Tag: keyof JSX.IntrinsicElements) =>
            forwardRef<HTMLElement, PropsWithChildren<Record<string, unknown>>>(({
                children,
                initial: _initial,
                animate: _animate,
                exit: _exit,
                transition: _transition,
                whileHover: _whileHover,
                whileTap: _whileTap,
                ...props
            }, ref) => createElement(Tag, { ...props, ref }, children as ReactNode));

    return {
        motion: new Proxy({}, {
            get: (_target, tag: any) => MotionElement(tag as any),
        }),
    };
});

describe('UrgencyIndicators', () => {
    it('renders non-urgent availability wording for in-stock items', () => {
        render(<UrgencyIndicators stock={12} />);

        expect(screen.getByText('Disponible para envío')).toBeInTheDocument();
    });

    it('renders limited availability wording without urgency claims', () => {
        render(<UrgencyIndicators stock={3} />);

        expect(screen.getByText('Stock limitado: 3 unidades')).toBeInTheDocument();
        expect(screen.queryByText(/Solo quedan/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Ultimas/i)).not.toBeInTheDocument();
    });

    it('renders out-of-stock wording', () => {
        render(<UrgencyIndicators stock={0} />);

        expect(screen.getByText('Agotado')).toBeInTheDocument();
    });
});
