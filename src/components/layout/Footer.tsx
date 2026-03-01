/**
 * Footer — Pie de página principal del sitio.
 *
 * @module Footer
 * @independent Componente independiente y altamente modularizado (legolizado).
 * @data Contenido estático (links, redes sociales, newsletter) extraído en constantes.
 */
import { ElementType } from 'react';
import { Link } from 'react-router-dom';
import { 
    Facebook, Instagram, Twitter, Mail, Phone, 
    Send, ShieldCheck, Zap, HeartHandshake, CreditCard, Droplet, Truck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderLogo } from './header/HeaderLogo';

// ── Constantes y Configuración de Datos ───────────────────────────────────────

const SHOP_LINKS = [
    { name: 'Vape', path: '/vape' },
    { name: '420', path: '/420' },
    { name: 'Líquidos', path: '/liquidos' },
    { name: 'Desechables', path: '/desechables' },
    { name: 'Ofertas', path: '/ofertas' },
    { name: 'Novedades', path: '/novedades' },
];

const SERVICE_LINKS = [
    { name: 'Rastrear Mi Pedido', path: '/rastreo' },
    { name: 'Mis Compras', path: '/perfil/pedidos' },
    { name: 'Envíos y Entregas', path: '/envios' },
    { name: 'Devoluciones y Garantías', path: '/devoluciones' },
    { name: 'Preguntas Frecuentes', path: '/faq' },
    { name: 'Contacto', path: '/contact' },
];

const TRUST_BADGES = [
    { label: '100% Seguro', icon: ShieldCheck, title: 'Pago Seguro' },
    { label: 'Envío Nacional', icon: Truck, title: 'Envíos a todo México' },
    { label: 'Tarjetas & Efectivo', icon: CreditCard, title: 'Múltiples métodos de pago' },
];

const SOCIAL_LINKS = [
    { 
        name: 'Instagram', 
        href: 'https://instagram.com', 
        icon: Instagram, 
        hoverClass: 'hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent' 
    },
    { 
        name: 'Facebook', 
        href: 'https://facebook.com', 
        icon: Facebook, 
        hoverClass: 'hover:bg-blue-600 hover:text-white hover:border-blue-500' 
    },
    { 
        name: 'Twitter', 
        href: 'https://twitter.com', 
        icon: Twitter, 
        hoverClass: 'hover:bg-black hover:text-white hover:border-white/30' 
    },
];

// ── Sub-componentes (Legos) ──────────────────────────────────────────────────

/** Link con efecto hover estandarizado para las columnas del footer */
function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <li>
            <Link 
                to={to} 
                className="text-sm text-white/50 hover:text-white hover:translate-x-1 inline-block transition-all duration-200"
            >
                {children}
            </Link>
        </li>
    );
}

/** Título de columna estandarizado */
function ColumnHeader({ title, icon: Icon, colorClass }: { title: string; icon: ElementType; colorClass: string }) {
    return (
        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
            <Icon className={cn("w-4 h-4", colorClass)} />
            {title}
        </h4>
    );
}

/** Botón social con tooltip y clases dinámicas */
function SocialButton({ href, icon: Icon, hoverClass, name }: typeof SOCIAL_LINKS[0]) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noreferrer" 
            aria-label={name}
            title={name}
            className={cn(
                "w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-300 shadow-lg hover:scale-110 hover:-translate-y-1",
                hoverClass
            )}
        >
            <Icon className="w-5 h-5" />
        </a>
    );
}

/** Badge de confianza (seguridad, envío, etc) */
function TrustBadge({ label, icon: Icon, title }: typeof TRUST_BADGES[0]) {
    return (
        <div className="flex items-center gap-1.5" title={title}>
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    );
}

// ── Componente Principal ─────────────────────────────────────────────────────

export const Footer = () => {
    return (
        <footer className="relative bg-[#050b14] pt-24 pb-8 overflow-hidden border-t border-white/5">
            {/* Efectos de luz premium (glows de fondo) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-vape-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 left-1/2 w-[800px] h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

            <div className="container-vsm relative z-10">
                
                {/* Banner Suscripción (Club VSM) */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl mb-20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-transparent to-vape-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
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

                {/* Grid Principal de Navegación */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 mb-16">
                    
                    {/* Columna 1: Marca y Contacto */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="block w-fit">
                            <HeaderLogo />
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed pr-4">
                            Elevando la experiencia. Tu tienda premium de vape y productos 420. Calidad, discreción y las mejores marcas garantizadas en cada entrega.
                        </p>
                        <address className="space-y-4 pt-2 not-italic">
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
                        </address>
                    </div>

                    {/* Columna 2: Tienda */}
                    <nav aria-label="Navegación de Tienda" className="lg:col-span-2">
                        <ColumnHeader title="Tienda" icon={Droplet} colorClass="text-accent-primary" />
                        <ul className="space-y-3.5">
                            {SHOP_LINKS.map((item) => (
                                <FooterLink key={item.name} to={item.path}>
                                    {item.name}
                                </FooterLink>
                            ))}
                        </ul>
                    </nav>

                    {/* Columna 3: Servicio al Cliente */}
                    <nav aria-label="Navegación de Servicio" className="lg:col-span-3">
                        <ColumnHeader title="Servicio" icon={HeartHandshake} colorClass="text-red-400" />
                        <ul className="space-y-3.5">
                            {SERVICE_LINKS.map((item) => (
                                <FooterLink key={item.name} to={item.path}>
                                    {item.name}
                                </FooterLink>
                            ))}
                        </ul>
                    </nav>

                    {/* Columna 4: Comunidad (Redes) */}
                    <div className="lg:col-span-3">
                        <ColumnHeader title="Comunidad" icon={ShieldCheck} colorClass="text-emerald-400" />
                        <div className="space-y-6">
                            <p className="text-sm text-white/50 leading-relaxed">
                                Únete a nuestra comunidad. Síguenos en redes para enterarte antes que nadie de los nuevos drops y promociones.
                            </p>
                            <div className="flex gap-4">
                                {SOCIAL_LINKS.map((social) => (
                                    <SocialButton key={social.name} {...social} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barra Inferior (Bottom Bar) */}
                <div className="pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-white/40 font-medium text-center lg:text-left">
                        © {new Date().getFullYear()} VSM Store. Todos los derechos reservados.
                    </p>
                    
                    {/* Badges de Confianza */}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-white/30 order-first lg:order-none mb-4 lg:mb-0">
                        {TRUST_BADGES.map((badge, index) => (
                            <div key={badge.label} className="flex items-center gap-4">
                                <TrustBadge {...badge} />
                                {/* Separador (excepto el último) */}
                                {index < TRUST_BADGES.length - 1 && (
                                    <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" aria-hidden="true" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Enlaces Legales */}
                    <nav aria-label="Enlaces Legales" className="flex gap-6">
                        <Link to="/legal/privacy" className="text-xs text-white/40 hover:text-white transition-colors">
                            Privacidad
                        </Link>
                        <Link to="/legal/terms" className="text-xs text-white/40 hover:text-white transition-colors">
                            Términos
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
};
