import { useState, useEffect } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { Save, Loader2, Smartphone, MapPin, Share2 } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

export function AdminSettings() {
    const { data: settings, isLoading } = useStoreSettings();
    const updateMutation = useUpdateStoreSettings();
    const { success, error: notifyError } = useNotification();

    const [formData, setFormData] = useState({
        site_name: '',
        description: '',
        whatsapp_number: '',
        whatsapp_default_message: '',
        social_links: {
            facebook: '',
            instagram: '',
            youtube: '',
            tiktok: '',
        },
        location_address: '',
        location_city: '',
        location_map_url: '',
        bank_account_info: '',
    });

    useEffect(() => {
        if (settings) {
            // eslint-disable-next-line
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
            });
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                social_links: { ...prev.social_links, [socialKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({
                ...formData,
                id: 1 // Always update singleton
            });
            success('Configuración guardada', 'Los cambios se han aplicado correctamente.');
        } catch (err) {
            console.error(err);
            notifyError('Error al guardar', 'No se pudieron guardar los cambios.');
        }
    };

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-vape-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-theme-primary">Configuración de la Tienda</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* 1. WhatsApp & Checkout */}
                <div className="rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-theme pb-4 mb-4">
                        <div className="p-2 rounded-lg bg-green-500/10"><Smartphone className="h-6 w-6 text-green-500" /></div>
                        <h2 className="text-lg font-semibold text-theme-primary">WhatsApp & Checkout</h2>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Número de WhatsApp (con lada, sin +)</label>
                        <input
                            type="text"
                            name="whatsapp_number"
                            value={formData.whatsapp_number}
                            onChange={handleChange}
                            placeholder="Ej: 5212281234567"
                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                        />
                        <p className="mt-1 text-xs text-theme-primary0">A este número llegarán los pedidos.</p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Mensaje Default</label>
                        <textarea
                            name="whatsapp_default_message"
                            value={formData.whatsapp_default_message}
                            onChange={handleChange}
                            rows={2}
                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                        />
                    </div>
                </div>

                {/* 2. Redes Sociales */}
                <div className="rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-theme pb-4 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10"><Share2 className="h-6 w-6 text-blue-500" /></div>
                        <h2 className="text-lg font-semibold text-theme-primary">Redes Sociales</h2>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Facebook URL</label>
                        <input
                            type="url"
                            name="social_facebook"
                            value={formData.social_links.facebook}
                            onChange={handleChange}
                            placeholder="https://facebook.com/..."
                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Instagram URL</label>
                        <input
                            type="url"
                            name="social_instagram"
                            value={formData.social_links.instagram}
                            onChange={handleChange}
                            placeholder="https://instagram.com/..."
                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-secondary">YouTube URL</label>
                        <input
                            type="url"
                            name="social_youtube"
                            value={formData.social_links.youtube}
                            onChange={handleChange}
                            placeholder="https://youtube.com/..."
                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-theme-secondary">TikTok URL</label>
                        <input
                            type="url"
                            name="social_tiktok"
                            value={formData.social_links.tiktok || ''}
                            onChange={handleChange}
                            placeholder="https://tiktok.com/@..."
                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                        />
                    </div>
                </div>

                {/* 3. Información (Collapsible) */}
                <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/30 overflow-hidden">
                    <details className="group">
                        <summary className="flex items-center justify-between p-6 cursor-pointer bg-theme-primary/50 hover:bg-theme-primary/80 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent-primary/10"><MapPin className="h-6 w-6 text-accent-primary" /></div>
                                <h2 className="text-lg font-semibold text-theme-primary">Información General & Bancaria</h2>
                            </div>
                            <span className="text-theme-primary0 text-sm group-open:rotate-180 transition-transform">▼</span>
                        </summary>

                        <div className="p-6 pt-0 border-t border-theme/50 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Nombre de la Tienda</label>
                                    <input
                                        type="text"
                                        name="site_name"
                                        value={formData.site_name}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Ciudad</label>
                                    <input
                                        type="text"
                                        name="location_city"
                                        value={formData.location_city}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Dirección</label>
                                    <input
                                        type="text"
                                        name="location_address"
                                        value={formData.location_address}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-theme-secondary">Google Maps URL</label>
                                    <input
                                        type="url"
                                        name="location_map_url"
                                        value={formData.location_map_url}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                    />
                                </div>

                                <div className="md:col-span-2 border-t border-theme/50 pt-4 mt-2">
                                    <label className="mb-1 block text-sm font-medium text-accent-primary">Datos Bancarios (para Transferencias)</label>
                                    <p className="text-xs text-theme-primary0 mb-2">Esta información se mostrará al cliente cuando elija "Pago con Transferencia".</p>
                                    <textarea
                                        name="bank_account_info"
                                        value={formData.bank_account_info || ''}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder={`Banco: ...\nCuenta: ...\nCLABE: ...`}
                                        className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </details>
                </div>

                <div className="col-span-1 lg:col-span-2 flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 rounded-xl bg-vape-500 px-8 py-3 font-semibold text-white shadow-lg shadow-vape-500/20 transition-all hover:bg-vape-600 hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}
