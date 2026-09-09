import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    it('allows clicking interactive elements inside rightIcon and leftIcon', () => {
        const handleRightClick = vi.fn();
        const handleLeftClick = vi.fn();

        render(
            <Input
                placeholder="Contraseña"
                type="password"
                leftIcon={
                    <button
                        type="button"
                        onClick={handleLeftClick}
                        aria-label="Prefix action"
                    >
                        🔒
                    </button>
                }
                rightIcon={
                    <button
                        type="button"
                        onClick={handleRightClick}
                        aria-label="Toggle password visibility"
                    >
                        👁️
                    </button>
                }
            />
        );

        const rightButton = screen.getByRole('button', { name: 'Toggle password visibility' });
        const leftButton = screen.getByRole('button', { name: 'Prefix action' });

        fireEvent.click(rightButton);
        expect(handleRightClick).toHaveBeenCalledTimes(1);

        fireEvent.click(leftButton);
        expect(handleLeftClick).toHaveBeenCalledTimes(1);
    });

    it('cleanly merges custom aria-describedby with errorId', () => {
        render(
            <Input
                id="email-field"
                aria-describedby="external-hint-id"
                error="El correo es obligatorio"
            />
        );
        const inputElement = screen.getByRole('textbox');
        expect(inputElement).toHaveAttribute('aria-describedby', 'external-hint-id email-field-error');
        expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-field-error');
    });

    it('cleanly merges custom aria-describedby with helperId', () => {
        render(
            <Input
                id="phone-field"
                aria-describedby="external-hint-id"
                helperText="Formato: 10 dígitos"
            />
        );
        const inputElement = screen.getByRole('textbox');
        expect(inputElement).toHaveAttribute('aria-describedby', 'external-hint-id phone-field-helper');
        expect(screen.getByText('Formato: 10 dígitos')).toHaveAttribute('id', 'phone-field-helper');
    });

    it('preserves custom aria-describedby when neither error nor helperText is present', () => {
        render(<Input aria-describedby="external-only-desc" placeholder="Solo custom desc" />);
        const inputElement = screen.getByPlaceholderText('Solo custom desc');
        expect(inputElement).toHaveAttribute('aria-describedby', 'external-only-desc');
    });

    it('does not set aria-describedby when no error, helperText, or custom prop is provided', () => {
        render(<Input placeholder="Plain input" />);
        const inputElement = screen.getByPlaceholderText('Plain input');
        expect(inputElement).not.toHaveAttribute('aria-describedby');
    });

    it('does not flag aria-invalid or render alert paragraph when error is an empty string or whitespace', () => {
        const { rerender } = render(
            <Input label="Test" error="" helperText="Instrucción de ayuda" />
        );
        const inputElement = screen.getByLabelText('Test');

        expect(inputElement).not.toHaveAttribute('aria-invalid', 'true');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        // Since error is empty, fallback helperText renders
        expect(screen.getByText('Instrucción de ayuda')).toBeInTheDocument();

        // When whitespace only
        rerender(<Input label="Test" error="   " />);
        expect(inputElement).not.toHaveAttribute('aria-invalid', 'true');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(inputElement.className).not.toContain('border-red-500');
    });

    it('does not render helperText paragraph when helperText is an empty string or whitespace', () => {
        render(<Input label="Empty Helper" helperText="" />);
        expect(screen.queryByText('', { selector: 'p' })).not.toBeInTheDocument();
    });

    it('prioritizes error over helperText and only links error to aria-describedby', () => {
        render(
            <Input
                id="conflict-field"
                label="Conflicto"
                error="Error prioritario"
                helperText="Texto secundario ignorado"
            />
        );
        const inputElement = screen.getByLabelText('Conflicto');

        expect(screen.getByRole('alert')).toHaveTextContent('Error prioritario');
        expect(screen.queryByText('Texto secundario ignorado')).not.toBeInTheDocument();
        expect(inputElement).toHaveAttribute('aria-describedby', 'conflict-field-error');
    });

    it('focuses the input when clicking the label', async () => {
        const user = userEvent.setup();
        render(<Input label="Click Me Label" id="label-focus-test" />);
        const labelElement = screen.getByText('Click Me Label');
        const inputElement = screen.getByLabelText('Click Me Label');

        await user.click(labelElement);
        expect(inputElement).toHaveFocus();
    });
});
