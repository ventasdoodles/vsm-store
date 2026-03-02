/**
 * // ─── COMPONENTE: GeneralSettings ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Card glassmorphism para informacion general de la tienda
 *    (nombre, ciudad, direccion, mapa). Full-width col-span-2.
 * // Regla / Notas: Props tipadas. Sin `any`. Sin `<details>` accordion. Tema cyan/teal (info).
 */
import { MapPin, Store, Navigation, Map } from 'lucide-react';
import type { SettingsFormData, SettingsChangeHandler } from './settings.types';

interface GeneralSettingsProps {
    formData: SettingsFormData;
    handleChange: SettingsChangeHandler;
}

const INPUT_CLASS =
    'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition-colors focus:border-cyan-500/50 focus:bg-white/[0.07]';

/** Campos del formulario con metadata para renderizado */
const FIELDS = [
    { name: 'site_name', label: 'Nombre de la Tienda', icon: Store, type: 'text', span: 1 },
    { name: 'location_city', label: 'Ciudad', icon: Navigation, type: 'text', span: 1 },
    { name: 'location_address', label: 'Dirección', icon: MapPin, type: 'text', span: 2 },
    { name: 'location_map_url', label: 'Google Maps URL', icon: Map, type: 'url', span: 2 },
] as const;

export function GeneralSettings({ formData, handleChange }: GeneralSettingsProps) {
    return (
        <div className="group relative col-span-1 lg:col-span-2 overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 p-6 shadow-xl backdrop-blur-md transition-all hover:border-cyan-500/15 hover:shadow-cyan-500/5">
            {/* Orbes ambientales */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-500/8 blur-[100px] transition-all group-hover:bg-cyan-500/12" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-teal-500/6 blur-[80px]" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-teal-500/10 rounded-xl border border-cyan-500/20">
                    <MapPin className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">Información General</h2>
                    <p className="text-xs text-theme-secondary/70">Identidad y ubicación de tu tienda</p>
                </div>
            </div>

            {/* Fields Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {FIELDS.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div key={field.name} className={field.span === 2 ? 'md:col-span-2' : ''}>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400/80">
                                <Icon className="h-3 w-3" />
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name as keyof SettingsFormData] as string}
                                onChange={handleChange}
                                className={INPUT_CLASS}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
