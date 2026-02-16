import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'vape' | 'herbal';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const variants = {
            primary: 'bg-primary-100 text-primary-950 hover:bg-white border border-transparent shadow-sm',
            secondary: 'bg-primary-800 text-primary-100 hover:bg-primary-700 border border-transparent',
            outline: 'bg-transparent border border-primary-700 text-primary-200 hover:bg-primary-800/50 hover:border-primary-600',
            ghost: 'bg-transparent text-primary-300 hover:text-primary-100 hover:bg-primary-800/50',
            danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent',
            vape: 'bg-vape-600 text-white hover:bg-vape-500 shadow-vape-500/20 shadow-lg',
            herbal: 'bg-herbal-600 text-white hover:bg-herbal-500 shadow-herbal-500/20 shadow-lg',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 text-sm',
            lg: 'h-12 px-6 text-base',
            icon: 'h-9 w-9 p-0 flex items-center justify-center',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-95 focus-visible:ring-2 focus-visible:ring-vape-500/30 focus-visible:outline-none',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
