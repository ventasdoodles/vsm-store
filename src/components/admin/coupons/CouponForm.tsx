import { useState, useEffect } from 'react';
import { Save, X, Percent, DollarSign, Calendar, User, Ticket, Zap } from 'lucide-react';    
import { CustomerSelect } from '@/components/admin/CustomerSelect';
import type { CouponFormData } from '@/services/admin';
import { cn } from '@/lib/utils';

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
        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-[#181825] to-[#13141f] border border-fuchsia-500/20 shadow-[0_0_40px_rgba(168,85,247,0.1)] rounded-[2.5rem] p-6 md:p-10 mb-8 relative overflow-hidden group">                                                             
            {/* Background Gradients */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl">
                        <Zap className="h-6 w-6 text-fuchsia-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-theme-primary tracking-tight">
                            {initialData.code ? 'Editar Cupón' : 'Nuevo Cupón'}
                        </h2>
                        <p className="text-xs font-medium text-theme-secondary">Configura las reglas matemáticas de esta promoción.</p>
                    </div>
                </div>
                <button type="button" onClick={onCancel} className="p-2.5 hover:bg-white/5 rounded-2xl text-theme-secondary transition-colors">                                                 
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 relative z-10">
                {/* Columna Izquierda: Datos Básicos */}
                <div className="space-y-6">
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Código del Cupón *</label>                                                               
                        <div className="relative">
                            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fuchsia-500/50" />
                            <input
                                type="text"
                                required
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}                                                                                        
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-lg font-black text-fuchsia-400 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none font-mono tracking-widest placeholder:text-theme-secondary/20 placeholder:font-medium transition-all"                                                                                     
                                placeholder="EJ: VERANO20"
                            />
                        </div>
                    </div>

                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Descripción</label>                                                                      
                        <input
                            type="text"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}                                                                                               
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all placeholder:text-theme-secondary/30"                                                                                                         
                            placeholder="Para qué es este cupón..."
                        />
                    </div>

                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Tipo</label>                                                                
                                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">                                                                                       
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, discount_type: 'percentage' })}                                                                                               
                                        className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all", form.discount_type === 'percentage' ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20' : 'text-theme-secondary hover:text-white hover:bg-white/5')}                                                                      
                                    >
                                        <Percent className="h-4 w-4" /> %
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, discount_type: 'fixed' })}                                                                                                    
                                        className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all", form.discount_type === 'fixed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-theme-secondary hover:text-white hover:bg-white/5')}                                                                           
                                    >
                                        <DollarSign className="h-4 w-4" /> Fijo     
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Valor *</label>                                                                          
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step={form.discount_type === 'percentage' ? '1' : '0.01'}                                                                                                       
                                    value={form.discount_value}
                                    onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })}                                                                                    
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-lg font-black text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none tabular-nums"                                                                                                     
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Reglas y Límites */}
                <div className="space-y-6">
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Compra Mínima</label>                                                                    
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary/50" />
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.min_purchase}
                                        onChange={e => setForm({ ...form, min_purchase: Number(e.target.value) })}                                                                                      
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-bold text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none tabular-nums"                                                                                                     
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Límite de Usos</label>                                                                   
                                <input
                                    type="number"
                                    min="1"
                                    value={form.max_uses || ''}
                                    onChange={e => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })}                                                                  
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm font-bold text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none tabular-nums placeholder:text-theme-secondary/30 placeholder:font-medium"                                                                                                         
                                    placeholder="Ilimitado"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">                                                                     
                                    <Calendar className="h-3 w-3 text-blue-400" /> Desde   
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.valid_from ? new Date(form.valid_from).toISOString().slice(0, 16) : ''}                                                                             
                                    onChange={e => setForm({ ...form, valid_from: e.target.value ? new Date(e.target.value).toISOString() : null })}                                                
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none text-xs font-medium"                                                                                             
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">                                                                     
                                    <Calendar className="h-3 w-3 text-red-400" /> Hasta   
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.valid_until ? new Date(form.valid_until).toISOString().slice(0, 16) : ''}                                                                           
                                    onChange={e => setForm({ ...form, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null })}                                               
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none text-xs font-medium"                                                                                             
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-theme-secondary uppercase tracking-widest mb-3">                                                                     
                            <User className="h-3.5 w-3.5 text-indigo-400" /> Cliente Específico (Opcional)
                        </label>
                        <CustomerSelect
                            value={form.customer_id || ''}
                            onChange={(val) => setForm({ ...form, customer_id: val || null })}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Form */}
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-end gap-4 relative z-10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-theme-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !form.code || form.discount_value <= 0}
                    className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-black tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'GUARDANDO...' : 'GUARDAR CUPÓN'}
                </button>
            </div>
        </form>
    );
}

