/**
 * // ─── COMPONENTE: WhatsAppSettings ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Card glassmorphism para la configuracion de WhatsApp y checkout.
 * // Regla / Notas: Props tipadas via SettingsFormData. Sin `any`. Tema verde (WhatsApp brand).
 */
import { MessageCircle, Phone } from 'lucide-react';
import type { SettingsFormData, SettingsChangeHandler } from './settings.types';

interface WhatsAppSettingsProps {
    formData: SettingsFormData;
    handleChange: SettingsChangeHandler;
}

/** Estilos reutilizables para inputs del modulo */
const INPUT_CLASS =
    'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition-colors focus:border-green-500/50 focus:bg-white/[0.07]';

export function WhatsAppSettings({ formData, handleChange }: WhatsAppSettingsProps) {
    return (
        <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 p-6 shadow-xl backdrop-blur-md transition-all hover:border-green-500/15 hover:shadow-green-500/5">
            {/* Orbe ambiental */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-500/8 blur-[80px] transition-all group-hover:bg-green-500/12" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <MessageCircle className="h-5 w-5 text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">WhatsApp & Checkout</h2>
                    <p className="text-xs text-theme-secondary/70">Canal principal de pedidos</p>
                </div>
            </div>

            {/* Fields */}
            <div className="relative z-10 space-y-4">
                <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-green-400/80">
                        <Phone className="h-3 w-3" />
                        Número (con lada, sin +)
                    </label>
                    <input
                        type="text"
                        name="whatsapp_number"
                        value={formData.whatsapp_number}
                        onChange={handleChange}
                        placeholder="Ej: 5212281234567"
                        className={INPUT_CLASS}
                    />
                    <p className="mt-1.5 text-[11px] text-theme-secondary/60">A este número llegarán los pedidos.</p>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-green-400/80">
                        Mensaje Predeterminado
                    </label>
                    <textarea
                        name="whatsapp_default_message"
                        value={formData.whatsapp_default_message}
                        onChange={handleChange}
                        rows={2}
                        className={`${INPUT_CLASS} resize-none`}
                    />
                </div>
            </div>
        </div>
    );
}
