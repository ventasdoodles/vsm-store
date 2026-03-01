// ─── AdminHomeSliders (Orchestrator) ──────────────────────────────────────────
// Página autónoma para gestionar los MegaHero Sliders del Home.
// Patrón idéntico al de Testimonios y Marcas: toda la lógica aquí,
// los subcomponentes son puramente presentacionales.
import { useState, useEffect } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { useNotification } from '@/hooks/useNotification';
import type { HeroSlider } from '@/services/settings.service';
import { uploadSliderImage } from '@/services/settings.service';
import { PREMIUM_GRADIENTS } from '@/constants/slider';

// ─── Subcomponents ───
import { SlidersHeader } from '@/components/admin/sliders/SlidersHeader';
import { SlidersList } from '@/components/admin/sliders/SlidersList';
import { SliderFormModal } from '@/components/admin/sliders/SliderFormModal';
import { Loader2 } from 'lucide-react';

/** Gradiente por defecto para nuevos slides */
const DEFAULT_GRADIENT = PREMIUM_GRADIENTS[0] ?? { id: 'default', bg: 'from-gray-900 to-black' };

export function AdminHomeSliders() {
    const { data: settings, isLoading, refetch } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { success, error } = useNotification();

    const [sliders, setSliders] = useState<HeroSlider[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState<HeroSlider | null>(null);

    // Sincronizar estado local al cargar settings
    useEffect(() => {
        if (settings?.hero_sliders) {
            const sorted = [...settings.hero_sliders].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setSliders(sorted);
        }
    }, [settings]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleCreateNew = () => {
        setCurrentSlide({
            id: '',
            title: '',
            subtitle: '',
            description: '',
            image: '',
            tag: '',
            ctaText: 'COMPRAR AHORA',
            ctaLink: '/',
            bgGradient: DEFAULT_GRADIENT.bg,
            bgGradientLight: DEFAULT_GRADIENT.id,
            active: true,
            order: sliders.length,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (slider: HeroSlider) => {
        setCurrentSlide({ ...slider });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSlide(null);
    };

    /** Persiste un array actualizado de sliders en store_settings */
    const persistSliders = async (updated: HeroSlider[]) => {
        await updateMutation.mutateAsync({ id: 1, hero_sliders: updated });
        setSliders(updated);
        refetch();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este slide?')) return;
        try {
            const updated = sliders.filter(s => s.id !== id);
            await persistSliders(updated);
            success('Slide eliminado', 'El slider se eliminó correctamente de la pantalla principal.');
        } catch (err) {
            console.error('Error deleting slider:', err);
            error('Error al eliminar', 'No se pudo eliminar el slide. Intenta de nuevo.');
        }
    };

    const handleToggleStatus = async (slider: HeroSlider) => {
        try {
            const updated = sliders.map(s =>
                s.id === slider.id ? { ...s, active: !s.active } : s
            );
            await persistSliders(updated);
            success(
                slider.active ? 'Slide Ocultado' : 'Slide Activado',
                `El slide ahora está ${slider.active ? 'oculto' : 'visible'} en el inicio.`
            );
        } catch (err) {
            console.error('Error toggling status:', err);
            error('Error', 'No se pudo actualizar el estado del slide.');
        }
    };

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        const index = sliders.findIndex(s => s.id === id);
        if (index === -1) return;
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === sliders.length - 1)
        ) return;

        const newSliders = [...sliders];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const current = newSliders[index]!;
        const swap = newSliders[swapIndex]!;

        // Intercambiar valores de order
        const currentOrder = current.order ?? index;
        const swapOrder = swap.order ?? swapIndex;
        newSliders[index] = { ...current, order: swapOrder };
        newSliders[swapIndex] = { ...swap, order: currentOrder };

        // Reordenar el array
        newSliders.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        try {
            setSliders(newSliders); // Optimistic UI
            await persistSliders(newSliders);
            success('Orden actualizado', 'El orden de los slides se ha guardado.');
        } catch (err) {
            console.error('Error reordering sliders:', err);
            error('Error', 'No se pudo reordenar los slides.');
            setSliders(sliders); // Revert on error
        }
    };

    const handleSaveSlide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSlide) return;

        try {
            let updated: HeroSlider[];

            if (currentSlide.id) {
                // Editar existente
                updated = sliders.map(s => s.id === currentSlide.id ? currentSlide : s);
            } else {
                // Crear nuevo con ID generado
                updated = [...sliders, { ...currentSlide, id: Date.now().toString() }];
            }

            await persistSliders(updated);
            handleCloseModal();
            success(
                currentSlide.id ? 'Slide guardado' : 'Slide creado',
                'Los cambios se reflejarán en el inicio.'
            );
        } catch (err) {
            console.error('Error saving slide:', err);
            error('Error al guardar', 'Verifica tu conexión e intenta de nuevo.');
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
                <p className="text-theme-secondary font-medium tracking-wide">Cargando módulos interactivos...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <SlidersHeader
                onCreateNew={handleCreateNew}
                total={sliders.length}
                activeCount={sliders.filter(s => s.active).length}
            />

            <div className="bg-[#13141f] rounded-[2.5rem] p-6 sm:p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />

                <SlidersList
                    sliders={sliders}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onReorder={handleReorder}
                />
            </div>

            {isModalOpen && currentSlide && (
                <SliderFormModal
                    isOpen={isModalOpen}
                    form={currentSlide}
                    setForm={(slide) => setCurrentSlide(slide)}
                    onSubmit={handleSaveSlide}
                    onCancel={handleCloseModal}
                    isPending={updateMutation.isPending}
                    onUploadImage={uploadSliderImage}
                />
            )}
        </div>
    );
}

export default AdminHomeSliders;
