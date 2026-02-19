import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

export function PromoSection() {
    return (
        <section className="my-8 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl overflow-hidden">
            <div className="container-vsm py-8 md:py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Icon + Text */}
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Truck className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-1">
                                Envío Gratis en Xalapa
                            </h3>
                            <p className="text-white/90">
                                Recibe tus productos favoritos en la puerta de tu casa sin costo adicional en compras mayores a $500.
                            </p>
                        </div>
                    </div>

                    {/* Right: CTA */}
                    <Link
                        to="/vape"
                        className="px-8 py-3 bg-white hover:bg-white/90 text-accent-primary font-semibold rounded-lg transition-all hover:scale-105 whitespace-nowrap"
                    >
                        Ver zonas de entrega →
                    </Link>
                </div>
            </div>
        </section>
    );
}
