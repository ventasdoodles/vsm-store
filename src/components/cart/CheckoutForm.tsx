// Formulario de checkout con WhatsApp - VSM Store
// Soporta usuarios autenticados (prefill + address selector + cupón + order creation)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MapPin, Phone, User, CheckCircle2, ChevronDown, LogIn, Award, Tag, X, Loader2 } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { usePointsBalance } from '@/hooks/useOrders';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useNotification } from '@/hooks/useNotification';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { SITE_CONFIG } from '@/config/site';
import { createOrder, markWhatsAppSent, calculateLoyaltyPoints } from '@/services/orders.service';
import { mercadopagoService } from '@/services/payments/mercadopago.service';
import { applyCoupon } from '@/services/coupons.service';
import { formatAddress } from '@/services/addresses.service';
import type { CheckoutFormData, DeliveryType, PaymentMethod, Order } from '@/types/cart';
import type { Address } from '@/services/addresses.service';
import type { CouponValidation } from '@/services/coupons.service';

interface CheckoutFormProps {
    onSuccess: () => void;
    onBack: () => void;
}

export function CheckoutForm({ onSuccess, onBack }: CheckoutFormProps) {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const subtotalValue = useCartStore(selectSubtotal);
    const clearCart = useCartStore((s) => s.clearCart);
    const closeCart = useCartStore((s) => s.closeCart);

    const { user, profile, isAuthenticated } = useAuth();
    const { data: addresses = [] } = useAddresses(user?.id);
    const { data: pointsBalance = 0 } = usePointsBalance(user?.id);
    const validateCouponMutation = useValidateCoupon();
    const { success, error: notifyError } = useNotification();

    // Configuración dinámica (WhatsApp)
    const { data: settings } = useStoreSettings();

    const shippingAddresses = addresses.filter((a: Address) => a.type === 'shipping');

    const [formData, setFormData] = useState<CheckoutFormData>({
        customerName: '',
        customerPhone: '',
        deliveryType: 'pickup',
        address: '',
        paymentMethod: 'cash',
    });

    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    // Cupón
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
    const [couponError, setCouponError] = useState('');

    // Prefill con datos del perfil
    useEffect(() => {
        if (isAuthenticated && profile) {
            setFormData((prev) => ({
                ...prev,
                customerName: profile.full_name ?? prev.customerName,
                customerPhone: profile.phone ?? prev.customerPhone,
            }));
        }
    }, [isAuthenticated, profile]);

    // Seleccionar dirección por defecto
    useEffect(() => {
        const defaultAddr = shippingAddresses.find((a: Address) => a.is_default);
        if (defaultAddr && !selectedAddressId) {
            setSelectedAddressId(defaultAddr.id);
        }
    }, [shippingAddresses, selectedAddressId]);

    // Analytics: Begin Checkout
    useEffect(() => {
        import('@/lib/analytics').then(({ trackEvent }) => {
            trackEvent({
                action: 'begin_checkout',
                params: {
                    currency: 'MXN',
                    value: subtotalValue,
                    items: items.map(item => ({
                        item_id: item.product.id,
                        item_name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity
                    }))
                }
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Calcular total final con descuento
    const subtotal = subtotalValue;
    const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0;
    const finalTotal = Math.max(0, subtotal - discount);

    // ─── Validar cupón ──────────────────────────────
    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError('');
        setAppliedCoupon(null);

        const result = await validateCouponMutation.mutateAsync({
            code: couponCode.trim(),
            total: subtotal,
            customerId: user?.id,
        });

        if (result.valid) {
            setAppliedCoupon(result);
        } else {
            setCouponError(result.message);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    // ─── Validar formulario ─────────────────────────
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

        if (!formData.customerName.trim()) newErrors.customerName = 'Nombre requerido';
        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Teléfono requerido';
        } else if (formData.customerPhone.replace(/\D/g, '').length < 10) {
            newErrors.customerPhone = 'Teléfono inválido';
        }
        if (formData.deliveryType === 'delivery') {
            if (isAuthenticated && !useNewAddress && !selectedAddressId) {
                newErrors.address = 'Selecciona una dirección';
            } else if ((!isAuthenticated || useNewAddress) && !formData.address.trim()) {
                newErrors.address = 'Dirección requerida para envío';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ─── Enviar pedido ──────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) return;
        setSending(true);

        try {
            const order: Order = {
                ...formData,
                id: Date.now().toString(36).toUpperCase(),
                items,
                subtotal,
                total: finalTotal,
                createdAt: new Date().toISOString(),
            };

            // Usar dirección guardada
            if (isAuthenticated && formData.deliveryType === 'delivery' && !useNewAddress && selectedAddressId) {
                const addr = shippingAddresses.find((a: Address) => a.id === selectedAddressId);
                if (addr) order.address = formatAddress(addr);
            }

            // Crear en Supabase si autenticado
            let dbOrderId: string | undefined;
            if (isAuthenticated && user) {
                const dbOrder = await createOrder({
                    customer_id: user.id,
                    items: items.map((item) => ({
                        product_id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                        image: item.product.images?.[0],
                        section: item.product.section,
                    })),
                    subtotal,
                    discount,
                    total: finalTotal,
                    payment_method: formData.paymentMethod,
                    shipping_address_id: (!useNewAddress && selectedAddressId) ? selectedAddressId : undefined,
                });
                dbOrderId = dbOrder.id;

                // Registrar uso de cupón
                if (appliedCoupon?.valid && appliedCoupon.coupon_id) {
                    await applyCoupon(couponCode.trim(), user.id, dbOrder.id).catch(() => { });
                }
            }

            // Si es Mercado Pago, generar link y redirigir
            if (formData.paymentMethod === 'mercadopago' && dbOrderId) {
                const { init_point } = await mercadopagoService.createPayment(dbOrderId);
                window.location.href = init_point; // Redirigir a Mercado Pago
                return; // Detener flujo aquí
            }

            // WhatsApp (default)
            // Usar configuración dinámica si existe, o fallback a SITE_CONFIG
            const waNumber = settings?.whatsapp_number || SITE_CONFIG.whatsapp.number;
            const message = SITE_CONFIG.orderWhatsApp.generateMessage(order);
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');

            if (dbOrderId) {
                await markWhatsAppSent(dbOrderId).catch(() => { });
            }

            success('¡Pedido creado!', `Tu pedido ha sido registrado. Te contactaremos por WhatsApp.`);

            // Analytics: Purchase
            import('@/lib/analytics').then(({ trackEvent }) => {
                trackEvent({
                    action: 'purchase',
                    params: {
                        transaction_id: order.id,
                        value: finalTotal,
                        currency: 'MXN',
                        coupon: appliedCoupon?.valid ? couponCode : undefined,
                        items: items.map(item => ({
                            item_id: item.product.id,
                            item_name: item.product.name,
                            price: item.product.price,
                            quantity: item.quantity
                        }))
                    }
                });
            });

            setSent(true);
            setTimeout(() => {
                clearCart();
                closeCart();
                if (dbOrderId) navigate(`/orders/${dbOrderId}`);
                onSuccess();
            }, 2500);
        } catch (err) {
            console.error('Error creando orden:', err);
            notifyError('Error', 'No se pudo procesar tu pedido. Inténtalo de nuevo.');
            // NO borrar carrito en error — el usuario debe poder reintentar
        } finally {
            setSending(false);
        }
    };

    // ─── Estado: Enviado ────────────────────────────
    if (sent) {
        const earnedPoints = calculateLoyaltyPoints(finalTotal);
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <CheckCircle2 className="mb-4 h-16 w-16 text-herbal-500 animate-[scale-in_0.3s_ease-out]" />
                <h3 className="mb-2 text-lg font-bold text-primary-100">¡Pedido enviado!</h3>
                <p className="text-sm text-primary-400">
                    Tu pedido se envió por WhatsApp. Nos pondremos en contacto contigo pronto.
                </p>
                {isAuthenticated && earnedPoints > 0 && (
                    <p className="mt-2 text-xs text-vape-400">+{earnedPoints} puntos de lealtad ganados 🎉</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-primary-800 px-5 py-3">
                <button onClick={onBack} className="rounded-lg p-1.5 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-semibold text-primary-200">Datos de entrega</h3>
            </div>

            {/* Banner: no autenticado */}
            {!isAuthenticated && (
                <div className="mx-5 mt-4 rounded-xl border border-vape-500/20 bg-vape-500/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                        <LogIn className="h-3.5 w-3.5 text-vape-400 flex-shrink-0" />
                        <span className="text-primary-400">
                            <a href="/login" className="font-medium text-vape-400 hover:text-vape-300">Inicia sesión</a> para guardar direcciones y acumular puntos.
                        </span>
                    </div>
                </div>
            )}

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
                            errors.customerName ? 'border-red-500/50 focus:border-red-500' : 'border-primary-800 focus:border-vape-500'
                        )}
                    />
                    {errors.customerName && <p className="mt-1 text-xs text-red-400">{errors.customerName}</p>}
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
                            errors.customerPhone ? 'border-red-500/50 focus:border-red-500' : 'border-primary-800 focus:border-vape-500'
                        )}
                    />
                    {errors.customerPhone && <p className="mt-1 text-xs text-red-400">{errors.customerPhone}</p>}
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

                {/* Dirección */}
                {formData.deliveryType === 'delivery' && (
                    <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary-400">
                            <MapPin className="h-3.5 w-3.5" /> Dirección de envío
                        </label>
                        {isAuthenticated && shippingAddresses.length > 0 && !useNewAddress ? (
                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        value={selectedAddressId}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                        className="w-full appearance-none rounded-xl border border-primary-800 bg-primary-900 px-4 py-2.5 pr-8 text-sm text-primary-200 outline-none focus:border-vape-500"
                                    >
                                        <option value="">Selecciona una dirección</option>
                                        {shippingAddresses.map((a: Address) => (
                                            <option key={a.id} value={a.id}>
                                                {a.label}: {a.street} #{a.number}, {a.colony}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-500 pointer-events-none" />
                                </div>
                                <button type="button" onClick={() => setUseNewAddress(true)} className="text-[11px] text-vape-400 hover:text-vape-300">
                                    + Usar nueva dirección
                                </button>
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Calle, número, colonia, CP"
                                    rows={2}
                                    className={cn(
                                        'w-full resize-none rounded-xl border bg-primary-900 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 outline-none transition-colors',
                                        errors.address ? 'border-red-500/50 focus:border-red-500' : 'border-primary-800 focus:border-vape-500'
                                    )}
                                />
                                {isAuthenticated && useNewAddress && (
                                    <button type="button" onClick={() => setUseNewAddress(false)} className="mt-1 text-[11px] text-primary-500 hover:text-primary-400">
                                        ← Usar dirección guardada
                                    </button>
                                )}
                            </div>
                        )}
                        {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
                    </div>
                )}

                {/* Método de pago */}
                <div>
                    <label className="mb-2 block text-xs font-medium text-primary-400">Método de pago</label>
                    <div className="grid grid-cols-2 gap-2">
                        {([
                            { value: 'cash', label: '💵 Efectivo' },
                            { value: 'transfer', label: '🏦 Transferencia' },
                            ...(isAuthenticated ? [{ value: 'mercadopago', label: '💳 Mercado Pago' }] : []),
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

                    {/* Info Bancaria (Transferencia) */}
                    {formData.paymentMethod === 'transfer' && (
                        <div className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                <Award className="h-4 w-4" /> Datos de Transferencia
                            </h4>
                            <pre className="text-xs text-primary-300 font-mono whitespace-pre-wrap">
                                {settings?.bank_account_info || SITE_CONFIG.bankAccount}
                            </pre>
                            <p className="text-[10px] text-blue-400 mt-2 italic">
                                * Envía tu comprobante por WhatsApp al finalizar.
                            </p>
                        </div>
                    )}
                </div>

                {/* ─── CUPÓN ─── */}
                <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-primary-400">
                        <Tag className="h-3.5 w-3.5" /> Cupón de descuento
                    </label>
                    {appliedCoupon?.valid ? (
                        <div className="flex items-center justify-between rounded-xl border border-herbal-500/30 bg-herbal-500/5 px-4 py-2.5">
                            <div>
                                <p className="text-xs font-medium text-herbal-400">{appliedCoupon.message}</p>
                                <p className="text-[11px] text-herbal-500">-{formatPrice(appliedCoupon.discount)}</p>
                            </div>
                            <button type="button" onClick={handleRemoveCoupon} className="rounded-lg p-1 text-primary-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                placeholder="CÓDIGO"
                                className="flex-1 rounded-xl border border-primary-800 bg-primary-900 px-4 py-2.5 text-sm font-mono text-primary-200 placeholder:text-primary-600 outline-none focus:border-vape-500 uppercase"
                            />
                            <button
                                type="button"
                                onClick={handleValidateCoupon}
                                disabled={!couponCode.trim() || validateCouponMutation.isPending}
                                className="rounded-xl bg-vape-500/10 border border-vape-500/30 px-4 text-xs font-medium text-vape-400 hover:bg-vape-500/20 transition-all disabled:opacity-40"
                            >
                                {validateCouponMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Aplicar'}
                            </button>
                        </div>
                    )}
                    {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                </div>

                {/* Resumen con descuento */}
                {discount > 0 && (
                    <div className="rounded-xl border border-primary-800 bg-primary-900/30 p-3 space-y-1">
                        <div className="flex justify-between text-xs text-primary-400">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-herbal-400">
                            <span>Descuento cupón</span>
                            <span>-{formatPrice(discount)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-primary-200 pt-1 border-t border-primary-800/50">
                            <span>Total</span>
                            <span>{formatPrice(finalTotal)}</span>
                        </div>
                    </div>
                )}

                {/* Puntos (solo auth) */}
                {isAuthenticated && (
                    <div className="rounded-xl border border-primary-800 bg-primary-900/30 p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-primary-400">
                            <Award className="h-3.5 w-3.5 text-vape-400" />
                            <span>Tus puntos: <strong className="text-vape-400">{pointsBalance}</strong></span>
                        </div>
                        <p className="text-[11px] text-primary-600">
                            Ganarás <strong className="text-herbal-400">+{calculateLoyaltyPoints(finalTotal)} puntos</strong> con esta compra
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-primary-800 px-5 py-4">
                <button
                    onClick={handleSubmit}
                    disabled={sending}
                    className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-xl bg-herbal-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-herbal-500/25 transition-all hover:bg-herbal-600 hover:shadow-herbal-500/40 hover:-translate-y-0.5 active:translate-y-0',
                        'disabled:opacity-60 disabled:cursor-not-allowed'
                    )}
                >
                    <Send className="h-4 w-4" />
                    {sending
                        ? 'Procesando...'
                        : formData.paymentMethod === 'mercadopago'
                            ? `Pagar ${formatPrice(finalTotal)} con Mercado Pago`
                            : `Enviar pedido ${discount > 0 ? `(${formatPrice(finalTotal)})` : ''} por WhatsApp`
                    }
                </button>
            </div>
        </div>
    );
}
