/**
 * SocialSkeleton — Estado de carga animado para la sección de testimonios.
 * 
 * @component
 */
export function SocialSkeleton() {
    return (
        <div className="flex gap-4 overflow-hidden">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="flex-shrink-0 w-[85vw] sm:w-[340px] md:w-[360px] p-6 rounded-2xl bg-theme-secondary/30 animate-pulse"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full bg-white/10" />
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-24 bg-white/10 rounded" />
                            <div className="h-2 w-16 bg-white/10 rounded" />
                        </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => (
                            <div key={j} className="w-3.5 h-3.5 rounded bg-white/10" />
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-white/10 rounded" />
                        <div className="h-3 w-4/5 bg-white/10 rounded" />
                        <div className="h-3 w-3/5 bg-white/10 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
