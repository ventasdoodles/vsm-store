import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading } from '../Heading';

describe('Heading Component (UI Atomic)', () => {
    it('renders an h2 element by default with level 2 styles', () => {
        render(<Heading>Título de Sección</Heading>);
        const headingElement = screen.getByRole('heading', { level: 2 });
        expect(headingElement).toBeInTheDocument();
        expect(headingElement.tagName).toBe('H2');
        expect(headingElement.className).toContain('text-xl');
        expect(headingElement.className).toContain('text-white');
    });

    it('renders appropriate heading tag matching the level prop', () => {
        const { rerender } = render(<Heading level={1}>Encabezado Principal</Heading>);
        expect(screen.getByRole('heading', { level: 1 }).tagName).toBe('H1');

        rerender(<Heading level={3}>Subsección</Heading>);
        expect(screen.getByRole('heading', { level: 3 }).tagName).toBe('H3');

        rerender(<Heading level={4}>Detalle</Heading>);
        expect(screen.getByRole('heading', { level: 4 }).tagName).toBe('H4');
    });

    it('allows decoupling the rendered HTML tag using the "as" prop', () => {
        render(
            <Heading level={1} as="p" data-testid="custom-tag-heading">
                Visual H1 con semántica de párrafo
            </Heading>
        );
        const element = screen.getByTestId('custom-tag-heading');
        expect(element.tagName).toBe('P');
        // Still preserves level 1 visual styling
        expect(element.className).toContain('text-2xl');
        expect(element.className).toContain('font-black');
    });

    it('supports visual size overrides', () => {
        const { rerender } = render(<Heading level={1} size="xs">Micro Heading</Heading>);
        const element = screen.getByRole('heading', { level: 1 });
        expect(element.className).toContain('text-2xs');

        rerender(<Heading level={2} size="5xl">Mega Hero Heading</Heading>);
        expect(screen.getByRole('heading', { level: 2 }).className).toContain('text-4xl');
    });

    it('supports color and text variants (default, muted, accent, gradient)', () => {
        const { rerender } = render(<Heading variant="muted">Muted Heading</Heading>);
        expect(screen.getByRole('heading').className).toContain('text-theme-secondary');

        rerender(<Heading variant="accent">Accent Heading</Heading>);
        expect(screen.getByRole('heading').className).toContain('text-accent-primary');

        rerender(<Heading variant="gradient">Gradient Heading</Heading>);
        expect(screen.getByRole('heading').className).toContain('bg-clip-text');
    });

    it('supports tracking options', () => {
        render(<Heading tracking="tighter">Tight Heading</Heading>);
        expect(screen.getByRole('heading').className).toContain('tracking-tighter');
    });

    it('forwards ref to the DOM element', () => {
        const ref = createRef<HTMLHeadingElement>();
        render(<Heading ref={ref}>Ref Target</Heading>);
        expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
        expect(ref.current?.textContent).toBe('Ref Target');
    });

    it('merges custom classNames properly', () => {
        render(<Heading className="uppercase italic custom-class">Custom Styled</Heading>);
        const element = screen.getByRole('heading');
        expect(element.className).toContain('uppercase');
        expect(element.className).toContain('italic');
        expect(element.className).toContain('custom-class');
    });
});
