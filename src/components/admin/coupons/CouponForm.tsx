import { useState, useEffect } from 'react';
import { Save, X, Percent, DollarSign, Calendar, User } from 'lucide-react';
import { CustomerSelect } from '@/components/admin/CustomerSelect';
import type { CouponFormData } from '@/services/admin';

interface Props {
    initialData: CouponFormData;
    onSubmit: (data: CouponFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function CouponForm({ initialData, onSubmit, onCancel, isSubmitting }: Props) {
    const [form, setForm] = useState<CouponFormData>(initialData);

    useEffect(() => {
        setForm(initialData);
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-theme-primary/20 border border-theme rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                    {initialData.code ? 'Editar Cupón' : 'Nuevo Cupón'}
                </h2>
                <button type="button" onClick={onCancel} className="p-2 hover:bg-theme-primary/50 rounded-xl text-theme-secondary">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Columna Izquierda: Datos Básicos */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-1">Código del Cupón *</label>
                        <input
                            type="text"
                            required
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-theme-primary focus:border-vape-500 outline-none font-mono uppercase"
                            placeholder="EJ: VERANO20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-1">Descripción</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-theme-primary focus:border-vape-500 outline-none"
                            placeholder="Para qué es este cupón..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-1">Tipo de Descuento</label>
                            <div className="flex bg-theme-primary/50 border border-theme rounded-xl p-1">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, discount_type: 'percentage' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.discount_type === 'percentage' ? 'bg-theme-secondary text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}
                                >
                                    <Percent className="h-4 w-4" /> %
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, discount_type: 'fixed' })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.discount_type === 'fixed' ? 'bg-theme-secondary text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}
                                >
                                    <DollarSign className="h-4 w-4" /> Fijo
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-1">Valor *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step={form.discount_type === 'percentage' ? '1' : '0.01'}
                                value={form.discount_value}
                                onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })}
                                className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-theme-primary focus:border-vape-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Reglas y Límites */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-1">Compra Mínima</label>
                            <input
                                type="number"
                                min="0"
                                value={form.min_purchase}
                                onChange={e => setForm({ ...form, min_purchase: Number(e.target.value) })}
                                className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-theme-primary focus:border-vape-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-1">Límite de Usos</label>
                            <input
                                type="number"
                                min="1"
                                value={form.max_uses || ''}
                                onChange={e => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })}
                                className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-theme-primary focus:border-vape-500 outline-none"
                                placeholder="Ilimitado"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Válido Desde
                            </label>
                            <input
                                type="datetime-local"
                                value={form.valid_from ? new Date(form.valid_from).toISOString().slice(0, 16) : ''}
                                onChange={e => setForm({ ...form, valid_from: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-theme-primary focus:border-vape-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Válido Hasta
                            </label>
                            <input
                                type="datetime-local"
                                value={form.valid_until ? new Date(form.valid_until).toISOString().slice(0, 16) : ''}
                                onChange={e => setForm({ ...form, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="w-full bg-theme-primary/50 border border-theme rounded-xl px-4 py-2.5 text-theme-primary focus:border-vape-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-1 flex items-center gap-1">
                            <User className="h-3 w-3" /> Cliente Específico (Opcional)
                        </label>
                        <CustomerSelect
                            value={form.customer_id || ''}
                            onChange={(val) => setForm({ ...form, customer_id: val || null })}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-theme">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl font-medium text-theme-secondary hover:bg-theme-primary/50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl font-bold bg-theme-secondary text-theme-primary hover:bg-theme-secondary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Save className="h-5 w-5" />
                    {isSubmitting ? 'Guardando...' : 'Guardar Cupón'}
                </button>
            </div>
        </form>
    );
}
