/**
 * Header — Shell principal del header de VSM Store.
 * Composición pura de sub-componentes independientes.
 * 2 líneas (expanded) → 1 línea pill flotante (scrolled).
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrolled } from '@/hooks/useScrolled';
import { SearchBar } from '@/components/search/SearchBar';
import { HeaderLogo, DesktopNav, HeaderActions, MobileMenu } from './header/index';
import { TopBanner } from './header/TopBanner';
import { DeliveryLocation } from './header/DeliveryLocation';

export function Header() {
    const scrolled = useScrolled();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <TopBanner />
            <header
                className={cn(
                    'sticky z-40 transition-all duration-700 w-full',
                    scrolled
                        ? 'top-4 sm:top-6 py-0 px-4 sm:px-8'
                        : 'top-0 py-2 sm:py-4 px-0 absolute'
                )}
            >
                {/* Contenedor principal: flex-col (2 líneas) en default, flex-row (pill) al scroll */}
                <div
                    className={cn(
                        'mx-auto transition-all duration-700 relative overflow-visible w-full',
                        scrolled
                            ? 'flex items-center justify-between gap-3 lg:gap-5 h-16 max-w-6xl bg-[#0f172a]/80 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] border border-white/20 rounded-full px-4 sm:px-6 ring-1 ring-white/10'
                            : 'flex flex-col gap-4 max-w-7xl bg-transparent border border-transparent rounded-none px-4 sm:px-6 xl:px-8'
                    )}
                >
                    {/* Efecto glow de fondo en modo scrolled */}
                    {scrolled && (
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-accent-primary/20 via-vape-500/10 to-accent-primary/20 rounded-full blur-sm pointer-events-none opacity-40" />
                    )}

                    {/* Línea superior: Logo + Barra de búsqueda + Acciones */}
                    <div className={cn(
                        "flex items-center justify-between w-full h-full",
                        scrolled ? "gap-2 lg:gap-4" : "gap-4 lg:gap-8"
                    )}>
                        <div className="flex-shrink-0">
                            <HeaderLogo />
                        </div>

                        {/* Nav compacta (solo iconos) en modo scrolled */}
                        {scrolled && (
                            <div className="hidden xl:flex items-center justify-center flex-shrink-0">
                                <DesktopNav compact />
                            </div>
                        )}

                        {/* Barra de búsqueda — protagonista en desktop */}
                        <div className={cn(
                            "hidden md:flex transition-all duration-300 group justify-center",
                            scrolled
                                ? "w-[240px] lg:w-[320px] xl:w-[380px] mx-auto"
                                : "flex-1 w-full mx-auto"
                        )}>
                            <SearchBar
                                className={cn(
                                    "w-full rounded-full transition-all duration-300",
                                    scrolled
                                        ? "bg-[#1e2538]/60 backdrop-blur-md border border-white/20 shadow-none group-focus-within:border-accent-primary/60"
                                        : "bg-[#161d2e] border-2 border-white/10 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_8px_32px_-8px_rgba(0,0,0,0.6)] group-focus-within:border-accent-primary/70 group-focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.15),0_8px_32px_-8px_rgba(59,130,246,0.2)] group-hover:border-white/20 group-hover:bg-[#1c2438]"
                                )}
                            />
                        </div>

                        {/* Acciones — siempre en la línea superior */}
                        <div className="flex-shrink-0">
                            <HeaderActions
                                menuOpen={menuOpen}
                                onMenuToggle={() => setMenuOpen(!menuOpen)}
                            />
                        </div>
                    </div>

                    {/* Línea inferior: Ubicación de envío + Navegación (se oculta al scroll) */}
                    {!scrolled && (
                        <div className="hidden lg:flex items-center justify-between w-full pb-2 gap-2">
                            <div className="flex-shrink-0">
                                <DeliveryLocation />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <DesktopNav />
                            </div>
                        </div>
                    )}
                </div>

                <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
            </header>
        </>
    );
}
