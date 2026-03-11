/**
 * // ─── COMPONENTE: PROFILE INFO ───
 * // Propósito: Visualización sintetizada de información de contacto del usuario.
 * // Arquitectura: Presentational component con aislamiento absoluto (§1.3).
 * // Estilo: Premium Glassmorphism + Accent Icons.
 */
import { Phone, MessageCircle, Calendar, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 group">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-theme-tertiary border border-white/10 group-hover:scale-110 group-hover:bg-accent-primary/10 group-hover:text-accent-primary transition-all duration-300 shadow-xl">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary opacity-40 mb-1">{label}</p>
                <p className="text-sm font-bold text-theme-primary truncate tracking-tight">{value}</p>
            </div>
        </div>
    );
}

export function ProfileInfo() {
    const { user, profile } = useAuth();

    if (!profile) return null;

    const memberSince = new Date(profile.created_at).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 shadow-2xl overflow-hidden relative">
            {/* Accent decoration */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent-primary/5 blur-[60px]" />
            
            <h2 className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] mb-6 opacity-60">
                Información personal
            </h2>
            <div>
                {user?.email && (
                    <InfoRow
                        icon={<Mail className="h-4 w-4" />}
                        label="Email"
                        value={user.email}
                    />
                )}
                {profile.phone && (
                    <InfoRow
                        icon={<Phone className="h-4 w-4" />}
                        label="Teléfono"
                        value={profile.phone}
                    />
                )}
                {profile.whatsapp && (
                    <InfoRow
                        icon={<MessageCircle className="h-4 w-4" />}
                        label="WhatsApp"
                        value={profile.whatsapp}
                    />
                )}
                <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Miembro desde"
                    value={memberSince}
                />
            </div>
        </section>
    );
}
