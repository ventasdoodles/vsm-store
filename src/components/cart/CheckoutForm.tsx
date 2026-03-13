import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Send, MapPin, Phone, User, CheckCircle,
    Award, Tag, Loader2,
    ShoppingBag, ChevronRight, CreditCard, Building,
    Truck, Store as StoreIcon, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { usePointsBalance } from '@/hooks/useOrders';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { useNotification } from '@/hooks/useNotification';
import { useCartValidator } from '@/hooks/useCartValidator';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useCheckout } from '@/hooks/useCheckout';
import { useTacticalUI } from '@/contexts/TacticalContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { checkoutSchema } from '@/lib/domain/validations/checkout.schema';
import { SITE_CONFIG } from '@/config/site';
import { CheckoutSteps } from './CheckoutSteps';
import type { CheckoutFormData, PaymentMethod } from '@/types/cart';
import type { Address } from '@/hooks/useAddresses';

interface CheckoutFormProps {
    onSuccess: () => void;
    onBack: () => void;
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
                    ? "-top-2 text-[10px] font-black text-vape-400 uppercase tracking-widest bg-[#0a0f1d] px-2 rounded-sm border border-white/10" 
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
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="absolute -bottom-5 left-4 text-[10px] font-black uppercase tracking-widest text-red-500/90 flex items-center gap-1.5"
                    >
                        <AlertCircle className="h-3 w-3" /> {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
    const navigate = useNavigate();
    const subtotalValue = useCartStore(selectSubtotal);

    const { user, profile, isAuthenticated } = useAuth();
    const { data: addresses = [] } = useAddresses(user?.id);
    const { data: pointsBalance = 0 } = usePointsBalance(user?.id);
    const validateCouponMutation = useValidateCoupon();
    const { error: notifyError } = useNotification();
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
    const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
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

    const { discount, finalTotal, appliedCoupon, sent, sending, earnedPoints } = checkout;

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

    const validateStep = (step: number): boolean => {
        const dataToValidate = { ...formData };
        if (isAuthenticated && !useNewAddress && selectedAddressId && formData.deliveryType === 'delivery') {
            dataToValidate.address = 'saved-address';
        }

        const result = checkoutSchema.safeParse(dataToValidate);
        const zodErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof CheckoutFormData;
                zodErrors[field] = issue.message;
            });
        }

        if (step === 1) {
            if (zodErrors.customerName || zodErrors.customerPhone) {
                setErrors(zodErrors);
                return false;
            }
        }

        if (step === 2 && formData.deliveryType === 'delivery') {
            if (isAuthenticated && !useNewAddress && !selectedAddressId) {
                setErrors({ address: 'Selecciona una dirección' });
                return false;
            }
            if (useNewAddress && !formData.address) {
                setErrors({ address: 'Ingresa tu dirección' });
                return false;
            }
            if (!isAuthenticated && !formData.address) {
                setErrors({ address: 'Ingresa tu dirección' });
                return false;
            }
        }

        setErrors({});
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
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
        if (!validateStep(3)) return;
        if (isAuthenticated && profile && (!profile.full_name || !profile.whatsapp)) {
            notifyError('Perfil incompleto', 'Completa tu perfil antes de continuar.');
            navigate('/profile');
            return;
        }
        playClick();
        triggerHaptic(40);
        await checkout.handleSubmit(formData, selectedAddressId, useNewAddress, shippingAddresses);
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-herbal-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                    <CheckCircle className="h-10 w-10 text-slate-900" strokeWidth={3} />
                </motion.div>
                <h3 className="mb-2 text-2xl font-black text-white">¡Gracias por tu compra!</h3>
                <p className="text-theme-secondary">Tu pedido se procesó correctamente y se envió por WhatsApp.</p>
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
            <AnimatePresence exitBeforeEnter>
                {currentStep === 1 && (
                    <motion.div
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
                    </motion.div>
                )}

                {currentStep === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <FormCard title="Dirección de Envío" icon={MapPin}>
                            {isAuthenticated && shippingAddresses.length > 0 && !useNewAddress ? (
                                <div className="space-y-4">
                                    <div className="grid gap-3">
                                        {shippingAddresses.map((a: Address) => (
                                            <button
                                                key={a.id}
                                                onClick={() => setSelectedAddressId(a.id)}
                                                className={cn(
                                                    "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                                                    selectedAddressId === a.id
                                                        ? "border-vape-500 bg-vape-500/10 text-white"
                                                        : "border-white/5 text-theme-secondary hover:bg-white/5"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-full border",
                                                    selectedAddressId === a.id ? "border-vape-400 bg-vape-400/20" : "border-white/10"
                                                )}>
                                                    <Building className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold uppercase tracking-widest text-vape-400">{a.label}</p>
                                                    <p className="text-[11px] text-theme-tertiary">{a.street} #{a.number}, {a.colony}</p>
                                                </div>
                                                {selectedAddressId === a.id && <CheckCircle className="h-5 w-5 text-vape-400" />}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setUseNewAddress(true)}
                                        className="text-xs font-bold text-vape-400 hover:text-vape-300 ml-2"
                                    >
                                        + Agregar nueva dirección
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Calle, número, colonia, código postal y referencias..."
                                            rows={4}
                                            className={cn(
                                                "w-full rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white transition-all focus:border-vape-500/50 focus:outline-none",
                                                errors.address && "border-red-500/50"
                                            )}
                                        />
                                        {errors.address && <p className="mt-2 text-[11px] text-red-500 ml-2">{errors.address}</p>}
                                    </div>
                                    {isAuthenticated && (
                                        <button
                                            onClick={() => setUseNewAddress(false)}
                                            className="text-xs font-bold text-theme-tertiary hover:text-white"
                                        >
                                            ← Volver a mis direcciones
                                        </button>
                                    )}
                                </div>
                            )}
                        </FormCard>
                    </motion.div>
                )}

                {currentStep === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Métodos de Pago */}
                        <FormCard title="Método de Pago" icon={CreditCard}>
                            <div className="grid gap-3">
                                {([
                                    { value: 'transfer', label: 'Transferencia / Depósito', icon: Building, disabled: !(settings?.payment_methods?.transfer ?? true) },
                                    ...(isAuthenticated ? [{ value: 'mercadopago', label: 'Tarjeta (Mercado Pago)', icon: CreditCard, disabled: !(settings?.payment_methods?.mercadopago ?? false) }] : []),
                                    { value: 'cash', label: 'Efectivo contra entrega', icon: Send, disabled: !(settings?.payment_methods?.cash ?? false) },
                                ] as { value: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }>; disabled: boolean }[]).filter(o => !o.disabled).map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFormData({ ...formData, paymentMethod: option.value })}
                                        className={cn(
                                            "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                                            formData.paymentMethod === option.value
                                                ? "border-vape-500 bg-vape-500/10 text-white"
                                                : "border-white/5 text-theme-tertiary flex-shrink-0"
                                        )}
                                    >
                                        <option.icon className={cn("h-5 w-5", formData.paymentMethod === option.value ? "text-vape-400" : "text-white/20")} />
                                        <span className="flex-1 text-xs font-bold uppercase tracking-widest">{option.label}</span>
                                        {formData.paymentMethod === option.value && <CheckCircle className="h-5 w-5 text-vape-400" />}
                                    </button>
                                ))}
                            </div>

                            {formData.paymentMethod === 'transfer' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <Award className="h-4 w-4 text-blue-400" />
                                        <span className="text-xs font-black uppercase text-blue-400 tracking-tighter">Cuenta Bancaria</span>
                                    </div>
                                    <pre className="text-[11px] font-mono text-theme-secondary whitespace-pre-wrap leading-relaxed">
                                        {settings?.bank_account_info || SITE_CONFIG.bankAccount}
                                    </pre>
                                </motion.div>
                            )}
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
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center text-xs font-bold text-herbal-400">
                                    ¡Cupón aplicado exitosamente! -{formatPrice(appliedCoupon.discount)}
                                </motion.p>
                            )}
                        </FormCard>

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
                    </motion.div>
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
                        disabled={sending || isValidating}
                        className={cn(
                            "group relative flex h-16 flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-herbal-500 font-bold transition-all shadow-xl shadow-herbal-500/20 hover:bg-herbal-400 active:scale-95",
                            (sending || isValidating) && "opacity-50 grayscale cursor-not-allowed"
                        )}
                    >
                        <AnimatePresence>
                            {sending ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Procesando</span>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                                    <Send className="h-5 w-5 text-slate-900" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                                        {formData.paymentMethod === 'mercadopago' ? 'Pagar Ahora' : 'Confirmar Pedido'}
                                    </span>
                                </motion.div>
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
