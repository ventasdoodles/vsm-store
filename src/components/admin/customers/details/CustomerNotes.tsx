import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, FileText, Save, Plus, X, Trash2 } from 'lucide-react';
import { updateAdminCustomerNotes } from '@/services/admin';
import { useNotificationsStore } from '@/stores/notifications.store';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerNotes({ customer }: Props) {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationsStore();

    const [newTag, setNewTag] = useState('');
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (customer?.admin_notes?.notes) {
            setNotes(customer.admin_notes.notes);
        }
    }, [customer]);

    const updateMutation = useMutation({
        mutationFn: (data: { tags?: string[]; custom_fields?: Record<string, string>; notes?: string }) => updateAdminCustomerNotes(customer.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customer.id] });
            addNotification({ type: 'success', title: 'Guardado', message: 'Datos actualizados correctamente' });
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo guardar los cambios' });
        }
    });

    const handleAddTag = () => {
        if (!newTag.trim()) return;
        const currentTags = customer.admin_notes?.tags || [];
        if (currentTags.includes(newTag.trim())) return;

        updateMutation.mutate({ tags: [...currentTags, newTag.trim()] });
        setNewTag('');
    };

    const handleRemoveTag = (tag: string) => {
        const currentTags = customer.admin_notes?.tags || [];
        updateMutation.mutate({ tags: currentTags.filter(t => t !== tag) });
    };

    const handleAddField = () => {
        if (!newFieldKey.trim() || !newFieldValue.trim()) return;
        const currentFields = customer.admin_notes?.custom_fields || {};

        updateMutation.mutate({ custom_fields: { ...currentFields, [newFieldKey.trim()]: newFieldValue.trim() } });
        setNewFieldKey('');
        setNewFieldValue('');
    };

    const handleRemoveField = (key: string) => {
        const currentFields = { ...customer.admin_notes?.custom_fields };
        delete currentFields[key];
        updateMutation.mutate({ custom_fields: currentFields });
    };

    const handleSaveNotes = () => {
        updateMutation.mutate({ notes });
    };

    return (
        <div className="space-y-6">
            {/* Tags Section */}
            <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5">
                <h3 className="text-sm font-semibold text-vape-400 mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {customer.admin_notes?.tags?.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-theme-secondary/50 text-xs font-medium text-theme-primary border border-theme">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        placeholder="Nueva etiqueta (ej. VIP)..."
                        className="flex-1 bg-theme-primary/50 border border-theme rounded-lg px-3 py-1.5 text-sm text-theme-primary"
                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                    />
                    <button onClick={handleAddTag} className="bg-theme-secondary hover:bg-theme-secondary text-theme-primary p-1.5 rounded-lg"><Plus className="h-4 w-4" /></button>
                </div>
            </div>

            {/* Custom Fields Section */}
            <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5">
                <h3 className="text-sm font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Campos Personalizados
                </h3>
                <div className="space-y-3 mb-4">
                    {Object.entries(customer.admin_notes?.custom_fields || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-theme-primary/30 p-2 rounded-lg border border-theme/50">
                            <div className="text-sm">
                                <span className="text-theme-primary0 block text-xs">{key}</span>
                                <span className="text-theme-primary">{value as string}</span>
                            </div>
                            <button onClick={() => handleRemoveField(key)} className="text-primary-600 hover:text-red-400 p-1">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {Object.keys(customer.admin_notes?.custom_fields || {}).length === 0 && (
                        <div className="text-sm text-primary-600 italic">No hay campos personalizados</div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        value={newFieldKey}
                        onChange={e => setNewFieldKey(e.target.value)}
                        placeholder="Campo (ej. Sabor Favorito)"
                        className="bg-theme-primary/50 border border-theme rounded-lg px-3 py-1.5 text-sm text-theme-primary"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newFieldValue}
                            onChange={e => setNewFieldValue(e.target.value)}
                            placeholder="Valor (ej. Menta)"
                            className="flex-1 bg-theme-primary/50 border border-theme rounded-lg px-3 py-1.5 text-sm text-theme-primary"
                            onKeyDown={e => e.key === 'Enter' && handleAddField()}
                        />
                        <button onClick={handleAddField} className="bg-theme-secondary hover:bg-theme-secondary text-theme-primary p-1.5 rounded-lg"><Plus className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-theme-secondary">Notas Generales</h3>
                    <button onClick={handleSaveNotes} className="text-xs text-vape-400 hover:text-vape-300 flex items-center gap-1">
                        <Save className="h-3 w-3" /> Guardar
                    </button>
                </div>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-theme-primary/50 border border-theme rounded-lg p-3 text-sm text-theme-primary focus:border-vape-500 outline-none resize-none"
                    placeholder="Notas privadas sobre este cliente..."
                />
            </div>
        </div>
    );
}
