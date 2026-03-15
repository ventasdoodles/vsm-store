import React from 'react';
import { Edit2, Copy, Trash2, EyeOff, Image as ImageIcon, Eye } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';
import type { Brand } from '@/services/admin';

interface BrandAdminCardProps {
    brand: Brand;
    onEdit: (b: Brand) => void;
    onDuplicate: (b: Brand) => void;
    onDelete: (b: Brand) => void;
    onToggleActive: (id: string, active: boolean) => void;
}

export function BrandAdminCard({ brand, onEdit, onDuplicate, onDelete, onToggleActive }: BrandAdminCardProps) {
    return (
        <div className={cn(
            'group relative flex flex-col rounded-3xl transition-all duration-300 overflow-hidden',
            brand.is_active
                ? 'bg-[#181825]/80 backdrop-blur-xl border border-white/[0.06] hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1'
                : 'bg-[#181825]/40 border border-white/[0.04] opacity-75 grayscale-[0.5]'
        )}>
            {/* Status Badge */}
            {!brand.is_active && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500 text-[10px] uppercase font-black tracking-wider rounded-xl shadow-lg flex items-center gap-1.5">
                    <EyeOff className="w-3 h-3" />
                    Inactiva
                </div>
            )}
            
            {/* Image Container */}
            <div className="relative h-40 bg-theme-primary/5 flex items-center justify-center p-6 group-hover:bg-theme-primary/10 transition-colors">
                {brand.logo_url ? (
                    <OptimizedImage
                        src={brand.logo_url}
                        alt={brand.name}
                        className={cn(
                            "max-w-full max-h-full object-contain filter transition-all duration-500 group-hover:scale-110",
                            !brand.is_active && "opacity-50"
                        )}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                        <ImageIcon className="h-10 w-10 text-theme-secondary shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-theme-secondary">Sin logo</span>
                    </div>
                )}

                {/* Desktop Hover Actions (over image) */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                     <ActionBtn icon={<Edit2 className="w-4 h-4" />} onClick={() => onEdit(brand)} color="blue" tooltip="Editar" />
                     <ActionBtn icon={<Copy className="w-4 h-4" />} onClick={() => onDuplicate(brand)} color="white" tooltip="Duplicar" />
                     <ActionBtn icon={brand.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} onClick={() => onToggleActive(brand.id, !brand.is_active)} color="amber" tooltip={brand.is_active ? "Ocultar" : "Mostrar"} />
                     <ActionBtn icon={<Trash2 className="w-4 h-4" />} onClick={() => onDelete(brand)} color="red" tooltip="Eliminar" />
                </div>
            </div>

            {/* Info Footer */}
            <div className="p-5 border-t border-white/5 bg-gradient-to-b from-transparent to-theme-primary/10 relative z-10">
                <h3 className={cn("font-black text-lg truncate tracking-tight", brand.is_active ? "text-theme-primary" : "text-theme-secondary")}>
                    {brand.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono font-bold text-white/50 bg-black/30 px-2 py-1 rounded-md border border-white/5">
                        NO. {brand.sort_order}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-theme-secondary/40">
                         Orden de aparición
                    </span>
                </div>
            </div>
            
            {/* Mobile Actions (Always visible on touch) */}
            <div className="flex md:hidden border-t border-white/5 p-2 bg-[#13141f] justify-around">
                 <button onClick={() => onEdit(brand)} className="p-3 text-blue-400"><Edit2 className="w-5 h-5"/></button>
                 <button onClick={() => onDuplicate(brand)} className="p-3 text-gray-400"><Copy className="w-5 h-5"/></button>
                 <button onClick={() => onToggleActive(brand.id, !brand.is_active)} className="p-3 text-amber-400">
                    {brand.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
                 <button onClick={() => onDelete(brand)} className="p-3 text-red-400"><Trash2 className="w-5 h-5"/></button>
            </div>
        </div>
    );
}

function ActionBtn({ icon, onClick, color, tooltip }: { icon: React.ReactNode, onClick: () => void, color: 'blue' | 'red' | 'white' | 'amber', tooltip: string }) {
    const colors = {
        blue: 'bg-blue-600/90 hover:bg-blue-500 shadow-blue-500/20 text-white',
        red: 'bg-red-600/90 hover:bg-red-500 shadow-red-500/20 text-white',
        white: 'bg-white/10 hover:bg-white/20 text-white',
        amber: 'bg-amber-600/90 hover:bg-amber-500 shadow-amber-500/20 text-white'
    };

    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={cn(
                'p-3 rounded-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-xl backdrop-blur-md',
                colors[color]
            )}
        >
            {icon}
        </button>
    );
}
