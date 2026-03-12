/**
 * // ─── COMPONENTE: PROFILE INFO ───
 * // Propósito: Visualización sintetizada de información de contacto del usuario.
 * // Arquitectura: Presentational component con aislamiento absoluto (§1.3).
 * // Estilo: Premium Glassmorphism + Accent Icons (§2.1).
 */
import { Phone, MessageCircle, Calendar, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    return (
        <div className="flex items-center gap-5 py-5 border-b border-white/5 last:border-0 group">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-theme-tertiary border border-white/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-accent-primary/10 group-hover:text-accent-primary group-hover:border-accent-primary/20 shadow-xl group-hover:shadow-accent-primary/10">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-40 mb-1">{label}</p>
                <p className="text-sm font-black text-white truncate tracking-tight uppercase italic">{value}</p>
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
        <section className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl overflow-hidden relative group">
            {/* Accent decoration */}
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-accent-primary/5 blur-[80px] transition-transform duration-1000 group-hover:scale-150" />
            
            <header className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] opacity-40">
                    Bitácora de Identidad
                </h2>
                <ShieldCheck className="h-4 w-4 text-herbal-500 animate-pulse" />
            </header>

            <div className="space-y-1">
                {user?.email && (
                    <InfoRow
                        icon={<Mail size={20} />}
                        label="Email Codificado"
                        value={user.email}
                    />
                )}
                {profile.phone && (
                    <InfoRow
                        icon={<Phone size={20} />}
                        label="Línea de Voz"
                        value={profile.phone}
                    />
                )}
                {profile.whatsapp && (
                    <InfoRow
                        icon={<MessageCircle size={20} />}
                        label="Protocolo WhatsApp"
                        value={profile.whatsapp}
                    />
                )}
                <InfoRow
                    icon={<Calendar size={20} />}
                    label="Fecha de Alta"
                    value={memberSince}
                />
            </div>
        </section>
    );
}
