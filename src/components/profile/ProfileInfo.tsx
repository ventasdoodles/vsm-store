/**
 * ProfileInfo — Tarjeta con información personal del usuario.
 *
 * @module ProfileInfo
 * @independent Componente 100% independiente. Lee auth internamente via useAuth().
 * @removable Quitar de Profile.tsx sin consecuencias para el resto de la página.
 *            Retorna null si no hay profile → plug-and-play seguro.
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
        <div className="flex items-center gap-3 py-2.5 border-b border-theme/50 last:border-0">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-theme-secondary/50 text-theme-secondary">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-theme-secondary">{label}</p>
                <p className="text-sm font-medium text-theme-primary truncate">{value}</p>
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
        <section className="rounded-xl border border-theme bg-theme-secondary/20 backdrop-blur-sm p-5">
            <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider mb-3">
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
