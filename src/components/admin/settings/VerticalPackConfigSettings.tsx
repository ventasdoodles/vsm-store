import type { SettingsChangeHandler } from './settings.types';
import type { SettingsFormData } from './settings.types';
import { Package } from 'lucide-react';

interface Props {
    formData: SettingsFormData;
    handleChange: SettingsChangeHandler;
}

export function VerticalPackConfigSettings({ formData, handleChange }: Props) {
    return (
        <section className="col-span-1 lg:col-span-2 rounded-2xl bg-[#13141f] border border-white/10 overflow-hidden relative shadow-2xl group transition-colors focus-within:border-accent-primary/50">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="p-6 sm:p-8 space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary shadow-inner">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-theme-primary tracking-tight">
                            Configuración de Productización (JSON)
                        </h2>
                        <p className="text-sm text-theme-secondary font-medium mt-0.5">
                            Define la estructura de secciones y atributos del negocio.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.2em] mb-2 block ml-1">
                            Vertical Pack Config
                        </label>
                        <textarea
                            name="vertical_pack_config"
                            value={formData.vertical_pack_config}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-emerald-400 font-mono text-sm focus:border-accent-primary outline-none focus:bg-black/60 focus:ring-4 focus:ring-accent-primary/10 transition-all shadow-inner font-medium resize-y min-h-[300px]"
                            placeholder='{"id": "...", ...}'
                        />
                        <p className="text-xs text-theme-secondary/60 mt-2 ml-1">
                            Asegúrate de proporcionar un JSON válido. Un JSON inválido o malformado no se guardará.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
