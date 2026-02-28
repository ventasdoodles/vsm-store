/**
 * PromoSection — Banner promocional de envío gratis.
 *
 * @module PromoSection
 * @independent Componente 100% independiente. Sin dependencias externas.
 * @data Contenido estático. Sin API calls.
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

export function PromoSection() {
    return (
        <section className="my-20 relative overflow-hidden">
            <div className="container-vsm relative z-10">
                <div className="relative group overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-vape-500 to-herbal-500 shadow-2xl shadow-vape-500/10">
                    <div className="relative bg-black/60 backdrop-blur-3xl rounded-2xl p-10 md:p-16 vsm-border overflow-hidden">

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ backgroundSize: '100% 100%' }} />

                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-80 h-80 bg-vape-500/20 rounded-full blur-[100px] animate-pulse-slow" />
                        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-80 h-80 bg-herbal-500/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
                            {/* Left: Icon + Text */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                                <div className="w-20 h-20 bg-white/5 backdrop-blur-md vsm-border rounded-3xl flex items-center justify-center flex-shrink-0 shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                                    <Truck className="w-10 h-10 text-white drop-shadow-glow" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-tight">
                                        Envío Gratis <br className="hidden md:block" /> en Xalapa
                                    </h3>
                                    <p className="text-theme-tertiary font-bold uppercase tracking-[0.2em] text-xs md:text-sm opacity-60">
                                        En compras mayores a <span className="text-vape-400 font-black">$500 MXN</span>
                                    </p>
                                </div>
                            </div>

                            {/* Right: CTA */}
                            <Link
                                to="/contact"
                                className="group relative px-10 py-5 bg-white text-theme-primary font-black uppercase tracking-widest text-sm rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 flex items-center gap-3 whitespace-nowrap overflow-hidden"
                            >
                                <span className="relative z-10">Ver zonas de entrega</span>
                                <div className="w-2 h-2 rounded-full bg-vape-500 group-hover:scale-[10] transition-transform duration-700 absolute -right-4 -bottom-4 -z-0 opacity-20" />
                                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-500">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
