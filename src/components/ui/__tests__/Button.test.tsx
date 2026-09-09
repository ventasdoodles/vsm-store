import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button Component (UI Atomic)', () => {
    it('renders with default attributes (type="button", md size, rounded-xl, primary variant)', () => {
        render(<Button>Guardar</Button>);
        const btn = screen.getByRole('button', { name: 'Guardar' });

        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('type', 'button');
        expect(btn.className).toContain('rounded-xl');
        expect(btn.className).toContain('h-10');
        expect(btn.className).toContain('bg-white');
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
        expect(btn).toHaveTextContent('Procesando pedido...');
        expect(btn.querySelector('svg')).toBeInTheDocument(); // Loader2 spinner
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

    it('renders left and right icons when not loading', () => {
        render(
            <Button
                leftIcon={<span data-testid="left-icon">←</span>}
                rightIcon={<span data-testid="right-icon">→</span>}
            >
                Siguiente
            </Button>
        );
        expect(screen.getByTestId('left-icon')).toBeInTheDocument();
        expect(screen.getByTestId('right-icon')).toBeInTheDocument();
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
});
