import { useState, useEffect, useRef, type ReactNode } from 'react';

interface DeferredSectionProps {
    children: ReactNode;
    /** Placeholder height while waiting for viewport entry */
    minHeight?: string;
    /** IntersectionObserver rootMargin — loads N px before visible */
    rootMargin?: string;
    /** Optional CSS class for the wrapper */
    className?: string;
}

/**
 * DeferredSection — Delays rendering of children until the element enters the viewport.
 *
 * Used for below-the-fold sections on the Home page to reduce Time-to-Interactive (TTI).
 * Once the section enters the viewport (or gets close, via rootMargin), it renders
 * the children and never goes back to the placeholder.
 *
 * @module DeferredSection
 * @independent No external dependencies beyond React.
 */
export function DeferredSection({
    children,
    minHeight = '200px',
    rootMargin = '200px',
    className,
}: DeferredSectionProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || isVisible) return;

        // IntersectionObserver primary trigger
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin },
        );

        observer.observe(el);

        // Safety fallback: if IntersectionObserver never fires (e.g. inside
        // framer-motion Reorder.Group where placeholder minHeight is 0 during
        // layout measurement), render the content after a short delay anyway.
        const fallback = setTimeout(() => setIsVisible(true), 800);

        return () => {
            observer.disconnect();
            clearTimeout(fallback);
        };
    }, [isVisible, rootMargin]);

    if (!isVisible) {
        return <div ref={ref} style={{ minHeight }} className={className} />;
    }

    return <div ref={ref} className={className}>{children}</div>;
}
