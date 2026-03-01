// CategoryDropdown — Dropdown de categorías para una sección
// Componente independiente: obtiene sus propias categorías via useCategories
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import type { Section } from '@/types/product';

interface CategoryDropdownProps {
    section: Section;
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    hoverBg: string;
}

export function CategoryDropdown({ section, label, icon, colorClass, hoverBg }: CategoryDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const timeout = useRef<ReturnType<typeof setTimeout>>();

    const { data: categories = [] } = useCategories(section);

    // Solo categorías raíz
    const rootCategories = categories.filter((c) => c.parent_id === null);

    const handleEnter = () => {
        clearTimeout(timeout.current);
        setOpen(true);
    };
    const handleLeave = () => {
        timeout.current = setTimeout(() => setOpen(false), 150);
    };

    // Cerrar con click fuera
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div
            ref={ref}
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <button
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    'flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium tracking-wide text-white/70 transition-all duration-300',
                    'hover:bg-white/10 hover:text-white',
                    colorClass
                )}
            >
                {icon}
                {label}
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')} />
            </button>

            {/* Dropdown */}
            {open && rootCategories.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl vsm-border-strong bg-theme-primary/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-scale-in">
                    {/* Link a la sección */}
                    <Link
                        to={`/${section}`}
                        onClick={() => setOpen(false)}
                        className={cn(
                            'block px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-theme-secondary transition-colors',
                            hoverBg
                        )}
                    >
                        Ver todo {label}
                    </Link>
                    <hr className="border-theme" />
                    {rootCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/${section}/${cat.slug}`}
                            onClick={() => setOpen(false)}
                            className={cn(
                                'block px-4 py-2.5 text-sm text-theme-secondary transition-colors',
                                hoverBg
                            )}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
