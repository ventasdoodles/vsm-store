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
            primary: 'bg-white text-black hover:bg-gray-100 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.3)] btn-shine font-bold',
            secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm',
            outline: 'bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/40',
            ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
            danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40',
            vape: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:to-blue-600 shadow-blue-500/20 shadow-lg border border-blue-400/20 btn-shine',
            herbal: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:to-emerald-600 shadow-emerald-500/20 shadow-lg border border-emerald-400/20 btn-shine',
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
