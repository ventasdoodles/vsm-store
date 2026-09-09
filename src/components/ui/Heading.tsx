import * as React from 'react';
import { cn } from '@/lib/utils';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingTag =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'p'
    | 'span'
    | 'div'
    | 'label'
    | 'legend'
    | 'a';
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type HeadingVariant = 'default' | 'muted' | 'accent' | 'gradient';
export type HeadingTracking = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider';

export interface HeadingBaseProps {
    level?: HeadingLevel;
    size?: HeadingSize;
    variant?: HeadingVariant;
    tracking?: HeadingTracking;
}

type AsProp<C extends React.ElementType> = {
    as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

export type PolymorphicComponentProps<
    C extends React.ElementType,
    Props = Record<string, unknown>
> = React.PropsWithChildren<Props & AsProp<C>> &
    Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export type PolymorphicRef<C extends React.ElementType> =
    React.ComponentPropsWithRef<C>['ref'];

export type PolymorphicComponentPropsWithRef<
    C extends React.ElementType,
    Props = Record<string, unknown>
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };

export type HeadingProps<C extends React.ElementType = React.ElementType> =
    PolymorphicComponentPropsWithRef<C, HeadingBaseProps>;

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

interface HeadingComponent {
    <C extends React.ElementType = 'h2'>(
        props: HeadingProps<C>
    ): React.ReactElement | null;
    displayName?: string;
}

const HeadingInner = (
    {
        level = 2,
        as,
        size,
        variant = 'default',
        tracking,
        className,
        children,
        ...props
    }: HeadingBaseProps & {
        as?: React.ElementType;
        className?: string;
        children?: React.ReactNode;
        [key: string]: unknown;
    },
    ref: React.Ref<HTMLElement>
) => {
    const Tag = as || `h${level}`;
    const resolvedSize = size || defaultSizes[level];

    return (
        <Tag
            ref={ref}
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
};

export const Heading: HeadingComponent = React.forwardRef(HeadingInner) as unknown as HeadingComponent;

Heading.displayName = 'Heading';
