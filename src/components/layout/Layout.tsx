// Layout wrapper - VSM Store
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { MobileSearchOverlay } from '@/components/search/MobileSearchOverlay';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex min-h-screen flex-col relative pb-20 md:pb-0">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />

            {/* Quick Wins UI */}
            <ScrollToTop />
            <InstallPrompt />

            {/* Mobile App Experience */}
            <BottomNavigation />
            <MobileSearchOverlay />
        </div>
    );
}
