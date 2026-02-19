import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Clock, Shield } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-theme-primary border-t border-theme mt-auto">
            <div className="container-vsm py-12">
                {/* Trust Badges Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="flex items-center gap-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                        <MapPin className="w-6 h-6 text-accent-primary flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-theme-primary mb-1">
                                Xalapa, Veracruz
                            </h3>
                            <p className="text-sm text-theme-secondary">
                                Entrega local y envíos
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                        <Clock className="w-6 h-6 text-accent-primary flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-theme-primary mb-1">
                                Atención 24/7
                            </h3>
                            <p className="text-sm text-theme-secondary">
                                Siempre disponibles
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                        <Shield className="w-6 h-6 text-accent-primary flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-theme-primary mb-1">
                                Compra Segura
                            </h3>
                            <p className="text-sm text-theme-secondary">
                                Pago con Mercado Pago
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-accent-primary">
                            VSM Store
                        </h2>
                        <p className="text-sm text-theme-secondary">
                            Tu tienda de vape y productos 420
                        </p>
                    </div>

                    {/* Explorar Column */}
                    <div>
                        <h3 className="font-semibold text-theme-primary mb-4">
                            EXPLORAR
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-sm text-theme-secondary hover:text-accent-primary transition-colors"
                                >
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/products"
                                    className="text-sm text-theme-secondary hover:text-accent-primary transition-colors"
                                >
                                    Productos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/categories"
                                    className="text-sm text-theme-secondary hover:text-accent-primary transition-colors"
                                >
                                    Categorías
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/deals"
                                    className="text-sm text-theme-secondary hover:text-accent-primary transition-colors"
                                >
                                    Ofertas
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Ayuda Column */}
                    <div>
                        <h3 className="font-semibold text-theme-primary mb-4">
                            AYUDA
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/help/faq"
                                    className="text-sm text-theme-secondary hover:text-accent-primary transition-colors"
                                >
                                    Preguntas Frecuentes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/help/shipping"
                                    className="text-sm text-theme-secondary hover:text-accent-primary transition-colors"
                                >
                                    Envíos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/help/returns"
                                    className="text-sm text-theme-secondary hover:text-accent-primary transition-colors"
                                >
                                    Devoluciones
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-sm text-theme-secondary hover:text-accent-primary transition-colors"
                                >
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h3 className="font-semibold text-theme-primary mb-4">
                            SÍGUENOS
                        </h3>
                        <div className="flex gap-2 mb-4">
                            {/* Social Icons */}
                            <a
                                href="#"
                                className="w-10 h-10 bg-accent-primary/10 hover:bg-accent-primary/20 rounded-lg flex items-center justify-center text-accent-primary transition-colors"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-accent-primary/10 hover:bg-accent-primary/20 rounded-lg flex items-center justify-center text-accent-primary transition-colors"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-accent-primary/10 hover:bg-accent-primary/20 rounded-lg flex items-center justify-center text-accent-primary transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Newsletter Form */}
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Tu email"
                                className="flex-1 h-10 px-4 bg-theme-secondary border border-theme rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                            />
                            <button
                                type="submit"
                                className="h-10 px-4 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-lg transition-colors"
                            >
                                OK
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-theme">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-theme-secondary">
                        <p>© 2026 VSM Store. Todos los derechos reservados.</p>
                        <div className="flex gap-6">
                            <Link
                                to="/legal/privacy"
                                className="hover:text-accent-primary transition-colors"
                            >
                                Privacidad
                            </Link>
                            <Link
                                to="/legal/terms"
                                className="hover:text-accent-primary transition-colors"
                            >
                                Términos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
