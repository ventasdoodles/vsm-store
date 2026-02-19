import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

export function PromoSection() {
    return (
        <section className="my-12">
            <div className="container-vsm">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
                        {/* Left: Icon + Text */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Truck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">
                                    Envío Gratis en Xalapa
                                </h3>
                                <p className="text-white/90 text-sm md:text-base">
                                    En compras mayores a $500
                                </p>
                            </div>
                        </div>

                        {/* Right: CTA */}
                        <Link
                            to="/contact"
                            className="px-6 py-3 bg-white hover:bg-white/90 text-blue-600 font-semibold rounded-lg transition-all hover:scale-105 whitespace-nowrap"
                        >
                            Ver zonas de entrega →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
