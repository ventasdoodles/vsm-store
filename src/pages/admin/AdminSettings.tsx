import { useState, useEffect } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { Save, Loader2, Zap } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import type { HeroSlider, LoyaltyConfig, FeaturedCategory } from '@/services/settings.service';

// Importar los sub-componentes modulares
import { WhatsAppSettings } from '@/components/admin/settings/WhatsAppSettings';
import { SocialSettings } from '@/components/admin/settings/SocialSettings';
import { PaymentSettings } from '@/components/admin/settings/PaymentSettings';
import { HeroSliderSettings } from '@/components/admin/settings/HeroSliderSettings';
import { FeaturedCategoriesSettings } from '@/components/admin/settings/FeaturedCategoriesSettings';
import { LoyaltySettings } from '@/components/admin/settings/LoyaltySettings';
import { GeneralSettings } from '@/components/admin/settings/GeneralSettings';

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
        payment_methods: {
            transfer: true,
            mercadopago: false,
            cash: false,
        },
        hero_sliders: [] as HeroSlider[],
        featured_categories: [] as FeaturedCategory[],
        loyalty_config: {
            points_per_currency: 1,
            currency_per_point: 0.1,
            min_points_to_redeem: 100,
            max_points_per_order: 1000,
            points_expiry_days: 365,
            enable_loyalty: true
        } as LoyaltyConfig,
        flash_deals_end: '' as string,
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
                payment_methods: {
                    transfer: settings.payment_methods?.transfer ?? true,
                    mercadopago: settings.payment_methods?.mercadopago ?? false,
                    cash: settings.payment_methods?.cash ?? false,
                },
                hero_sliders: settings.hero_sliders || [],
                featured_categories: settings.featured_categories || [],
                loyalty_config: settings.loyalty_config || {
                    points_per_currency: 1,
                    currency_per_point: 0.1,
                    min_points_to_redeem: 100,
                    max_points_per_order: 1000,
                    points_expiry_days: 365,
                    enable_loyalty: true
                },
                flash_deals_end: settings.flash_deals_end || '',
            });
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name.startsWith('payment_')) {
                const paymentKey = name.replace('payment_', '');
                setFormData(prev => ({
                    ...prev,
                    payment_methods: { ...prev.payment_methods, [paymentKey]: checked }
                }));
            }
        } else if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                social_links: { ...prev.social_links, [socialKey]: value }
            }));
        } else if (name.startsWith('loyalty_')) {
            const loyaltyKey = name.replace('loyalty_', '');
            setFormData(prev => ({
                ...prev,
                loyalty_config: { 
                    ...prev.loyalty_config, 
                    [loyaltyKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : Number(value) 
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSliderChange = <K extends keyof HeroSlider>(index: number, field: K, value: HeroSlider[K]) => {
        setFormData(prev => {
            const newSliders = [...prev.hero_sliders];
            newSliders[index] = { ...newSliders[index], [field]: value } as HeroSlider;
            return { ...prev, hero_sliders: newSliders };
        });
    };

    const handleFeaturedCategoryChange = <K extends keyof FeaturedCategory>(index: number, field: K, value: FeaturedCategory[K]) => {
        setFormData(prev => {
            const newCategories = [...(prev.featured_categories || [])];
            // Si el slot no existe aún en el estado, lo inicializamos perezosamente
            if (!newCategories[index]) {
                newCategories[index] = { id: String(index + 1) } as FeaturedCategory;
            }
            newCategories[index] = { ...newCategories[index], [field]: value };
            return { ...prev, featured_categories: newCategories };
        });
    };

    const addSlider = () => {
        setFormData(prev => ({
            ...prev,
            hero_sliders: [
                ...prev.hero_sliders,
                {
                    id: Date.now().toString(),
                    title: 'Nuevo Slide',
                    subtitle: 'Subtítulo del slide',
                    description: 'Descripción breve para enganchar al usuario.',
                    image: '',
                    tag: 'Nuevo',
                    ctaText: 'Ver más',
                    ctaLink: '/',
                    bgGradient: 'from-gray-900 via-gray-800 to-black',
                    bgGradientLight: 'from-gray-500 via-gray-400 to-gray-300',
                    active: true,
                    order: prev.hero_sliders.length
                }
            ]
        }));
    };

    const removeSlider = (index: number) => {
        setFormData(prev => ({
            ...prev,
            hero_sliders: prev.hero_sliders.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({
                ...formData,
                flash_deals_end: formData.flash_deals_end || null,
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
                <WhatsAppSettings formData={formData} handleChange={handleChange} />

                {/* 2. Redes Sociales */}
                <SocialSettings formData={formData} handleChange={handleChange} />

                {/* 3. Métodos de Pago */}
                <PaymentSettings formData={formData} handleChange={handleChange} />

                {/* 4. Sliders del Home */}
                <HeroSliderSettings
                    formData={formData}
                    handleSliderChange={handleSliderChange}
                    addSlider={addSlider}
                    removeSlider={removeSlider}
                />

                {/* 4.1 Categorías Destacadas (Home) */}
                <FeaturedCategoriesSettings
                    formData={{ featured_categories: formData.featured_categories }}
                    handleChange={handleFeaturedCategoryChange}
                />

                {/* 5. Programa de Lealtad */}
                <LoyaltySettings formData={formData} handleChange={handleChange} />

                {/* 6. Información General */}
                <GeneralSettings formData={formData} handleChange={handleChange} />

                {/* 7. Ofertas Flash */}
                <div className="rounded-2xl border border-theme bg-theme-primary/60 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-400" />
                        <h2 className="text-lg font-semibold text-theme-primary">Ofertas Flash</h2>
                    </div>
                    <p className="text-xs text-theme-secondary">
                        Configura la hora de fin del countdown. Si está vacío, se usa un timer automático de 6 horas.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-1">Fin de ofertas (fecha y hora)</label>
                        <input
                            type="datetime-local"
                            value={formData.flash_deals_end ? formData.flash_deals_end.slice(0, 16) : ''}
                            onChange={e => setFormData(prev => ({ ...prev, flash_deals_end: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                            className="w-full rounded-lg border border-theme bg-theme-secondary/30 px-3 py-2 text-sm text-theme-primary focus:border-vape-500 focus:outline-none"
                        />
                    </div>
                    {formData.flash_deals_end && (
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, flash_deals_end: '' }))}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                            Limpiar (usar timer automático)
                        </button>
                    )}
                </div>

                {/* Botón de Guardar */}
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
