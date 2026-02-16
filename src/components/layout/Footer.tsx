// Footer - VSM Store
import { Link } from 'react-router-dom';
import { SocialLinks } from '@/components/social/SocialLinks';
import { MapPin, Clock, Shield } from 'lucide-react';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const { data: settings } = useStoreSettings();

    return (
        <footer className="border-t border-primary-800/40 bg-primary-950">
            {/* Trust bar */}
            <div className="border-b border-primary-800/30">
                <div className="container-vsm py-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                            { icon: MapPin, title: settings?.location_city || 'Xalapa, Veracruz', sub: 'Entrega local y envíos' },
                            { icon: Clock, title: 'Atención 24/7', sub: 'Siempre disponibles' },
                            { icon: Shield, title: 'Compra segura', sub: 'Pago con Mercado Pago' },
                        ].map((item) => (
                            <div key={item.title} className="flex items-center gap-3 rounded-xl bg-primary-900/30 px-4 py-3 border border-primary-800/20">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-vape-500/8">
                                    <item.icon className="h-5 w-5 text-vape-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-primary-200">{item.title}</p>
                                    <p className="text-xs text-primary-500">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container-vsm py-12">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* COLUMNA 1: Marca */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-extrabold text-gradient-brand">
                                {settings?.site_name?.split(' ')[0] || 'VSM'}
                            </span>
                            <span className="text-base font-light text-primary-400">{settings?.site_name?.split(' ').slice(1).join(' ') || 'Store'}</span>
                        </div>
                        <p className="text-sm text-primary-500 leading-relaxed max-w-xs">
                            {settings?.description || 'Tu tienda de confianza en Xalapa para productos de vapeo y 420. Calidad y servicio premium.'}
                        </p>
                        <SocialLinks size="small" className="pt-2" />
                    </div>

                    {/* COLUMNA 2: Enlaces Rápidos */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold text-primary-300 uppercase tracking-wider">Explorar</h3>
                        <ul className="space-y-2.5 text-sm text-primary-400">
                            <li>
                                <Link to="/" className="hover:text-vape-400 transition-colors">Inicio</Link>
                            </li>
                            <li>
                                <Link to="/?section=vape" className="hover:text-vape-400 transition-colors">Vape Shop</Link>
                            </li>
                            <li>
                                <Link to="/?section=420" className="hover:text-herbal-400 transition-colors">420 Shop</Link>
                            </li>
                            <li>
                                <Link to="/profile" className="hover:text-primary-200 transition-colors">Mi Cuenta</Link>
                            </li>
                            <li>
                                <Link to="/orders" className="hover:text-primary-200 transition-colors">Mis Pedidos</Link>
                            </li>
                        </ul>
                    </div>

                    {/* COLUMNA 3: Ayuda y Legal */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold text-primary-300 uppercase tracking-wider">Ayuda</h3>
                        <ul className="space-y-2.5 text-sm text-primary-400">
                            <li>
                                <Link to="/contact" className="hover:text-primary-200 transition-colors">Contacto</Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-primary-200 transition-colors">Aviso de Privacidad</Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-primary-200 transition-colors">Términos y Condiciones</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary-200 transition-colors">Envíos y Devoluciones</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-primary-200 transition-colors">Preguntas Frecuentes</Link>
                            </li>
                        </ul>
                    </div>

                    {/* COLUMNA 4: Síguenos */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold text-primary-300 uppercase tracking-wider">Síguenos</h3>
                        <p className="text-sm text-primary-500 mb-4">
                            Entérate de nuevos productos y promociones exclusivas.
                        </p>
                        <SocialLinks size="medium" variant="buttons" />

                        {/* Newsletter Mini */}
                        <div className="mt-6">
                            <h4 className="text-xs font-semibold text-primary-400 mb-2">Suscríbete al boletín</h4>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Tu email"
                                    className="w-full rounded-lg bg-primary-900/50 border border-primary-800/40 px-3 py-2 text-xs text-primary-200 placeholder:text-primary-600 focus:border-vape-500/50 outline-none transition-colors"
                                />
                                <button className="rounded-lg bg-vape-500 px-3.5 py-2 text-xs font-medium text-white hover:bg-vape-600 transition-colors shadow-sm shadow-vape-500/20">
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-12 flex flex-col items-center justify-between border-t border-primary-800/30 pt-8 sm:flex-row">
                    <div className="text-xs text-primary-600 mb-4 sm:mb-0">
                        © {currentYear} VSM Store. Todos los derechos reservados.
                    </div>
                    <div className="flex gap-6 text-xs text-primary-500">
                        <Link to="/privacy" className="hover:text-primary-300 transition-colors">Privacidad</Link>
                        <span className="hover:text-primary-300 cursor-not-allowed transition-colors">Cookies</span>
                        <span className="hover:text-primary-300 cursor-not-allowed transition-colors">Términos</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
