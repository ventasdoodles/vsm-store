import { MessageSquareQuote, Plus } from 'lucide-react';

interface TestimonialsHeaderProps {
    onNew: () => void;
}

export function TestimonialsHeader({ onNew }: TestimonialsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-primary/10 p-6 rounded-2xl border border-white/5 relative overflow-hidden backdrop-blur-md shadow-2xl">
            {/* Soft Ambient Glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10">
                <h1 className="text-3xl font-black text-theme-primary flex items-center gap-3 drop-shadow-sm">
                    <div className="p-2.5 bg-accent-primary/10 rounded-xl border border-accent-primary/20">
                        <MessageSquareQuote className="h-7 w-7 text-accent-primary" />
                    </div>
                    Testimonios
                </h1>
                <p className="text-sm font-medium text-theme-secondary mt-2 max-w-xl">
                    Gestiona reseñas de clientes. Destácalas para aumentar la confianza y asócialas a contextos de navegación (Vapeo o 420).
                </p>
            </div>
            
            <button
                onClick={onNew}
                className="relative z-10 group flex items-center justify-center gap-2 bg-gradient-to-r from-accent-primary to-accent-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-primary/25 active:scale-95"
            >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                <span>Nuevo Testimonio</span>
            </button>
        </div>
    );
}
