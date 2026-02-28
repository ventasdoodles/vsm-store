import { CreditCard } from 'lucide-react';

export function PaymentSettings({ formData, handleChange }: any) {
    return (
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-theme pb-4 mb-4">
                <div className="p-2 rounded-lg bg-accent-primary/10"><CreditCard className="h-6 w-6 text-accent-primary" /></div>
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
    );
}
