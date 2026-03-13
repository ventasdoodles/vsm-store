import { useState, useEffect } from 'react';
import { 
    Save, X, Percent, DollarSign, Calendar, 
    User, Ticket, Zap, Sparkles, Loader2, TrendingUp 
} from 'lucide-react';    
import { CustomerSelect } from '@/components/admin/CustomerSelect';
import { generateCouponMagic, forecastCouponImpact, type CouponFormData } from '@/services/admin';
import { cn } from '@/lib/utils';

interface Props {
    initialData: CouponFormData;
    onSubmit: (data: CouponFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function CouponForm({ initialData, onSubmit, onCancel, isSubmitting }: Props) {                                                                              
    const [form, setForm] = useState<CouponFormData>(initialData);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isForecasting, setIsForecasting] = useState(false);
    const [forecast, setForecast] = useState<{ reach: number; potential_revenue: number; recommendation: string } | null>(null);

    const [localNumbers, setLocalNumbers] = useState({
        discount_value: initialData.discount_value === 0 ? '' : initialData.discount_value.toString(),
        min_purchase: initialData.min_purchase === 0 ? '' : initialData.min_purchase.toString(),
        max_uses: initialData.max_uses?.toString() || ''
    });

    useEffect(() => {
        setForm(initialData);
        setLocalNumbers({
            discount_value: initialData.discount_value === 0 ? '' : initialData.discount_value.toString(),
            min_purchase: initialData.min_purchase === 0 ? '' : initialData.min_purchase.toString(),
            max_uses: initialData.max_uses?.toString() || ''
        });
    }, [initialData]);

    const handleMagicGen = async (goal: 'conversion' | 'retention' | 'clearance') => {
        setIsGenerating(true);
        try {
            const result = await generateCouponMagic(goal);
            setForm(prev => ({
                ...prev,
                code: result.code,
                discount_value: result.discount_value,
                description: result.description
            }));
            setLocalNumbers(prev => ({
                ...prev,
                discount_value: result.discount_value.toString()
            }));
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Error in Magic Coupon:', error);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleForecast = async () => {
        setIsForecasting(true);
        try {
            const result = await forecastCouponImpact(form);
            setForecast(result);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Error in Forecast:', error);
            }
        } finally {
            setIsForecasting(false);
        }
    };

    const addDays = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        setForm(prev => ({ ...prev, valid_until: d.toISOString() }));
    };

