import { useState, useEffect } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import { Save, Loader2, Smartphone, MapPin, Share2, CreditCard, Image as ImageIcon, Gift, Plus, Trash2 } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import type { HeroSlider, LoyaltyConfig } from '@/services/settings.service';

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
        loyalty_config: {
            points_per_currency: 1,
            currency_per_point: 0.1,
            min_points_to_redeem: 100,
            max_points_per_order: 1000,
            points_expiry_days: 365,
            enable_loyalty: true
        } as LoyaltyConfig
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
                loyalty_config: settings.loyalty_config || {
                    points_per_currency: 1,
                    currency_per_point: 0.1,
                    min_points_to_redeem: 100,
                    max_points_per_order: 1000,
                    points_expiry_days: 365,
                    enable_loyalty: true
                }
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

    const addSlider = () => {
        setFormData(prev => ({
            ...prev,
            hero_sliders: [
                ...prev.hero_sliders,
                {
                    id: Date.now().toString(),
                    title: 'Nuevo Slide',
                    subtitle: 'Descripción del slide',
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

                {/* 3. Métodos de Pago */}
                <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-theme pb-4 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/10"><CreditCard className="h-6 w-6 text-purple-500" /></div>
                        <h2 className="text-lg font-semibold text-theme-primary">Métodos de Pago</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-start gap-3 p-4 rounded-lg border border-theme bg-theme-secondary/30 cursor-pointer hover:bg-theme-secondary/50 transition-colors">
                            <input
                                type="checkbox"
                                name="payment_transfer"
                                checked={formData.payment_methods.transfer}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 rounded border-theme text-vape-500 focus:ring-vape-500 bg-theme-primary"
                            />
                            <div>
                                <p className="text-sm font-medium text-theme-primary">Transferencia / Depósito</p>
                                <p className="text-xs text-theme-secondary mt-1">Pago manual con comprobante por WhatsApp.</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 rounded-lg border border-theme bg-theme-secondary/30 cursor-pointer hover:bg-theme-secondary/50 transition-colors">
                            <input
                                type="checkbox"
                                name="payment_mercadopago"
                                checked={formData.payment_methods.mercadopago}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 rounded border-theme text-vape-500 focus:ring-vape-500 bg-theme-primary"
                            />
                            <div>
                                <p className="text-sm font-medium text-theme-primary">Mercado Pago (Tarjetas)</p>
                                <p className="text-xs text-theme-secondary mt-1">Requiere configuración de credenciales en Supabase.</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 rounded-lg border border-theme bg-theme-secondary/30 cursor-pointer hover:bg-theme-secondary/50 transition-colors">
                            <input
                                type="checkbox"
                                name="payment_cash"
                                checked={formData.payment_methods.cash}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 rounded border-theme text-vape-500 focus:ring-vape-500 bg-theme-primary"
                            />
                            <div>
                                <p className="text-sm font-medium text-theme-primary">Contra Entrega (Efectivo)</p>
                                <p className="text-xs text-theme-secondary mt-1">Pago en efectivo al recibir el producto.</p>
                            </div>
                        </label>
                    </div>

                    {/* Configuración específica de Transferencia (solo visible si está activa) */}
                    {formData.payment_methods.transfer && (
                        <div className="mt-4 p-4 rounded-lg border border-theme bg-theme-secondary/20">
                            <label className="mb-1 block text-sm font-medium text-accent-primary">Datos Bancarios (para Transferencias)</label>
                            <p className="text-xs text-theme-primary0 mb-3">Esta información se mostrará al cliente al finalizar su pedido para que realice el pago.</p>
                            <textarea
                                name="bank_account_info"
                                value={formData.bank_account_info || ''}
                                onChange={handleChange}
                                rows={4}
                                placeholder={`Banco: BBVA\nTitular: Juan Pérez\nCuenta: 1234567890\nCLABE: 012345678901234567`}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 font-mono text-sm"
                            />
                        </div>
                    )}
                </div>

                {/* 4. Sliders del Home */}
                <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-theme pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-500/10"><ImageIcon className="h-6 w-6 text-pink-500" /></div>
                            <h2 className="text-lg font-semibold text-theme-primary">Sliders del Home (MegaHero)</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addSlider}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-vape-500 rounded-lg hover:bg-vape-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Slide
                        </button>
                    </div>

                    <div className="space-y-6">
                        {formData.hero_sliders.map((slider, index) => (
                            <div key={slider.id} className="p-4 rounded-lg border border-theme bg-theme-secondary/30 relative">
                                <button
                                    type="button"
                                    onClick={() => removeSlider(index)}
                                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Eliminar slide"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-12">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Título</label>
                                        <input
                                            type="text"
                                            value={slider.title}
                                            onChange={(e) => handleSliderChange(index, 'title', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Subtítulo</label>
                                        <input
                                            type="text"
                                            value={slider.subtitle}
                                            onChange={(e) => handleSliderChange(index, 'subtitle', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Texto del Botón</label>
                                        <input
                                            type="text"
                                            value={slider.ctaText}
                                            onChange={(e) => handleSliderChange(index, 'ctaText', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Link del Botón</label>
                                        <input
                                            type="text"
                                            value={slider.ctaLink}
                                            onChange={(e) => handleSliderChange(index, 'ctaLink', e.target.value)}
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Gradiente (Dark Mode)</label>
                                        <input
                                            type="text"
                                            value={slider.bgGradient}
                                            onChange={(e) => handleSliderChange(index, 'bgGradient', e.target.value)}
                                            placeholder="from-violet-900 via-fuchsia-900 to-purple-900"
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-theme-secondary">Gradiente (Light Mode)</label>
                                        <input
                                            type="text"
                                            value={slider.bgGradientLight}
                                            onChange={(e) => handleSliderChange(index, 'bgGradientLight', e.target.value)}
                                            placeholder="from-violet-500 via-fuchsia-500 to-purple-600"
                                            className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500 font-mono text-xs"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={slider.active}
                                                onChange={(e) => handleSliderChange(index, 'active', e.target.checked)}
                                                className="h-4 w-4 rounded border-theme text-vape-500 focus:ring-vape-500 bg-theme-primary"
                                            />
                                            <span className="text-sm font-medium text-theme-primary">Slide Activo</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-theme-secondary">Orden:</label>
                                            <input
                                                type="number"
                                                value={slider.order || 0}
                                                onChange={(e) => handleSliderChange(index, 'order', Number(e.target.value))}
                                                className="w-20 rounded-lg border border-theme bg-theme-secondary px-2 py-1 text-theme-primary outline-none focus:border-vape-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {formData.hero_sliders.length === 0 && (
                            <p className="text-center text-theme-secondary py-4">No hay slides configurados. Agrega uno para mostrar en el inicio.</p>
                        )}
                    </div>
                </div>

                {/* 5. Programa de Lealtad */}
                <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-theme pb-4 mb-4">
                        <div className="p-2 rounded-lg bg-yellow-500/10"><Gift className="h-6 w-6 text-yellow-500" /></div>
                        <h2 className="text-lg font-semibold text-theme-primary">Programa de Lealtad (Puntos)</h2>
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-theme bg-theme-secondary/30 cursor-pointer hover:bg-theme-secondary/50 transition-colors">
                            <input
                                type="checkbox"
                                name="loyalty_enable_loyalty"
                                checked={formData.loyalty_config.enable_loyalty}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-theme text-vape-500 focus:ring-vape-500 bg-theme-primary"
                            />
                            <div>
                                <p className="text-sm font-medium text-theme-primary">Habilitar Programa de Lealtad</p>
                                <p className="text-xs text-theme-secondary">Permite a los usuarios ganar y canjear puntos.</p>
                            </div>
                        </label>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!formData.loyalty_config.enable_loyalty ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Puntos ganados por cada $1 gastado</label>
                            <input
                                type="number"
                                step="0.1"
                                name="loyalty_points_per_currency"
                                value={formData.loyalty_config.points_per_currency}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Valor en $ de cada punto al canjear</label>
                            <input
                                type="number"
                                step="0.01"
                                name="loyalty_currency_per_point"
                                value={formData.loyalty_config.currency_per_point}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Mínimo de puntos para canjear</label>
                            <input
                                type="number"
                                name="loyalty_min_points_to_redeem"
                                value={formData.loyalty_config.min_points_to_redeem}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Máximo de puntos a canjear por orden</label>
                            <input
                                type="number"
                                name="loyalty_max_points_per_order"
                                value={formData.loyalty_config.max_points_per_order}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Días de expiración de los puntos</label>
                            <input
                                type="number"
                                name="loyalty_points_expiry_days"
                                value={formData.loyalty_config.points_expiry_days}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 6. Información (Collapsible) */}
                <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/30 overflow-hidden">
                    <details className="group">
                        <summary className="flex items-center justify-between p-6 cursor-pointer bg-theme-primary/50 hover:bg-theme-primary/80 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent-primary/10"><MapPin className="h-6 w-6 text-accent-primary" /></div>
                                <h2 className="text-lg font-semibold text-theme-primary">Información General</h2>
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
                            </div>
                        </div>
                    </details>
                </div>

                {/* 7. Datos Bancarios (Collapsible) */}

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
