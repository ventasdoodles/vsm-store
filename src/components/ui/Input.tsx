import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    inputSize?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'surface' | 'ghost';
    containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            containerClassName,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            inputSize = 'md',
            variant = 'default',
            id,
            disabled,
            'aria-describedby': ariaDescribedByProp,
            'aria-invalid': ariaInvalidProp,
            ...props
        },
        ref
    ) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;

        const hasError = Boolean(error && error.trim().length > 0);
        const hasHelperText = Boolean(!hasError && helperText && helperText.trim().length > 0);

        const customDescribedBy = ariaDescribedByProp?.trim();
        const internalDescribedBy = hasError ? errorId : hasHelperText ? helperId : undefined;
        const combinedDescribedBy = [customDescribedBy, internalDescribedBy]
            .filter(Boolean)
            .join(' ')
            .trim() || undefined;

        const computedAriaInvalid = hasError ? true : ariaInvalidProp;

        const sizeStyles = {
            sm: 'h-8 px-2.5 text-xs rounded-lg',
            md: 'h-10 px-3.5 text-sm rounded-xl',
            lg: 'h-12 px-4 text-base rounded-xl',
        };

        const leftPadding = {
            sm: leftIcon ? 'pl-8' : '',
            md: leftIcon ? 'pl-10' : '',
            lg: leftIcon ? 'pl-11' : '',
        };

        const rightPadding = {
            sm: rightIcon ? 'pr-8' : '',
            md: rightIcon ? 'pr-10' : '',
            lg: rightIcon ? 'pr-11' : '',
        };

        const variantStyles = {
            default: 'bg-white/5 border-surface text-white placeholder:text-white/30 backdrop-blur-sm focus:border-vape-500/50 focus:ring-vape-500/20',
            surface: 'bg-surface-card border-surface text-white placeholder:text-white/30 focus:border-vape-500/50 focus:ring-vape-500/20',
            ghost: 'bg-transparent border-transparent hover:bg-white/5 text-white placeholder:text-white/30 focus:bg-white/5 focus:border-surface focus:ring-white/10',
        };

        return (
            <div className={cn('w-full min-w-0', containerClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-1.5 block text-xs font-medium text-theme-secondary cursor-pointer"
                    >
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center justify-center text-white/40 [&_button]:pointer-events-auto [&_a]:pointer-events-auto [&_[role=button]]:pointer-events-auto [&_.pointer-events-auto]:pointer-events-auto [&_[data-interactive]]:pointer-events-auto">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        disabled={disabled}
                        aria-invalid={computedAriaInvalid}
                        aria-describedby={combinedDescribedBy}
                        className={cn(
                            'w-full min-w-0 border font-normal transition-all duration-150 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
                            sizeStyles[inputSize],
                            leftPadding[inputSize],
                            rightPadding[inputSize],
                            variantStyles[variant],
                            hasError && 'border-red-500/60 text-red-100 placeholder:text-red-300/30 focus:border-red-500 focus:ring-red-500/20',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="pointer-events-none absolute inset-y-0 right-3 z-10 flex items-center justify-center text-white/40 [&_button]:pointer-events-auto [&_a]:pointer-events-auto [&_[role=button]]:pointer-events-auto [&_.pointer-events-auto]:pointer-events-auto [&_[data-interactive]]:pointer-events-auto">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {hasError ? (
                    <p id={errorId} role="alert" className="mt-1 text-2xs font-medium text-red-400">
                        {error}
                    </p>
                ) : hasHelperText ? (
                    <p id={helperId} className="mt-1 text-2xs text-white/40">
                        {helperText}
                    </p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';
