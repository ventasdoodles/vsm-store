import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Loader2, Plus, Trash2, Settings2, Hash,
    Layers, ChevronRight, X, Save, Palette, Maximize, Droplets
} from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import {
    getAllAttributes, createAttribute, createAttributeValue,
    deleteAttribute, deleteAttributeValue
} from '@/services/admin';
import { cn } from '@/lib/utils';

export function AdminAttributes() {
    const queryClient = useQueryClient();
    const notify = useNotification();
    const [selectedAttrId, setSelectedAttrId] = useState<string | null>(null);
    const [isCreatingAttr, setIsCreatingAttr] = useState(false);
    const [newAttrName, setNewAttrName] = useState('');
    const [newValue, setNewValue] = useState('');

    // Load attributes
    const { data: attributes = [], isLoading } = useQuery({
        queryKey: ['admin-attributes'],
        queryFn: getAllAttributes
    });

    const selectedAttribute = attributes.find(a => a.id === selectedAttrId);

    // Mutations
    const createAttrMutation = useMutation({
        mutationFn: createAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            setIsCreatingAttr(false);
            setNewAttrName('');
            notify.success('Atributo creado', 'El nuevo atributo global está listo.');
        },
        onError: (e: Error) => notify.error('Error al crear', e.message)
    });

    const createValueMutation = useMutation({
        mutationFn: ({ id, val }: { id: string, val: string }) => createAttributeValue(id, val),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            setNewValue('');
            notify.success('Valor añadido', 'El valor se ha registrado correctamente.');
        },
        onError: (e: Error) => notify.error('Error al añadir', e.message)
    });

    const deleteAttrMutation = useMutation({
        mutationFn: deleteAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            setSelectedAttrId(null);
            notify.success('Atributo eliminado', 'El atributo global ha sido borrado.');
        },
        onError: (e: Error) => notify.error('Error al eliminar', e.message)
    });

    const deleteValueMutation = useMutation({
        mutationFn: deleteAttributeValue,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-attributes'] });
            notify.success('Valor eliminado', 'El valor ha sido borrado.');
        },
        onError: (e: Error) => notify.error('Error al eliminar valor', e.message)
    });

    const handleCreateAttr = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAttrName.trim()) return;
        createAttrMutation.mutate(newAttrName.trim());
    };

    const handleAddValue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAttrId || !newValue.trim()) return;
        createValueMutation.mutate({ id: selectedAttrId, val: newValue.trim() });
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
                <p className="text-white/40 animate-pulse">Cargando atributos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Atributos <span className="text-violet-500">Globales</span>
                    </h1>
                    <p className="mt-2 text-white/40 max-w-2xl">
                        Define las propiedades (color, tamaño, etc.) que podrán tener tus productos variables.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreatingAttr(true)}
                    className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/40 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Atributo
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Atributos List */}
                <div className="lg:col-span-5 space-y-4">
                    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30">
                        <Layers className="h-4 w-4" />
                        Lista de Propiedades
                    </h2>

                    <div className="space-y-3">
                        {isCreatingAttr && (
                            <form
                                onSubmit={handleCreateAttr}
                                className="group relative overflow-hidden rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 backdrop-blur-sm animate-in fade-in slide-in-from-top-1 px-4 duration-300"
                            >
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Nombre (ej: Concentración)"
                                        className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                                        value={newAttrName}
                                        onChange={(e) => setNewAttrName(e.target.value)}
                                    />
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => setIsCreatingAttr(false)} className="p-1 text-white/30 hover:text-white/50">
                                            <X className="h-5 w-5" />
                                        </button>
                                        <button type="submit" disabled={createAttrMutation.isPending} className="p-1 text-violet-400 hover:text-violet-300">
                                            {createAttrMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {attributes.map((attr) => (
                            <button
                                key={attr.id}
                                onClick={() => setSelectedAttrId(attr.id)}
                                className={cn(
                                    "group w-full relative flex items-center justify-between overflow-hidden rounded-[1.25rem] border p-4 transition-all duration-300",
                                    selectedAttrId === attr.id
                                        ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                                        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                                        selectedAttrId === attr.id ? "border-violet-500/30 bg-violet-500/20 text-violet-400" : "border-white/5 bg-white/5 text-white/40 group-hover:text-white/60"
                                    )}>
                                        {attr.name.toLowerCase().includes('color') ? <Palette className="h-5 w-5" /> :
                                            attr.name.toLowerCase().includes('capacidad') ? <Maximize className="h-5 w-5" /> :
                                                attr.name.toLowerCase().includes('concentracion') ? <Droplets className="h-5 w-5" /> :
                                                    <Settings2 className="h-5 w-5" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white tracking-wide">{attr.name}</p>
                                        <p className="text-[10px] text-white/30 uppercase font-black">
                                            {(attr.values?.length || 0)} valores disponibles
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`¿Seguro que quieres borrar el atributo "${attr.name}" y todos sus valores?`)) {
                                                deleteAttrMutation.mutate(attr.id);
                                            }
                                        }}
                                        className="p-2 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <ChevronRight className={cn("h-5 w-5 transition-transform", selectedAttrId === attr.id ? "translate-x-1 text-violet-400" : "text-white/10 group-hover:translate-x-0.5 group-hover:text-white/30")} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Valores List / Editor */}
                <div className="lg:col-span-7 space-y-4">
                    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30">
                        <Hash className="h-4 w-4" />
                        Valores del Atributo
                    </h2>

                    {selectedAttribute ? (
                        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl animate-in fade-in duration-500">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-white">{selectedAttribute.name}</h3>
                                    <p className="text-sm text-white/30">Gestiona los valores posibles para este atributo.</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddValue} className="mb-8 flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Nuevo valor (ej: 50mg, Rojo, XL...)"
                                    className="flex-1 rounded-2xl border border-white/5 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={createValueMutation.isPending || !newValue.trim()}
                                    className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-95 disabled:opacity-50"
                                >
                                    {createValueMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Añadir
                                </button>
                            </form>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {selectedAttribute.values?.map((val) => (
                                    <div
                                        key={val.id}
                                        className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition-all hover:border-white/10 hover:bg-white/10"
                                    >
                                        <span className="text-sm font-medium text-white/80">{val.value}</span>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Seguro que quieres borrar este valor?')) {
                                                    deleteValueMutation.mutate(val.id);
                                                }
                                            }}
                                            className="opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!selectedAttribute.values || selectedAttribute.values.length === 0) && (
                                    <div className="col-span-full py-12 text-center">
                                        <p className="text-white/20">No hay valores definidos aún.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-[400px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.01]">
                            <div className="rounded-full bg-white/5 p-4 mb-4">
                                <Settings2 className="h-8 w-8 text-white/20" />
                            </div>
                            <p className="text-white/20 font-medium">Selecciona una propiedad para ver sus valores.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
