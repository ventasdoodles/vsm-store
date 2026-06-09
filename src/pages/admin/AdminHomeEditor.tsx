/**
 * AdminHomeEditor - Page responsible for orchestrating the Home editor (Featured Categories).
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
import {
    applyHomeFeaturedCategorySelection,
    buildHomeFeaturedCategories,
    findMatchingHomeFeaturedCategoryId,
    HOME_FEATURED_CATEGORY_SLOTS,
    updateHomeFeaturedCategorySlot,
} from '@/lib/domain/homeFeaturedCategories';

import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';

// Subcomponents for the module
import { HomeEditorHeader } from '@/components/admin/home-editor/HomeEditorHeader';
import { HomeEditorSlotCard } from '@/components/admin/home-editor/HomeEditorSlotCard';

export function AdminHomeEditor() {
    const { config } = useActiveVerticalPack();
    const { data: settings, isLoading } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { data: storeCategories = [] } = useCategories();
    const { success, error: notifyError } = useNotification();

    const [categories, setCategories] = useState<FeaturedCategory[]>(() =>
        buildHomeFeaturedCategories(config, null),
    );
    const [isDirty, setIsDirty] = useState(false);

    // Sync with the DB when settings arrive
    useEffect(() => {
        if (settings?.featured_categories) {
            setCategories(buildHomeFeaturedCategories(config, settings.featured_categories));
            setIsDirty(false);
        }
    }, [settings?.featured_categories, config]);

    /** Update a field for a specific slot */
    const updateSlot = useCallback((index: number, field: keyof FeaturedCategory, value: string) => {
        setCategories((prev) => updateHomeFeaturedCategorySlot(prev, index, field, value));
        setIsDirty(true);
    }, []);

    /** When selecting a category from the dropdown, auto-fill slug, name, image, and section */
    const handleCategorySelect = useCallback((index: number, categoryId: string) => {
        const matched: Category | undefined = storeCategories.find((c) => c.id === categoryId);
        if (!matched) return;

        setCategories((prev) => applyHomeFeaturedCategorySelection(prev, index, matched));
        setIsDirty(true);
    }, [storeCategories]);

    /** Save only featured categories, without touching the rest of settings */
    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({
                featured_categories: categories,
                id: 1,
            });
            success('Categorías guardadas', 'Las categorías destacadas se actualizaron correctamente.');
            setIsDirty(false);
        } catch (err: unknown) {
            const supaError = err as { message?: string; code?: string; details?: string };
            if (import.meta.env.DEV) {
                console.error('Error saving featured categories:', supaError);
            }
            notifyError(
                'Error al guardar',
                supaError?.message || 'No se pudieron guardar las categorías destacadas.',
            );
        }
    };

    /** Discard changes and go back to the DB-backed state */
    const handleDiscard = () => {
        setCategories(buildHomeFeaturedCategories(config, settings?.featured_categories));
        setIsDirty(false);
    };

    /** Find the category ID that matches the current slug + section of a slot */
    const findMatchingCategoryId = (slot: FeaturedCategory): string => {
        return findMatchingHomeFeaturedCategoryId(slot, storeCategories);
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
                slotsCount={HOME_FEATURED_CATEGORY_SLOTS}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
