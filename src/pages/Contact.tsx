/**
 * Contact — Página de Contacto de VSM Store.
 *
 * @module Contact
 * @independent Página auto-contenida con su propio form de envíos hacia WhatsApp.
 * Consume SITE_CONFIG para evitar datos hardcodeados.
 */
import { MessageCircle, MapPin, Clock, Send } from 'lucide-react';
import { useState, useCallback } from 'react';
import { SITE_CONFIG } from '@/config/site';
import toast from 'react-hot-toast';
import { SEO } from '@/components/seo/SEO';

// ── Tipos y Constantes ───────────────────────────────────────
interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

const INITIAL_FORM_STATE: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    message: '',
};

// ── Componentes Internos (Legos de Tarjetas Info) ───────────────────

interface InfoCardProps {
    icon: React.ElementType;
    iconColor: string;
    bgIcon: string;
    title: string;
    children: React.ReactNode;
}

function InfoCard({ icon: Icon, iconColor, bgIcon, title, children }: InfoCardProps) {
    return (
        <div className="glass-premium rounded-3xl p-8 vsm-border hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500 spotlight-container group">
            <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 vsm-border group-hover:scale-110 transition-transform ${bgIcon}`}>
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">
                        {title}
                    </h3>
                    {children}
                </div>
            </div>
        </div>
    );
}

// ── Componente Principal ─────────────────────────────────────

export function Contact() {
    const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        const whatsappMessage = `*Nuevo mensaje de contacto*%0A%0A`
            + `*Nombre:* ${formData.name}%0A`
            + `*Email:* ${formData.email}%0A`
            + `*Teléfono:* ${formData.phone}%0A`
            + `*Mensaje:* ${formData.message}`;

        window.open(
            `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${whatsappMessage}`,
            '_blank',
            'noopener,noreferrer'
        );

        toast.success('Redirigiendo a WhatsApp...');
        setFormData(INITIAL_FORM_STATE);
    }, [formData]);

    const handleInputChange = (field: keyof ContactFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-noise pb-20">
            {/* Background Aesthetic Blobs */}
            <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-vape-500/10 blur-[130px] animate-pulse-slow pointer-events-none" />
            <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-herbal-500/10 blur-[110px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '3s' }} />

            <SEO
                title={`Contacto | ${SITE_CONFIG.name}`}
                description={`Contáctanos por WhatsApp, visítanos en ${SITE_CONFIG.location.city} o envíanos un mensaje.`}
            />

            <div className="container-vsm py-12 relative z-10">
                {/* Header Section */}
                <header className="text-center mb-16 md:mb-20 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                        Contáctanos
                    </h1>
                    <div className="h-1.5 w-24 bg-vape-500 mx-auto rounded-full" />
                    <p className="text-theme-tertiary max-w-2xl mx-auto font-bold uppercase tracking-widest text-xs opacity-60">
                        ¿Tienes alguna pregunta? Estamos aquí para ayudarte. <br className="hidden sm:block" />
                        Contáctanos por WhatsApp o completa el formulario.
                    </p>
                </header>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
                    
                    {/* Left Column: Contact Info Cards */}
                    <div className="space-y-6 lg:space-y-8">
                        
                        {/* WhatsApp Card */}
                        <InfoCard 
                            title="WhatsApp" 
                            icon={MessageCircle} 
                            bgIcon="bg-green-500/10" 
                            iconColor="text-green-500"
                        >
                            <p className="text-sm font-medium text-theme-tertiary opacity-60">
                                La forma más rápida de contactarnos
                            </p>
                            <a
                                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 text-green-500 hover:text-green-400 font-black tracking-widest uppercase text-sm mt-4 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Conectar ahora
                            </a>
                        </InfoCard>

                        {/* Location Card */}
                        <InfoCard 
                            title="Ubicación" 
                            icon={MapPin} 
                            bgIcon="bg-vape-500/10" 
                            iconColor="text-vape-400"
                        >
                            <div className="space-y-1 mb-2">
                                <p className="text-lg font-bold text-theme-primary">
                                    {SITE_CONFIG.location.city}, {SITE_CONFIG.location.state}
                                </p>
                                <p className="text-sm font-medium text-theme-tertiary opacity-60 uppercase tracking-widest">
                                    {SITE_CONFIG.location.country}
                                </p>
                            </div>
                            <a
                                href={SITE_CONFIG.location.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-vape-400 hover:text-vape-300 font-bold text-xs uppercase tracking-widest transition-colors"
                            >
                                Ver en Google Maps &rarr;
                            </a>
                        </InfoCard>

                        {/* Hours Card */}
                        <InfoCard 
                            title="Horario" 
                            icon={Clock} 
                            bgIcon="bg-accent-primary/10" 
                            iconColor="text-blue-400"
                        >
                            <div className="space-y-3 w-full mt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-theme-tertiary font-bold uppercase tracking-wider text-xs">Lunes - Viernes</span>
                                    <span className="text-white font-black">10:00 AM - 8:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                                    <span className="text-theme-tertiary font-bold uppercase tracking-wider text-xs">Sábado</span>
                                    <span className="text-white font-black">10:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                                    <span className="text-theme-tertiary font-bold uppercase tracking-wider text-xs">Domingo</span>
                                    <span className="text-red-500 font-black uppercase tracking-widest">Cerrado</span>
                                </div>
                            </div>
                        </InfoCard>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="glass-premium rounded-3xl p-8 sm:p-10 vsm-border shadow-2xl spotlight-container h-fit">
                        <header className="mb-8 sm:mb-10">
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic mb-2">
                                Envíanos un Mensaje
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-theme-tertiary opacity-40">
                                Serás redirigido a WhatsApp vía API
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Input: Nombre */}
                            <div className="space-y-2">
                                <label htmlFor="contact_name" className="text-xs font-black uppercase tracking-[0.2em] text-theme-tertiary ml-1">
                                    Nombre completo
                                </label>
                                <input
                                    id="contact_name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    placeholder="Tu nombre"
                                    className="w-full h-14 px-6 bg-white/5 vsm-border rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-vape-500 transition-all font-bold"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Input: Email */}
                                <div className="space-y-2">
                                    <label htmlFor="contact_email" className="text-xs font-black uppercase tracking-[0.2em] text-theme-tertiary ml-1">
                                        Email
                                    </label>
                                    <input
                                        id="contact_email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange('email')}
                                        placeholder="tu@email.com"
                                        className="w-full h-14 px-6 bg-white/5 vsm-border rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-vape-500 transition-all font-bold"
                                    />
                                </div>

                                {/* Input: Teléfono */}
                                <div className="space-y-2">
                                    <label htmlFor="contact_phone" className="text-xs font-black uppercase tracking-[0.2em] text-theme-tertiary ml-1">
                                        Teléfono
                                    </label>
                                    <input
                                        id="contact_phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange('phone')}
                                        placeholder="Tu número"
                                        className="w-full h-14 px-6 bg-white/5 vsm-border rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-vape-500 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            {/* Input: Mensaje */}
                            <div className="space-y-2">
                                <label htmlFor="contact_message" className="text-xs font-black uppercase tracking-[0.2em] text-theme-tertiary ml-1">
                                    Tu consulta
                                </label>
                                <textarea
                                    id="contact_message"
                                    required
                                    value={formData.message}
                                    onChange={handleInputChange('message')}
                                    placeholder="¿En qué podemos ayudarte?"
                                    rows={4}
                                    className="w-full px-6 py-5 bg-white/5 vsm-border rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-vape-500 transition-all font-bold resize-none"
                                />
                            </div>

                            {/* Botón Submit */}
                            <button
                                type="submit"
                                aria-label="Enviar mensaje por WhatsApp"
                                className="group relative w-full h-14 rounded-2xl bg-vape-500 shadow-2xl shadow-vape-500/25 transition-all hover:shadow-vape-500/50 hover:-translate-y-1 active:translate-y-0 overflow-hidden mt-4"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-vape-600 via-vape-500 to-vape-600 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                                <div className="relative flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-white">
                                    <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    <span>Enviar mensaje</span>
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
