/**
 * // ─── COMPONENTE: SocialSettings ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Card glassmorphism para URLs de redes sociales.
 * // Regla / Notas: Props tipadas. Sin `any`. Tema azul/indigo (social media vibe).
 *    Cada red social tiene su icono y color semantico.
 */
import { Share2 } from 'lucide-react';
import type { SettingsFormData, SettingsChangeHandler } from './settings.types';

interface SocialSettingsProps {
    formData: SettingsFormData;
    handleChange: SettingsChangeHandler;
}

/** Configuracion de redes sociales con icono unicode y color */
const SOCIAL_FIELDS = [
    { name: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/...', color: 'text-blue-400', dot: 'bg-blue-400' },
    { name: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/...', color: 'text-pink-400', dot: 'bg-pink-400' },
    { name: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/...', color: 'text-red-400', dot: 'bg-red-400' },
    { name: 'social_tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...', color: 'text-cyan-400', dot: 'bg-cyan-400' },
] as const;

const INPUT_CLASS =
    'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition-colors focus:border-blue-500/50 focus:bg-white/[0.07]';

/** Mapa de acceso a social_links por nombre del campo */
const SOCIAL_KEY_MAP: Record<string, keyof SettingsFormData['social_links']> = {
    social_facebook: 'facebook',
    social_instagram: 'instagram',
    social_youtube: 'youtube',
    social_tiktok: 'tiktok',
} as const;

export function SocialSettings({ formData, handleChange }: SocialSettingsProps) {
    return (
        <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 p-6 shadow-xl backdrop-blur-md transition-all hover:border-blue-500/15 hover:shadow-blue-500/5">
            {/* Orbe ambiental */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-500/8 blur-[80px] transition-all group-hover:bg-blue-500/12" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-indigo-500/6 blur-[60px]" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 rounded-xl border border-blue-500/20">
                    <Share2 className="h-5 w-5 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.4)]" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">Redes Sociales</h2>
                    <p className="text-xs text-theme-secondary/70">Conecta con tu audiencia</p>
                </div>
            </div>

            {/* Fields */}
            <div className="relative z-10 space-y-3">
                {SOCIAL_FIELDS.map((field) => (
                    <div key={field.name}>
                        <label className={`mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${field.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${field.dot}`} />
                            {field.label}
                        </label>
                        <input
                            type="url"
                            name={field.name}
                            value={formData.social_links[SOCIAL_KEY_MAP[field.name]!] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className={INPUT_CLASS}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
