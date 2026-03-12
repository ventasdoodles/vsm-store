/**
 * // ─── COMPONENTE: ADDRESS FORM ───
 * // Propósito: Formulario cinemático para la gestión de direcciones.
 * // Arquitectura: Pure presentation with React Hook Form integration (§1.1).
 * // Estilo: Premium Floating Label Forms (§2.1).
 */
import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
    X, 
    Loader2, 
    Save, 
    MapPin, 
    User, 
    Phone, 
    Building, 
    Hash, 
    Navigation,
    Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Address, AddressData } from '@/services/addresses.service';

interface AddressFormProps {
    address?: Address | null;
    customerId: string;
    onSubmit: (data: AddressData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export function AddressForm({ address, customerId, onSubmit, onCancel, loading }: AddressFormProps) {
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AddressData>({
        defaultValues: address || {
            customer_id: customerId,
            type: 'shipping',
            label: '',
            full_name: '',
            phone: '',
            street: '',
            number: '',
            colony: '',
            city: '',
            state: '',
            zip_code: '',
            references: '',
            is_default: false,
        },
    });

    const isShipping = watch('type') === 'shipping';

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header del Formulario */}
            <div className="flex items-center justify-between group/header">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {address ? 'Refinar Dirección' : 'Nueva Ubicación'}
                    </h3>
                    <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest opacity-60 mt-1">
                        Define los parámetros de tu punto de entrega
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-theme-secondary hover:bg-white/10 hover:text-white transition-all group-hover/header:rotate-90 duration-500"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="grid gap-6">
                {/* Selector de Tipo (Shipping/Billing) */}
                <div className="grid grid-cols-2 gap-4 p-1.5 rounded-[2rem] bg-black/40 border border-white/5 relative overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setValue('type', 'shipping')}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-3 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                            isShipping ? "text-white" : "text-theme-tertiary hover:text-white"
                        )}
                    >
                        {isShipping && <motion.div layoutId="addr-type-bg" className="absolute inset-0 bg-accent-primary rounded-[1.75rem] -z-10 shadow-xl shadow-accent-primary/20" />}
                        <MapPin className={cn("h-4 w-4", isShipping ? "text-white" : "text-theme-tertiary")} />
                        Envío
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue('type', 'billing')}
                        className={cn(
                            "relative z-10 flex items-center justify-center gap-3 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                            !isShipping ? "text-white" : "text-theme-tertiary hover:text-white"
                        )}
                    >
                        {!isShipping && <motion.div layoutId="addr-type-bg" className="absolute inset-0 bg-herbal-500 rounded-[1.75rem] -z-10 shadow-xl shadow-herbal-500/20" />}
                        <Building className={cn("h-4 w-4", !isShipping ? "text-white" : "text-theme-tertiary")} />
                        Facturación
                    </button>
                </div>

                {/* Grid Responsivo de Inputs */}
                <div className="grid sm:grid-cols-2 gap-6">
                    {/* Etiqueta (Lugar) */}
                    <div className="sm:col-span-1">
                         <FloatingInput
                            id="label"
                            label="Etiqueta (Ej: Casa, Oficina)"
                            icon={<Hash size={16} />}
                            {...register('label', { required: 'La etiqueta es requerida' })}
                            error={errors.label?.message}
                         />
                    </div>

                    {/* Nombre Completo */}
                    <div className="sm:col-span-1">
                         <FloatingInput
                            id="full_name"
                            label="Nombre Completo"
                            icon={<User size={16} />}
                            {...register('full_name', { required: 'El nombre es requerido' })}
                            error={errors.full_name?.message}
                         />
                    </div>

                    {/* Teléfono */}
                    <div className="sm:col-span-2">
                         <FloatingInput
                            id="phone"
                            label="Teléfono de Contacto"
                            icon={<Phone size={16} />}
                            {...register('phone', { required: 'El teléfono es requerido' })}
                            error={errors.phone?.message}
                         />
                    </div>

                    {/* Calle */}
                    <div className="sm:col-span-1">
                         <FloatingInput
                            id="street"
                            label="Calle / Avenida"
                            icon={<Navigation size={16} />}
                            {...register('street', { required: 'La calle es requerida' })}
                            error={errors.street?.message}
                         />
                    </div>

                    {/* Número */}
                    <div className="sm:col-span-1">
                         <FloatingInput
                            id="number"
                            label="Número Ext"
                            icon={<Hash size={16} />}
                            {...register('number', { required: 'El número es requerido' })}
                            error={errors.number?.message}
                         />
                    </div>

                    {/* Colonia */}
                    <div className="sm:col-span-2">
                         <FloatingInput
                            id="colony"
                            label="Colonia"
                            icon={<Building size={16} />}
                            {...register('colony', { required: 'La colonia es requerida' })}
                            error={errors.colony?.message}
                         />
                    </div>

                    {/* Referencias */}
                    <div className="sm:col-span-2">
                         <FloatingInput
                            id="references"
                            label="Referencias / Entre Calles"
                            icon={<Navigation size={16} className="opacity-40" />}
                            {...register('references')}
                         />
                    </div>

                    {/* Ciudad */}
                    <div className="sm:col-span-1">
                         <FloatingInput
                            id="city"
                            label="Ciudad"
                            icon={<Building size={16} />}
                            {...register('city')}
                            error={errors.city?.message}
                         />
                    </div>

                    {/* Estado */}
                    <div className="sm:col-span-1">
                         <FloatingInput
                            id="state"
                            label="Estado"
                            icon={<MapPin size={16} />}
                            {...register('state')}
                            error={errors.state?.message}
                         />
                    </div>

                    {/* Código Postal */}
                    <div className="sm:col-span-2">
                         <FloatingInput
                            id="zip_code"
                            label="Código Postal"
                            icon={<Navigation size={16} />}
                            {...register('zip_code', { required: 'El CP es requerido' })}
                            error={errors.zip_code?.message}
                         />
                    </div>
                </div>

                {/* Switch Predeterminada */}
                <label className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all duration-500">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                            watch('is_default') 
                                ? "bg-accent-primary/10 border-accent-primary/20 text-accent-primary shadow-xl shadow-accent-primary/10" 
                                : "bg-white/5 border-white/10 text-theme-tertiary"
                        )}>
                            <Star className={cn("h-6 w-6", watch('is_default') && "fill-current")} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">Dirección Principal</p>
                            <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest opacity-60">Usar por defecto en mis compras</p>
                        </div>
                    </div>
                    <div className="relative inline-flex items-center">
                        <input
                            type="checkbox"
                            {...register('is_default')}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-white/5 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent-primary peer-checked:border-accent-primary shadow-inner" />
                    </div>
                </label>
            </div>

            {/* Footer de Acciones */}
            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-5 rounded-[2rem] bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary hover:bg-white/10 hover:text-white transition-all duration-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-5 rounded-[2rem] bg-accent-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl shadow-accent-primary/30"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Sincronizando...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Guardar Ubicación
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

