/**
 * CustomerAddress — Dirección Principal del Cliente
 * 
 * Muestra la dirección de entrega predeterminada del cliente
 * con calle, colonia, ciudad, estado y referencias.
 * Indica cuántas direcciones alternativas tiene registradas.
 * 
 * @module admin/customers/details
 */
import { MapPin, Navigation, Map } from 'lucide-react';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerAddress({ customer }: Props) {
    if (!customer?.addresses || customer.addresses.length === 0) return (
        <div className="rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[150px]">
            <Map className="w-8 h-8 text-theme-secondary/30 mb-2" />
            <p className="text-sm font-medium text-white mb-1">Sin direcciones</p>
            <p className="text-xs text-theme-secondary">El usuario no ha registrado un domicilio de entrega.</p>
        </div>
    );

    const mainAddress = customer.addresses[0];
    if (!mainAddress) return null;

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl p-6 shadow-2xl group transition-all hover:border-white/10">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <div className="relative flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-500/20 shadow-inner">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Dirección Principal</h3>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Predeterminada</p>
                    </div>
                </div>
                {customer.addresses.length > 1 && (
                    <span className="text-[10px] font-bold text-theme-secondary bg-white/5 px-2 py-1 rounded-md border border-white/10">
                        + {customer.addresses.length - 1} alternativas
                    </span>
                )}
            </div>

            <div className="relative z-10 bg-[#1a1c29]/50 p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-start gap-4">
                    <div className="flex-1 text-sm font-medium text-white leading-relaxed">
                        {mainAddress.street} {mainAddress.number}
                    </div>
                </div>
                
                <div className="text-xs text-theme-secondary space-y-1">
                    <p className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary/30" />
                        <span className="font-medium text-white/70">Colonia:</span> {mainAddress.colony || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-theme-secondary/30" />
                        <span className="font-medium text-white/70">Ciudad e Identificador:</span> {mainAddress.city || 'N/A'}, {mainAddress.state || 'N/A'}
                    </p>
                </div>

                {mainAddress.references && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-start gap-2">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400/50 mt-0.5 shrink-0" />
                        <p className="text-xs text-emerald-400/80 italic font-medium leading-relaxed">
                            "{mainAddress.references}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
