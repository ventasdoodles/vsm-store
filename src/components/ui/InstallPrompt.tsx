import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Mostrar prompt solo si no ha sido descartado recientemente
            const dismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!dismissed || Date.now() - Number(dismissed) > 1000 * 60 * 60 * 24 * 7) { // 7 days
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-5 duration-500 sm:bottom-6 sm:right-6 sm:left-auto">
            <div className="flex items-center gap-4 rounded-xl border border-vape-500/30 bg-primary-900/95 p-4 shadow-2xl backdrop-blur-md">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-vape-500/20">
                    <Download className="h-5 w-5 text-vape-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">Instalar App</h3>
                    <p className="text-xs text-primary-400">Acceso más rápido y sin conexión.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleInstall}
                        className="rounded-lg bg-vape-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-vape-500/20 hover:bg-vape-600 transition-colors"
                    >
                        Instalar
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-800 hover:text-primary-300 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
