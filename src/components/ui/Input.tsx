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
            ...props
        },
        ref
    ) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;

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
            <div className={cn('w-full', containerClassName)}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-1.5 block text-xs font-medium text-theme-secondary"
                    >
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="pointer-events-none absolute left-3 flex items-center justify-center text-white/40">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        disabled={disabled}
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                            error ? errorId : helperText ? helperId : undefined
                        }
                        className={cn(
                            'w-full border font-normal transition-all duration-150 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
                            sizeStyles[inputSize],
                            leftPadding[inputSize],
                            rightPadding[inputSize],
                            variantStyles[variant],
                            error && 'border-red-500/60 text-red-100 placeholder:text-red-300/30 focus:border-red-500 focus:ring-red-500/20',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="pointer-events-none absolute right-3 flex items-center justify-center text-white/40">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error ? (
                    <p id={errorId} role="alert" className="mt-1 text-2xs font-medium text-red-400">
                        {error}
                    </p>
                ) : helperText ? (
                    <p id={helperId} className="mt-1 text-2xs text-white/40">
                        {helperText}
                    </p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';
