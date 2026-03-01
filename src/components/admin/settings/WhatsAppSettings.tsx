import { Smartphone } from 'lucide-react';

export function WhatsAppSettings({ formData, handleChange }: any) {
    return (
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
                <p className="mt-1 text-xs text-theme-secondary">A este número llegarán los pedidos.</p>
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
    );
}
