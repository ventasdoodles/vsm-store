// Formulario de dirección - VSM Store
import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Address, AddressData } from '@/services/addresses.service';

interface AddressFormProps {
    address?: Address | null;
    customerId: string;
    onSubmit: (data: AddressData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const LABELS = ['Casa', 'Oficina', 'Otro'];

export function AddressForm({ address, customerId, onSubmit, onCancel, loading }: AddressFormProps) {
    const [type, setType] = useState<'shipping' | 'billing'>(address?.type ?? 'shipping');
    const [label, setLabel] = useState(address?.label ?? 'Casa');
    const [fullName, setFullName] = useState(address?.full_name ?? '');
    const [street, setStreet] = useState(address?.street ?? '');
    const [number, setNumber] = useState(address?.number ?? '');
    const [colony, setColony] = useState(address?.colony ?? '');
    const [city, setCity] = useState(address?.city ?? 'Xalapa');
    const [state, setState] = useState(address?.state ?? 'Veracruz');
    const [zipCode, setZipCode] = useState(address?.zip_code ?? '');
    const [phone, setPhone] = useState(address?.phone ?? '');
    const [notes, setNotes] = useState(address?.notes ?? '');
    const [isDefault, setIsDefault] = useState(address?.is_default ?? false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (address) {
            setType(address.type as 'shipping' | 'billing');
            setLabel(address.label ?? 'Casa');
            setFullName(address.full_name ?? '');
            setStreet(address.street);
            setNumber(address.number);
            setColony(address.colony);
            setCity(address.city ?? 'Xalapa');
            setState(address.state ?? 'Veracruz');
            setZipCode(address.zip_code);
            setPhone(address.phone ?? '');
            setNotes(address.notes ?? '');
            setIsDefault(address.is_default ?? false);
        }
    }, [address]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!street.trim() || !number.trim() || !colony.trim() || !zipCode.trim()) {
            setError('Completa los campos requeridos: calle, número, colonia y CP');
            return;
        }

        await onSubmit({
            customer_id: customerId,
            type,
            label,
            full_name: fullName,
            street,
            number,
            colony,
            city,
            state,
            zip_code: zipCode,
            phone: phone || undefined,
            notes: notes || undefined,
            is_default: isDefault,
        });
    };

    const inputCls = 'w-full rounded-xl border border-primary-800 bg-primary-900/50 px-3.5 py-2.5 text-sm text-primary-200 placeholder-primary-600 outline-none transition-all focus:border-vape-500 focus:ring-2 focus:ring-vape-500/20';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-bold text-primary-100 mb-1">
                {address ? 'Editar dirección' : 'Nueva dirección'}
            </h3>

            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Tipo */}
            <div>
                <label className="block text-xs font-medium text-primary-400 mb-1.5">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['shipping', 'billing'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={cn(
                                'rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                                type === t
                                    ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                    : 'border-primary-800 text-primary-500 hover:border-primary-700'
                            )}
                        >
                            {t === 'shipping' ? '📦 Envío' : '🧾 Facturación'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Etiqueta */}
            <div>
                <label className="block text-xs font-medium text-primary-400 mb-1.5">Etiqueta</label>
                <div className="flex gap-2">
                    {LABELS.map((l) => (
                        <button
                            key={l}
                            type="button"
                            onClick={() => setLabel(l)}
                            className={cn(
                                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                                label === l
                                    ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                    : 'border-primary-800 text-primary-500 hover:border-primary-700'
                            )}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Nombre para envío */}
            <div>
                <label className="block text-xs font-medium text-primary-400 mb-1.5">Nombre (para envíos)</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Pérez" className={inputCls} />
            </div>

            {/* Calle y número en grid */}
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-primary-400 mb-1.5">Calle *</label>
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Av. Lázaro Cárdenas" className={inputCls} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-primary-400 mb-1.5">Número *</label>
                    <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123" className={inputCls} />
                </div>
            </div>

            {/* Colonia */}
            <div>
                <label className="block text-xs font-medium text-primary-400 mb-1.5">Colonia *</label>
                <input type="text" value={colony} onChange={(e) => setColony(e.target.value)} placeholder="Centro" className={inputCls} />
            </div>

            {/* Ciudad, Estado, CP */}
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-xs font-medium text-primary-400 mb-1.5">Ciudad</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-primary-400 mb-1.5">Estado</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputCls} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-primary-400 mb-1.5">CP *</label>
                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="91000" className={inputCls} />
                </div>
            </div>

            {/* Teléfono */}
            <div>
                <label className="block text-xs font-medium text-primary-400 mb-1.5">Teléfono</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="228 123 4567" className={inputCls} />
            </div>

            {/* Notas */}
            <div>
                <label className="block text-xs font-medium text-primary-400 mb-1.5">Notas (opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Entre calles, referencia, etc." className={cn(inputCls, 'resize-none')} />
            </div>

            {/* Default checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-primary-700 bg-primary-900 text-vape-500 focus:ring-vape-500/30"
                />
                <span className="text-xs text-primary-400">Establecer como predeterminada</span>
            </label>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-xl border border-primary-800 py-3 text-sm font-medium text-primary-400 hover:bg-primary-800 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all',
                        'bg-vape-500 hover:bg-vape-600 shadow-lg shadow-vape-500/25',
                        'disabled:opacity-60 disabled:cursor-not-allowed'
                    )}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
}
