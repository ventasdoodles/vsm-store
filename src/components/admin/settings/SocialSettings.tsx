import { Share2 } from 'lucide-react';

export function SocialSettings({ formData, handleChange }: any) {
    return (
        <div className="rounded-xl border border-theme bg-theme-primary/50 p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-theme pb-4 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10"><Share2 className="h-6 w-6 text-blue-500" /></div>
                <h2 className="text-lg font-semibold text-theme-primary">Redes Sociales</h2>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-theme-secondary">Facebook URL</label>
                <input
                    type="url"
                    name="social_facebook"
                    value={formData.social_links.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-theme-secondary">Instagram URL</label>
                <input
                    type="url"
                    name="social_instagram"
                    value={formData.social_links.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-theme-secondary">YouTube URL</label>
                <input
                    type="url"
                    name="social_youtube"
                    value={formData.social_links.youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-theme-secondary">TikTok URL</label>
                <input
                    type="url"
                    name="social_tiktok"
                    value={formData.social_links.tiktok || ''}
                    onChange={handleChange}
                    placeholder="https://tiktok.com/@..."
                    className="w-full rounded-lg border border-theme bg-theme-secondary px-3 py-2 text-theme-primary outline-none focus:border-vape-500"
                />
            </div>
        </div>
    );
}
