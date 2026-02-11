// Formulario de checkout con WhatsApp - VSM Store
import { useState } from 'react';
import { ArrowLeft, Send, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { SITE_CONFIG } from '@/config/site';
import type { CheckoutFormData, DeliveryType, PaymentMethod, Order } from '@/types/cart';

interface CheckoutFormProps {
    onSuccess: () => void;
    onBack: () => void;
}

/**
 * Formulario de checkout que genera mensaje WhatsApp automático
 */
export function CheckoutForm({ onSuccess, onBack }: CheckoutFormProps) {
    const items = useCartStore((s) => s.items);
    const total = useCartStore((s) => s.total);
    const clearCart = useCartStore((s) => s.clearCart);
    const closeCart = useCartStore((s) => s.closeCart);

    const [formData, setFormData] = useState<CheckoutFormData>({
        customerName: '',
        customerPhone: '',
        deliveryType: 'pickup',
        address: '',
        paymentMethod: 'cash',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
    const [sent, setSent] = useState(false);

    // Validar formulario
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Nombre requerido';
        }
        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Teléfono requerido';
        } else if (formData.customerPhone.replace(/\D/g, '').length < 10) {
            newErrors.customerPhone = 'Teléfono inválido';
        }
        if (formData.deliveryType === 'delivery' && !formData.address.trim()) {
            newErrors.address = 'Dirección requerida para envío';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Enviar pedido por WhatsApp
    const handleSubmit = () => {
        if (!validate()) return;

        // Construir orden
        const order: Order = {
            ...formData,
            id: Date.now().toString(36).toUpperCase(),
            items,
            subtotal: total(),
            total: total(),
            createdAt: new Date().toISOString(),
        };

        // Generar mensaje
        const message = SITE_CONFIG.orderWhatsApp.generateMessage(order);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodedMessage}`;

        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');

        // Mostrar éxito
        setSent(true);

        // Limpiar carrito después de 2s
        setTimeout(() => {
            clearCart();
            closeCart();
            onSuccess();
        }, 2500);
    };

    // Estado: Enviado con éxito
    if (sent) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <CheckCircle2 className="mb-4 h-16 w-16 text-herbal-500 animate-[scale-in_0.3s_ease-out]" />
                <h3 className="mb-2 text-lg font-bold text-primary-100">¡Pedido enviado!</h3>
                <p className="text-sm text-primary-400">
                    Tu pedido se envió por WhatsApp. Nos pondremos en contacto contigo pronto.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-primary-800 px-5 py-3">
                <button
                    onClick={onBack}
                    className="rounded-lg p-1.5 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-semibold text-primary-200">Datos de entrega</h3>
            </div>

            {/* Formulario */}
            <div className="flex-1 space-y-4 px-5 py-4">
                {/* Nombre */}
                <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary-400">
                        <User className="h-3.5 w-3.5" /> Nombre
                    </label>
                    <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Tu nombre completo"
                        className={cn(
                            'w-full rounded-xl border bg-primary-900 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 outline-none transition-colors',
                            errors.customerName
                                ? 'border-red-500/50 focus:border-red-500'
                                : 'border-primary-800 focus:border-vape-500'
                        )}
                    />
                    {errors.customerName && (
                        <p className="mt-1 text-xs text-red-400">{errors.customerName}</p>
                    )}
                </div>

                {/* Teléfono */}
                <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary-400">
                        <Phone className="h-3.5 w-3.5" /> Teléfono
                    </label>
                    <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="228 123 4567"
                        className={cn(
                            'w-full rounded-xl border bg-primary-900 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 outline-none transition-colors',
                            errors.customerPhone
                                ? 'border-red-500/50 focus:border-red-500'
                                : 'border-primary-800 focus:border-vape-500'
                        )}
                    />
                    {errors.customerPhone && (
                        <p className="mt-1 text-xs text-red-400">{errors.customerPhone}</p>
                    )}
                </div>

                {/* Tipo de entrega */}
                <div>
                    <label className="mb-2 block text-xs font-medium text-primary-400">Tipo de entrega</label>
                    <div className="grid grid-cols-2 gap-2">
                        {([
                            { value: 'pickup', label: '🏪 Recoger en tienda' },
                            { value: 'delivery', label: '🚚 Envío a domicilio' },
                        ] as { value: DeliveryType; label: string }[]).map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, deliveryType: option.value })}
                                className={cn(
                                    'rounded-xl border px-3 py-2.5 text-xs font-medium transition-all',
                                    formData.deliveryType === option.value
                                        ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                        : 'border-primary-800 bg-primary-900 text-primary-400 hover:border-primary-700'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dirección (solo si es envío) */}
                {formData.deliveryType === 'delivery' && (
                    <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary-400">
                            <MapPin className="h-3.5 w-3.5" /> Dirección de envío
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Calle, número, colonia, CP"
                            rows={2}
                            className={cn(
                                'w-full resize-none rounded-xl border bg-primary-900 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 outline-none transition-colors',
                                errors.address
                                    ? 'border-red-500/50 focus:border-red-500'
                                    : 'border-primary-800 focus:border-vape-500'
                            )}
                        />
                        {errors.address && (
                            <p className="mt-1 text-xs text-red-400">{errors.address}</p>
                        )}
                    </div>
                )}

                {/* Método de pago */}
                <div>
                    <label className="mb-2 block text-xs font-medium text-primary-400">Método de pago</label>
                    <div className="grid grid-cols-2 gap-2">
                        {([
                            { value: 'cash', label: '💵 Efectivo' },
                            { value: 'transfer', label: '🏦 Transferencia' },
                        ] as { value: PaymentMethod; label: string }[]).map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentMethod: option.value })}
                                className={cn(
                                    'rounded-xl border px-3 py-2.5 text-xs font-medium transition-all',
                                    formData.paymentMethod === option.value
                                        ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                        : 'border-primary-800 bg-primary-900 text-primary-400 hover:border-primary-700'
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer: botón enviar */}
            <div className="border-t border-primary-800 px-5 py-4">
                <button
                    onClick={handleSubmit}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-herbal-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-herbal-500/25 transition-all hover:bg-herbal-600 hover:shadow-herbal-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Send className="h-4 w-4" />
                    Enviar pedido por WhatsApp
                </button>
            </div>
        </div>
    );
}
