// â”€â”€â”€ AdminHomeSliders (Orchestrator) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Página autónoma para gestionar los MegaHero Sliders del Home.
// Patrón idéntico al de Testimonios y Marcas: toda la lógica aquí,
// los subcomponentes son puramente presentacionales.
import { useState, useEffect } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { useNotification } from '@/hooks/useNotification';
import { useConfirm } from '@/hooks/useConfirm';
import type { HeroSlider } from '@/services';
import { uploadSliderImage } from '@/services';
import {
    buildNewHomeHeroSliderDraft,
    deleteHomeHeroSliderById,
    reorderHomeHeroSlider,
    sortHomeHeroSlidersByOrder,
    toggleHomeHeroSliderStatus,
    upsertHomeHeroSlider,
} from '@/lib/domain/homeHeroSliders';

// â”€â”€â”€ Subcomponents â”€â”€â”€
import { SlidersHeader } from '@/components/admin/sliders/SlidersHeader';
import { SlidersList } from '@/components/admin/sliders/SlidersList';
import { SliderFormModal } from '@/components/admin/sliders/SliderFormModal';
import { Loader2 } from 'lucide-react';

export function AdminHomeSliders() {
    const { data: settings, isLoading, refetch } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { success, error } = useNotification();
    const { confirm } = useConfirm();

    const [sliders, setSliders] = useState<HeroSlider[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState<HeroSlider | null>(null);

    // Sincronizar estado local al cargar settings
    useEffect(() => {
        if (settings?.hero_sliders) {
            setSliders(sortHomeHeroSlidersByOrder(settings.hero_sliders));
        }
    }, [settings]);

    // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const handleCreateNew = () => {
        setCurrentSlide(buildNewHomeHeroSliderDraft(sliders.length));
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
        const isConfirmed = await confirm({
            title: '¿Eliminar este slide?',
            description: 'El slide se eliminará permanentemente de la página principal.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        if (!isConfirmed) return;
        try {
            const updated = deleteHomeHeroSliderById(sliders, id);
            await persistSliders(updated);
            success('Slide eliminado', 'El slider se eliminó correctamente de la pantalla principal.');
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Error deleting slider:', err);
            }
            error('Error al eliminar', 'No se pudo eliminar el slide. Intenta de nuevo.');
        }
    };

    const handleToggleStatus = async (slider: HeroSlider) => {
        try {
            const updated = toggleHomeHeroSliderStatus(sliders, slider.id);
            await persistSliders(updated);
            success(
                slider.active ? 'Slide Ocultado' : 'Slide Activado',
                `El slide ahora está ${slider.active ? 'oculto' : 'visible'} en el inicio.`
            );
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Error toggling status:', err);
            }
            error('Error', 'No se pudo actualizar el estado del slide.');
        }
    };

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        const newSliders = reorderHomeHeroSlider(sliders, id, direction);
        if (newSliders === sliders) return;

        try {
            setSliders(newSliders); // Optimistic UI
            await persistSliders(newSliders);
            success('Orden actualizado', 'El orden de los slides se ha guardado.');
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Error reordering sliders:', err);
            }
            error('Error', 'No se pudo reordenar los slides.');
            setSliders(sliders); // Revert on error
        }
    };

    const handleSaveSlide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSlide) return;

        try {
            const updated = upsertHomeHeroSlider(sliders, currentSlide);

            await persistSliders(updated);
            handleCloseModal();
            success(
                currentSlide.id ? 'Slide guardado' : 'Slide creado',
                'Los cambios se reflejarán en el inicio.'
            );
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('Error saving slide:', err);
            }
            error('Error al guardar', 'Verifica tu conexión e intenta de nuevo.');
        }
    };

    // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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


