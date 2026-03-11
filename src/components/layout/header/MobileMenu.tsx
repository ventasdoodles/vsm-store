// MobileMenu — Menú móvil del header
// Independiente: obtiene sus propias categorías y lee auth internamente
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Flame, Leaf, LogOut, LogIn, Truck, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar } from '@/components/search/SearchBar';
import { motion } from 'framer-motion';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { isAuthenticated, signOut } = useAuth();
    const { data: vapeCategories = [] } = useCategories('vape');
    const { data: herbalCategories = [] } = useCategories('420');
    const menuRef = useRef<HTMLDivElement>(null);

    const vapeRoots = vapeCategories.filter((c) => c.parent_id === null);
    const herbalRoots = herbalCategories.filter((c) => c.parent_id === null);

    // Body scroll lock & Escape to close (Focus Trap)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            // Focus Trap implementation
            const handleFocusTrap = (e: KeyboardEvent) => {
                if (e.key === 'Tab' && menuRef.current) {
                    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    if (focusable.length === 0) return;
                    const first = focusable[0]!;
                    const last = focusable[focusable.length - 1]!;
                    
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
                handleFocusTrap(e);
            };

            window.addEventListener('keydown', handleKeyDown);
            
            // Auto-focus first element
            const timer = setTimeout(() => {
                menuRef.current?.querySelector<HTMLElement>('button, [href]')?.focus();
            }, 100);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                clearTimeout(timer);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen, onClose]);

    return (
        <div
            ref={menuRef}
            className={cn(
                'overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden glass-premium',
                isOpen ? 'max-h-[800px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
            )}
        >
            <nav className="p-4 space-y-2">
                {/* SearchBar en móvil */}
                <div className="sm:hidden pb-4">
                    <SearchBar />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <Link
                        to="/#mas-vendidos"
                        onClick={(e) => {
                            if (window.location.pathname === '/') {
                                e.preventDefault();
                                const section = document.getElementById('mas-vendidos');
                                if (section) section.scrollIntoView({ behavior: 'smooth' });
                            }
                            onClose();
                        }}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-theme-secondary/5 p-4 text-sm font-medium text-theme-primary hover:bg-theme-secondary/10 transition-all active:scale-95"
                    >
                        <TrendingUp className="h-6 w-6 text-red-500" />
                        Popular
                    </Link>
                    <Link
                        to="/rastreo"
                        onClick={onClose}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-theme-secondary/5 p-4 text-sm font-medium text-theme-primary hover:bg-theme-secondary/10 transition-all active:scale-95"
                    >
                        <Truck className="h-6 w-6 text-yellow-500" />
                        Rastrear
                    </Link>
                    <Link
                        to="/profile"
                        onClick={onClose}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-theme-secondary/5 p-4 text-sm font-medium text-theme-primary hover:bg-theme-secondary/10 transition-all active:scale-95"
                    >
                        <User className="h-6 w-6 text-accent-primary" />
                        Perfil
                    </Link>
                </div>

                {/* Vape con categorías */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="group relative rounded-2xl bg-white/[0.03] p-5 border border-white/5 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-vape-500/10 blur-[40px] rounded-full -z-10 transition-opacity group-hover:opacity-100 opacity-50" />
                    
                    <Link
                        to="/vape"
                        onClick={onClose}
                        className="flex items-center justify-between text-lg font-black text-white mb-4 group/title"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-vape-500/20 text-vape-400 border border-vape-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                <Flame className="h-5 w-5" />
                            </div>
                            <span className="tracking-tight">Vape Collection</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-white/20 group-hover/title:translate-x-1 transition-transform" />
                    </Link>

                    {vapeRoots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2.5">
                            {vapeRoots.map((cat, idx) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + idx * 0.05 }}
                                >
                                    <Link
                                        to={`/vape/${cat.slug}`}
                                        onClick={onClose}
                                        className="flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-white/60 hover:bg-vape-500/20 hover:text-vape-400 hover:border-vape-500/30 transition-all text-center"
                                    >
                                        {cat.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* 420 con categorías */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group relative rounded-2xl bg-white/[0.03] p-5 border border-white/5 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full -z-10 transition-opacity group-hover:opacity-100 opacity-50" />

                    <Link
                        to="/420"
                        onClick={onClose}
                        className="flex items-center justify-between text-lg font-black text-white mb-4 group/title"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Leaf className="h-5 w-5" />
                            </div>
                            <span className="tracking-tight">420 Zone</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-white/20 group-hover/title:translate-x-1 transition-transform" />
                    </Link>

                    {herbalRoots.length > 0 && (
                        <div className="grid grid-cols-2 gap-2.5">
                            {herbalRoots.map((cat, idx) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + idx * 0.05 }}
                                >
                                    <Link
                                        to={`/420/${cat.slug}`}
                                        onClick={onClose}
                                        className="flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-white/60 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-center"
                                    >
                                        {cat.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Auth: móvil */}
                <div className="pt-2">
                    {isAuthenticated ? (
                        <button
                            onClick={() => { signOut(); onClose(); }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
                        >
                            <LogOut className="h-5 w-5" />
                            Cerrar sesión
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
                        >
                            <LogIn className="h-5 w-5" />
                            Iniciar sesión
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
}
