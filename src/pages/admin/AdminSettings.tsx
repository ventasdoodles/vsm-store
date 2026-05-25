/**
 * // â”€â”€â”€ COMPONENTE: AdminSettings â”€â”€â”€
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar el formulario de configuracion de la tienda.
 *    Gestiona formData (state), handleChange con prefix routing, handleSubmit con mutation.
 *    Delega TODO el renderizado visual a los Legos en components/admin/settings/.
 * // Regla / Notas: Cero UI propio excepto el layout grid + form wrapper. Sin `any`, sin cadenas
 *    magicas sueltas. SettingsFormData tipado desde settings.types.ts.
 */
import { useState, useEffect } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { Loader2 } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { STORE_SETTINGS_ID } from '@/constants/app';
import type { SettingsFormData } from '@/components/admin/settings/settings.types';
import {
    applyStoreSettingsFormChange,
    buildStoreSettingsFormData,
    buildStoreSettingsUpdatePayload,
} from '@/lib/domain/storeSettingsForm';

// Legos
import { SettingsHeader } from '@/components/admin/settings/SettingsHeader';
import { WhatsAppSettings } from '@/components/admin/settings/WhatsAppSettings';
import { SocialSettings } from '@/components/admin/settings/SocialSettings';
import { PaymentSettings } from '@/components/admin/settings/PaymentSettings';
import { GeneralSettings } from '@/components/admin/settings/GeneralSettings';
import { SettingsSaveBar } from '@/components/admin/settings/SettingsSaveBar';

export function AdminSettings() {
    const { data: settings, isLoading } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { success, error: notifyError } = useNotification();

    const [formData, setFormData] = useState<SettingsFormData>(buildStoreSettingsFormData(null));

    useEffect(() => {
        setFormData(buildStoreSettingsFormData(settings));
    }, [settings]);

    /** Handler con prefix routing: social_, loyalty_, payment_ */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData((prev) =>
            applyStoreSettingsFormChange(prev, {
                name,
                value,
                type,
                checked,
            }),
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync(
                buildStoreSettingsUpdatePayload(formData, STORE_SETTINGS_ID),
            );
            success('ConfiguraciÃ³n guardada', 'Los cambios se han aplicado correctamente.');
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error(err);
            }
            notifyError('Error al guardar', 'No se pudieron guardar los cambios.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SettingsHeader />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <WhatsAppSettings formData={formData} handleChange={handleChange} />
                <SocialSettings formData={formData} handleChange={handleChange} />
                <PaymentSettings formData={formData} handleChange={handleChange} />
                <GeneralSettings formData={formData} handleChange={handleChange} />
                <SettingsSaveBar isPending={updateMutation.isPending} />
            </form>
        </div>
    );
}

