/**
 * // ─── COMPONENTE: Footer ───
 * // Arquitectura: Shell Lego (Lego Master)
 * // Proposito principal: Cierre inmersivo con estética Cinema y Newsletter 3K.
 * // Estilo: Cinema Glass, Poly-Glow Orbs, High-Contrast Typography (§2.1).
 */
import { ElementType, memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import {
    Facebook, Instagram, Twitter, Mail, Phone,
    ShieldCheck, HeartHandshake, CreditCard, Droplet, Truck,
    Zap, ArrowRight, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/config/site';
import { HeaderLogo } from './header/HeaderLogo';
import { useNotification } from '@/hooks/useNotification';

// ── Constantes y Configuración de Datos ───────────────────────────────────────
const SHOP_LINKS = [
    { name: 'Vape HQ', path: '/vape' },
    { name: '420 Culture', path: '/420' },
    { name: 'Nuevos Drops', path: '/vape' },
    { name: 'Explorar Todo', path: '/buscar' },
];

const SERVICE_LINKS = [
    { name: 'Logística de Envío', path: '/rastreo' },
    { name: 'Bitácora de Compras', path: '/orders' },
    { name: 'Soporte Directo', path: '/contact' },
    { name: 'Marco Legal', path: '/legal/terms' },
    { name: 'Privacidad Datos', path: '/legal/privacy' },
];

const TRUST_BADGES = [
    { label: 'Encriptación 256-bit', icon: Shield, title: 'Pago Blindado' },
    { label: 'Logística Regional', icon: Truck, title: 'Envíos Blindados' },
    { label: 'Pasarela Multi-Pago', icon: CreditCard, title: 'Transacciones Seguras' },
];

const SOCIAL_LINKS = [
    {
        name: 'Instagram',
        href: SITE_CONFIG.social.instagram,
        icon: Instagram,
        gradient: 'from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]'
    },
    {
        name: 'Facebook',
        href: SITE_CONFIG.social.facebook,
        icon: Facebook,
        gradient: 'from-[#1877F2] to-[#0052cc]'
    },
    {
        name: 'Twitter',
        href: 'https://twitter.com',
        icon: Twitter,
        gradient: 'from-[#1DA1F2] to-[#0d8bd9]'
    },
];

// ── Sub-componentes (Legos) ──────────────────────────────────────────────────

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <li>
            <Link
                to={to}
                className="group flex items-center gap-2 text-sm text-theme-tertiary hover:text-white transition-all duration-500"
            >
                <div className="h-px w-0 bg-accent-primary group-hover:w-3 transition-all duration-500" />
                <span className="group-hover:translate-x-1 transition-transform duration-500 font-bold uppercase tracking-widest text-[10px] opacity-60 group-hover:opacity-100">
                    {children}
                </span>
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
            className="group relative p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 overflow-hidden"
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-700 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            150px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.05),
                            transparent 80%
                        )
                    `,
                }}
            />
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 relative z-10 opacity-40 group-hover:opacity-100 transition-opacity">
                <Icon className={cn("w-4 h-4", colorClass)} />
                {title}
            </h4>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

function SocialButton({ href, icon: Icon, gradient, name }: typeof SOCIAL_LINKS[0]) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={name}
            className="relative group p-0.5 rounded-2xl transition-all duration-500 hover:scale-110 active:scale-95"
        >
            <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500", gradient)} />
            <div className="relative h-12 w-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-white/50 group-hover:text-white group-hover:border-white/20 transition-all duration-500 backdrop-blur-xl">
                <Icon size={20} />
            </div>
        </a>
    );
}

// ── Componente Principal ─────────────────────────────────────────────────────

export const Footer = memo(function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const notify = useNotification();

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribed(true);
        notify.success('Protocolo Completado', 'Te has suscrito exitosamente al newsletter.');
    };

    return (
        <footer className="relative bg-[#02060c] pt-24 pb-12 overflow-hidden border-t border-white/5">
            {/* 🌌 Cinema Poly-Glow Orbs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.05, 0.12, 0.05],
                        x: [0, 100, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-primary rounded-full blur-[150px] opacity-10" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1.3, 1, 1.3],
                        opacity: [0.03, 0.1, 0.03],
                        x: [0, -100, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-vape-500 rounded-full blur-[180px] opacity-10" 
                />
            </div>

            <div className="container-vsm relative z-10 px-6 sm:px-10">
                {/* 🧧 Cinema Newsletter 3K */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative p-10 sm:p-16 rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl mb-24 group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/[0.03] via-transparent to-vape-500/[0.03]" />
                    
                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 animate-pulse">
                                <Zap className="h-3 w-3 fill-current" />
                                Protocolo VIP VSM
                            </div>
                            <h3 className="text-4xl sm:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                                Únete a la <span className="text-accent-primary">Trascendencia</span>
                            </h3>
                            <p className="text-sm font-bold text-theme-tertiary uppercase tracking-widest opacity-60 max-w-md">
                                Suscríbete para lanzamientos exclusivos y un <span className="text-white font-black">10% de bono</span> en tu primera misión.
                            </p>
                        </div>

                        <form onSubmit={handleSubscribe} className="relative group/form">
                            {subscribed ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-4 text-emerald-400 p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl"
                                >
                                    <div className="h-12 w-12 rounded-full border border-emerald-400 flex items-center justify-center">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Enlace de acceso enviado</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-6 flex items-center text-theme-tertiary group-focus-within/input:text-accent-primary transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Introduce tu dirección de email..."
                                            required
                                            className="w-full h-16 sm:h-20 pl-16 pr-32 bg-black border border-white/5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest placeholder:text-theme-tertiary/40 focus:outline-none focus:border-accent-primary/50 transition-all italic text-white"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-3 top-3 bottom-3 px-8 bg-accent-primary text-black font-black uppercase italic text-xs rounded-xl transition-all hover:scale-[1.05] active:scale-95 shadow-2xl flex items-center gap-2 group/btn"
                                        >
                                            <span>Unirse</span>
                                            <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                        </button>
                                    </div>
                                    <p className="text-[9px] font-black text-theme-tertiary uppercase tracking-[0.2em] opacity-40 text-center lg:text-left px-4">
                                        Al unirte aceptas nuestras políticas de privacidad avanzada.
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </motion.div>

                {/* Grid Principal de Navegación 3K */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-24">
                    {/* Marca */}
                    <div className="lg:col-span-4 space-y-10 p-4">
                        <div className="block w-fit scale-125 origin-left">
                            <HeaderLogo />
                        </div>
                        <p className="text-xs font-black text-theme-tertiary uppercase tracking-widest leading-loose opacity-60">
                            Redefiniendo el lujo en <span className="text-white">Vape & 420 Culture</span>. Calidad suprema, discreción absoluta y curaduría de marcas globales para cada entrega.
                        </p>
                        <div className="space-y-4">
                            <a href="mailto:hq@vsmstore.com" className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary hover:text-accent-primary transition-all group">
                                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent-primary/10 group-hover:border-accent-primary/30 group-hover:scale-110 transition-all duration-500">
                                    <Mail size={16} />
                                </div>
                                hq@vsmstore.com
                            </a>
                            <a href="tel:+528100000000" className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary hover:text-emerald-400 transition-all group">
                                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-400/10 group-hover:border-emerald-400/30 group-hover:scale-110 transition-all duration-500">
                                    <Phone size={16} />
                                </div>
                                +52 (81) VSM-LUXE
                            </a>
                        </div>
                    </div>

                    {/* Links Columnas */}
                    <div className="lg:col-span-2">
                        <ColumnWithSpotlight title="Catálogo" icon={Droplet} colorClass="text-accent-primary">
                            <ul className="space-y-5">
                                {SHOP_LINKS.map((item) => (
                                    <FooterLink key={item.name} to={item.path}>{item.name}</FooterLink>
                                ))}
                            </ul>
                        </ColumnWithSpotlight>
                    </div>
                    <div className="lg:col-span-3">
                        <ColumnWithSpotlight title="Centro Operativo" icon={HeartHandshake} colorClass="text-red-400">
                            <ul className="space-y-5">
                                {SERVICE_LINKS.map((item) => (
                                    <FooterLink key={item.name} to={item.path}>{item.name}</FooterLink>
                                ))}
                            </ul>
                        </ColumnWithSpotlight>
                    </div>
                    <div className="lg:col-span-3">
                        <ColumnWithSpotlight title="Conexión Social" icon={ShieldCheck} colorClass="text-emerald-400">
                            <div className="space-y-8">
                                <p className="text-[10px] font-bold text-theme-tertiary uppercase tracking-widest leading-relaxed opacity-60">
                                    Únete a nuestra élite. Drops, eventos y preventas exclusivas a través de nuestros canales oficiales.
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

                {/* Bottom Bar Cinematic */}
                <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-4 text-[9px] font-black text-theme-tertiary uppercase tracking-[0.3em] opacity-40">
                        <span>© {new Date().getFullYear()} VSM STORE</span>
                        <div className="h-1 w-1 rounded-full bg-theme-tertiary" />
                        <span>TRANSFERENCE PROTOCOL 3.0</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {TRUST_BADGES.map((badge) => (
                            <div key={badge.label} className="flex items-center gap-3 group/trust cursor-help" title={badge.title}>
                                <badge.icon size={14} className="text-theme-tertiary group-hover:text-accent-primary transition-colors" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-theme-tertiary group-hover:text-white transition-colors">
                                    {badge.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <nav className="flex gap-8">
                        <Link to="/legal/privacy" className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-tertiary hover:text-white transition-all">Privacidad</Link>
                        <Link to="/legal/terms" className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-tertiary hover:text-white transition-all">Términos</Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
});
