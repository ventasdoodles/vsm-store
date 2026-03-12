/**
 * // ─── COMPONENTE: ADDRESS CARD ───
 * // Propósito: Visualización premium de una dirección guardada.
 * // Arquitectura: Pure presentation with action callbacks (§1.1).
 * // Estilo: High-Contrast Premium Glass (§2.1).
 */
import { MapPin, Pencil, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/hooks/useAddresses';
import type { Address } from '@/services/addresses.service';

interface AddressCardProps {
    address: Address;
    onEdit?: (address: Address) => void;
    onDelete?: (id: string) => void;
    onSetDefault?: (id: string) => void;
    selected?: boolean;
    compact?: boolean;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault, selected, compact }: AddressCardProps) {
    const isShipping = address.type === 'shipping';

    return (
        <div
            className={cn(
                'vsm-surface group/card relative overflow-hidden transition-all duration-500',
                selected
                    ? 'border-accent-primary/50 bg-accent-primary/5 ring-1 ring-accent-primary/20 shadow-2xl shadow-accent-primary/10'
                    : 'glass-premium hover:border-white/20 hover:bg-white/[0.04]'
            )}
        >
            {/* Indicador de selección lateral */}
            {selected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-primary shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.5)]" />
            )}

            <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Header con Badge */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                'h-10 w-10 rounded-xl flex items-center justify-center border transition-colors duration-500',
                                isShipping 
                                    ? 'bg-vape-500/10 border-vape-500/20 text-vape-400' 
                                    : 'bg-herbal-500/10 border-herbal-500/20 text-herbal-400'
                            )}>
                                <MapPin size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary mb-0.5 opacity-50">
                                    {isShipping ? 'Dirección de Envío' : 'Dirección de Facturación'}
                                </span>
                                <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                                    {address.label || (isShipping ? 'Hogar' : 'Oficina')}
                                </h3>
                            </div>
                        </div>

                        {/* Detalles */}
                        <div className="space-y-1 pl-[3.25rem]">
                            {address.full_name && !compact && (
                                <p className="text-[11px] font-bold text-white uppercase tracking-wide">{address.full_name}</p>
                            )}
                            <p className="text-xs text-theme-secondary leading-relaxed font-medium">
                                {formatAddress(address)}
                            </p>
                            {address.phone && !compact && (
                                <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                    <span className="h-1 w-1 rounded-full bg-theme-tertiary/30" />
                                    Tel: {address.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Badge Predeterminada */}
                    {address.is_default && (
                        <div className={cn(
                            'flex h-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border animate-pulse-slow',
                            isShipping
                                ? 'bg-vape-500/10 text-vape-400 border-vape-500/20'
                                : 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20'
                        )}>
                            <Star className="h-2.5 w-2.5 fill-current" />
                            Predeterminada
                        </div>
                    )}
                </div>

                {/* Acciones Premium */}
                {(onEdit || onDelete || onSetDefault) && (
                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                        {onSetDefault && !address.is_default && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onSetDefault(address.id); }}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-theme-tertiary hover:bg-white/5 hover:text-white transition-all bg-white/[0.02]"
                            >
                                <Star className="h-3.5 w-3.5" />
                                Hacer Principal
                            </button>
                        )}
                        <div className="flex-1" />
                        <div className="flex items-center gap-1">
                            {onEdit && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(address); }}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-theme-secondary hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(address.id); }}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
