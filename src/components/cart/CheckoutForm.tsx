import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Send, MapPin, Phone, User, CheckCircle,
    Award, Tag, Loader2,
    ShoppingBag, ChevronRight, CreditCard,
    Truck, Store as StoreIcon, AlertCircle
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { usePointsBalance } from '@/hooks/useOrders';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useCartValidator } from '@/hooks/useCartValidator';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useCheckout } from '@/hooks/useCheckout';
import { useStorefrontCartDependencyOffer } from '@/hooks/useStorefrontCartDependencyOffer';
import { useTacticalUI } from '@/contexts/TacticalContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getStorefrontCheckoutTransitionView } from '@/lib/domain/cart';
import { getStorefrontOpenOrderRecoveryView } from '@/lib/domain/orders';
import { CheckoutSteps } from './CheckoutSteps';
import { CheckoutTransitionStatus } from './CheckoutTransitionStatus';
import { useCheckoutValidation } from '@/hooks/useCheckoutValidation';
import { ShippingAddressContent } from './ShippingAddressContent';
import { PaymentMethodContent } from './PaymentMethodContent';
import type { CheckoutFormData } from '@/types/cart';
import type { Address } from '@/hooks/useAddresses';
import type { OrderRecord } from '@/hooks/useOrders';

interface CheckoutFormProps {
    onSuccess: () => void;
    onBack: () => void;
    openRecoverableOrder?: OrderRecord | null;
}

const STEPS = [
    { id: 1, label: 'Identidad' },
    { id: 2, label: 'Entrega' },
    { id: 3, label: 'Pago' }
];

