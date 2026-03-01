// Header — VSM Store
// Composición pura de sub-componentes independientes
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrolled } from '@/hooks/useScrolled';
import { SearchBar } from '@/components/search/SearchBar';
import { HeaderLogo, DesktopNav, HeaderActions, MobileMenu } from './header/index';
import { TopBanner } from './header/TopBanner';

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
                {/* 
                  * Contenedor principal: Cambia de flex-row a flex-col dependiendo de si 
                  * estamos en la vista default (2 líneas) o scrolled (1 línea compacta flotante).
                  */}
                <div 
                    className={cn(
                        'mx-auto transition-all duration-700 relative overflow-visible w-full',
                        scrolled 
                            ? 'flex items-center justify-between gap-3 lg:gap-5 h-[64px] max-w-6xl bg-[#0f172a]/80 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] border border-white/20 rounded-full px-4 sm:px-6 ring-1 ring-white/10' 
                            : 'flex flex-col gap-4 max-w-7xl bg-transparent border border-transparent rounded-none px-4 sm:px-6 xl:px-8'
                    )}
                >
                    {/* Glowing background effect when scrolled */}
                    {scrolled && (
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-accent-primary/20 via-vape-500/10 to-accent-primary/20 rounded-full blur-sm pointer-events-none opacity-40" />
                    )}

                    {/* TOP LINE: Logo + Gran Barra Búsqueda + Acciones */}
                    <div className={cn(
                        "flex items-center justify-between w-full h-full",
                        scrolled ? "gap-2 lg:gap-4" : "gap-4 lg:gap-8"
                    )}>
                        <div className="flex-shrink-0">
                            <HeaderLogo />
                        </div>

                        {/* Navigation en modo scrolled (comprimido en 1 sola línea) */}
                        {scrolled && (
                            <div className="hidden xl:flex items-center justify-center flex-shrink-0">
                                <DesktopNav compact={true} />
                            </div>
                        )}

                        {/* SearchBar — desktop protagonista (en state NO-scrolled ocupa gran espacio central) */}
                        <div className={cn(
                            "hidden md:flex transition-all duration-300 group justify-center",
                            scrolled 
                                ? "w-[280px] lg:w-[350px] xl:w-[400px] mx-auto" // Control estricto del ancho en scrolled
                                : "flex-1 max-w-[600px] w-full mx-auto" // Máximo impacto centrado en 2-lines
                        )}>
                            <SearchBar 
                                expandable 
                                className="w-full bg-[#1e2538]/60 backdrop-blur-md border border-white/20 text-white placeholder:text-white/60 rounded-full transition-all duration-300 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] group-focus-within:bg-[#232b3f]/90 group-focus-within:shadow-[0_0_25px_rgba(59,130,246,0.3)] group-focus-within:border-accent-primary/60 group-hover:bg-[#232b3f]/80 group-hover:border-white/30" 
                            />
                        </div>

                        <div className="flex-shrink-0">
                            <HeaderActions
                                menuOpen={menuOpen}
                                onMenuToggle={() => setMenuOpen(!menuOpen)}
                            />
                        </div>
                    </div>

                    {/* BOTTOM LINE: Navegación del Desktop (Se oculta al hacer scroll, o bien puede quedarse flotando) */}
                    {!scrolled && (
                        <div className="hidden lg:flex items-center justify-center w-full pb-2">
                            <DesktopNav />
                        </div>
                    )}
                </div>

                <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
            </header>
        </>
    );
}
