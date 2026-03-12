/**
 * // ─── COMPONENTE: PROFILE FORM ───
 * // Propósito: Gestión de datos personales y avatar del usuario.
 * // Arquitectura: Formulario reactivo con validación Zod (§1.8) + Smart State Cache.
 * // UI: Premium Floating Labels + Glass Inset Inputs (§2.1).
 */
import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { profileSchema, type ProfileFormData } from '@/lib/domain/validations/profile.schema';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useNotification } from '@/hooks/useNotification';
import { Loader2, Save, User, Phone, MessageSquare, Calendar } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';
import { cn } from '@/lib/utils';

export function ProfileForm() {
    const { user, profile, refreshProfile } = useAuth();
    const updateProfileMutation = useUpdateProfile();
    const notify = useNotification();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            whatsapp: profile?.whatsapp || '',
            birthdate: profile?.birthdate || '',
            avatar_url: profile?.avatar_url || '',
        },
    });

    const currentAvatarUrl = watch('avatar_url');

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;

        try {
            await updateProfileMutation.mutateAsync({ userId: user.id, data });
            await refreshProfile();
            notify.success('Actualizado', 'Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            notify.error('Error', 'Error al actualizar el perfil');
        }
    };

    const isSubmitting = updateProfileMutation.isPending;

    if (!user) return null;

    return (
        <section className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-accent-primary/5 rounded-full blur-[80px] pointer-events-none" />
            
            <header className="mb-8">
                <h2 className="text-sm font-black text-theme-tertiary uppercase tracking-[0.2em] opacity-40">
                    Editar Información
                </h2>
                <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest opacity-60 mt-1">
                    Gestiona tu identidad digital
                </p>
            </header>

            {/* Avatar Upload Integration */}
            <div className="mb-12 flex justify-center scale-110 transition-transform duration-700 hover:scale-115">
                <AvatarUpload
                    userId={user.id}
                    currentUrl={currentAvatarUrl}
                    onUploadSuccess={(url) => {
                        setValue('avatar_url', url, { shouldDirty: true });
                    }}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6">
                    {/* Nombre Completo */}
                    <FloatingInput
                        id="full_name"
                        label="Nombre Completo"
                        icon={<User size={18} />}
                        {...register('full_name')}
                        error={errors.full_name?.message}
                    />

                    {/* WhatsApp */}
                    <FloatingInput
                        id="whatsapp"
                        label="WhatsApp (10 dígitos)"
                        icon={<MessageSquare size={18} />}
                        {...register('whatsapp')}
                        error={errors.whatsapp?.message}
                    />

                    {/* Teléfono Alternativo */}
                    <FloatingInput
                        id="phone"
                        label="Teléfono Alternativo (Opcional)"
                        icon={<Phone size={18} />}
                        {...register('phone')}
                        error={errors.phone?.message}
                    />

                    {/* Fecha de Nacimiento */}
                    <FloatingInput
                        id="birthdate"
                        label="Fecha de Nacimiento"
                        type="date"
                        icon={<Calendar size={18} />}
                        {...register('birthdate')}
                        error={errors.birthdate?.message}
                    />
                </div>

                {/* Botón Guardar Cinemático */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                        className={cn(
                            "group relative flex w-full items-center justify-center gap-3 rounded-[2rem] py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden shadow-2xl active:scale-95",
                            isDirty && !isSubmitting
                                ? "bg-accent-primary text-white shadow-accent-primary/30 hover:bg-accent-secondary"
                                : "bg-white/5 border border-white/5 text-theme-tertiary cursor-not-allowed opacity-50"
                        )}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        )}
                        <span>{isSubmitting ? 'Sincronizando...' : 'Guardar Cambios'}</span>
                        
                        {/* Shimmer effect */}
                        {isDirty && !isSubmitting && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}

/**
 * Visual Sub-component: FloatingInput (Cinema Style)
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
