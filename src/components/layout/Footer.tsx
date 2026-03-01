/**
 * Footer — Pie de página principal del sitio.
 *
 * @module Footer
 * @independent Componente independiente y altamente componetizado en su UI.
 * @data Contenido estático (links, redes sociales, newsletter).
 */
import { Link } from 'react-router-dom';
import { 
    Facebook, Instagram, Twitter, Mail, Phone, 
    Send, ShieldCheck, Zap, HeartHandshake, CreditCard, Droplet, Truck 
} from 'lucide-react';
import { HeaderLogo } from './header/HeaderLogo';

export const Footer = () => {
    return (
        <footer className="relative bg-[#050b14] pt-24 pb-8 overflow-hidden mt-16 border-t border-white/5">
            {/* Soft background reflections for premium feel */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-vape-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 left-1/2 w-[800px] h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

            <div className="container-vsm relative z-10">
                
                {/* Top Banner / Newsletter */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl mb-20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-transparent to-vape-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="flex-1 text-center lg:text-left relative z-10">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center lg:justify-start gap-2">
                            <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-pulse" />
                            Únete al Club VSM
                        </h3>
                        <p className="text-sm sm:text-base text-white/60">
                            Suscríbete para recibir lanzamientos exclusivos, ofertas secretas y un <span className="text-accent-primary font-semibold">10% de descuento</span> en tu primera compra.
                        </p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="w-full lg:w-[420px] relative z-10 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                required
                                className="w-full h-12 pl-11 pr-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/60 transition-all shadow-inner"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-12 px-6 bg-gradient-to-r from-accent-primary to-blue-600 hover:from-blue-500 hover:to-accent-primary text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2 flex-shrink-0"
                        >
                            <span>Suscribir</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 mb-16">
                    {/* Column 1: Brand & Contact (Takes more space) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="block w-fit">
                            <HeaderLogo />
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed pr-4">
                            Elevando la experiencia. Tu tienda premium de vape y productos 420. Calidad, discreción y las mejores marcas garantizadas en cada entrega.
                        </p>
                        <div className="space-y-4 pt-2">
                            <a href="mailto:contacto@vsmstore.com" className="flex items-center gap-3 text-sm text-white/60 hover:text-accent-primary transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-accent-primary/10 group-hover:border-accent-primary/30 transition-all">
                                    <Mail className="w-4 h-4" />
                                </div>
                                contacto@vsmstore.com
                            </a>
                            <a href="tel:+528100000000" className="flex items-center gap-3 text-sm text-white/60 hover:text-emerald-400 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                                    <Phone className="w-4 h-4" />
                                </div>
                                +52 (81) 0000-0000
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Tienda */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-accent-primary" />
                            Tienda
                        </h4>
                        <ul className="space-y-3.5">
                            {['Vape', '420', 'Líquidos', 'Desechables', 'Ofertas', 'Novedades'].map((item) => (
                                <li key={item}>
                                    <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Servicio al Cliente */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <HeartHandshake className="w-4 h-4 text-red-400" />
                            Servicio
                        </h4>
                        <ul className="space-y-3.5">
                            {[
                                { name: 'Rastrear Mi Pedido', path: '/rastreo' },
                                { name: 'Mis Compras', path: '/perfil/pedidos' },
                                { name: 'Envíos y Entregas', path: '/envios' },
                                { name: 'Devoluciones y Garantías', path: '/devoluciones' },
                                { name: 'Preguntas Frecuentes', path: '/faq' },
                                { name: 'Contacto', path: '/contacto' },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Comunidad */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            Comunidad
                        </h4>
                        <div className="space-y-6">
                            <p className="text-sm text-white/50 leading-relaxed">
                                Únete a nuestra comunidad. Síguenos en redes para enterarte antes que nadie de los nuevos drops y promociones.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-black hover:text-white hover:border-white/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar items */}
                <div className="pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-white/40 font-medium text-center lg:text-left">
                        © {new Date().getFullYear()} VSM Store. Todos los derechos reservados.
                    </p>
                    
                    {/* Payment / Features small badges */}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-white/30 order-first lg:order-none mb-4 lg:mb-0">
                        <div className="flex items-center gap-1.5" title="Pago Seguro">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-medium">100% Seguro</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                        <div className="flex items-center gap-1.5" title="Envíos a todo México">
                            <Truck className="w-4 h-4" />
                            <span className="text-xs font-medium">Envío Nacional</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                        <div className="flex items-center gap-1.5" title="Múltiples métodos de pago">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-xs font-medium">Tarjetas & Efectivo</span>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <Link to="/legal/privacy" className="text-xs text-white/40 hover:text-white transition-colors">
                            Privacidad
                        </Link>
                        <Link to="/legal/terms" className="text-xs text-white/40 hover:text-white transition-colors">
                            Términos
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
