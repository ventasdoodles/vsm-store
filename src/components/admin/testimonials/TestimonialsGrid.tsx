import { MessageSquareQuote } from 'lucide-react';
import type { Testimonial } from '@/types/testimonial';
import { TestimonialAdminCard } from './TestimonialAdminCard';

interface TestimonialsGridProps {
    testimonials: Testimonial[];
    onEdit: (t: Testimonial) => void;
    onDuplicate: (t: Testimonial) => void;
    onDelete: (id: string) => void;
    onToggleFeatured: (id: string, v: boolean) => void;
    onToggleActive: (id: string, v: boolean) => void;
}

export function TestimonialsGrid({
    testimonials,
    onEdit,
    onDuplicate,
    onDelete,
    onToggleFeatured,
    onToggleActive,
}: TestimonialsGridProps) {
    if (testimonials.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-theme-primary/5 rounded-3xl border border-white/5 shadow-inner">
                <div className="p-5 bg-theme-secondary/10 rounded-full mb-6">
                     <MessageSquareQuote className="h-12 w-12 text-theme-secondary/50" />
                </div>
                <p className="text-xl font-black text-theme-primary text-center">
                    No se encontraron testimonios
                </p>
                <p className="text-sm font-medium text-theme-secondary mt-2 text-center max-w-md">
                    Intenta ajustar los filtros de búsqueda o crea un nuevo testimonio para comenzar a construir la confianza de tus clientes.
                </p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr pt-4 pb-12">
            {testimonials.map((t) => (
                <TestimonialAdminCard
                    key={t.id}
                    testimonial={t}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onToggleFeatured={onToggleFeatured}
                    onToggleActive={onToggleActive}
                />
            ))}
        </div>
    );
}
