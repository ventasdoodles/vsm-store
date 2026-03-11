import { useState, useEffect } from 'react';
import { LoyaltyTier } from '@/services/settings.service';
import { Edit2, Shield, TrendingUp, Star, Award, Zap, CheckCircle, Save, X } from 'lucide-react';

interface TierManagementProps {
    tiers: LoyaltyTier[];
    onSave: (updatedTiers: LoyaltyTier[]) => Promise<void>;
    isUpdating: boolean;
}

export function TierManagement({ tiers, onSave, isUpdating }: TierManagementProps) {
    const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
    const [localTiers, setLocalTiers] = useState<LoyaltyTier[]>(tiers);

    // Sync local state when props change (important for initial load)
    useEffect(() => {
        if (tiers && tiers.length > 0) {
            setLocalTiers(tiers);
        }
    }, [tiers]);

    const getIcon = (id: string) => {
        switch (id) {
            case 'bronze': return <Shield className="h-5 w-5" />;
            case 'silver': return <Star className="h-5 w-5" />;
            case 'gold': return <Award className="h-5 w-5" />;
            case 'platinum': return <Zap className="h-5 w-5" />;
            default: return <TrendingUp className="h-5 w-5" />;
        }
    };

    const handleEdit = (tier: LoyaltyTier) => {
        setEditingTier({ ...tier, benefits: [...tier.benefits] });
    };

    const handleSaveLocal = () => {
        if (!editingTier) return;
        const newTiers = localTiers.map(t => t.id === editingTier.id ? editingTier : t);
        setLocalTiers(newTiers);
        setEditingTier(null);
    };

    const handleGlobalSave = () => {
        onSave(localTiers);
    };

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-1.5 rounded-full bg-indigo-500" />
                    <h2 className="text-xl font-black text-theme-primary tracking-tight uppercase">Configuración de Tiers</h2>
                </div>
                {JSON.stringify(tiers) !== JSON.stringify(localTiers) && (
                    <button
                        onClick={handleGlobalSave}
                        disabled={isUpdating}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95"
                    >
                        {isUpdating ? <span className="animate-spin text-lg">◌</span> : <Save className="h-4 w-4" />}
                        PUBLICAR CAMBIOS DE TIERS
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {localTiers.map((tier) => (
                    <div
                        key={tier.id}
                        className="group relative bg-[#1c1d29]/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all duration-500 hover:border-white/10 hover:shadow-2xl overflow-hidden"
                    >
                        {/* Gradient Backdrop */}
                        <div
                            className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
                            style={{ backgroundColor: tier.color }}
                        />

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div
                                    className="p-2.5 rounded-2xl bg-white/5 vsm-border-subtle group-hover:scale-110 transition-transform duration-500"
                                    style={{ color: tier.color }}
                                >
                                    {getIcon(tier.id)}
                                </div>
                                <button
                                    onClick={() => handleEdit(tier)}
                                    className="p-2 rounded-xl bg-white/5 text-theme-tertiary hover:bg-white/10 hover:text-theme-primary transition-all"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-theme-primary uppercase tracking-tight">{tier.name}</h3>
                                <p className="text-[10px] text-theme-tertiary font-bold tracking-widest uppercase opacity-50">Gasto Min: ${tier.threshold.toLocaleString()}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold text-theme-secondary flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                                    Multiplicador: {tier.multiplier}x
                                </p>
                                <div className="space-y-1.5 pt-2">
                                    {tier.benefits.slice(0, 3).map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-2 text-[10px] text-theme-tertiary">
                                            <CheckCircle className="h-3 w-3 mt-0.5 text-indigo-400 shrink-0" />
                                            <span className="leading-tight">{benefit}</span>
                                        </div>
                                    ))}
                                    {tier.benefits.length > 3 && (
                                        <p className="text-[9px] text-indigo-400 font-bold pl-5">+ {tier.benefits.length - 3} beneficios más</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Modal Overlay */}
            {editingTier && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#13141f] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-black text-theme-primary tracking-tight">EDITAR NIVEL {editingTier.name.toUpperCase()}</h3>
                            <button onClick={() => setEditingTier(null)} className="text-theme-tertiary hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">Umbral de Gasto (Threshold)</label>
                                    <input
                                        type="number"
                                        value={editingTier.threshold}
                                        onChange={(e) => setEditingTier({ ...editingTier, threshold: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-theme-primary focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">Multiplicador de Puntos</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editingTier.multiplier}
                                        onChange={(e) => setEditingTier({ ...editingTier, multiplier: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-theme-primary focus:border-indigo-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">Beneficios del Nivel</label>
                                <div className="space-y-2">
                                    {editingTier.benefits.map((benefit, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={benefit}
                                                onChange={(e) => {
                                                    const newBenefits = [...editingTier.benefits];
                                                    newBenefits[i] = e.target.value;
                                                    setEditingTier({ ...editingTier, benefits: newBenefits });
                                                }}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-theme-primary focus:border-indigo-500 focus:outline-none transition-colors"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newBenefits = editingTier.benefits.filter((_, idx) => idx !== i);
                                                    setEditingTier({ ...editingTier, benefits: newBenefits });
                                                }}
                                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setEditingTier({ ...editingTier, benefits: [...editingTier.benefits, ''] })}
                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest py-2"
                                    >
                                        + Añadir beneficio
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                            <button
                                onClick={() => setEditingTier(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-black text-theme-tertiary hover:bg-white/5 transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleSaveLocal}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all active:scale-95"
                            >
                                ACTUALIZAR LOCALMENTE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
