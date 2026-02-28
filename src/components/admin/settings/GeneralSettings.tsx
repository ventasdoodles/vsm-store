import { MapPin } from 'lucide-react';

export function GeneralSettings({ formData, handleChange }: any) {
    return (
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-theme bg-theme-primary/30 overflow-hidden">
            <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer bg-theme-primary/50 hover:bg-theme-primary/80 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent-primary/10"><MapPin className="h-6 w-6 text-accent-primary" /></div>
                        <h2 className="text-lg font-semibold text-theme-primary">Información General</h2>
                    </div>
                    <span className="text-theme-primary0 text-sm group-open:rotate-180 transition-transform">▼</span>
                </summary>

                <div className="p-6 pt-0 border-t border-theme space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Nombre de la Tienda</label>
                            <input
                                type="text"
                                name="site_name"
                                value={formData.site_name}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Ciudad</label>
                            <input
                                type="text"
                                name="location_city"
                                value={formData.location_city}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Dirección</label>
                            <input
                                type="text"
                                name="location_address"
                                value={formData.location_address}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-theme-secondary">Google Maps URL</label>
                            <input
                                type="url"
                                name="location_map_url"
                                value={formData.location_map_url}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                            />
                        </div>
                    </div>
                </div>
            </details>
        </div>
    );
}
