import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/lib/domain/validations/profile.schema';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useNotification } from '@/hooks/useNotification';
import { Loader2, Save } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';

/**
 * // ─── COMPONENTE: PROFILE FORM ───
 * // Propósito: Gestión de datos personales y avatar del usuario.
 * // Arquitectura: Formulario reactivo con validación Zod (§1.8) + Smart State Cache.
 * // UI: Premium Floating Labels + Glass Inset Inputs.
 */
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
        <section className="rounded-xl border border-theme bg-theme-secondary/20 backdrop-blur-sm p-5">
            <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider mb-6">
                Editar Información
            </h2>

            {/* Avatar Upload Integration */}
            <div className="mb-10 flex justify-center">
                <AvatarUpload
                    userId={user.id}
                    currentUrl={currentAvatarUrl}
                    onUploadSuccess={(url) => {
                        setValue('avatar_url', url, { shouldDirty: true });
                    }}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Nombre Completo */}
                <div className="group relative">
                    <input
                        id="full_name"
                        type="text"
                        {...register('full_name')}
                        className="peer w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 pt-6 pb-2 text-sm text-theme-primary placeholder-transparent focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all backdrop-blur-md"
                        placeholder="Nombre Completo"
                    />
                    <label 
                        htmlFor="full_name" 
                        className="absolute left-4 top-2 text-[10px] font-black uppercase tracking-widest text-theme-tertiary transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-black peer-focus:tracking-widest peer-focus:text-accent-primary"
                    >
                        Nombre Completo
                    </label>
                    {errors.full_name && (
                        <p className="mt-1 text-[10px] font-bold text-red-400 uppercase tracking-tight">{errors.full_name.message}</p>
                    )}
                </div>

                {/* WhatsApp */}
                <div className="group relative">
                    <input
                        id="whatsapp"
                        type="tel"
                        {...register('whatsapp')}
                        className="peer w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 pt-6 pb-2 text-sm text-theme-primary placeholder-transparent focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all backdrop-blur-md"
                        placeholder="WhatsApp"
                    />
                    <label 
                        htmlFor="whatsapp" 
                        className="absolute left-4 top-2 text-[10px] font-black uppercase tracking-widest text-theme-tertiary transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-black peer-focus:tracking-widest peer-focus:text-accent-primary"
                    >
                        WhatsApp (10 dígitos)
                    </label>
                    {errors.whatsapp && (
                        <p className="mt-1 text-[10px] font-bold text-red-400 uppercase tracking-tight">{errors.whatsapp.message}</p>
                    )}
                </div>

                {/* Teléfono Alternativo */}
                <div className="group relative">
                    <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        className="peer w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 pt-6 pb-2 text-sm text-theme-primary placeholder-transparent focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all backdrop-blur-md"
                        placeholder="Teléfono Alternativo"
                    />
                    <label 
                        htmlFor="phone" 
                        className="absolute left-4 top-2 text-[10px] font-black uppercase tracking-widest text-theme-tertiary transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-black peer-focus:tracking-widest peer-focus:text-accent-primary"
                    >
                        Teléfono Alternativo (Opcional)
                    </label>
                    {errors.phone && (
                        <p className="mt-1 text-[10px] font-bold text-red-400 uppercase tracking-tight">{errors.phone.message}</p>
                    )}
                </div>

                {/* Fecha de Nacimiento */}
                <div className="group relative">
                    <input
                        id="birthdate"
                        type="date"
                        {...register('birthdate')}
                        className="peer w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 pt-6 pb-2 text-sm text-theme-primary placeholder-transparent focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all backdrop-blur-md"
                    />
                    <label 
                        htmlFor="birthdate" 
                        className="absolute left-4 top-2 text-[10px] font-black uppercase tracking-widest text-theme-tertiary transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-black peer-focus:tracking-widest peer-focus:text-accent-primary"
                    >
                        Fecha de Nacimiento
                    </label>
                    {errors.birthdate && (
                        <p className="mt-1 text-[10px] font-bold text-red-400 uppercase tracking-tight">{errors.birthdate.message}</p>
                    )}
                </div>

                {/* Botón Guardar */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </section>
    );
}
