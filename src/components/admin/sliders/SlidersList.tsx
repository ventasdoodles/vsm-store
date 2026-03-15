// â”€â”€â”€ SlidersList â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Grid de tarjetas de sliders con estado vacÃ­o y ordenamiento por `order`.
import { Image as ImageIcon } from 'lucide-react';
import type { HeroSlider } from '@/services';
import { SliderAdminCard } from './SliderAdminCard';

interface SlidersListProps {
    sliders: HeroSlider[];
    onEdit: (s: HeroSlider) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (slider: HeroSlider) => void;
    onReorder: (id: string, direction: 'up' | 'down') => void;
}

export function SlidersList({ sliders, onEdit, onDelete, onToggleStatus, onReorder }: SlidersListProps) {
    if (sliders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-theme-primary/5 rounded-3xl border border-white/5 shadow-inner">
                <div className="p-5 bg-pink-500/10 rounded-full mb-6">
                     <ImageIcon className="h-12 w-12 text-pink-500/50" />
                </div>
                <p className="text-xl font-black text-theme-primary text-center">
                    No hay sliders configurados
                </p>
                <p className="text-sm font-medium text-theme-secondary mt-2 text-center max-w-md">
                    El Home no mostrarÃ¡ banners hasta que agregues al menos un MegaHero slide activo.
                </p>
            </div>
        );
    }

    // Ordenar por la propiedad `order` (fallback a 0)
    const sortedSliders = [...sliders].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-12">
            {sortedSliders.map((slider, index) => (
                <SliderAdminCard
                    key={slider.id}
                    slider={slider}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={(id) => {
                        const target = sliders.find(s => s.id === id);
                        if (target) onToggleStatus(target);
                    }}
                    onMoveUp={() => onReorder(slider.id, 'up')}
                    onMoveDown={() => onReorder(slider.id, 'down')}
                    isFirst={index === 0}
                    isLast={index === sortedSliders.length - 1}
                />
            ))}
        </div>
    );
}