// Helper Component for Visual Grouping
const FormCard = ({ children, title, icon: Icon }: { children: React.ReactNode, title?: string, icon?: React.ComponentType<{ className?: string }> }) => (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
        {title && (
            <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.02] px-6 py-4">
                {Icon && <Icon className="h-4 w-4 text-vape-400" />}
                <h4 className="text-sm font-bold tracking-tight text-white">{title}</h4>
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

// Floating Label Input - Premium VSM Redesign
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    error?: string;
}
const FloatingInput = ({ label, icon: Icon, error, ...props }: FloatingInputProps) => {
    const [focused, setFocused] = useState(false);
    const hasValue = !!props.value;

    return (
        <div className="relative mb-6 group">
            <label className={cn(
                "absolute left-11 transition-all duration-300 pointer-events-none select-none z-10",
                (focused || hasValue) 
                    ? "-top-2 text-[10px] font-black text-vape-400 uppercase tracking-widest bg-[var(--concierge-bg-border)] px-2 rounded-sm border border-white/10" 
                    : "top-1/2 -translate-y-1/2 text-sm text-white/30"
            )}>
                {label}
            </label>
            <div className={cn(
                "relative flex items-center rounded-2xl border bg-black/40 backdrop-blur-md transition-all duration-500",
                focused ? "border-vape-500/50 shadow-[0_0_25px_rgba(234,88,12,0.1)] ring-1 ring-vape-500/20" : "border-white/5",
                error && "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            )}>
                <div className="pl-4 flex-shrink-0">
                    {Icon && <Icon className={cn(
                        "h-4 w-4 transition-all duration-300", 
                        (focused || hasValue) ? "text-vape-400 scale-110" : "text-white/20"
                    )} />}
                </div>
                <input
                    {...props}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="w-full bg-transparent py-4 px-3 text-sm font-medium text-white focus:outline-none placeholder:opacity-0"
                    placeholder={label}
                />
            </div>
            <AnimatePresence>
                {error && (
                    <m.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="absolute -bottom-5 left-4 text-[10px] font-black uppercase tracking-widest text-red-500/90 flex items-center gap-1.5"
                    >
                        <AlertCircle className="h-3 w-3" /> {error}
                    </m.p>
                )}
            </AnimatePresence>
        </div>
    );
};

export function CheckoutForm({ onSuccess, openRecoverableOrder = null }: CheckoutFormProps) {
    const navigate = useNavigate();
    const cartItems = useCartStore((s) => s.items);
    const lastValidationResult = useCartStore((s) => s.lastValidationResult);
    const subtotalValue = useCartStore(selectSubtotal);
    const { data: cartDependencyOffer } = useStorefrontCartDependencyOffer(cartItems);

    const { user, profile, isAuthenticated } = useAuth();
    const { data: addresses = [] } = useAddresses(user?.id);
    const { data: pointsBalance = 0 } = usePointsBalance(user?.id);
    const validateCouponMutation = useValidateCoupon();
    const { isValidating } = useCartValidator();
    const { data: settings } = useStoreSettings();
    const { playClick, playSuccess, playTick, playError, triggerHaptic } = useTacticalUI();

    const checkout = useCheckout({ onSuccess });
    const shippingAddresses = useMemo(() => addresses.filter((a: Address) => a.type === 'shipping'), [addresses]);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<CheckoutFormData>({
        customerName: '',
        customerPhone: '',
        deliveryType: 'pickup',
        address: '',
        paymentMethod: 'transfer',
    });

    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [useNewAddress, setUseNewAddress] = useState(false);
    const { errors, validateStep } = useCheckoutValidation(isAuthenticated);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');

    // Persistencia
    useEffect(() => {
        const savedData = sessionStorage.getItem('vsm_checkout_form');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) { console.error('Error parsing saved checkout data', e); }
        }
    }, []);

    useEffect(() => {
        if (formData.customerName || formData.customerPhone || formData.address) {
            sessionStorage.setItem('vsm_checkout_form', JSON.stringify(formData));
        }
    }, [formData]);

    useEffect(() => {
        if (isAuthenticated && profile) {
            setFormData((prev) => ({
                ...prev,
                customerName: prev.customerName || profile.full_name || '',
                customerPhone: prev.customerPhone || profile.phone || '',
            }));
        }
    }, [isAuthenticated, profile]);

    useEffect(() => {
        const defaultAddr = shippingAddresses.find((a: Address) => a.is_default);
        if (defaultAddr && !selectedAddressId) {
            setSelectedAddressId(defaultAddr.id);
        }
    }, [shippingAddresses, selectedAddressId]);

    const { discount, finalTotal, appliedCoupon, sent, sending, earnedPoints, orderId, handoffOnly } = checkout;
    const transitionView = useMemo(
        () => getStorefrontCheckoutTransitionView(cartItems, lastValidationResult, cartDependencyOffer ?? null),
        [cartItems, cartDependencyOffer, lastValidationResult],
    );
    const openOrderRecoveryView = useMemo(
        () => (openRecoverableOrder ? getStorefrontOpenOrderRecoveryView(openRecoverableOrder) : null),
        [openRecoverableOrder],
    );
    const hasOpenRecoverableOrder = openOrderRecoveryView?.shouldRecover === true;
    const canSubmitCheckout = transitionView.canSubmitCheckout && !hasOpenRecoverableOrder;
    const handleOpenDependencyProduct = (missingProduct: NonNullable<typeof transitionView.dependencyGuidance>['missingProduct']) => {
        navigate(`/${missingProduct.section}/${missingProduct.slug}`);
    };

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
            playSuccess();
            triggerHaptic([10, 30, 10]);
        } else {
            setCouponError(result.message);
            playError();
            triggerHaptic(80);
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep, formData, useNewAddress, selectedAddressId)) {
            playTick();
            triggerHaptic(10);
            if (currentStep === 1 && formData.deliveryType === 'pickup') {
                setCurrentStep(3); // Skip address for pickup
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            playError();
            triggerHaptic(50);
        }
    };

    const prevStep = () => {
        playTick();
        triggerHaptic(10);
        if (currentStep === 3 && formData.deliveryType === 'pickup') {
            setCurrentStep(1);
        } else {
            setCurrentStep(prev => prev - 1);
        }
    };

    const onSubmit = async () => {
        if (!transitionView.canSubmitCheckout || hasOpenRecoverableOrder) return;
        if (!validateStep(3, formData, useNewAddress, selectedAddressId)) return;
        playClick();
        triggerHaptic(40);
        await checkout.handleSubmit(formData, selectedAddressId, useNewAddress, shippingAddresses);
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-herbal-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                    <CheckCircle className="h-10 w-10 text-slate-900" strokeWidth={3} />
                </m.div>
                <h3 className="mb-2 text-2xl font-black text-white">¡Gracias por tu compra!</h3>
                {handoffOnly ? (
                    <p className="text-theme-secondary">Tu solicitud fue enviada por WhatsApp. No se registro un pedido en el sistema.</p>
                ) : (
                    <>
                        <p className="text-theme-secondary">Tu pedido se procesó correctamente y se envió por WhatsApp.</p>
                        {orderId && (
                            <p className="mt-2 text-xs font-bold text-theme-tertiary">ID de pedido: {orderId}</p>
                        )}
                    </>
                )}
                {isAuthenticated && earnedPoints > 0 && (
                    <p className="mt-4 text-sm font-bold text-vape-400">+{earnedPoints} V-Coins ganadas 🎉</p>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Steps Indicator */}
            <div className="mb-10">
                <CheckoutSteps currentStep={currentStep} steps={STEPS} />
            </div>

            <ErrorBoundary>
            <AnimatePresence mode="wait">
                {currentStep === 1 && (
                    <m.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <FormCard title="Quien recibe" icon={User}>
                            <FloatingInput
                                label="Nombre Completo"
                                icon={User}
                                value={formData.customerName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, customerName: e.target.value })}
                                error={errors.customerName}
                            />
                            <FloatingInput
                                label="Teléfono de Contacto"
                                icon={Phone}
                                type="tel"
                                value={formData.customerPhone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, customerPhone: e.target.value })}
                                error={errors.customerPhone}
                            />
                        </FormCard>

                        <FormCard title="Tipo de Entrega" icon={Truck}>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setFormData({ ...formData, deliveryType: 'pickup' })}
                                    className={cn(
                                        "group flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all text-center",
                                        formData.deliveryType === 'pickup'
                                            ? "border-vape-500 bg-vape-500/10 text-white shadow-lg"
                                            : "border-white/5 bg-white/[0.02] text-theme-tertiary hover:bg-white/[0.05]"
                                    )}
                                >
                                    <StoreIcon className={cn("h-6 w-6", formData.deliveryType === 'pickup' ? "text-vape-400" : "text-white/20")} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Recoger</span>
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, deliveryType: 'delivery' })}
                                    className={cn(
                                        "group flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all text-center",
                                        formData.deliveryType === 'delivery'
                                            ? "border-vape-500 bg-vape-500/10 text-white shadow-lg"
                                            : "border-white/5 bg-white/[0.02] text-theme-tertiary hover:bg-white/[0.05]"
                                    )}
                                >
                                    <Truck className={cn("h-6 w-6", formData.deliveryType === 'delivery' ? "text-vape-400" : "text-white/20")} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Domicilio</span>
                                </button>
                            </div>
                        </FormCard>
                    </m.div>
                )}

                {currentStep === 2 && (
                    <m.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <FormCard title="Dirección de Envío" icon={MapPin}>
                            <ShippingAddressContent
                                isAuthenticated={isAuthenticated}
                                shippingAddresses={shippingAddresses}
                                useNewAddress={useNewAddress}
                                selectedAddressId={selectedAddressId}
                                addressFormValue={formData.address}
                                errors={errors as any}
                                setSelectedAddressId={setSelectedAddressId}
                                setUseNewAddress={setUseNewAddress}
                                setAddressFormValue={(val) => setFormData({ ...formData, address: val })}
                            />
                        </FormCard>
                    </m.div>
                )}

                {currentStep === 3 && (
                    <m.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Métodos de Pago */}
                        <FormCard title="Método de Pago" icon={CreditCard}>
                            <PaymentMethodContent
                                isAuthenticated={isAuthenticated}
                                settings={settings}
                                paymentMethod={formData.paymentMethod}
                                setPaymentMethod={(method) => setFormData({ ...formData, paymentMethod: method })}
                            />
                        </FormCard>

                        {/* Cupón */}
                        <FormCard title="Cupón de Descuento" icon={Tag}>
                            <div className="flex gap-3">
                                <FloatingInput
                                    label="Ingresar Código"
                                    icon={Tag}
                                    value={couponCode}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCoupon}
                                    className="mb-0 flex-1"
                                />
                                <button
                                    onClick={appliedCoupon ? () => { checkout.setAppliedCoupon(null); setCouponCode(''); } : handleValidateCoupon}
                                    className={cn(
                                        "rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all",
                                        appliedCoupon
                                            ? "bg-red-500/20 text-red-400 border border-red-500/20"
                                            : "bg-vape-500 text-slate-900 shadow-lg shadow-vape-500/20"
                                    )}
                                >
                                    {appliedCoupon ? 'Quitar' : 'Aplicar'}
                                </button>
                            </div>
                            {couponError && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase text-center">{couponError}</p>}
                            {appliedCoupon?.valid && (
                                <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center text-xs font-bold text-herbal-400">
                                    ¡Cupón aplicado exitosamente! -{formatPrice(appliedCoupon.discount)}
                                </m.p>
                            )}
                        </FormCard>

                        <CheckoutTransitionStatus
                            view={transitionView}
                            onDependencyAction={handleOpenDependencyProduct}
                        />

                        {/* Mobile Summary Mini (Solo visible si no es desktop split) */}
                        <div className="lg:hidden">
                            <FormCard title="Resumen" icon={ShoppingBag}>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-theme-tertiary">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotalValue)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-xs text-herbal-400">
                                            <span>Descuento</span>
                                            <span>-{formatPrice(discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-white/5">
                                        <span>Total</span>
                                        <span className="text-herbal-400">{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>
                            </FormCard>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
            </ErrorBoundary>

            {/* Navigation Footer */}
            <div className="mt-10 flex gap-4">
                {currentStep > 1 && (
                    <button
                        onClick={prevStep}
                        className="flex h-16 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-theme-secondary hover:bg-white/10 transition-all active:scale-95"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                )}
                {currentStep < 3 ? (
                    <button
                        onClick={nextStep}
                        className="group flex h-16 flex-1 items-center justify-center gap-3 rounded-2xl bg-vape-500 shadow-xl shadow-vape-500/20 transition-all hover:bg-vape-400 active:scale-95"
                    >
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Continuar</span>
                        <ChevronRight className="h-5 w-5 text-slate-900 transition-transform group-hover:translate-x-1" />
                    </button>
                ) : (
                    <button
                        onClick={onSubmit}
                        disabled={sending || isValidating || !canSubmitCheckout}
                        className={cn(
                            "group relative flex h-16 flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-herbal-500 font-bold transition-all shadow-xl shadow-herbal-500/20 hover:bg-herbal-400 active:scale-95",
                            (sending || isValidating || !canSubmitCheckout) && "opacity-50 grayscale cursor-not-allowed"
                        )}
                    >
                        <AnimatePresence>
                            {sending ? (
                                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Procesando</span>
                                </m.div>
                            ) : (
                                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                                    <Send className="h-5 w-5 text-slate-900" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                                        {hasOpenRecoverableOrder
                                            ? 'Ya existe una orden pendiente'
                                            : formData.paymentMethod === 'mercadopago'
                                                ? 'Pagar Ahora'
                                                : 'Confirmar Pedido'}
                                    </span>
                                </m.div>
                            )}
                        </AnimatePresence>
                    </button>
                )}
            </div>

            {/* Loyalty Info Footer */}
            {isAuthenticated && pointsBalance > 0 && (
                <div className="mt-10 flex items-center justify-center gap-4 px-6 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default group">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-vape-500/30 to-transparent" />
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Award className="h-5 w-5 text-vape-400" />
                            <div className="absolute inset-0 blur-lg bg-vape-500/50 scale-150 animate-pulse" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-vape-400">
                            {pointsBalance} V-Coins disponibles
                        </span>
                    </div>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-vape-500/30 to-transparent" />
                </div>
            )}
        </div>
    );
}








