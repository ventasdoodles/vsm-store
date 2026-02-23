import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/lib/domain/validations/profile.schema';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { toast } from 'react-hot-toast';
import { Loader2, Save } from 'lucide-react';

/**
 * ProfileForm — Formulario para editar la información del usuario.
 *
 * @module ProfileForm
 * @independent Componente 100% independiente. Maneja su propio estado de formulario y validaciones.
 */
export function ProfileForm() {
    const { user, profile, refreshProfile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            whatsapp: profile?.whatsapp || '',
            birthdate: profile?.birthdate || '',
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            await authService.updateProfile(user.id, data);
            await refreshProfile();
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!profile) return null;

    return (
        <section className="rounded-xl border border-theme bg-theme-secondary/20 backdrop-blur-sm p-5">
            <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider mb-4">
                Editar Información
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nombre Completo */}
                <div>
                    <label htmlFor="full_name" className="block text-xs font-medium text-theme-secondary mb-1">
                        Nombre Completo *
                    </label>
                    <input
                        id="full_name"
                        type="text"
                        {...register('full_name')}
                        className="w-full rounded-lg border border-theme bg-theme-primary px-3 py-2 text-sm text-theme-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                        placeholder="Ej. Juan Pérez"
                    />
                    {errors.full_name && (
                        <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>
                    )}
                </div>

                {/* WhatsApp */}
                <div>
                    <label htmlFor="whatsapp" className="block text-xs font-medium text-theme-secondary mb-1">
                        WhatsApp (10 dígitos) *
                    </label>
                    <input
                        id="whatsapp"
                        type="tel"
                        {...register('whatsapp')}
                        className="w-full rounded-lg border border-theme bg-theme-primary px-3 py-2 text-sm text-theme-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                        placeholder="Ej. 2281234567"
                    />
                    {errors.whatsapp && (
                        <p className="mt-1 text-xs text-red-500">{errors.whatsapp.message}</p>
                    )}
                </div>

                {/* Teléfono Alternativo */}
                <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-theme-secondary mb-1">
                        Teléfono Alternativo (Opcional)
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        className="w-full rounded-lg border border-theme bg-theme-primary px-3 py-2 text-sm text-theme-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                        placeholder="Ej. 2281234567"
                    />
                    {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                    )}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                    <label htmlFor="birthdate" className="block text-xs font-medium text-theme-secondary mb-1">
                        Fecha de Nacimiento (Opcional)
                    </label>
                    <input
                        id="birthdate"
                        type="date"
                        {...register('birthdate')}
                        className="w-full rounded-lg border border-theme bg-theme-primary px-3 py-2 text-sm text-theme-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                    />
                    {errors.birthdate && (
                        <p className="mt-1 text-xs text-red-500">{errors.birthdate.message}</p>
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
