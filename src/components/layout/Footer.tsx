/**
 * // ─── COMPONENTE: Footer ───
 * // Arquitectura: Shell Lego (Lego Master)
 * // Proposito principal: Cierre inmersivo con efectos Abyssal Glow y Newsletter reactivado.
 *    Design: Glass-Carbon aesthetic, Floating Light Orbs, Column Spotlights.
 * // Regla / Notas: Incluye validación de Newsletter y links dinámicos.
 */
import { ElementType, memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import {
    Facebook, Instagram, Twitter, Mail, Phone,
    ShieldCheck, HeartHandshake, CreditCard, Droplet, Truck,
    Send, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/config/site';
import { HeaderLogo } from './header/HeaderLogo';
import { toast } from 'react-hot-toast';

// ── Constantes y Configuración de Datos ───────────────────────────────────────
const SHOP_LINKS = [
    { name: 'Vape', path: '/vape' },
    { name: '420', path: '/420' },
    { name: 'Nuevos', path: '/vape' },
    { name: 'Búsqueda', path: '/buscar' },
];

const SERVICE_LINKS = [
    { name: 'Rastrear Mi Pedido', path: '/rastreo' },
    { name: 'Mis Compras', path: '/orders' },
    { name: 'Contacto', path: '/contact' },
    { name: 'Términos y Condiciones', path: '/legal/terms' },
    { name: 'Política de Privacidad', path: '/legal/privacy' },
];

const TRUST_BADGES = [
    { label: '100% Seguro', icon: ShieldCheck, title: 'Pago Seguro' },
    { label: 'Envío Nacional', icon: Truck, title: 'Envíos a todo México' },
    { label: 'Tarjetas & Efectivo', icon: CreditCard, title: 'Múltiples métodos de pago' },
];

const SOCIAL_LINKS = [
    {
        name: 'Instagram',
        href: SITE_CONFIG.social.instagram,
        icon: Instagram,
        hoverClass: 'hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent'
    },
    {
        name: 'Facebook',
        href: SITE_CONFIG.social.facebook,
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

function ColumnWithSpotlight({ title, icon: Icon, colorClass, children }: { title: string; icon: ElementType; colorClass: string; children: React.ReactNode }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div 
            onMouseMove={handleMouseMove}
            className="group relative p-6 rounded-2xl border border-transparent hover:border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500"
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            120px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.05),
                            transparent 80%
                        )
                    `,
                }}
            />
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2 relative z-10">
                <Icon className={cn("w-4 h-4", colorClass)} />
                {title}
            </h4>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

function SocialButton({ href, icon: Icon, hoverClass, name }: typeof SOCIAL_LINKS[0]) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={name}
            title={name}
            className={cn(
                "w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-300 shadow-lg hover:scale-110 hover:-translate-y-1 relative group overflow-hidden",
                hoverClass
            )}
        >
            <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
            />
            <Icon className="w-5 h-5 relative z-10" />
        </a>
    );
}

function TrustBadge({ label, icon: Icon, title }: typeof TRUST_BADGES[0]) {
    return (
        <div className="flex items-center gap-1.5" title={title}>
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    );
}

// ── Componente Principal ─────────────────────────────────────────────────────

export const Footer = memo(function Footer() {
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribed(true);
        toast.success('¡Bienvenido al Club VSM! Revisa tu correo.', {
            style: {
                background: '#0f172a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)'
            }
        });
    };

    return (
        <footer className="relative bg-[#050b14] pt-24 pb-8 overflow-hidden border-t border-white/5">
            {/* 🌌 Abyssal Glow Orbs (Framer Motion) */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.05, 0.1, 0.05],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary rounded-full blur-[120px] pointer-events-none -translate-y-1/2" 
            />
            <motion.div 
                animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.03, 0.08, 0.03],
                    x: [0, -50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-1/4 w-96 h-96 bg-vape-500 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" 
            />

            <div className="container-vsm relative z-10">
                {/* 🧧 Newsletter Rebirth (Glass-Carbon) */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-2xl mb-20 relative overflow-hidden group"
                >
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

                    <form onSubmit={handleSubscribe} className="w-full lg:w-[420px] relative z-10 flex flex-col sm:flex-row gap-3">
                        {subscribed ? (
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-2 text-emerald-400 font-semibold text-sm py-3"
                            >
                                <HeartHandshake className="w-5 h-5" />
                                ¡Gracias por suscribirte! Revisa tu bandeja de entrada.
                            </motion.div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </form>
                </motion.div>

                {/* Grid Principal de Navegación */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-8 mb-16">

                    {/* Columna 1: Marca y Contacto */}
                    <div className="lg:col-span-4 space-y-6 p-6">
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
                    <div className="lg:col-span-2">
                        <ColumnWithSpotlight title="Tienda" icon={Droplet} colorClass="text-accent-primary">
                            <ul className="space-y-3.5">
                                {SHOP_LINKS.map((item) => (
                                    <FooterLink key={item.name} to={item.path}>
                                        {item.name}
                                    </FooterLink>
                                ))}
                            </ul>
                        </ColumnWithSpotlight>
                    </div>

                    {/* Columna 3: Servicio al Cliente */}
                    <div className="lg:col-span-3">
                        <ColumnWithSpotlight title="Servicio" icon={HeartHandshake} colorClass="text-red-400">
                            <ul className="space-y-3.5">
                                {SERVICE_LINKS.map((item) => (
                                    <FooterLink key={item.name} to={item.path}>
                                        {item.name}
                                    </FooterLink>
                                ))}
                            </ul>
                        </ColumnWithSpotlight>
                    </div>

                    {/* Columna 4: Comunidad (Redes) */}
                    <div className="lg:col-span-3">
                        <ColumnWithSpotlight title="Comunidad" icon={ShieldCheck} colorClass="text-emerald-400">
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
                        </ColumnWithSpotlight>
                    </div>
                </div>

                {/* Barra Inferior (Bottom Bar) */}
                <div className="pt-8 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-white/40 font-medium text-center lg:text-left tracking-wide">
                        © {new Date().getFullYear()} VSM STORE. TOTAL TRANSCENDENCE EDITION.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 text-white/30 order-first lg:order-none mb-4 lg:mb-0">
                        {TRUST_BADGES.map((badge, index) => (
                            <div key={badge.label} className="flex items-center gap-4">
                                <TrustBadge {...badge} />
                                {index < TRUST_BADGES.length - 1 && (
                                    <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" aria-hidden="true" />
                                )}
                            </div>
                        ))}
                    </div>

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
});
