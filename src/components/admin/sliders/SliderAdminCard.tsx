// ─── SliderAdminCard ──────────────────────────────────────────────────────────
// Tarjeta visual que muestra una preview real del slider con su gradiente,
// imagen, badges de estado y controles de acción. Puramente presentacional.
import { Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import type { HeroSlider } from '@/services/settings.service';
import { PREMIUM_GRADIENTS } from '@/constants/slider';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface SliderAdminCardProps {
    slider: HeroSlider;
    onEdit: (s: HeroSlider) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string) => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
}

export function SliderAdminCard({
    slider,
    onEdit,
    onDelete,
    onToggleActive,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast
}: SliderAdminCardProps) {

    // Resolver el preset del gradiente o usar fallback neutro
    const currentPreset = PREMIUM_GRADIENTS.find(g => g.id === slider.bgGradientLight)
        ?? { bg: 'from-gray-900 via-gray-800 to-black', textGradient: 'from-white to-gray-400', buttonGradient: 'from-gray-600 to-gray-500' };

    return (
        <div className={cn(
            'group relative flex flex-col md:flex-row overflow-hidden rounded-3xl transition-all duration-300 border',
            slider.active
                ? 'bg-[#181825]/90 backdrop-blur-xl border-white/[0.08] hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/10'
                : 'bg-[#181825]/40 border-white/[0.04] opacity-75 grayscale-[0.6]'
        )}>
            
            {/* Visual Preview Area (Left side) */}
            <div className={`relative w-full md:w-2/5 min-h-[220px] bg-gradient-to-r ${currentPreset.bg} flex items-center justify-center p-6 overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" /> {/* Overlay for better image contrast */}
                
                {slider.image ? (
                    <OptimizedImage
                        src={slider.image}
                        alt={slider.title}
                        className={cn(
                            "relative z-10 w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-105",
                            !slider.active && "opacity-70"
                        )}
                    />
                ) : (
                    <div className="relative z-10 text-white/30 font-bold uppercase tracking-widest text-sm flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-2xl border-2 border-white/20 border-dashed flex items-center justify-center mb-2">
                            <span className="text-2xl">🖼️</span>
                        </div>
                        Sin Imagen
                    </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {!slider.active && (
                        <div className="px-3 py-1 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-500 text-[10px] uppercase font-black tracking-wider rounded-xl shadow-lg flex items-center gap-1.5">
                            <EyeOff className="w-3 h-3" /> Inactivo
                        </div>
                    )}
                    {slider.tag && slider.tag !== 'Ninguno' && (
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] uppercase font-black tracking-wider rounded-xl shadow-lg max-w-max">
                            {slider.tag}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Area (Right side) */}
            <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1">
                    <h3 className="text-xl font-black text-theme-primary mb-1 line-clamp-1">
                        {slider.title || 'Sin título'}
                    </h3>
                    <p className={`font-bold text-sm bg-gradient-to-r ${currentPreset.textGradient} bg-clip-text text-transparent line-clamp-1 mb-3`}>
                        {slider.subtitle || 'Sin subtítulo'}
                    </p>
                    
                    {slider.description && (
                        <p className="text-sm font-medium text-theme-secondary/70 line-clamp-2 leading-relaxed mb-4">
                            {slider.description}
                        </p>
                    )}

                    <div className="flex items-center gap-3 mt-auto">
                        <div className={`px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase text-white shadow-lg bg-gradient-to-r ${currentPreset.buttonGradient}`}>
                            {slider.ctaText || 'Sin CTA'}
                        </div>
                        {slider.ctaLink && (
                            <span className="text-[10px] font-mono text-theme-secondary/50 truncate max-w-[150px]">
                                {slider.ctaLink}
                            </span>
                        )}
                    </div>
                </div>

                <div className="h-px w-full bg-white/5 my-5" />
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <ActionBtn title="Editar" icon={<Pencil className="w-4 h-4" />} onClick={() => onEdit(slider)} color="pink" />
                        <ActionBtn 
                            title={slider.active ? 'Ocultar' : 'Mostrar'} 
                            icon={slider.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} 
                            onClick={() => onToggleActive(slider.id)} 
                            color="amber" 
                        />
                        
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        
                        <ActionBtn title="Eliminar" icon={<Trash2 className="w-4 h-4" />} onClick={() => onDelete(slider.id)} color="red" />
                    </div>

                    {/* Order Controls */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-xl border border-white/5">
                        <button 
                            disabled={isFirst} 
                            onClick={onMoveUp}
                            className="p-1 text-theme-secondary hover:text-white disabled:opacity-30 transition-colors"
                        >
                            <GripVertical className="w-4 h-4 mr-0.5" />
                            <span className="sr-only">Subir</span>
                        </button>
                        <span className="text-[10px] font-black text-theme-secondary w-6 text-center tabular-nums">#{slider.order ?? 0}</span>
                        <button 
                            disabled={isLast} 
                            onClick={onMoveDown}
                            className="p-1 text-theme-secondary hover:text-white disabled:opacity-30 transition-colors"
                        >
                            <GripVertical className="w-4 h-4 ml-0.5" />
                            <span className="sr-only">Bajar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionBtn({ icon, onClick, color, title }: { icon: React.ReactNode, onClick: () => void, color: 'pink' | 'amber' | 'red' | 'blue', title: string }) {
    const colors = {
        pink: 'hover:bg-pink-500/20 hover:text-pink-400 focus:ring-pink-500/30 font-semibold',
        amber: 'hover:bg-amber-500/20 hover:text-amber-400 focus:ring-amber-500/30',
        red: 'hover:bg-red-500/20 hover:text-red-400 focus:ring-red-500/30',
        blue: 'hover:bg-blue-500/20 hover:text-blue-400 focus:ring-blue-500/30'
    };

    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                'p-2.5 rounded-xl transition-all duration-200 outline-none focus:ring-2 active:scale-90 text-theme-secondary',
                colors[color]
            )}
        >
            {icon}
        </button>
    );
}
