import { useState } from 'react';
import { Truck, Search, ExternalLink, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrackOrder() {
    const [trackingNumber, setTrackingNumber] = useState('');

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        // DHL Tracking URL format
        const dhlUrl = `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${encodeURIComponent(trackingNumber.trim())}`;
        window.open(dhlUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="container-vsm py-12 md:py-20 min-h-[70vh] flex flex-col items-center justify-center">
            <div className="w-full max-w-md mx-auto text-center space-y-6">
                {/* Icono y Título */}
                <div className="space-y-4">
                    <div className="mx-auto w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                        <Truck className="h-10 w-10 text-yellow-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-theme-primary">
                        Rastrea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Pedido</span>
                    </h1>
                    <p className="text-theme-secondary text-sm md:text-base max-w-sm mx-auto">
                        Ingresa tu número de guía de DHL para conocer el estado actual de tu envío.
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleTrack} className="space-y-4 mt-8">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Package className="h-5 w-5 text-theme-tertiary group-focus-within:text-yellow-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Ej. 1234567890"
                            className="w-full pl-12 pr-4 py-4 bg-theme-secondary/5 border border-theme/10 rounded-2xl text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all text-lg font-mono tracking-wider shadow-inner"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!trackingNumber.trim()}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all duration-300",
                            trackingNumber.trim()
                                ? "bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                                : "bg-theme-secondary/10 text-theme-tertiary cursor-not-allowed"
                        )}
                    >
                        <Search className="h-5 w-5" />
                        Rastrear en DHL
                        <ExternalLink className="h-4 w-4 ml-1 opacity-70" />
                    </button>
                </form>

                {/* Info adicional */}
                <div className="pt-8 border-t border-theme/10 text-xs text-theme-tertiary space-y-2">
                    <p>
                        Todos nuestros envíos se realizan a través de <strong>DHL Express</strong>.
                    </p>
                    <p>
                        Si no tienes tu número de guía, revisa los detalles de tu pedido en tu <a href="/profile" className="text-yellow-500 hover:underline">perfil</a> o contáctanos.
                    </p>
                </div>
            </div>
        </div>
    );
}
