import * as React from 'react';
import { cn } from '@/lib/utils';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type HeadingVariant = 'default' | 'muted' | 'accent' | 'gradient';
export type HeadingTracking = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: HeadingLevel;
    as?: HeadingTag;
    size?: HeadingSize;
    variant?: HeadingVariant;
    tracking?: HeadingTracking;
}

const defaultSizes: Record<HeadingLevel, HeadingSize> = {
    1: '3xl',
    2: '2xl',
    3: 'xl',
    4: 'lg',
    5: 'md',
    6: 'sm',
};

const sizeStyles: Record<HeadingSize, string> = {
    '5xl': 'text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none',
    '4xl': 'text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight',
    '3xl': 'text-2xl sm:text-3xl font-black tracking-tight leading-tight',
    '2xl': 'text-xl sm:text-2xl font-bold tracking-tight leading-snug',
    'xl': 'text-lg sm:text-xl font-semibold tracking-normal leading-snug',
    'lg': 'text-base sm:text-lg font-semibold leading-normal',
    'md': 'text-sm sm:text-base font-semibold leading-normal',
    'sm': 'text-xs sm:text-sm font-semibold uppercase tracking-wider',
    'xs': 'text-2xs sm:text-xs font-bold uppercase tracking-wider',
};

const variantStyles: Record<HeadingVariant, string> = {
    default: 'text-white',
    muted: 'text-theme-secondary',
    accent: 'text-accent-primary',
    gradient: 'bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent',
};

const trackingStyles: Record<HeadingTracking, string> = {
    tighter: 'tracking-tighter',
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    (
        {
            level = 2,
            as,
            size,
            variant = 'default',
            tracking,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const Tag = (as || `h${level}`) as React.ElementType;
        const resolvedSize = size || defaultSizes[level];

        return (
            <Tag
                ref={ref as React.Ref<HTMLElement>}
                className={cn(
                    sizeStyles[resolvedSize],
                    variantStyles[variant],
                    tracking ? trackingStyles[tracking] : undefined,
                    className
                )}
                {...props}
            >
                {children}
            </Tag>
        );
    }
);

Heading.displayName = 'Heading';
