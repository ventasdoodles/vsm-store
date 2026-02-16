// Layout wrapper - VSM Store
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { InstallPrompt } from '@/components/ui/InstallPrompt';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex min-h-screen flex-col relative">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />

            {/* Quick Wins UI */}
            <ScrollToTop />
            <InstallPrompt />
        </div>
    );
}
