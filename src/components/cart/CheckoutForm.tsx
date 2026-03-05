// Formulario de checkout con WhatsApp - VSM Store
// Soporta usuarios autenticados (prefill + address selector + cupón + order creation)
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, MapPin, Phone, User, CheckCircle2, ChevronDown, LogIn, Award, Tag, X, Loader2, ShoppingBag } from 'lucide-react';
import { cn, formatPrice, optimizeImage } from '@/lib/utils';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { usePointsBalance } from '@/hooks/useOrders';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useNotification } from '@/hooks/useNotification';
import { useCartValidator } from '@/hooks/useCartValidator';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useCheckout } from '@/hooks/useCheckout';
import { checkoutSchema } from '@/lib/domain/validations/checkout.schema';
import { SITE_CONFIG } from '@/config/site';
import type { CheckoutFormData, DeliveryType, PaymentMethod } from '@/types/cart';
import type { Address } from '@/hooks/useAddresses';

interface CheckoutFormProps {
    onSuccess: () => void;
    onBack: () => void;
}

export function CheckoutForm({ onSuccess, onBack }: CheckoutFormProps) {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const subtotalValue = useCartStore(selectSubtotal);

    const { user, profile, isAuthenticated } = useAuth();
    const { data: addresses = [] } = useAddresses(user?.id);
    const { data: pointsBalance = 0 } = usePointsBalance(user?.id);
    const validateCouponMutation = useValidateCoupon();
    const { error: notifyError } = useNotification();
    const { isValidating } = useCartValidator();

    // Configuración dinámica (WhatsApp)
    const { data: settings } = useStoreSettings();

    // Hook de checkout — orquesta submit, cupones, pagos
    const checkout = useCheckout({ onSuccess });

    const shippingAddresses = addresses.filter((a: Address) => a.type === 'shipping');

    const [formData, setFormData] = useState<CheckoutFormData>({
        customerName: '',
        customerPhone: '',
        deliveryType: 'pickup',
        address: '',
        paymentMethod: 'transfer',
    });

    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

    // Cupón (UI state local, applied coupon vive en useCheckout)
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [showOrderSummary, setShowOrderSummary] = useState(false);

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

    // Calcular total final con descuento (delegado al hook)
    const { discount, finalTotal, appliedCoupon, sent, sending, earnedPoints } = checkout;

    // ─── Validar cupón ──────────────────────────────
    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError('');
        checkout.setAppliedCoupon(null);

        const result = await validateCouponMutation.mutateAsync({
            code: couponCode.trim(),
            total: subtotalValue,
            customerId: user?.id,
        });

        if (result.valid) {
            checkout.setAppliedCoupon(result);
        } else {
            setCouponError(result.message);
        }
    };

    const handleRemoveCoupon = () => {
        checkout.setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    // ─── Validar formulario (Zod + lógica adicional) ─
    const validate = (): boolean => {
        // Si usa dirección guardada, rellenar address para pasar Zod
        const dataToValidate = { ...formData };
        if (isAuthenticated && !useNewAddress && selectedAddressId && formData.deliveryType === 'delivery') {
            dataToValidate.address = 'saved-address';
        }

        const result = checkoutSchema.safeParse(dataToValidate);

        if (!result.success) {
            const zodErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof CheckoutFormData;
                if (!zodErrors[field]) zodErrors[field] = issue.message;
            });
            setErrors(zodErrors);
            return false;
        }

        // Dirección guardada seleccionada
        if (formData.deliveryType === 'delivery' && isAuthenticated && !useNewAddress && !selectedAddressId) {
            setErrors({ address: 'Selecciona una dirección' });
            return false;
        }

        // Validar que el perfil esté completo si está autenticado
        if (isAuthenticated && profile) {
            if (!profile.full_name || !profile.whatsapp) {
                notifyError('Perfil incompleto', 'Por favor, completa tu nombre y WhatsApp en tu perfil antes de continuar.');
                navigate('/profile');
                return false;
            }
        }

        setErrors({});
        return true;
    };

    // ─── Enviar pedido (delegado a useCheckout) ─────
    const onSubmit = async () => {
        if (!validate()) return;
        await checkout.handleSubmit(formData, selectedAddressId, useNewAddress, shippingAddresses);
    };

    // ─── Estado: Enviado ────────────────────────────
    if (sent) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <CheckCircle2 className="mb-4 h-16 w-16 text-herbal-500 animate-[scale-in_0.3s_ease-out]" />
                <h3 className="mb-2 text-lg font-bold text-theme-primary">¡Pedido enviado!</h3>
                <p className="text-sm text-theme-secondary">
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
            <div className="flex items-center gap-2 border-b border-theme px-5 py-3">
                <button onClick={onBack} className="rounded-lg p-1.5 text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-semibold text-theme-primary">Datos de entrega</h3>
            </div>

            {/* Mini Order Summary — collapsible */}
            {items.length > 0 && (
                <div className="mx-5 mt-3">
                    <button
                        type="button"
                        onClick={() => setShowOrderSummary(!showOrderSummary)}
                        className="w-full flex items-center justify-between rounded-xl border border-theme bg-theme-secondary/5 px-4 py-3 transition-colors hover:bg-theme-secondary/10"
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-vape-400" />
                            <span className="text-xs font-bold text-theme-primary">
                                {items.reduce((acc, i) => acc + i.quantity, 0)} producto{items.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-theme-primary">{formatPrice(subtotalValue)}</span>
                            <ChevronDown className={cn('h-4 w-4 text-theme-secondary transition-transform', showOrderSummary && 'rotate-180')} />
                        </div>
                    </button>
                    {showOrderSummary && (
                        <div className="mt-2 space-y-2 rounded-xl border border-theme bg-theme-secondary/5 p-3">
                            {items.map((item) => (
                                <div key={item.product.id} className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-theme-secondary/30">
                                        {item.product.images?.[0] ? (
                                            <img
                                                src={optimizeImage(item.product.images[0], { width: 80, height: 80, quality: 70, format: 'webp' })}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <ShoppingBag className="h-4 w-4 text-theme-tertiary/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-theme-primary truncate">{item.product.name}</p>
                                        <p className="text-[10px] text-theme-secondary">×{item.quantity}</p>
                                    </div>
                                    <span className="text-xs font-bold text-theme-primary">{formatPrice(item.product.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Banner: no autenticado */}
            {!isAuthenticated && (
                <div className="mx-5 mt-4 rounded-xl border border-vape-500/20 bg-vape-500/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                        <LogIn className="h-3.5 w-3.5 text-vape-400 flex-shrink-0" />
                        <span className="text-theme-secondary">
                            <Link to="/login" className="font-medium text-vape-400 hover:text-vape-300">Inicia sesión</Link> para guardar direcciones y acumular puntos.
                        </span>
                    </div>
                </div>
            )}

            {/* Formulario */}
            <div className="flex-1 space-y-4 px-5 py-4">
                {/* Nombre */}
                <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-theme-secondary">
                        <User className="h-3.5 w-3.5" /> Nombre
                    </label>
                    <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Tu nombre completo"
                        className={cn(
                            'w-full rounded-xl border bg-theme-primary px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-tertiary outline-none transition-colors',
                            errors.customerName ? 'border-red-500/50 focus:border-red-500' : 'border-theme focus:border-vape-500'
                        )}
                    />
                    {errors.customerName && <p className="mt-1 text-xs text-red-400">{errors.customerName}</p>}
                </div>

                {/* Teléfono */}
                <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-theme-secondary">
                        <Phone className="h-3.5 w-3.5" /> Teléfono
                    </label>
                    <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="228 123 4567"
                        className={cn(
                            'w-full rounded-xl border bg-theme-primary px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-tertiary outline-none transition-colors',
                            errors.customerPhone ? 'border-red-500/50 focus:border-red-500' : 'border-theme focus:border-vape-500'
                        )}
                    />
                    {errors.customerPhone && <p className="mt-1 text-xs text-red-400">{errors.customerPhone}</p>}
                </div>

                {/* Tipo de entrega */}
                <div>
                    <label className="mb-2 block text-xs font-medium text-theme-secondary">Tipo de entrega</label>
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
                                        : 'border-theme bg-theme-primary text-theme-secondary hover:border-theme'
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
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-theme-secondary">
                            <MapPin className="h-3.5 w-3.5" /> Dirección de envío
                        </label>
                        {isAuthenticated && shippingAddresses.length > 0 && !useNewAddress ? (
                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        value={selectedAddressId}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                        className="w-full appearance-none rounded-xl border border-theme bg-theme-primary px-4 py-2.5 pr-8 text-sm text-theme-primary outline-none focus:border-vape-500"
                                    >
                                        <option value="">Selecciona una dirección</option>
                                        {shippingAddresses.map((a: Address) => (
                                            <option key={a.id} value={a.id}>
                                                {a.label}: {a.street} #{a.number}, {a.colony}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-theme-secondary pointer-events-none" />
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
                                        'w-full resize-none rounded-xl border bg-theme-primary px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-tertiary outline-none transition-colors',
                                        errors.address ? 'border-red-500/50 focus:border-red-500' : 'border-theme focus:border-vape-500'
                                    )}
                                />
                                {isAuthenticated && useNewAddress && (
                                    <button type="button" onClick={() => setUseNewAddress(false)} className="mt-1 text-[11px] text-theme-secondary hover:text-theme-secondary">
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
                    <label className="mb-2 block text-xs font-medium text-theme-secondary">Método de pago</label>
                    <div className="grid grid-cols-1 gap-2">
                        {([
                            { value: 'transfer', label: '🏦 Transferencia / Depósito', disabled: !(settings?.payment_methods?.transfer ?? true) },
                            ...(isAuthenticated ? [{ value: 'mercadopago', label: '💳 Tarjeta (Mercado Pago)', disabled: !(settings?.payment_methods?.mercadopago ?? false) }] : []),
                            { value: 'cash', label: '💵 Contra Entrega (Efectivo)', disabled: !(settings?.payment_methods?.cash ?? false) },
                        ] as { value: PaymentMethod; label: string; disabled?: boolean }[])
                            .filter(option => !option.disabled) // Solo mostrar los habilitados
                            .map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={option.disabled}
                                    onClick={() => setFormData({ ...formData, paymentMethod: option.value })}
                                    className={cn(
                                        'rounded-xl border px-3 py-2.5 text-xs font-medium transition-all text-left flex items-center justify-between',
                                        formData.paymentMethod === option.value
                                            ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                            : 'border-theme bg-theme-primary text-theme-secondary hover:border-theme',
                                        option.disabled && 'opacity-50 cursor-not-allowed hover:border-theme'
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {formData.paymentMethod === option.value && <CheckCircle2 className="h-4 w-4 text-vape-400" />}
                                </button>
                            ))}

                        {/* Mensaje si no hay métodos de pago disponibles */}
                        {(!settings?.payment_methods?.transfer && !settings?.payment_methods?.mercadopago && !settings?.payment_methods?.cash) && (
                            <p className="text-xs text-red-400 p-3 rounded-lg border border-red-500/20 bg-red-500/10">
                                No hay métodos de pago disponibles en este momento.
                            </p>
                        )}
                    </div>

                    {/* Info Bancaria (Transferencia) */}
                    {formData.paymentMethod === 'transfer' && (
                        <div className="mt-3 rounded-xl border border-blue-500/30 bg-accent-primary/10 p-4 animate-in fade-in slide-in-from-top-2">
                            <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                <Award className="h-4 w-4" /> Datos de Transferencia o Depósito
                            </h4>
                            <pre className="text-xs text-theme-secondary font-mono whitespace-pre-wrap">
                                {settings?.bank_account_info || SITE_CONFIG.bankAccount}
                            </pre>
                            <p className="text-xs text-blue-400 mt-2 italic">
                                * Envía tu comprobante por WhatsApp al finalizar para confirmar tu pedido.
                            </p>
                        </div>
                    )}
                </div>

                {/* ─── CUPÓN ─── */}
                <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-theme-secondary">
                        <Tag className="h-3.5 w-3.5" /> Cupón de descuento
                    </label>
                    {appliedCoupon?.valid ? (
                        <div className="flex items-center justify-between rounded-xl border border-herbal-500/30 bg-herbal-500/5 px-4 py-2.5">
                            <div>
                                <p className="text-xs font-medium text-herbal-400">{appliedCoupon.message}</p>
                                <p className="text-[11px] text-herbal-500">-{formatPrice(appliedCoupon.discount)}</p>
                            </div>
                            <button type="button" onClick={handleRemoveCoupon} className="rounded-lg p-1 text-theme-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors">
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
                                className="flex-1 rounded-xl border border-theme bg-theme-primary px-4 py-2.5 text-sm font-mono text-theme-primary placeholder:text-theme-tertiary outline-none focus:border-vape-500 uppercase"
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
                    <div className="rounded-xl border border-theme bg-theme-primary/30 p-3 space-y-1">
                        <div className="flex justify-between text-xs text-theme-secondary">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotalValue)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-herbal-400">
                            <span>Descuento cupón</span>
                            <span>-{formatPrice(discount)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-theme-primary pt-1 border-t border-theme">
                            <span>Total</span>
                            <span>{formatPrice(finalTotal)}</span>
                        </div>
                    </div>
                )}

                {/* Puntos (solo auth) */}
                {isAuthenticated && (
                    <div className="rounded-xl border border-theme bg-theme-primary/30 p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-theme-secondary">
                            <Award className="h-3.5 w-3.5 text-vape-400" />
                            <span>Tus puntos: <strong className="text-vape-400">{pointsBalance}</strong></span>
                        </div>
                        <p className="text-[11px] text-accent-primary">
                            Ganarás <strong className="text-herbal-400">+{earnedPoints} puntos</strong> con esta compra
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-theme px-5 py-4">
                <button
                    onClick={onSubmit}
                    disabled={sending || isValidating}
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
