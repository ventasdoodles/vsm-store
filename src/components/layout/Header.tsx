// Header — VSM Store
// Composición pura de sub-componentes independientes
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useScrolled } from '@/hooks/useScrolled';
import { SearchBar } from '@/components/search/SearchBar';
import { HeaderLogo, DesktopNav, HeaderActions, MobileMenu } from './header/index';

export function Header() {
    const scrolled = useScrolled();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header
            className={cn(
                'sticky top-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                scrolled
                    ? 'glass-premium shadow-2xl shadow-black/40 py-2'
                    : 'bg-transparent py-4'
            )}
        >
            {/* Subtle bottom gradient line when scrolled */}
            <div className={cn(
                "absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-500",
                scrolled ? "opacity-100" : "opacity-0"
            )} />

            <div className="container-vsm flex h-14 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 relative">
                {/* Skip to main content (accessibility) */}
                <a href="#main-content" className="skip-to-main">
                    Saltar al contenido principal
                </a>

                <HeaderLogo />

                <DesktopNav />

                {/* SearchBar — desktop */}
                <div className="hidden sm:block flex-1 max-w-md mx-6">
                    <SearchBar expandable className="w-full glass-premium text-theme-primary placeholder:text-theme-tertiary rounded-2xl transition-all" />
                </div>

                <HeaderActions
                    menuOpen={menuOpen}
                    onMenuToggle={() => setMenuOpen(!menuOpen)}
                />
            </div>

            <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </header>
    );
}
