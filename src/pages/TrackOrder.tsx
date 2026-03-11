import { useState } from 'react';
import { Truck, Search, Package, MapPin, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTrackingInfo } from '@/services/tracking.service';
import type { TrackingInfo, TrackingEvent } from '@/types/order';

export function TrackOrder() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        setIsLoading(true);
        setError(null);
        setTrackingData(null);

        try {
            // Llamada al servicio de rastreo (actualmente simulado)
            const data = await getTrackingInfo(trackingNumber.trim());
            setTrackingData(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error al buscar el envío.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-vsm py-12 md:py-20 min-h-[70vh] flex flex-col items-center">
            <div className="w-full max-w-2xl mx-auto space-y-8">
                {/* Cabecera */}
                <div className="text-center space-y-4">
                    <div className="mx-auto w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                        <Truck className="h-10 w-10 text-yellow-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-theme-primary">
                        Rastrea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Pedido</span>
                    </h1>
                    <p className="text-theme-secondary text-sm md:text-base max-w-md mx-auto">
                        Ingresa tu número de guía para conocer el estado actual de tu envío en tiempo real.
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleTrack} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Package className="h-5 w-5 text-theme-tertiary group-focus-within:text-yellow-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Ej. 1234567890"
                            className="w-full pl-12 pr-4 py-4 bg-theme-secondary/5 border border-theme rounded-2xl text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all text-lg font-mono tracking-wider shadow-inner"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!trackingNumber.trim() || isLoading}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all duration-300",
                            trackingNumber.trim() && !isLoading
                                ? "bg-yellow-500 text-theme-primary hover:bg-yellow-400 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                                : "bg-theme-secondary/10 text-theme-tertiary cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5" />
                        )}
                        {isLoading ? 'Buscando...' : 'Rastrear Envío'}
                    </button>
                </form>

                {/* Mensaje de Error */}
                {error && (
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-bottom-4">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Resultados del Rastreo */}
                {trackingData && (
                    <div className="rounded-3xl border border-theme bg-theme-secondary/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Resumen del Envío */}
                        <div className="p-6 md:p-8 border-b border-theme bg-gradient-to-br from-theme-secondary/5 to-transparent">
                            {/* Banner modo demo */}
                            {trackingData.statusText.includes('Demo') && (
                                <div className="mb-4 flex items-start gap-2 rounded-xl bg-accent-primary/10 border border-blue-500/20 p-3 text-xs text-blue-400">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Modo demostración:</strong> Configura tu API Key de DHL para activar el rastreo real. Lee las instrucciones en <code className="bg-accent-primary/20 px-1 rounded">docs/MANUAL_RASTREO_DHL.md</code>
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-theme-tertiary font-medium uppercase tracking-wider mb-1">
                                        {trackingData.carrier}
                                    </p>
                                    <h2 className="text-2xl font-mono font-bold text-theme-primary">
                                        {trackingData.trackingNumber}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2",
                                        trackingData.status === 'delivered' ? "bg-green-500/20 text-green-400" :
                                        trackingData.status === 'in_transit' ? "bg-yellow-500/20 text-yellow-400" :
                                        trackingData.status === 'exception' ? "bg-red-500/20 text-red-400" :
                                        "bg-accent-primary/20 text-blue-400"
                                    )}>
                                        {trackingData.status === 'delivered' && <CheckCircle className="h-4 w-4" />}
                                        {trackingData.status === 'in_transit' && <Truck className="h-4 w-4" />}
                                        {trackingData.status === 'exception' && <AlertCircle className="h-4 w-4" />}
                                        {trackingData.status === 'pending' && <Clock className="h-4 w-4" />}
                                        {trackingData.statusText}
                                    </div>
                                </div>
                            </div>

                            {trackingData.estimatedDelivery && trackingData.status !== 'delivered' && (
                                <div className="mt-6 p-4 rounded-2xl bg-theme-secondary/10 border border-theme-subtle flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-theme-secondary/20 text-theme-primary">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-theme-tertiary">Entrega Estimada</p>
                                        <p className="text-sm font-medium text-theme-primary">
                                            {new Date(trackingData.estimatedDelivery).toLocaleDateString('es-MX', {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Línea de Tiempo (Timeline) */}
                        <div className="p-6 md:p-8">
                            <h3 className="text-lg font-bold text-theme-primary mb-6">Historial del Envío</h3>
                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/20 before:via-white/10 before:to-transparent">
                                {trackingData.events.map((event: TrackingEvent, index: number) => {
                                    const isFirst = index === 0;
                                    const eventDate = new Date(event.date);
                                    
                                    return (
                                        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icono central */}
                                            <div className={cn(
                                                "flex items-center justify-center w-10 h-10 rounded-full border-4 border-theme-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors",
                                                isFirst ? "bg-yellow-500 text-theme-primary border-yellow-500/20" : "bg-theme-secondary text-theme-tertiary"
                                            )}>
                                                {isFirst ? <Truck className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                            </div>
                                            
                                            {/* Tarjeta de evento */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-theme-secondary/5 border border-theme-subtle group-hover:border-theme transition-colors">
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "font-bold text-sm md:text-base",
                                                        isFirst ? "text-theme-primary" : "text-theme-secondary"
                                                    )}>
                                                        {event.status}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs text-theme-tertiary mt-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-theme-tertiary">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {eventDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} • {eventDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Info adicional */}
                <div className="pt-8 border-t border-theme text-xs text-theme-tertiary text-center space-y-2">
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
