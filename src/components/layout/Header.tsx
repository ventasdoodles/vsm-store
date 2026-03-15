/**
 * // ─── COMPONENTE: Header ───
 * // Arquitectura: Shell Orchestrator (Lego Master)
 * // Proposito principal: Navegación principal con transformación dinámica "Full" -> "Pill".
 *    Design: Glassmorphism (80% alpha), Fluid Spring transitions, Neon Glow Aura.
 * // Regla / Notas: Sincronizado con hook useScrolled. Optimizado para CLS (Content Layout Shift).
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useScrolled } from '@/hooks/useScrolled';
import { SearchBar } from '@/components/search/SearchBar';
import { HeaderLogo, DesktopNav, HeaderActions, MobileMenu } from './header/index';
import { TopBanner } from './header/TopBanner';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Search } from 'lucide-react';

export function Header() {
    const scrolled = useScrolled(50);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <TopBanner />
            <motion.header
                initial={false}
                className={cn(
                    'sticky top-0 z-40 w-full transition-all duration-300',
                    !scrolled ? 'py-4 sm:py-6' : 'py-3'
                )}
            >
 
                <div
                    className={cn(
                        'mx-auto relative overflow-visible transition-all duration-500 container-vsm',
                        scrolled
                            ? 'h-[64px] flex items-center justify-between gap-3 bg-[#0f172a]/90 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] border border-white/20 rounded-full ring-1 ring-white/10'
                            : 'h-auto px-0 flex flex-col gap-4 bg-transparent border-transparent'
                    )}
                >

                    {/* ✨ Aura de Neón en modo Pill */}
                    <AnimatePresence>
                        {scrolled && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                exit={{ opacity: 0 }}
                                className="absolute -inset-[1px] bg-gradient-to-r from-accent-primary/20 via-vape-500/10 to-accent-primary/20 rounded-full blur-sm pointer-events-none"
                            />
                        )}
                    </AnimatePresence>
 
                    {/* Línea principal: Logo + Search + Actions */}
                    <div className={cn(
                        "flex items-center justify-between w-full h-full",
                        scrolled ? "gap-2 lg:gap-4" : "gap-4 lg:gap-8"
                    )}>
                        <div className="flex-shrink-0 flex items-center gap-2">
                             <HeaderLogo />
                        </div>


                        {/* Nav compacta (solo iconos) en modo scrolled */}
                        <AnimatePresence>
                            {scrolled && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="hidden xl:flex items-center justify-center flex-shrink-0"
                                >
                                    <DesktopNav compact />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Barra de búsqueda — protagonista en desktop */}
                        <motion.div 
                            layout
                            className={cn(
                                "hidden md:flex transition-all duration-300 group justify-center",
                                scrolled
                                    ? "w-[220px] lg:w-[280px] xl:w-[340px] mx-auto"
                                    : "flex-1 max-w-4xl mx-auto"
                            )}
                        >
                            <ErrorBoundary 
                                componentName="SearchBar"
                                fallback={
                                    <div className={cn(
                                        "w-full rounded-full h-10 px-4 flex items-center gap-3 bg-white/5 border border-white/10",
                                        scrolled ? "max-w-[280px]" : "max-w-4xl"
                                    )}>
                                        <Search className="w-4 h-4 text-white/30" />
                                        <span className="text-sm text-white/20 italic">Buscador temporalmente limitado</span>
                                    </div>
                                }
                            >
                                <SearchBar
                                    className={cn(
                                        "w-full rounded-full transition-all duration-300",
                                        scrolled
                                            ? "bg-[#1e2538]/60 backdrop-blur-md border border-white/20 shadow-none group-focus-within:border-accent-primary/60"
                                            : "bg-[#161d2e] border-2 border-white/10 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_8px_32px_-8px_rgba(0,0,0,0.6)] group-focus-within:border-accent-primary/70 group-focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_32px_-8px_rgba(59,130,246,0.2)] group-hover:border-white/20 group-hover:bg-[#1c2438]"
                                    )}
                                />
                            </ErrorBoundary>
                        </motion.div>

                        <div className="flex-shrink-0">
                            <HeaderActions
                                menuOpen={menuOpen}
                                onMenuToggle={() => setMenuOpen(!menuOpen)}
                            />
                        </div>
                    </div>

                    {/* Línea inferior (se oculta al scroll con fade-out) */}
                    <AnimatePresence>
                        {!scrolled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="hidden lg:flex items-center justify-between w-full pb-2 gap-2 relative"
                            >
                                <div className="flex-1 flex justify-center">
                                    <DesktopNav />
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
            </motion.header>
        </>
    );
}
