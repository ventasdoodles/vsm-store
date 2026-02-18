import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

interface Testimonial {
    id: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    verified: boolean;
    date: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: '1',
        name: 'María G.',
        location: 'Xalapa, Ver.',
        rating: 5,
        text: 'Excelente servicio, llegó en 2 días. Los líquidos son auténticos y el sabor increíble. 100% recomendado!',
        verified: true,
        date: 'Hace 2 semanas',
    },
    {
        id: '2',
        name: 'Carlos R.',
        location: 'Veracruz, Ver.',
        rating: 5,
        text: 'La mejor tienda de vapes en la zona. Precios justos y atención personalizada por WhatsApp.',
        verified: true,
        date: 'Hace 1 mes',
    },
    {
        id: '3',
        name: 'Ana L.',
        location: 'Coatepec, Ver.',
        rating: 5,
        text: 'Pedí un pod y llegó súper rápido. El empaque perfecto y el producto original. Volveré a comprar!',
        verified: true,
        date: 'Hace 3 días',
    },
    {
        id: '4',
        name: 'Luis M.',
        location: 'Xalapa, Ver.',
        rating: 4,
        text: 'Muy buena variedad de productos. Solo me gustaría que tuvieran más opciones de pago.',
        verified: true,
        date: 'Hace 1 semana',
    },
    {
        id: '5',
        name: 'Sofia P.',
        location: 'Banderilla, Ver.',
        rating: 5,
        text: 'Primera vez comprando en línea y todo perfecto. Me ayudaron por WhatsApp con todas mis dudas.',
        verified: true,
        date: 'Hace 4 días',
    },
];

export const SocialProof = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Mostrar 3 testimonios a la vez en desktop, 1 en mobile
    const testimonialsPerView = window.innerWidth >= 768 ? 3 : 1;
    const maxIndex = Math.max(0, TESTIMONIALS.length - testimonialsPerView);

    const next = () => {
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    };

    const prev = () => {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
    };

    // Calcular rating promedio
    const avgRating = (
        TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / TESTIMONIALS.length
    ).toFixed(1);

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-theme-primary">
                    Lo Que Dicen Nuestros Clientes
                </h2>

                {/* Rating Summary */}
                <div className="flex items-center justify-center gap-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className="w-5 h-5 fill-yellow-400 text-yellow-400"
                            />
                        ))}
                    </div>
                    <span className="text-lg font-semibold text-theme-primary">
                        {avgRating}
                    </span>
                    <span className="text-sm text-theme-secondary">
                        ({TESTIMONIALS.length} reseñas)
                    </span>
                </div>
            </div>

            {/* Carousel */}
            <div className="relative">
                {/* Navigation */}
                {currentIndex > 0 && (
                    <button
                        onClick={prev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-full flex items-center justify-center shadow-lg"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5 text-theme-primary" />
                    </button>
                )}

                {currentIndex < maxIndex && (
                    <button
                        onClick={next}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-full flex items-center justify-center shadow-lg"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-5 h-5 text-theme-primary" />
                    </button>
                )}

                {/* Testimonials Grid */}
                <div className="overflow-hidden">
                    <div
                        className="flex gap-4 transition-transform duration-500"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / testimonialsPerView)}%)`,
                        }}
                    >
                        {TESTIMONIALS.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex-shrink-0 w-full md:w-1/3 p-6 bg-theme-secondary rounded-xl border border-theme"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="font-semibold text-theme-primary">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-sm text-theme-secondary">
                                            {testimonial.location}
                                        </p>
                                    </div>

                                    {testimonial.verified && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-600 dark:text-green-400">
                                            <ShieldCheck className="w-3 h-3" />
                                            Verificada
                                        </div>
                                    )}
                                </div>

                                {/* Rating */}
                                <div className="flex gap-0.5 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < testimonial.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-primary-700'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Text */}
                                <p className="text-theme-secondary mb-3">
                                    "{testimonial.text}"
                                </p>

                                {/* Date */}
                                <p className="text-xs text-theme-secondary">
                                    {testimonial.date}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
