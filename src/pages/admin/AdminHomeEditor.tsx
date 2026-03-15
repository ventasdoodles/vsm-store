/**
 * AdminHomeEditor â€” PÃ¡gina responsable de orquestar la ediciÃ³n del Home (CategorÃ­as Destacadas).
 *
 * @module AdminHomeEditor
 * @independent No depende de AdminSettings. Lee/escribe directamente a `store_settings.featured_categories`.
 * @data Consume useStoreSettings + useUpdateStoreSettings para persistencia y useCategories para auto-completar.
 */
import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { useCategories } from '@/hooks/useCategories';
import { useNotification } from '@/hooks/useNotification';
import type { FeaturedCategory } from '@/services';
import type { Category } from '@/types/category';
import { FALLBACK_CATEGORIES } from '@/constants/category-showcase';

// Subcomponentes del mÃ³dulo
import { HomeEditorHeader } from '@/components/admin/home-editor/HomeEditorHeader';
import { HomeEditorSlotCard } from '@/components/admin/home-editor/HomeEditorSlotCard';

/** NÃºmero fijo de slots del grid de categorÃ­as en el Home */
const SLOTS_COUNT = 4;

/** Construye un array de 4 categorÃ­as completas, rellenando con fallbacks */
function buildInitialCategories(dbCategories: FeaturedCategory[] | null | undefined): FeaturedCategory[] {
    return Array.from({ length: SLOTS_COUNT }, (_, i) => {
        const saved = dbCategories?.[i];
        if (saved && saved.slug && saved.name) return saved;
        return { ...FALLBACK_CATEGORIES[i]! };
    });
}

export function AdminHomeEditor() {
    const { data: settings, isLoading } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { data: storeCategories = [] } = useCategories();
    const { success, error: notifyError } = useNotification();

    const [categories, setCategories] = useState<FeaturedCategory[]>(() =>
        buildInitialCategories(null)
    );
    const [isDirty, setIsDirty] = useState(false);

    // Sincronizar con la BD cuando llegan los settings
    useEffect(() => {
        if (settings?.featured_categories) {
            setCategories(buildInitialCategories(settings.featured_categories));
            setIsDirty(false);
        }
    }, [settings?.featured_categories]);

    /** Actualiza un campo de un slot especÃ­fico */
    const updateSlot = useCallback((index: number, field: keyof FeaturedCategory, value: string) => {
        setCategories(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index]!, [field]: value };
            return updated;
        });
        setIsDirty(true);
    }, []);

    /** Al seleccionar una categorÃ­a del dropdown, auto-rellena slug, nombre, imagen y secciÃ³n */
    const handleCategorySelect = useCallback((index: number, categoryId: string) => {
        const matched: Category | undefined = storeCategories.find(c => c.id === categoryId);
        if (!matched) return;

        setCategories(prev => {
            const updated = [...prev];
            const current = updated[index]!;
            updated[index] = {
                ...current,
                slug: matched.slug,
                name: matched.name,
                section: (matched.section === 'vape' || matched.section === '420') ? matched.section : current.section,
                ...(matched.image_url ? { image: matched.image_url } : {}),
            };
            return updated;
        });
        setIsDirty(true);
    }, [storeCategories]);

    /** Guardar solo las categorÃ­as destacadas, sin tocar el resto de settings */
    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                featured_categories: categories,
                id: 1,
            });
            success('CategorÃ­as guardadas', 'Las categorÃ­as destacadas se actualizaron correctamente.');
            setIsDirty(false);
        } catch (err: unknown) {
            const supaError = err as { message?: string; code?: string; details?: string };
            if (import.meta.env.DEV) {
                console.error('Error saving featured categories:', supaError);
            }
            notifyError(
                'Error al guardar',
                supaError?.message || 'No se pudieron guardar las categorÃ­as destacadas.',
            );
        }
    };

    /** Descartar cambios y volver al estado de la BD */
    const handleDiscard = () => {
        setCategories(buildInitialCategories(settings?.featured_categories));
        setIsDirty(false);
    };

    /** Encontrar el ID de la categorÃ­a que corresponde al slug+section actual de un slot */
    const findMatchingCategoryId = (slot: FeaturedCategory): string => {
        const match = storeCategories.find(
            c => c.slug === slot.slug && c.section === slot.section
        );
        return match?.id ?? '';
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-vape-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <HomeEditorHeader
                isDirty={isDirty}
                isPending={updateMutation.isPending}
                onSave={handleSave}
                onDiscard={handleDiscard}
                slotsCount={SLOTS_COUNT}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((slot, index) => (
                    <HomeEditorSlotCard
                        key={slot.id}
                        slot={slot}
                        index={index}
                        storeCategories={storeCategories}
                        selectedCategoryId={findMatchingCategoryId(slot)}
                        onUpdateSlot={updateSlot}
                        onCategorySelect={handleCategorySelect}
                    />
                ))}
            </div>
        </div>
    );
}