/**
 * Visual Sub-component: FloatingInput
 */
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.ReactNode;
    error?: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
    ({ label, icon, error, id, ...props }, ref) => {
        return (
            <div className="space-y-1.5 group/input">
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-theme-tertiary group-focus-within/input:text-accent-primary transition-colors duration-500 z-10">
                        {icon}
                    </div>
                    <input
                        id={id}
                        ref={ref}
                        placeholder=" "
                        className={cn(
                            "peer w-full rounded-2xl border border-white/5 bg-white/[0.02] pl-14 pr-5 pt-7 pb-3 text-sm font-bold text-white transition-all duration-500 hover:bg-white/[0.04] focus:border-accent-primary/50 focus:outline-none focus:ring-4 focus:ring-accent-primary/10 backdrop-blur-xl",
                            error && "border-red-500/30 bg-red-500/5 ring-red-500/10"
                        )}
                        {...props}
                    />
                    <label
                        htmlFor={id}
                        className="absolute left-14 top-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-theme-tertiary transition-all duration-500 pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-placeholder-shown:font-bold peer-placeholder-shown:tracking-normal peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:font-black peer-focus:tracking-[0.2em] peer-focus:text-accent-primary"
                    >
                        {label}
                    </label>
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[9px] font-black uppercase tracking-widest text-red-400 px-4"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

FloatingInput.displayName = 'FloatingInput';
