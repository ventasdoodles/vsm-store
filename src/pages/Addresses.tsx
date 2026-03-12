/**
 * // ─── PÁGINA: ADDRESSES ───
 * // Propósito: Gestión de direcciones de envío y facturación del usuario.
 * // Arquitectura: Orquestación de sub-módulos de geolocalización y persistencia.
 * // Estilo: High-End Premium Aesthetics (§2.1).
 */
import { useEffect } from 'react';
import { MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AddressList } from '@/components/addresses/AddressList';

export function Addresses() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Mis Direcciones | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    if (!user) return null;

    return (
        <div className="container-vsm py-8 space-y-8">
            {/* Header Cinemático */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-theme-secondary hover:bg-white/10 hover:text-white transition-all shadow-xl"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-accent-primary animate-pulse-slow" />
                             <h1 className="text-xl font-black text-white uppercase tracking-tight">Mis Direcciones</h1>
                        </div>
                        <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest opacity-60">Gestiona tus puntos de entrega</p>
                    </div>
                </div>
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    <MapPin className="h-6 w-6 text-accent-primary" />
                </div>
            </div>

            {/* Layout de Direcciones */}
            <div className="grid gap-8">
                <div className="space-y-4">
                    <h2 className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] opacity-40 px-1">
                        Libreta de direcciones
                    </h2>
                    <AddressList customerId={user.id} />
                </div>
            </div>
        </div>
    );
}
