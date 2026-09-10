import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Button } from '../Button';

describe('Button Component (UI Atomic)', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    it('renders with default attributes (type="button", md size, rounded-xl, primary variant)', () => {
        render(<Button>Guardar</Button>);
        const btn = screen.getByRole('button', { name: 'Guardar' });

        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('type', 'button');
        expect(btn.className).toContain('rounded-xl');
        expect(btn.className).toContain('h-10');
        expect(btn.className).toContain('bg-white');
        expect(btn.className).toContain('whitespace-nowrap');
        expect(btn.className).toContain('shrink-0');
    });

    it('honors custom type like type="submit"', () => {
        render(<Button type="submit">Enviar Formulario</Button>);
        expect(screen.getByRole('button', { name: 'Enviar Formulario' })).toHaveAttribute('type', 'submit');
    });

    it('renders all variant classes correctly', () => {
        const { rerender } = render(<Button variant="surface">Surface</Button>);
        expect(screen.getByRole('button').className).toContain('bg-surface-card');

        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button').className).toContain('bg-white/10');

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button').className).toContain('bg-transparent');

        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button').className).toContain('text-theme-secondary');

        rerender(<Button variant="danger">Danger</Button>);
        expect(screen.getByRole('button').className).toContain('text-red-400');

        rerender(<Button variant="vape">Vape</Button>);
        expect(screen.getByRole('button').className).toContain('from-blue-600');

        rerender(<Button variant="herbal">Herbal</Button>);
        expect(screen.getByRole('button').className).toContain('from-emerald-600');
    });

    it('renders all size classes correctly', () => {
        const { rerender } = render(<Button size="xs">XS</Button>);
        expect(screen.getByRole('button').className).toContain('h-7');

        rerender(<Button size="sm">SM</Button>);
        expect(screen.getByRole('button').className).toContain('h-8');

        rerender(<Button size="md">MD</Button>);
        expect(screen.getByRole('button').className).toContain('h-10');

        rerender(<Button size="lg">LG</Button>);
        expect(screen.getByRole('button').className).toContain('h-12');

        rerender(<Button size="icon" aria-label="Icon">✕</Button>);
        expect(screen.getByRole('button').className).toContain('h-9 w-9');

        rerender(<Button size="icon-sm" aria-label="Icon SM">✕</Button>);
        expect(screen.getByRole('button').className).toContain('h-7 w-7');

        rerender(<Button size="icon-lg" aria-label="Icon LG">✕</Button>);
        expect(screen.getByRole('button').className).toContain('h-11 w-11');
    });

    it('supports all radius options from VSM radius scale', () => {
        const { rerender } = render(<Button radius="full">Full</Button>);
        expect(screen.getByRole('button').className).toContain('rounded-full');

        rerender(<Button radius="lg">LG</Button>);
        expect(screen.getByRole('button').className).toContain('rounded-lg');

        rerender(<Button radius="2xl">2XL</Button>);
        expect(screen.getByRole('button').className).toContain('rounded-2xl');

        rerender(<Button radius="none">None</Button>);
        expect(screen.getByRole('button').className).toContain('rounded-none');
    });

    it('handles loading state with spinner, disabled attribute, and aria-busy', () => {
        render(
            <Button isLoading loadingText="Procesando pedido...">
                Pagar
            </Button>
        );
        const btn = screen.getByRole('button');

        expect(btn).toBeDisabled();
        expect(btn).toHaveAttribute('aria-busy', 'true');
        expect(btn).toHaveAttribute('aria-live', 'polite');
        expect(btn).toHaveTextContent('Procesando pedido...');
        expect(btn.querySelector('svg')).toBeInTheDocument(); // Loader2 spinner
        expect(btn.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('replaces leftIcon with spinner during loading', () => {
        render(
            <Button
                isLoading
                leftIcon={<span data-testid="test-icon">★</span>}
            >
                Acción
            </Button>
        );
        expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
        expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });

    it('renders left and right icons with aria-hidden="true" when not loading', () => {
        render(
            <Button
                leftIcon={<span data-testid="left-icon">←</span>}
                rightIcon={<span data-testid="right-icon">→</span>}
            >
                Siguiente
            </Button>
        );
        const leftWrapper = screen.getByTestId('left-icon').parentElement;
        const rightWrapper = screen.getByTestId('right-icon').parentElement;

        expect(leftWrapper).toHaveAttribute('aria-hidden', 'true');
        expect(rightWrapper).toHaveAttribute('aria-hidden', 'true');
    });

    it('supports fullWidth prop', () => {
        render(<Button fullWidth>Ancho Completo</Button>);
        expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('handles onClick event when enabled', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onClick when disabled', () => {
        const handleClick = vi.fn();
        render(<Button disabled onClick={handleClick}>Disabled</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('forwards ref to HTMLButtonElement', () => {
        const ref = createRef<HTMLButtonElement>();
        render(<Button ref={ref}>Ref Target</Button>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        expect(ref.current?.textContent).toBe('Ref Target');
    });

    /* ── Adversarial & Hardened Test Suite ────────────────────────── */

    describe('A11y & Screen Reader Enhancements', () => {
        it('appends sr-only announcement (Cargando...) when isLoading is true without loadingText', () => {
            render(<Button isLoading>Confirmar</Button>);
            const btn = screen.getByRole('button');

            expect(btn).toHaveAttribute('aria-busy', 'true');
            expect(btn).toHaveAttribute('aria-live', 'polite');
            const srSpan = btn.querySelector('.sr-only');
            expect(srSpan).toBeInTheDocument();
            expect(srSpan?.textContent).toContain('Cargando...');
        });

        it('derives accessible aria-label from title on icon-only buttons if aria-label is omitted', () => {
            render(
                <Button size="icon" title="Cerrar modal">
                    <span data-testid="close-icon">✕</span>
                </Button>
            );
            const btn = screen.getByRole('button', { name: 'Cerrar modal' });
            expect(btn).toHaveAttribute('aria-label', 'Cerrar modal');
        });

        it('warns in development if an icon button has no accessible label or string child', () => {
            render(
                <Button size="icon">
                    <span data-testid="dummy-icon">⚙</span>
                </Button>
            );
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('[Button]: Icon-only buttons')
            );
        });

        it('does not warn in development if icon button has explicit aria-label', () => {
            render(
                <Button size="icon" aria-label="Ajustes">
                    <span data-testid="dummy-icon">⚙</span>
                </Button>
            );
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('protects icon button geometry during loading: hides icon child and renders centered spinner + sr-only text', () => {
            render(
                <Button size="icon" aria-label="Eliminar elemento" isLoading loadingText="Eliminando...">
                    <span data-testid="trash-icon">🗑</span>
                </Button>
            );

            // Icon child must NOT be rendered, avoiding double-icon squishing in square button
            expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument();

            const btn = screen.getByRole('button', { name: 'Eliminar elemento' });
            expect(btn.querySelector('svg')).toBeInTheDocument(); // Loader2
            const srOnly = btn.querySelector('.sr-only');
            expect(srOnly).toBeInTheDocument();
            expect(srOnly?.textContent).toBe('Eliminando...');
        });

        it('defaults icon button sr-only loading text to Cargando... if loadingText is not passed', () => {
            render(
                <Button size="icon" aria-label="Eliminar" isLoading>
                    <span data-testid="trash-icon">🗑</span>
                </Button>
            );
            const srOnly = screen.getByRole('button').querySelector('.sr-only');
            expect(srOnly?.textContent).toBe('Cargando...');
        });
    });

    describe('Form & Keyboard Event Hardening', () => {
        it('prevents form submit even on enter or synthetic clicks when isLoading is true and type="submit"', () => {
            const handleSubmit = vi.fn((e) => e.preventDefault());
            const handleClick = vi.fn();

            render(
                <form onSubmit={handleSubmit}>
                    <Button type="submit" isLoading onClick={handleClick}>
                        Enviar
                    </Button>
                </form>
            );

            const btn = screen.getByRole('button');
            fireEvent.click(btn);
            fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });

            expect(handleClick).not.toHaveBeenCalled();
            expect(handleSubmit).not.toHaveBeenCalled();
        });

        it('blocks click and keydown when aria-disabled is passed', () => {
            const handleClick = vi.fn();
            const handleKeyDown = vi.fn();

            render(
                <Button aria-disabled="true" onClick={handleClick} onKeyDown={handleKeyDown}>
                    Bloqueado
                </Button>
            );

            const btn = screen.getByRole('button');
            fireEvent.click(btn);
            fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
            fireEvent.keyDown(btn, { key: ' ', code: 'Space' });

            expect(handleClick).not.toHaveBeenCalled();
            expect(handleKeyDown).not.toHaveBeenCalled();
        });

        it('allows normal keydown when button is enabled', () => {
            const handleKeyDown = vi.fn();
            render(<Button onKeyDown={handleKeyDown}>Presionar</Button>);

            const btn = screen.getByRole('button');
            fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
            expect(handleKeyDown).toHaveBeenCalledTimes(1);
        });
    });

    describe('Proportional Sizing & Layout Security', () => {
        it('scales spinner sizes proportionally across button sizes', () => {
            const { rerender } = render(<Button size="xs" isLoading>XS</Button>);
            expect(screen.getByRole('button').querySelector('svg')?.className.baseVal).toContain('h-3.5 w-3.5');

            rerender(<Button size="sm" isLoading>SM</Button>);
            expect(screen.getByRole('button').querySelector('svg')?.className.baseVal).toContain('h-4 w-4');

            rerender(<Button size="md" isLoading>MD</Button>);
            expect(screen.getByRole('button').querySelector('svg')?.className.baseVal).toContain('h-4 w-4');

            rerender(<Button size="lg" isLoading>LG</Button>);
            expect(screen.getByRole('button').querySelector('svg')?.className.baseVal).toContain('h-5 w-5');

            rerender(<Button size="icon-sm" aria-label="Icon SM" isLoading>✕</Button>);
            expect(screen.getByRole('button').querySelector('svg')?.className.baseVal).toContain('h-3.5 w-3.5');

            rerender(<Button size="icon-lg" aria-label="Icon LG" isLoading>✕</Button>);
            expect(screen.getByRole('button').querySelector('svg')?.className.baseVal).toContain('h-5 w-5');
        });

        it('applies high-contrast WCAG 2.2 focus ring classes with offset', () => {
            render(<Button>Focus Test</Button>);
            const btn = screen.getByRole('button');
            expect(btn.className).toContain('focus-visible:ring-vape-500');
            expect(btn.className).toContain('focus-visible:ring-offset-2');
            expect(btn.className).toContain('focus-visible:ring-offset-surface-base');
        });

        it('defensively falls back to size="none" when custom dimensions/padding are passed in className', () => {
            render(<Button className="h-8 w-8 p-0">Icon</Button>);
            const btn = screen.getByRole('button');
            expect(btn.className).toContain('h-8 w-8');
            expect(btn.className).not.toContain('h-10');
            expect(btn.className).not.toContain('px-4');
        });

        it('defensively falls back to variant="unstyled" when custom bg/border are passed in className', () => {
            render(<Button className="bg-red-600 border-red-500">Custom Red</Button>);
            const btn = screen.getByRole('button');
            expect(btn.className).toContain('bg-red-600');
            expect(btn.className).not.toContain('bg-white');
            expect(btn.className).not.toContain('btn-shine');
        });
    });
});

