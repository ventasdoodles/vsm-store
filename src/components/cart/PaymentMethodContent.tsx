import { Building, CreditCard, Send, CheckCircle, Award } from 'lucide-react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/config/site';
import type { PaymentMethod } from '@/types/cart';
import type { StoreSettings } from '@/services/settings.service';

interface PaymentMethodContentProps {
    isAuthenticated: boolean;
    settings: StoreSettings | null | undefined;
    paymentMethod: PaymentMethod;
    setPaymentMethod: (method: PaymentMethod) => void;
}

export function PaymentMethodContent({
    isAuthenticated,
    settings,
    paymentMethod,
    setPaymentMethod
}: PaymentMethodContentProps) {
    const paymentOptions = [
        { value: 'transfer', label: 'Transferencia / Depósito', icon: Building, disabled: !(settings?.payment_methods?.transfer ?? true) },
        ...(isAuthenticated ? [{ value: 'mercadopago', label: 'Tarjeta (Mercado Pago)', icon: CreditCard, disabled: !(settings?.payment_methods?.mercadopago ?? false) }] : []),
        { value: 'cash', label: 'Efectivo contra entrega', icon: Send, disabled: !(settings?.payment_methods?.cash ?? false) },
    ] as { value: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }>; disabled: boolean }[];

    return (
        <>
            <div className="grid gap-3">
                {paymentOptions.filter(o => !o.disabled).map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setPaymentMethod(option.value)}
                        className={cn(
                            "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                            paymentMethod === option.value
                                ? "border-vape-500 bg-vape-500/10 text-white"
                                : "border-white/5 text-theme-tertiary flex-shrink-0"
                        )}
                    >
                        <option.icon className={cn("h-5 w-5", paymentMethod === option.value ? "text-vape-400" : "text-white/20")} />
                        <span className="flex-1 text-xs font-bold uppercase tracking-widest">{option.label}</span>
                        {paymentMethod === option.value && <CheckCircle className="h-5 w-5 text-vape-400" />}
                    </button>
                ))}
            </div>

            {paymentMethod === 'transfer' && (
                <m.div
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
                </m.div>
            )}
        </>
    );
}
