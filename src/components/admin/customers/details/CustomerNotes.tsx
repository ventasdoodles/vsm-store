/**
 * CustomerNotes — CRM Insights y Segmentación de Perfil
 * 
 * Bloque estilo Notion con:
 * - Libreta de notas con auto-guardado (debounce 1s)
 * - Etiquetas globales del cliente (tags)
 * - Propiedades key-value personalizadas (custom_fields)
 * Todas las operaciones se persisten en admin_customer_notes vía upsert.
 * 
 * @module admin/customers/details
 */
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, FileText, Plus, X, Trash2, Library, BookOpen } from 'lucide-react';
import { updateAdminCustomerNotes } from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';
import type { AdminCustomerDetail } from '@/services/admin';
import { useDebounce } from '@/hooks/useDebounce';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerNotes({ customer }: Props) {
    const queryClient = useQueryClient();
    const notify = useNotification();

    const [newTag, setNewTag] = useState('');
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [notes, setNotes] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (customer?.admin_notes?.notes !== undefined) {
            setNotes(customer.admin_notes.notes);
            setIsDirty(false);
        }
    }, [customer?.admin_notes?.notes]);

    const updateMutation = useMutation({
        mutationFn: (data: { tags?: string[]; custom_fields?: Record<string, string>; notes?: string }) => updateAdminCustomerNotes(customer.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customer.id] });
            setIsDirty(false);
        },
        onError: () => {
            notify.error('Fallo', 'No se pudo guardar los cambios. Revisa tu conexión.');
        }
    });

    const handleAddTag = () => {
        if (!newTag.trim()) return;
        const currentTags = customer.admin_notes?.tags || [];
        if (currentTags.includes(newTag.trim())) {
            setNewTag('');
            return;
        }

        updateMutation.mutate({ tags: [...currentTags, newTag.trim()] }, {
            onSuccess: () => {
                notify.success('Añadido', 'Etiqueta añadida exitosamente.');
                setNewTag('');
            }
        });
    };

    const handleRemoveTag = (tag: string) => {
        const currentTags = customer.admin_notes?.tags || [];
        updateMutation.mutate({ tags: currentTags.filter(t => t !== tag) });
    };

    const handleAddField = () => {
        if (!newFieldKey.trim() || !newFieldValue.trim()) return;
        const currentFields = customer.admin_notes?.custom_fields || {};

        updateMutation.mutate({ custom_fields: { ...currentFields, [newFieldKey.trim()]: newFieldValue.trim() } }, {
            onSuccess: () => {
                notify.success('Añadido', 'Propiedad añadida al perfil.');
                setNewFieldKey('');
                setNewFieldValue('');
            }
        });
    };

    const handleRemoveField = (key: string) => {
        const currentFields = { ...customer.admin_notes?.custom_fields };
        delete currentFields[key];
        updateMutation.mutate({ custom_fields: currentFields }, {
            onSuccess: () => notify.success('Eliminado', 'Propiedad eliminada.')
        });
    };

    const debouncedNotes = useDebounce(notes, 1000);

    // Auto-save notes feature like Notion
    // Only triggers on debounced value changes — other deps are stable refs/state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (isDirty && debouncedNotes !== customer?.admin_notes?.notes) {
            updateMutation.mutate({ notes: debouncedNotes });
        }
    }, [debouncedNotes]);

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl p-6 shadow-2xl flex flex-col">
            
            <div className="relative mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/5 border border-indigo-500/20 shadow-inner">
                    <Library className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">CRM Insights</h3>
                    <p className="text-xs text-theme-secondary/70">Anotaciones y segmentación de perfil</p>
                </div>
            </div>

            <div className="space-y-6 flex-1">
                {/* Auto-saving Notes Area (Notion style) */}
                <div className="flex flex-col relative group">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-theme-secondary/80 flex items-center gap-1.5 uppercase tracking-wider">
                            <BookOpen className="h-3.5 w-3.5" /> Libreta de Cliente
                        </label>
                        {updateMutation.isPending && isDirty && (
                            <span className="text-[10px] text-theme-secondary animate-pulse">Guardando...</span>
                        )}
                        {!updateMutation.isPending && !isDirty && notes && (
                            <span className="text-[10px] text-green-400">Sincronizado</span>
                        )}
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => {
                            setNotes(e.target.value);
                            setIsDirty(true);
                        }}
                        placeholder="Clic aquí para agregar notas de seguimiento libres. Modificaciones se guardan solas..."
                        className="w-full min-h-[120px] bg-transparent border border-transparent hover:border-white/5 focus:border-white/10 rounded-xl p-3 text-sm text-theme-secondary resize-none transition-colors outline-none focus:bg-white/[0.02]"
                    />
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* Tags Section */}
                <div>
                    <label className="text-xs font-bold text-theme-secondary/80 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                        <Tag className="h-3.5 w-3.5" /> Etiquetas Globales
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                        {customer.admin_notes?.tags?.map(tag => (
                            <span key={tag} className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a1c29] border border-white/5 text-xs font-medium text-theme-secondary hover:text-white hover:border-white/20 transition-colors shadow-sm">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="text-theme-secondary/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            placeholder="Añadir tag (ej. Whale, Conflictivo)..."
                            className="flex-1 bg-[#1a1c29] border border-white/5 focus:border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 transition-colors focus:outline-none"
                            onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                        />
                        <button onClick={handleAddTag} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1">
                            <Plus className="h-3.5 w-3.5" /> Tag
                        </button>
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full" />

                {/* Custom Fields Section */}
                <div>
                    <label className="text-xs font-bold text-theme-secondary/80 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                        <FileText className="h-3.5 w-3.5" /> Propiedades de Perfil (Key-Value)
                    </label>
                    
                    <div className="space-y-2 mb-3">
                        {Object.entries(customer.admin_notes?.custom_fields || {}).map(([key, value]) => (
                            <div key={key} className="group flex items-center justify-between bg-[#1a1c29]/50 hover:bg-[#1a1c29] p-2.5 rounded-lg border border-transparent hover:border-white/5 transition-colors">
                                <div className="flex items-center gap-4 text-xs font-mono">
                                    <span className="text-theme-secondary/50 w-24 truncate" title={key}>{key}</span>
                                    <span className="text-theme-secondary font-medium tracking-wide">{value as string}</span>
                                </div>
                                <button onClick={() => handleRemoveField(key)} className="text-red-400/50 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Clave (ej. Equipo)"
                            value={newFieldKey}
                            onChange={e => setNewFieldKey(e.target.value)}
                            className="w-1/3 bg-[#1a1c29] border border-white/5 focus:border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 transition-colors focus:outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Valor (ej. Dragones)"
                            value={newFieldValue}
                            onChange={e => setNewFieldValue(e.target.value)}
                            className="flex-1 bg-[#1a1c29] border border-white/5 focus:border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 transition-colors focus:outline-none"
                            onKeyDown={e => e.key === 'Enter' && handleAddField()}
                        />
                        <button onClick={handleAddField} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center">
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
