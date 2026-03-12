/**
 * // ─── COMPONENTE: AdminSettings ───
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
import type { LoyaltyConfig } from '@/services/settings.service';
import type { SettingsFormData } from '@/components/admin/settings/settings.types';

// Legos
import { SettingsHeader } from '@/components/admin/settings/SettingsHeader';
import { WhatsAppSettings } from '@/components/admin/settings/WhatsAppSettings';
import { SocialSettings } from '@/components/admin/settings/SocialSettings';
import { PaymentSettings } from '@/components/admin/settings/PaymentSettings';
import { GeneralSettings } from '@/components/admin/settings/GeneralSettings';
import { SettingsSaveBar } from '@/components/admin/settings/SettingsSaveBar';

/** Valores default del formulario */
const DEFAULT_LOYALTY: LoyaltyConfig = {
    points_per_currency: 1,
    currency_per_point: 0.1,
    min_points_to_redeem: 100,
    max_points_per_order: 1000,
    points_expiry_days: 365,
    enable_loyalty: true,
};

const DEFAULT_FORM: SettingsFormData = {
    site_name: '',
    description: '',
    whatsapp_number: '',
    whatsapp_default_message: '',
    social_links: { facebook: '', instagram: '', youtube: '', tiktok: '' },
    location_address: '',
    location_city: '',
    location_map_url: '',
    bank_account_info: '',
    payment_methods: { transfer: true, mercadopago: false, cash: false },
    loyalty_config: DEFAULT_LOYALTY,
};

/** Prefijos para routing de handleChange */
const PREFIX_SOCIAL = 'social_';
const PREFIX_LOYALTY = 'loyalty_';
const PREFIX_PAYMENT = 'payment_';

export function AdminSettings() {
    const { data: settings, isLoading } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { success, error: notifyError } = useNotification();

    const [formData, setFormData] = useState<SettingsFormData>(DEFAULT_FORM);

    useEffect(() => {
        if (!settings) return;
        setFormData({
            site_name: settings.site_name || '',
            description: settings.description || '',
            whatsapp_number: settings.whatsapp_number || '',
            whatsapp_default_message: settings.whatsapp_default_message || '',
            social_links: {
                facebook: settings.social_links?.facebook || '',
                instagram: settings.social_links?.instagram || '',
                youtube: settings.social_links?.youtube || '',
                tiktok: settings.social_links?.tiktok || '',
            },
            location_address: settings.location_address || '',
            location_city: settings.location_city || '',
            location_map_url: settings.location_map_url || '',
            bank_account_info: settings.bank_account_info || '',
            payment_methods: {
                transfer: settings.payment_methods?.transfer ?? true,
                mercadopago: settings.payment_methods?.mercadopago ?? false,
                cash: settings.payment_methods?.cash ?? false,
            },
            loyalty_config: settings.loyalty_config || DEFAULT_LOYALTY,

        });
    }, [settings]);

    /** Handler con prefix routing: social_, loyalty_, payment_ */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name.startsWith(PREFIX_PAYMENT)) {
                const paymentKey = name.replace(PREFIX_PAYMENT, '');
                setFormData((prev) => ({
                    ...prev,
                    payment_methods: { ...prev.payment_methods, [paymentKey]: checked },
                }));
            }
        } else if (name.startsWith(PREFIX_SOCIAL)) {
            const socialKey = name.replace(PREFIX_SOCIAL, '');
            setFormData((prev) => ({
                ...prev,
                social_links: { ...prev.social_links, [socialKey]: value },
            }));
        } else if (name.startsWith(PREFIX_LOYALTY)) {
            const loyaltyKey = name.replace(PREFIX_LOYALTY, '');
            setFormData((prev) => ({
                ...prev,
                loyalty_config: {
                    ...prev.loyalty_config,
                    [loyaltyKey]:
                        type === 'checkbox'
                            ? (e.target as HTMLInputElement).checked
                            : Number(value),
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({
                ...formData,
                id: STORE_SETTINGS_ID,
            });
            success('Configuración guardada', 'Los cambios se han aplicado correctamente.');
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
