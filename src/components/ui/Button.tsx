import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'surface'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'vape'
    | 'herbal';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
export type ButtonRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    radius?: ButtonRadius;
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    /**
     * Accessible label for the button.
     * Strongly recommended for icon-only buttons (size="icon", "icon-sm", "icon-lg").
     */
    'aria-label'?: string;
}

const variants: Record<ButtonVariant, string> = {
    primary:
        'bg-white text-theme-primary hover:bg-theme-secondary border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.3)] btn-shine font-bold',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-surface backdrop-blur-sm',
    surface: 'bg-surface-card hover:bg-surface-elevated text-white border border-surface shadow-sm',
    outline: 'bg-transparent border border-surface text-white hover:bg-white/10 hover:border-surface-strong',
    ghost: 'bg-transparent text-theme-secondary hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40',
    vape: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:to-blue-600 shadow-blue-500/20 shadow-lg border border-blue-400/20 btn-shine',
    herbal: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:to-emerald-600 shadow-emerald-500/20 shadow-lg border border-emerald-400/20 btn-shine',
};

const sizes: Record<ButtonSize, string> = {
    xs: 'h-7 px-2.5 text-xs gap-1.5',
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
    icon: 'h-9 w-9 p-0 flex items-center justify-center',
    'icon-sm': 'h-7 w-7 p-0 flex items-center justify-center',
    'icon-lg': 'h-11 w-11 p-0 flex items-center justify-center',
};

const spinnerSizes: Record<ButtonSize, string> = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    icon: 'h-4 w-4',
    'icon-sm': 'h-3.5 w-3.5',
    'icon-lg': 'h-5 w-5',
};

const radii: Record<ButtonRadius, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            radius = 'xl',
            isLoading = false,
            loadingText,
            leftIcon,
            rightIcon,
            fullWidth = false,
            type = 'button',
            children,
            disabled,
            title,
            onClick,
            onKeyDown,
            'aria-label': ariaLabelProp,
            'aria-live': ariaLiveProp,
            'aria-busy': ariaBusyProp,
            ...props
        },
        ref
    ) => {
        const isIconButton = size === 'icon' || size === 'icon-sm' || size === 'icon-lg';
        const isDisabled = isLoading || disabled;
        const accessibleLabel =
            ariaLabelProp || (isIconButton && typeof title === 'string' && title.trim() ? title.trim() : undefined);

        if (
            process.env.NODE_ENV !== 'production' &&
            isIconButton &&
            !accessibleLabel &&
            !props['aria-labelledby'] &&
            typeof children !== 'string'
        ) {
            console.warn(
                '[Button]: Icon-only buttons (size="icon", "icon-sm", "icon-lg") should have an accessible name via `aria-label`, `aria-labelledby`, or `title`.'
            );
        }

        const computedAriaBusy = ariaBusyProp !== undefined ? ariaBusyProp : (isLoading ? true : undefined);
        const computedAriaLive = ariaLiveProp !== undefined ? ariaLiveProp : (isLoading ? 'polite' : undefined);

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isDisabled || props['aria-disabled'] === true || props['aria-disabled'] === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            onClick?.(e);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (
                (isDisabled || props['aria-disabled'] === true || props['aria-disabled'] === 'true') &&
                (e.key === 'Enter' || e.key === ' ')
            ) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            onKeyDown?.(e);
        };

        return (
            <button
                ref={ref}
                type={type}
                title={title}
                aria-label={accessibleLabel}
                aria-busy={computedAriaBusy}
                aria-live={computedAriaLive}
                disabled={isDisabled}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={cn(
                    'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none whitespace-nowrap shrink-0',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
                    'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
                    'focus-visible:ring-2 focus-visible:ring-vape-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base focus-visible:outline-none',
                    radii[radius],
                    variants[variant],
                    sizes[size],
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className={cn(spinnerSizes[size], 'animate-spin shrink-0')} aria-hidden="true" />
                        {isIconButton ? (
                            <span className="sr-only">{loadingText || 'Cargando...'}</span>
                        ) : (
                            <>
                                {loadingText ? loadingText : children}
                                {!loadingText && <span className="sr-only"> (Cargando...)</span>}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {leftIcon && (
                            <span className="shrink-0 flex items-center" aria-hidden="true">
                                {leftIcon}
                            </span>
                        )}
                        {children}
                        {rightIcon && (
                            <span className="shrink-0 flex items-center" aria-hidden="true">
                                {rightIcon}
                            </span>
                        )}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
