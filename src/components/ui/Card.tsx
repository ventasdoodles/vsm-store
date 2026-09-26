import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { m, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    interactive?: boolean;
    spotlight?: boolean;
    premium?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, interactive = false, spotlight = false, premium = true, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative overflow-hidden flex flex-col border',
                    premium ? 'glass-premium rounded-4xl border-white/5' : 'bg-surface-base rounded-2xl border-white/10',
                    interactive && 'hover-lift',
                    spotlight && 'spotlight-container',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';

export interface MotionCardProps extends HTMLMotionProps<"div"> {
    interactive?: boolean;
    spotlight?: boolean;
    premium?: boolean;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
    ({ className, children, interactive = false, spotlight = false, premium = true, ...props }, ref) => {
        return (
            <m.div
                ref={ref}
                className={cn(
                    'relative overflow-hidden flex flex-col border',
                    premium ? 'glass-premium rounded-4xl border-white/5' : 'bg-surface-base rounded-2xl border-white/10',
                    interactive && 'hover-lift',
                    spotlight && 'spotlight-container',
                    className
                )}
                {...props}
            >
                {children}
            </m.div>
        );
    }
);
MotionCard.displayName = 'MotionCard';
