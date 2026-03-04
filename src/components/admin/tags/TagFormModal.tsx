/**
 * // ─── COMPONENTE: TagFormModal ───
 * // Arquitectura: Dumb Component (Controlled Modal)
 * // Propósito principal: Modal para crear y editar etiquetas.
 * // Regla / Notas: Patrón homogenizado con BrandsFormModal. Autogenera slug desde label.
 */
import { useState, useEffect } from 'react';
import { X, Loader2, Hash, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface TagFormData {
    label: string;
    name: string;
}

interface TagFormModalProps {
    isOpen: boolean;
    editingName: string | null;
    form: TagFormData;
    setForm: (form: TagFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isPending: boolean;
}

function slugify(val: string): string {
    return val
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

export function TagFormModal({
    isOpen,
    editingName,
    form,
    setForm,
    onSubmit,
    onCancel,
    isPending,
}: TagFormModalProps) {
    const [autoSlug, setAutoSlug] = useState(true);
    const isEditing = editingName !== null;

    // Auto-slug cuando cambia el label (solo si autoSlug está activo)
    useEffect(() => {
        if (autoSlug && !isEditing) {
            setForm({ ...form, name: slugify(form.label) });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.label, autoSlug, isEditing]);

    const handleLabelChange = (val: string) => {
        setForm({ ...form, label: val });
    };

    const handleNameChange = (val: string) => {
        setAutoSlug(false);
        setForm({ ...form, name: slugify(val) });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && form.label.trim() && form.name.trim()) {
            e.preventDefault();
            onSubmit();
        }
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onCancel();
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#181825]/95 p-6 shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-accent-primary/10 ring-1 ring-inset ring-accent-primary/20">
                                    <Tag className="h-5 w-5 text-accent-primary" />
                                </div>
                                <h2 className="text-lg font-black text-white tracking-tight">
                                    {isEditing ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
                                </h2>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-2 rounded-xl text-theme-secondary hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Label */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-theme-secondary/70 mb-1.5">
                                    Nombre visible
                                </label>
                                <input
                                    type="text"
                                    value={form.label}
                                    onChange={(e) => handleLabelChange(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ej. Base Libre"
                                    autoFocus
                                    disabled={isPending}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white placeholder-theme-secondary/30 focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-theme-secondary/70 mb-1.5">
                                    Slug (identificador)
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-primary/50" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="auto-generado"
                                        disabled={isPending || isEditing}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm font-mono text-accent-primary/80 placeholder-theme-secondary/30 focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 focus:outline-none transition-all disabled:opacity-50"
                                    />
                                </div>
                                {!isEditing && (
                                    <p className="mt-1 text-[10px] text-theme-secondary/50">
                                        {autoSlug ? 'Auto-generado desde el nombre' : 'Personalizado'}
                                    </p>
                                )}
                                {isEditing && (
                                    <p className="mt-1 text-[10px] text-theme-secondary/50">
                                        El slug se actualiza automáticamente al renombrar
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                            <button
                                onClick={onCancel}
                                disabled={isPending}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-theme-secondary hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onSubmit}
                                disabled={isPending || !form.label.trim() || !form.name.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-black text-sm font-black hover:bg-accent-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isEditing ? 'Guardar Cambios' : 'Crear Etiqueta'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
