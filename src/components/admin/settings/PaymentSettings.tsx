/**
 * // ─── COMPONENTE: PaymentSettings ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Card glassmorphism para metodos de pago con toggles visuales
 *    y seccion condicional de datos bancarios.
 * // Regla / Notas: Props tipadas. Sin `any`. Tema ambar/naranja (dinero). Full-width col-span-2.
 */
import { CreditCard, Building2, Banknote, Landmark } from 'lucide-react';
import type { SettingsFormData, SettingsChangeHandler } from './settings.types';

interface PaymentSettingsProps {
    formData: SettingsFormData;
    handleChange: SettingsChangeHandler;
}

/** Configuracion de cada metodo de pago */
const PAYMENT_METHODS = [
    {
        name: 'payment_transfer',
        key: 'transfer' as const,
        label: 'Transferencia / Depósito',
        desc: 'Pago manual con comprobante por WhatsApp.',
        icon: Building2,
        color: 'amber',
    },
    {
        name: 'payment_mercadopago',
        key: 'mercadopago' as const,
        label: 'Mercado Pago (Tarjetas)',
        desc: 'Requiere credenciales en Supabase.',
        icon: CreditCard,
        color: 'blue',
    },
    {
        name: 'payment_cash',
        key: 'cash' as const,
        label: 'Contra Entrega (Efectivo)',
        desc: 'Pago en efectivo al recibir.',
        icon: Banknote,
        color: 'green',
    },
] as const;

const TEXTAREA_CLASS =
    'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition-colors focus:border-amber-500/50 focus:bg-white/[0.07] font-mono resize-none';

export function PaymentSettings({ formData, handleChange }: PaymentSettingsProps) {
    return (
        <div className="group relative col-span-1 lg:col-span-2 overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 p-6 shadow-xl backdrop-blur-md transition-all hover:border-amber-500/15 hover:shadow-amber-500/5">
            {/* Orbes ambientales */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-amber-500/8 blur-[100px] transition-all group-hover:bg-amber-500/12" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-orange-500/6 blur-[80px]" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl border border-amber-500/20">
                    <CreditCard className="h-5 w-5 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">Métodos de Pago</h2>
                    <p className="text-xs text-theme-secondary/70">Habilita las formas de pago para tus clientes</p>
                </div>
            </div>

            {/* Payment Method Cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const isActive = formData.payment_methods[method.key];

                    return (
                        <label
                            key={method.name}
                            className={`
                                relative flex items-start gap-3 p-4 rounded-[1rem] border cursor-pointer
                                transition-all duration-200
                                ${isActive
                                    ? 'border-amber-500/30 bg-amber-500/5 shadow-lg shadow-amber-500/5'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                                }
                            `}
                        >
                            <input
                                type="checkbox"
                                name={method.name}
                                checked={isActive}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            {/* Custom checkbox */}
                            <div className={`
                                mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all
                                ${isActive
                                    ? 'border-amber-500/50 bg-amber-500/20'
                                    : 'border-white/20 bg-white/5'
                                }
                            `}>
                                {isActive && (
                                    <svg className="h-3 w-3 text-amber-400" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-white/40'} transition-colors`} />
                                    <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/60'} transition-colors`}>
                                        {method.label}
                                    </p>
                                </div>
                                <p className="text-[11px] text-theme-secondary/60 mt-1">{method.desc}</p>
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Bank info (conditional) */}
            {formData.payment_methods.transfer && (
                <div className="relative z-10 mt-5 rounded-[1rem] border border-amber-500/15 bg-amber-500/5 p-5 backdrop-blur-sm">
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                        <Landmark className="h-3.5 w-3.5" />
                        Datos Bancarios (para Transferencias)
                    </label>
                    <p className="text-[11px] text-theme-secondary/60 mb-3">
                        Se mostrará al cliente al finalizar su pedido.
                    </p>
                    <textarea
                        name="bank_account_info"
                        value={formData.bank_account_info || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder={`Banco: BBVA\nTitular: Juan Pérez\nCuenta: 1234567890\nCLABE: 012345678901234567`}
                        className={TEXTAREA_CLASS}
                    />
                </div>
            )}
        </div>
    );
}