    const clearDate = (field: 'valid_from' | 'valid_until') => {
        setForm(prev => ({ ...prev, [field]: null }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final sanitization: Ensure no NaNs or invalid numbers are sent
        const sanitizedData = {
            ...form,
            discount_value: Number(localNumbers.discount_value) || 0,
            min_purchase: Number(localNumbers.min_purchase) || 0,
            max_uses: localNumbers.max_uses ? Number(localNumbers.max_uses) : null
        };
        
        onSubmit(sanitizedData);
    };

    // Helper for number inputs to keep string state (allow decimals, avoid 0 sticking)
    const handleLocalNumberChange = (field: keyof typeof localNumbers, value: string) => {
        // Allow numeric and decimal characters only
        let cleaned = value.replace(/[^0-9.]/g, '');
        
        // Prevent multiple dots
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
        }
        
        setLocalNumbers(prev => ({ ...prev, [field]: cleaned }));
        
        // Sync with form state for calculations/validation
        const num = parseFloat(cleaned);
        setForm(prev => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
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
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 transition-all focus-within:border-fuchsia-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest">Código del Cupón *</label>                                                               
                            <div className="flex gap-2">
                                {(['conversion', 'retention'] as const).map(goal => (
                                    <button
                                        key={goal}
                                        type="button"
                                        onClick={() => handleMagicGen(goal)}
                                        disabled={isGenerating}
                                        className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400 bg-fuchsia-400/10 px-2 py-1 rounded-lg border border-fuchsia-400/20 hover:bg-fuchsia-400/20 transition-all disabled:opacity-50"
                                    >
                                        {goal === 'conversion' ? '⚡ Venta' : '💎 Lealtad'}
                                    </button>
                                ))}
                            </div>
                        </div>
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
                            {isGenerating && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-5 w-5 text-fuchsia-400 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 transition-all focus-within:border-fuchsia-500/30">
                        <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Descripción</label>                                                                      
                        <input
                            type="text"
                            value={form.description || ''}
                            onChange={e => setForm({ ...form, description: e.target.value })}                                                                                               
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm font-medium text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all placeholder:text-theme-secondary/30"                                                                                                         
                            placeholder="Para qué es este cupón..."
                        />
                    </div>

                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 transition-all focus-within:border-fuchsia-500/30">
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
                                    type="text"
                                    inputMode="decimal"
                                    required
                                    value={localNumbers.discount_value}
                                    placeholder="0"
                                    onChange={e => handleLocalNumberChange('discount_value', e.target.value)}                                                                                    
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-lg font-black text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none tabular-nums transition-all"                                                                                                     
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Reglas y Límites */}
                <div className="space-y-6">
                    {/* Forecast Section */}
                    <div className="group relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-indigo-500/5 p-6 backdrop-blur-md transition-all hover:bg-indigo-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Marketing Forecaster</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleForecast}
                                disabled={isForecasting || form.discount_value <= 0}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all disabled:opacity-50"
                            >
                                {isForecasting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                Predecir Impacto
                            </button>
                        </div>
                        
                        {forecast ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Alcance Estimado</p>
                                        <p className="text-sm font-black text-white">{forecast.reach} clientes</p>
                                    </div>
                                    <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-1">Rev. Potencial</p>
                                        <p className="text-sm font-black text-emerald-400">${forecast.potential_revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed italic">"{forecast.recommendation}"</p>
                            </div>
                        ) : (
                            <p className="text-[10px] text-white/30 font-medium italic">Configura un cupón para ver el impacto estimado en ventas y retención.</p>
                        )}
                    </div>

                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 transition-all focus-within:border-fuchsia-500/30">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Compra Mínima</label>                                                                    
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary/50" />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0"
                                        value={localNumbers.min_purchase}
                                        onChange={e => handleLocalNumberChange('min_purchase', e.target.value)}                                                                                      
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-bold text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none tabular-nums transition-all"                                                                                                     
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-theme-secondary uppercase tracking-widest mb-2">Límite de Usos</label>                                                                   
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={localNumbers.max_uses}
                                    onChange={e => handleLocalNumberChange('max_uses', e.target.value)}                                                                  
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm font-bold text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none tabular-nums placeholder:text-theme-secondary/30 placeholder:font-medium transition-all"                                                                                                         
                                    placeholder="Ilimitado"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 transition-all focus-within:border-fuchsia-500/30">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-theme-secondary uppercase tracking-widest">                                                                     
                                        <Calendar className="h-3 w-3 text-blue-400" /> Desde   
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={() => clearDate('valid_from')}
                                        className="text-[9px] font-bold text-red-400/50 hover:text-red-400 uppercase"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                                <input
                                    type="datetime-local"
                                    value={form.valid_from ? new Date(form.valid_from).toISOString().slice(0, 16) : ''}                                                                             
                                    onChange={e => setForm({ ...form, valid_from: e.target.value ? new Date(e.target.value).toISOString() : null })}                                                
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none text-xs font-medium transition-all"                                                                                             
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-theme-secondary uppercase tracking-widest">                                                                     
                                        <Calendar className="h-3 w-3 text-red-400" /> Hasta   
                                    </label>
                                    <div className="flex gap-1.5">
                                        <button 
                                            type="button" 
                                            onClick={() => addDays(7)} 
                                            className="text-[8px] font-black bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded border border-white/5"
                                        >
                                            +7d
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => addDays(30)} 
                                            className="text-[8px] font-black bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded border border-white/5"
                                        >
                                            +30d
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => clearDate('valid_until')}
                                            className="text-[9px] font-bold text-red-400/50 hover:text-red-400 uppercase ml-1"
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="datetime-local"
                                    value={form.valid_until ? new Date(form.valid_until).toISOString().slice(0, 16) : ''}                                                                           
                                    onChange={e => setForm({ ...form, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null })}                                               
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-theme-primary focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none text-xs font-medium transition-all"                                                                                             
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

