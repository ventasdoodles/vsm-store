// Card de dirección - VSM Store
import { MapPin, Pencil, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/services/addresses.service';
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
                'rounded-xl border p-4 transition-all',
                selected
                    ? 'border-vape-500/50 bg-vape-500/5 ring-1 ring-vape-500/20'
                    : 'border-theme bg-theme-secondary/20 hover:border-theme',
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className={cn('h-3.5 w-3.5 flex-shrink-0', isShipping ? 'text-vape-400' : 'text-herbal-400')} />
                        <span className="text-sm font-medium text-theme-primary truncate">
                            {address.label || (isShipping ? 'Envío' : 'Facturación')}
                        </span>
                        {address.is_default && (
                            <span className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                isShipping
                                    ? 'bg-vape-500/10 text-vape-400 border border-vape-500/20'
                                    : 'bg-herbal-500/10 text-herbal-400 border border-herbal-500/20'
                            )}>
                                <Star className="h-2.5 w-2.5" />
                                Predeterminada
                            </span>
                        )}
                    </div>

                    {/* Nombre */}
                    {address.full_name && !compact && (
                        <p className="text-xs text-theme-secondary mb-0.5">{address.full_name}</p>
                    )}

                    {/* Dirección */}
                    <p className="text-xs text-theme-secondary leading-relaxed">
                        {formatAddress(address)}
                    </p>

                    {/* Teléfono */}
                    {address.phone && !compact && (
                        <p className="text-xs text-theme-secondary mt-1">Tel: {address.phone}</p>
                    )}
                </div>
            </div>

            {/* Acciones */}
            {(onEdit || onDelete || onSetDefault) && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-theme/50">
                    {onSetDefault && !address.is_default && (
                        <button
                            onClick={() => onSetDefault(address.id)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors"
                        >
                            <Star className="h-3 w-3" />
                            Predeterminada
                        </button>
                    )}
                    <div className="flex-1" />
                    {onEdit && (
                        <button
                            onClick={() => onEdit(address)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors"
                        >
                            <Pencil className="h-3 w-3" />
                            Editar
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(address.id)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="h-3 w-3" />
                            Eliminar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
