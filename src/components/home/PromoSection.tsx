import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

export function PromoSection() {
    return (
        <section className="my-12 relative">
            <div className="container-vsm relative z-10">
                <div className="bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl p-1 shadow-2xl shadow-accent-primary/20">
                    <div className="bg-bg-secondary/50 backdrop-blur-sm rounded-xl p-8 md:p-12 border border-white/10 overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-accent-primary/20 rounded-full blur-3xl animate-pulse-glow" />
                        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white relative z-10">
                            {/* Left: Icon + Text */}
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Truck className="w-8 h-8 text-white drop-shadow-md" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-1 tracking-tight">
                                        Envío Gratis en Xalapa
                                    </h3>
                                    <p className="text-blue-100/90 text-sm md:text-base font-medium">
                                        En compras mayores a <span className="text-white font-bold">$500 MXN</span>
                                    </p>
                                </div>
                            </div>

                            {/* Right: CTA */}
                            <Link
                                to="/contact"
                                className="group px-8 py-4 bg-white text-accent-primary font-bold rounded-xl transition-all hover:scale-105 shadow-xl hover:shadow-white/20 flex items-center gap-2 whitespace-nowrap"
                            >
                                Ver zonas de entrega
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
