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

    it('renders heading levels 5 and 6 correctly', () => {
        const { rerender } = render(<Heading level={5}>Nivel 5</Heading>);
        expect(screen.getByRole('heading', { level: 5 }).tagName).toBe('H5');

        rerender(<Heading level={6}>Nivel 6</Heading>);
        expect(screen.getByRole('heading', { level: 6 }).tagName).toBe('H6');
    });

    it('supports polymorphic anchor tag with href and forwards anchor ref', () => {
        const anchorRef = createRef<HTMLAnchorElement>();
        render(
            <Heading as="a" href="/catalogo" ref={anchorRef}>
                Enlace como Heading
            </Heading>
        );
        const element = screen.getByRole('link');
        expect(element.tagName).toBe('A');
        expect(element).toHaveAttribute('href', '/catalogo');
        expect(anchorRef.current).toBeInstanceOf(HTMLAnchorElement);
        expect(anchorRef.current?.href).toContain('/catalogo');
    });

    it('supports polymorphic paragraph tag with paragraph ref', () => {
        const pRef = createRef<HTMLParagraphElement>();
        render(
            <Heading as="p" ref={pRef} data-testid="p-heading">
                Párrafo estilizado como heading
            </Heading>
        );
        const element = screen.getByTestId('p-heading');
        expect(element.tagName).toBe('P');
        expect(pRef.current).toBeInstanceOf(HTMLParagraphElement);
    });

    it('supports polymorphic button tag with native button attributes', () => {
        render(
            <Heading as="button" type="button">
                Botón Heading
            </Heading>
        );
        const button = screen.getByRole('button');
        expect(button.tagName).toBe('BUTTON');
        expect(button).toHaveAttribute('type', 'button');
    });

    it('supports all tracking options', () => {
        const { rerender } = render(<Heading tracking="tight">Tight</Heading>);
        expect(screen.getByRole('heading').className).toContain('tracking-tight');

        rerender(<Heading tracking="normal">Normal</Heading>);
        expect(screen.getByRole('heading').className).toContain('tracking-normal');

        rerender(<Heading tracking="wide">Wide</Heading>);
        expect(screen.getByRole('heading').className).toContain('tracking-wide');

        rerender(<Heading tracking="wider">Wider</Heading>);
        expect(screen.getByRole('heading').className).toContain('tracking-wider');
    });
});
