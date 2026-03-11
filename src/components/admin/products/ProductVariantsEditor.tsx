import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Trash2, RefreshCw, Layers,
    ChevronDown, Settings2, PackageCheck
} from 'lucide-react';
import { getAllAttributes } from '@/services/admin';
import type { ProductVariant } from '@/types/variant';
import { cn } from '@/lib/utils';

interface LocalVariant {
    id?: string;
    sku: string;
    price: number;
    stock: number;
    optionValueIds: string[];
    optionLabels: string[];
}

interface ProductVariantsEditorProps {
    existingVariants: ProductVariant[];
    onChange: (variants: LocalVariant[]) => void;
    basePrice: number;
    baseSku: string | null;
}

const INPUT_CLS = 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20';

interface LocalVariant {
    id?: string;
    sku: string;
    price: number;
    stock: number;
    optionValueIds: string[];
    optionLabels: string[];
}

interface ComboGroup {
    name?: string;
    values: { id: string; value: string }[];
}

export function ProductVariantsEditor({
    existingVariants,
    onChange,
    basePrice,
    baseSku
}: ProductVariantsEditorProps) {
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});
    const [variants, setVariants] = useState<LocalVariant[]>([]);

    // Cargar atributos globales
    const { data: globalAttributes = [] } = useQuery({
        queryKey: ['admin-attributes'],
        queryFn: getAllAttributes
    });

    // Cargar datos iniciales si existen variantes
    useEffect(() => {
        if (existingVariants && existingVariants.length > 0 && variants.length === 0) {
            setVariants(existingVariants.map(v => ({
                id: v.id,
                sku: v.sku || '',
                price: v.price || basePrice,
                stock: v.stock || 0,
                optionValueIds: v.options.map((opt) => opt.attribute_value_id),
                optionLabels: v.options.map((opt) => `${opt.attribute_name}: ${opt.attribute_value?.value}`)
            })));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingVariants, basePrice]);

    const handleToggleAttribute = (attrId: string) => {
        setSelectedAttributes(prev =>
            prev.includes(attrId) ? prev.filter(id => id !== attrId) : [...prev, attrId]
        );
    };

    const handleValueToggle = (attrId: string, valId: string) => {
        setSelectedValues(prev => {
            const current = prev[attrId] || [];
            const next = current.includes(valId) ? current.filter(id => id !== valId) : [...current, valId];
            return { ...prev, [attrId]: next };
        });
    };

    const generateMatrix = () => {
        if (selectedAttributes.length === 0) return;

        // 1. Obtener los atributos seleccionados y sus valores
        const comboGroups: ComboGroup[] = selectedAttributes.map(attrId => {
            const attr = globalAttributes.find(a => a.id === attrId);
            const vals = attr?.values?.filter(v => (selectedValues[attrId] || []).includes(v.id)) || [];
            return { name: attr?.name, values: vals };
        }).filter(g => g.values.length > 0);

        if (comboGroups.length === 0) return;

        // 2. Función recursiva para combinaciones (Cartesian Product)
        function cartesian(groups: ComboGroup[]) {
            return groups.reduce((a, b) =>
                a.flatMap((d) => b.values.map((e) => ({
                    optionValueIds: [...d.optionValueIds, e.id],
                    optionLabels: [...d.optionLabels, `${b.name}: ${e.value}`]
                })))
                , [{ optionValueIds: [] as string[], optionLabels: [] as string[] }]);
        }

        const combinations = cartesian(comboGroups);

        // 3. Crear las nuevas variantes con los datos base
        const newVariants: LocalVariant[] = combinations.map((combo, idx) => ({
            sku: baseSku ? `${baseSku}-${idx + 1}` : '',
            price: basePrice,
            stock: 0,
            optionValueIds: combo.optionValueIds,
            optionLabels: combo.optionLabels
        }));

        setVariants(newVariants);
        onChange(newVariants);
    };

    const updateVariant = (idx: number, field: keyof LocalVariant, value: string | number) => {
        const next = [...variants];
        next[idx] = { ...next[idx], [field]: value } as LocalVariant;
        setVariants(next);
        onChange(next);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* 1. Selector de Configuracion */}
            <div className="rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                            <Settings2 className="h-4 w-4 text-violet-400" />
                            Configurar Propiedades
                        </h4>
                        <p className="text-[11px] text-white/30 uppercase tracking-wider font-black mt-1">
                            Selecciona los atributos que definen este producto
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {globalAttributes.map(attr => (
                        <div key={attr.id} className="space-y-3">
                            <button
                                type="button"
                                onClick={() => handleToggleAttribute(attr.id)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-xl border p-3 transition-all",
                                    selectedAttributes.includes(attr.id) ? "border-violet-500/30 bg-violet-500/5 text-white" : "border-white/5 bg-white/5 text-white/40"
                                )}
                            >
                                <span className="text-xs font-bold uppercase tracking-tight">{attr.name}</span>
                                <ChevronDown className={cn("h-4 w-4 transition-transform", selectedAttributes.includes(attr.id) ? "rotate-180" : "")} />
                            </button>

                            {selectedAttributes.includes(attr.id) && (
                                <div className="ml-2 flex flex-wrap gap-2 animate-in fade-in zoom-in-95 duration-200">
                                    {attr.values?.map(val => (
                                        <button
                                            key={val.id}
                                            type="button"
                                            onClick={() => handleValueToggle(attr.id, val.id)}
                                            className={cn(
                                                "rounded-lg px-3 py-1.5 text-[11px] font-bold border transition-all",
                                                (selectedValues[attr.id] || []).includes(val.id)
                                                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                                                    : "border-white/5 bg-white/5 text-white/30 hover:border-white/10"
                                            )}
                                        >
                                            {val.value}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={generateMatrix}
                    disabled={selectedAttributes.length === 0}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600/20 py-3 text-xs font-bold text-violet-400 border border-violet-500/20 transition-all hover:bg-violet-600 hover:text-white disabled:opacity-30"
                >
                    <RefreshCw className="h-4 w-4" />
                    Generar Tabla de Variantes
                </button>
            </div>

            {/* 2. Tabla de Variantes */}
            {variants.length > 0 && (
                <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white/50 px-2 uppercase tracking-wide">
                        <Layers className="h-4 w-4" />
                        Matriz Resultante ({variants.length})
                    </h4>

                    <div className="space-y-3">
                        {variants.map((v, idx) => (
                            <div
                                key={idx}
                                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/10"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-[150px]">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-white/20">
                                            <PackageCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white tracking-tight">
                                                {v.optionLabels?.join(' / ') || 'Variación única'}
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="SKU"
                                                    className="bg-transparent text-[10px] text-white/30 outline-none w-24"
                                                    value={v.sku}
                                                    onChange={e => updateVariant(idx, 'sku', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-1 max-w-[300px]">
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Precio ($)</label>
                                            <input
                                                type="number"
                                                className={INPUT_CLS}
                                                value={v.price}
                                                onChange={e => updateVariant(idx, 'price', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-1">Stock</label>
                                            <input
                                                type="number"
                                                className={INPUT_CLS}
                                                value={v.stock}
                                                onChange={e => updateVariant(idx, 'stock', Number(e.target.value))}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = variants.filter((_, i) => i !== idx);
                                                setVariants(next);
                                                onChange(next);
                                            }}
                                            className="mt-5 p-2 text-white/10 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
