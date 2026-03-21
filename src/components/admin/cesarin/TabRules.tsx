import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Target, AlertCircle, Pencil, Check, X } from 'lucide-react';
import { AIRule } from '@/types/cesarin';
import { cn } from '@/lib/utils';

// Operator-readable category labels
const CATEGORY_LABELS: Record<string, string> = {
    personalidad:  'Tono y personalidad',
    logistica:     'Logistica y envios',
    ventas:        'Ventas y comercio',
    integralidad:  'Legal y seguridad',
};

// Short contextual hint: when/what this category of rule applies to
const CATEGORY_HINTS: Record<string, string> = {
    personalidad:  'Aplica en cada respuesta. Define como habla y se comporta Cesarin.',
    logistica:     'Activa cuando el cliente pregunta sobre envios, devoluciones o tiempos.',
    ventas:        'Guia como Cesarin recomienda, compara y presenta productos.',
    integralidad:  'Restriccion legal o de seguridad. Siempre activa, no se omite.',
};

function categoryLabel(cat: string) {
    return CATEGORY_LABELS[cat] ?? cat;
}
function categoryHint(cat: string) {
    return CATEGORY_HINTS[cat] ?? 'Aplica segun el contexto de la conversacion.';
}

interface TabRulesProps {
    rules: AIRule[];
    isLoading: boolean;
    onToggle: (id: string, currentStatus: boolean) => void;
    onUpdate: (id: string, updates: { content: string; category: string }) => Promise<void>;
    newRule: { content: string; category: string };
    setNewRule: (rule: { content: string; category: string }) => void;
    onAdd: () => void;
}

export function TabRules({ rules, isLoading, onToggle, onUpdate, newRule, setNewRule, onAdd }: TabRulesProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [saving, setSaving] = useState(false);

    const startEdit = (rule: AIRule) => {
        setEditingId(rule.id);
        setEditContent(rule.content);
        setEditCategory(rule.category);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
        setEditCategory('');
    };

    const saveEdit = async (id: string) => {
        if (!editContent.trim()) return;
        setSaving(true);
        try {
            await onUpdate(id, { content: editContent.trim(), category: editCategory });
            setEditingId(null);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            key="rules"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-vape-400" />
                        Directrices activas
                    </h2>
                    <p className="text-sm text-theme-secondary">
                        Instrucciones que definen el comportamiento de Cesarin. Cada directriz esta activa o pausada en tiempo real.
                    </p>
                </div>
            </div>

            {/* New Rule Form */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Plus className="h-24 w-24 text-vape-400" />
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-vape-500/20 flex items-center justify-center">
                        <Plus className="h-5 w-5 text-vape-400" />
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Nueva directriz</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                        <textarea
                            value={newRule.content}
                            onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
                            placeholder="Ej: Si preguntan por CBD, mencionar solo a mayores de 18 con tono serio..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-vape-500/50 transition-all min-h-[100px] resize-none font-medium"
                        />
                    </div>
                    <div className="space-y-4">
                        <select
                            value={newRule.category}
                            onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl px-5 py-4 text-xs font-black text-vape-400 focus:outline-none transition-all cursor-pointer uppercase tracking-widest"
                        >
                            <option value="personalidad">Tono y personalidad</option>
                            <option value="logistica">Logistica y envios</option>
                            <option value="ventas">Ventas y comercio</option>
                            <option value="integralidad">Legal y seguridad</option>
                        </select>
                        <button
                            onClick={onAdd}
                            disabled={isLoading || !newRule.content.trim()}
                            className="w-full py-4 rounded-2xl bg-vape-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-vape-400 transition-all shadow-[0_10px_20px_rgba(168,85,247,0.2)] disabled:opacity-50"
                        >
                            Agregar directriz
                        </button>
                    </div>
                </div>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map((rule) => {
                    const isEditing = editingId === rule.id;
                    return (
                        <div
                            key={rule.id}
                            className={cn(
                                'p-6 rounded-[2rem] border transition-all duration-500',
                                rule.is_enabled
                                    ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                                    : 'bg-white/[0.01] border-transparent opacity-40 grayscale'
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {/* Toggle button */}
                                <button
                                    onClick={() => onToggle(rule.id, rule.is_enabled)}
                                    className={cn(
                                        'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-90',
                                        rule.is_enabled
                                            ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                            : 'bg-white/5 text-white/20'
                                    )}
                                    title={rule.is_enabled ? 'Pausar directriz' : 'Activar directriz'}
                                >
                                    <Target className="h-6 w-6" />
                                </button>

                                <div className="flex-1 min-w-0 space-y-3">
                                    {/* Category header row */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-vape-400 bg-vape-500/10 px-2 py-1 rounded-md">
                                                {categoryLabel(rule.category)}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <div className={cn('h-1.5 w-1.5 rounded-full', rule.is_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-white/20')} />
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                    {rule.is_enabled ? 'Activa' : 'Pausada'}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Edit button — only when not already editing */}
                                        {!isEditing && (
                                            <button
                                                onClick={() => startEdit(rule)}
                                                className="h-7 w-7 rounded-xl flex items-center justify-center text-white/20 hover:text-vape-400 hover:bg-vape-500/10 transition-all"
                                                title="Editar directriz"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Content — view or edit mode */}
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full bg-white/5 border border-vape-500/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-vape-500 resize-none min-h-[80px] font-medium"
                                                autoFocus
                                            />
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={editCategory}
                                                    onChange={(e) => setEditCategory(e.target.value)}
                                                    className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-vape-400 focus:outline-none cursor-pointer uppercase tracking-widest"
                                                >
                                                    <option value="personalidad">Tono y personalidad</option>
                                                    <option value="logistica">Logistica y envios</option>
                                                    <option value="ventas">Ventas y comercio</option>
                                                    <option value="integralidad">Legal y seguridad</option>
                                                </select>
                                                <button
                                                    onClick={() => saveEdit(rule.id)}
                                                    disabled={saving || !editContent.trim()}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vape-500 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-vape-400 transition-all"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    disabled={saving}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-white/80 leading-relaxed font-medium">{rule.content}</p>
                                            {/* Category hint — contextual layer */}
                                            <p className="text-[10px] text-white/25 leading-relaxed italic">
                                                {categoryHint(rule.category)}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {rules.length === 0 && (
                <div className="p-16 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01]">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/5">
                        <AlertCircle className="h-10 w-10 text-white/10" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-white font-black uppercase tracking-widest text-xs">Sin directrices configuradas</p>
                        <p className="text-theme-secondary text-sm max-w-sm mx-auto">
                            Cesarin respondera con su configuracion base. Agrega directrices para moldearlo a tu negocio.
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
