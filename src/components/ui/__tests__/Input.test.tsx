import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input Component (UI Atomic)', () => {
    it('renders native input with standard props', () => {
        render(<Input placeholder="Ingresa tu correo" type="email" />);
        const inputElement = screen.getByPlaceholderText('Ingresa tu correo');
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute('type', 'email');
    });

    it('renders with label linked to input id', () => {
        render(<Input label="Nombre completo" id="custom-name-id" />);
        const labelElement = screen.getByText('Nombre completo');
        const inputElement = screen.getByLabelText('Nombre completo');

        expect(labelElement).toHaveAttribute('for', 'custom-name-id');
        expect(inputElement).toHaveAttribute('id', 'custom-name-id');
    });

    it('generates an accessible id for label when id is not provided', () => {
        render(<Input label="Dirección de envío" />);
        const inputElement = screen.getByLabelText('Dirección de envío');
        expect(inputElement).toHaveAttribute('id');
        expect(inputElement.id).not.toBe('');
    });

    it('triggers onChange handler when typing', () => {
        const handleChange = vi.fn();
        render(<Input placeholder="Buscar" onChange={handleChange} />);
        const inputElement = screen.getByPlaceholderText('Buscar');

        fireEvent.change(inputElement, { target: { value: 'Vape Pod' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('renders error message with alert role and aria-invalid', () => {
        render(<Input label="Email" error="El correo es inválido" />);
        const errorElement = screen.getByRole('alert');
        const inputElement = screen.getByLabelText('Email');

        expect(errorElement).toHaveTextContent('El correo es inválido');
        expect(inputElement).toHaveAttribute('aria-invalid', 'true');
        expect(inputElement.className).toContain('border-red-500');
    });

    it('renders helper text when error is not present', () => {
        render(<Input label="Usuario" helperText="Mínimo 4 caracteres" />);
        expect(screen.getByText('Mínimo 4 caracteres')).toBeInTheDocument();
    });

    it('renders left and right icons', () => {
        render(
            <Input
                leftIcon={<span data-testid="left-icon">🔍</span>}
                rightIcon={<span data-testid="right-icon">✕</span>}
            />
        );
        expect(screen.getByTestId('left-icon')).toBeInTheDocument();
        expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('supports size variants (sm, md, lg)', () => {
        const { rerender } = render(<Input inputSize="sm" placeholder="sm input" />);
        expect(screen.getByPlaceholderText('sm input').className).toContain('h-8');

        rerender(<Input inputSize="md" placeholder="md input" />);
        expect(screen.getByPlaceholderText('md input').className).toContain('h-10');

        rerender(<Input inputSize="lg" placeholder="lg input" />);
        expect(screen.getByPlaceholderText('lg input').className).toContain('h-12');
    });

    it('supports visual variants (surface, ghost, default)', () => {
        const { rerender } = render(<Input variant="surface" placeholder="surface input" />);
        expect(screen.getByPlaceholderText('surface input').className).toContain('bg-surface-card');

        rerender(<Input variant="ghost" placeholder="ghost input" />);
        expect(screen.getByPlaceholderText('ghost input').className).toContain('bg-transparent');

        rerender(<Input variant="default" placeholder="default input" />);
        expect(screen.getByPlaceholderText('default input').className).toContain('bg-white/5');
    });

    it('forwards ref to native input element', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input ref={ref} placeholder="Ref test" />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current?.placeholder).toBe('Ref test');
    });

    it('handles disabled state properly', () => {
        render(<Input disabled placeholder="Disabled input" />);
        const inputElement = screen.getByPlaceholderText('Disabled input');
        expect(inputElement).toBeDisabled();
        expect(inputElement.className).toContain('disabled:opacity-50');
    });
});
