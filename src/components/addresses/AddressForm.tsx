// Formulario de dirección - VSM Store
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addressSchema, type AddressFormData } from '@/lib/domain/validations/address.schema';
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
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            type: 'shipping',
            label: 'Casa',
            full_name: '',
            street: '',
            number: '',
            colony: '',
            city: 'Xalapa',
            state: 'Veracruz',
            zip_code: '',
            phone: '',
            notes: '',
            is_default: false,
        },
    });

    const currentType = watch('type');
    const currentLabel = watch('label');
    const currentIsDefault = watch('is_default');

    useEffect(() => {
        if (address) {
            reset({
                type: address.type as 'shipping' | 'billing',
                label: address.label ?? 'Casa',
                full_name: address.full_name ?? '',
                street: address.street,
                number: address.number,
                colony: address.colony,
                city: address.city ?? 'Xalapa',
                state: address.state ?? 'Veracruz',
                zip_code: address.zip_code,
                phone: address.phone ?? '',
                notes: address.notes ?? '',
                is_default: address.is_default ?? false,
            });
        }
    }, [address, reset]);

    const handleFormSubmit = async (data: AddressFormData) => {
        await onSubmit({
            customer_id: customerId,
            ...data,
            phone: data.phone || undefined,
            notes: data.notes || undefined,
        });
    };

    const inputCls = 'w-full rounded-xl border border-theme bg-theme-secondary/20 px-3.5 py-2.5 text-sm text-theme-primary placeholder-theme-secondary/50 outline-none transition-all focus:border-vape-500 focus:ring-2 focus:ring-vape-500/20';
    const errorCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20';

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <h3 className="text-lg font-bold text-theme-primary mb-1">
                {address ? 'Editar dirección' : 'Nueva dirección'}
            </h3>

            {/* Tipo */}
            <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1.5">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                    {(['shipping', 'billing'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setValue('type', t)}
                            className={cn(
                                'rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                                currentType === t
                                    ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                    : 'border-theme text-theme-secondary hover:border-theme'
                            )}
                        >
                            {t === 'shipping' ? '📦 Envío' : '🧾 Facturación'}
                        </button>
                    ))}
                </div>
                {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
            </div>

            {/* Etiqueta */}
            <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1.5">Etiqueta</label>
                <div className="flex gap-2">
                    {LABELS.map((l) => (
                        <button
                            key={l}
                            type="button"
                            onClick={() => setValue('label', l)}
                            className={cn(
                                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                                currentLabel === l
                                    ? 'border-vape-500/50 bg-vape-500/10 text-vape-400'
                                    : 'border-theme text-theme-secondary hover:border-theme'
                            )}
                        >
                            {l}
                        </button>
                    ))}
                </div>
                {errors.label && <p className="mt-1 text-xs text-red-500">{errors.label.message}</p>}
            </div>

            {/* Nombre para envío */}
            <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1.5">Nombre (para envíos) *</label>
                <input
                    type="text"
                    {...register('full_name')}
                    placeholder="Juan Pérez"
                    className={cn(inputCls, errors.full_name && errorCls)}
                />
                {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            {/* Calle y número en grid */}
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-theme-secondary mb-1.5">Calle *</label>
                    <input
                        type="text"
                        {...register('street')}
                        placeholder="Av. Lázaro Cárdenas"
                        className={cn(inputCls, errors.street && errorCls)}
                    />
                    {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-theme-secondary mb-1.5">Número *</label>
                    <input
                        type="text"
                        {...register('number')}
                        placeholder="123"
                        className={cn(inputCls, errors.number && errorCls)}
                    />
                    {errors.number && <p className="mt-1 text-xs text-red-500">{errors.number.message}</p>}
                </div>
            </div>

            {/* Colonia */}
            <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1.5">Colonia *</label>
                <input
                    type="text"
                    {...register('colony')}
                    placeholder="Centro"
                    className={cn(inputCls, errors.colony && errorCls)}
                />
                {errors.colony && <p className="mt-1 text-xs text-red-500">{errors.colony.message}</p>}
            </div>

            {/* Ciudad, Estado, CP */}
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="block text-xs font-medium text-theme-secondary mb-1.5">Ciudad *</label>
                    <input
                        type="text"
                        {...register('city')}
                        className={cn(inputCls, errors.city && errorCls)}
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-theme-secondary mb-1.5">Estado *</label>
                    <input
                        type="text"
                        {...register('state')}
                        className={cn(inputCls, errors.state && errorCls)}
                    />
                    {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-theme-secondary mb-1.5">CP *</label>
                    <input
                        type="text"
                        {...register('zip_code')}
                        placeholder="91000"
                        className={cn(inputCls, errors.zip_code && errorCls)}
                    />
                    {errors.zip_code && <p className="mt-1 text-xs text-red-500">{errors.zip_code.message}</p>}
                </div>
            </div>

            {/* Teléfono */}
            <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1.5">Teléfono (10 dígitos)</label>
                <input
                    type="tel"
                    {...register('phone')}
                    placeholder="228 123 4567"
                    className={cn(inputCls, errors.phone && errorCls)}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Notas */}
            <div>
                <label className="block text-xs font-medium text-theme-secondary mb-1.5">Notas (opcional)</label>
                <textarea
                    {...register('notes')}
                    rows={2}
                    placeholder="Entre calles, referencia, etc."
                    className={cn(inputCls, 'resize-none', errors.notes && errorCls)}
                />
                {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>}
            </div>

            {/* Default checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                    type="checkbox"
                    {...register('is_default')}
                    className="h-4 w-4 rounded border-theme bg-theme-secondary/30 text-vape-500 focus:ring-vape-500/30"
                />
                <span className="text-xs text-theme-secondary">Establecer como predeterminada</span>
            </label>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-xl border border-theme py-3 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/20 transition-colors"
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
