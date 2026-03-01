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
                    'sticky z-50 transition-all duration-500 w-full',
                    scrolled 
                        ? 'top-2 sm:top-4 py-0 px-2 sm:px-4' 
                        : 'top-0 py-2 sm:py-4 px-0'
                )}
            >
                <div 
                    className={cn(
                        'mx-auto flex h-16 xl:h-[72px] items-center justify-between gap-4 transition-all duration-500 relative',
                        scrolled 
                            ? 'max-w-6xl bg-theme-primary/85 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/15 rounded-[2rem] px-4 sm:px-6' 
                            : 'max-w-7xl bg-transparent border border-transparent rounded-none px-4 sm:px-6 xl:px-8'
                    )}
                >
                    {/* Glowing background effect when scrolled */}
                    {scrolled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-vape-500/10 via-transparent to-accent-primary/10 rounded-full pointer-events-none" />
                    )}

                    <HeaderLogo />

                    <div className="hidden lg:flex items-center justify-center flex-1">
                        <DesktopNav />
                    </div>

                    {/* SearchBar — desktop */}
                    <div className="hidden md:block w-full max-w-[200px] lg:max-w-xs ml-auto transition-all duration-300 group">
                        <SearchBar 
                            expandable 
                            className="w-full glass-premium text-theme-primary placeholder:text-theme-tertiary rounded-full transition-all group-focus-within:ring-2 ring-accent-primary/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
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
