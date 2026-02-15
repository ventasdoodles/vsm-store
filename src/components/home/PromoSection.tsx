// Sección Promocional - VSM Store
// Banner visual para romper el flujo de productos
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface PromoSectionProps {
    title: string;
    subtitle: string;
    cta: string;
    link: string;
    bgImage: string;
    align?: 'left' | 'center' | 'right';
}

export function PromoSection({ title, subtitle, cta, link, bgImage, align = 'left' }: PromoSectionProps) {
    const alignClass = align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';

    return (
        <section>
            <div className="relative overflow-hidden rounded-3xl bg-primary-900 shadow-lg">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-950/60 to-transparent" />

                <div className={`relative z-10 flex flex-col ${alignClass} gap-3 p-8 sm:p-10`}>
                    <h2 className="text-2xl font-bold text-white sm:text-3xl max-w-lg">
                        {title}
                    </h2>
                    <p className="text-sm font-medium text-primary-200 max-w-md">
                        {subtitle}
                    </p>
                    <Link
                        to={link}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
                    >
                        {cta}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
