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
                <div 
                    className={cn(
                        'mx-auto flex items-center justify-between gap-3 lg:gap-5 transition-all duration-700 relative overflow-visible',
                        scrolled 
                            ? 'h-[64px] max-w-6xl bg-[#0f172a]/80 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] border border-white/20 rounded-full px-4 sm:px-6 ring-1 ring-white/10' 
                            : 'h-16 xl:h-[72px] max-w-7xl bg-transparent border border-transparent rounded-none px-4 sm:px-6 xl:px-8'
                    )}
                >
                    {/* Glowing background effect when scrolled */}
                    {scrolled && (
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-accent-primary/20 via-vape-500/10 to-accent-primary/20 rounded-full blur-sm pointer-events-none opacity-40" />
                    )}

                    <HeaderLogo />

                    <div className="hidden lg:flex items-center justify-center pr-2 lg:pr-4">
                        <DesktopNav />
                    </div>

                    {/* SearchBar — desktop */}
                    <div className="hidden md:flex flex-1 w-full max-w-[280px] lg:max-w-[400px] xl:max-w-[500px] transition-all duration-300 group justify-center mr-auto">
                        <SearchBar 
                            expandable 
                            className="w-full bg-[#1e2538]/80 backdrop-blur-sm border border-white/10 text-white placeholder:text-theme-secondary rounded-full transition-all duration-500 group-focus-within:bg-[#232b3f] group-focus-within:ring-1 group-focus-within:ring-white/30 group-hover:bg-[#232b3f]/90 shadow-inner" 
                        />
                    </div>

                    <HeaderActions
                        menuOpen={menuOpen}
                        onMenuToggle={() => setMenuOpen(!menuOpen)}
                    />
                </div>

                <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
            </header>
        </>
    );
}
