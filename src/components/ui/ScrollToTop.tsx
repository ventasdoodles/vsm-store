import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let lastRun = 0;
        const toggleVisibility = () => {
            const now = Date.now();
            if (now - lastRun < 150) return; // Throttle 150ms

            lastRun = now;
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                'fixed bottom-36 right-4 z-40 rounded-full bg-theme-secondary p-3 text-theme-primary shadow-xl transition-all hover:bg-theme-secondary hover:-translate-y-1 active:scale-95 border border-theme lg:bottom-20 lg:right-6',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            )}
            aria-label="Volver arriba"
        >
            <ArrowUp className="h-5 w-5" />
        </button>
    );
}
