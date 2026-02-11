// Footer - VSM Store

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-primary-800 bg-primary-950">
            <div className="container-vsm py-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Marca */}
                    <div>
                        <div className="flex items-center gap-1 mb-3">
                            <span className="text-xl font-extrabold bg-gradient-to-r from-vape-500 to-herbal-500 bg-clip-text text-transparent">
                                VSM
                            </span>
                            <span className="text-sm font-light text-primary-400">Store</span>
                        </div>
                        <p className="text-sm text-primary-500">
                            Tu tienda de confianza para productos de vapeo y 420.
                        </p>
                    </div>

                    {/* Vape */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-vape-400">Vape</h3>
                        <ul className="space-y-2 text-sm text-primary-500">
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Mods</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Atomizadores</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Líquidos</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Coils</span></li>
                        </ul>
                    </div>

                    {/* 420 */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-herbal-400">420</h3>
                        <ul className="space-y-2 text-sm text-primary-500">
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Vaporizers</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Fumables</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Comestibles</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Concentrados</span></li>
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-primary-300">Info</h3>
                        <ul className="space-y-2 text-sm text-primary-500">
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Sobre nosotros</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Contacto</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">Envíos</span></li>
                            <li><span className="hover:text-primary-300 cursor-pointer transition-colors">FAQ</span></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 border-t border-primary-800 pt-6 text-center text-xs text-primary-600">
                    © {currentYear} VSM Store. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
