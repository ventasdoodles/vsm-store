import { MessageCircle, MapPin, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { SITE_CONFIG } from '@/config/site';
import toast from 'react-hot-toast';
import { SEO } from '@/components/seo/SEO';

export function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const whatsappMessage = `*Nuevo mensaje de contacto*%0A%0A*Nombre:* ${formData.name}%0A*Email:* ${formData.email}%0A*Teléfono:* ${formData.phone}%0A*Mensaje:* ${formData.message}`;

        window.open(
            `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${whatsappMessage}`,
            '_blank'
        );

        toast.success('Redirigiendo a WhatsApp...');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-noise pb-20">
            {/* Background Aesthetic Blobs */}
            <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-vape-500/10 blur-[130px] animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-herbal-500/10 blur-[110px] animate-pulse-slow" style={{ animationDelay: '3s' }} />

            <SEO
                title="Contacto"
                description="Contáctanos por WhatsApp, visítanos en Xalapa o envíanos un mensaje."
            />

            <div className="container-vsm py-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-20 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                        Contáctanos
                    </h1>
                    <div className="h-1.5 w-24 bg-vape-500 mx-auto rounded-full" />
                    <p className="text-theme-tertiary max-w-2xl mx-auto font-bold uppercase tracking-widest text-xs opacity-60">
                        ¿Tienes alguna pregunta? Estamos aquí para ayudarte. <br />
                        Contáctanos por WhatsApp o completa el formulario.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* Left: Contact Info */}
                    <div className="space-y-8">
                        {/* WhatsApp Card */}
                        <div className="glass-premium rounded-[2.5rem] p-8 border border-white/10 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all duration-500 spotlight-container group">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-500/20 group-hover:scale-110 transition-transform">
                                    <MessageCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">
                                        WhatsApp
                                    </h3>
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
                                </div>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="glass-premium rounded-[2.5rem] p-8 border border-white/10 spotlight-container">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-vape-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-vape-500/20">
                                    <MapPin className="w-8 h-8 text-vape-400" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic">
                                        Ubicación
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-theme-primary">
                                            Xalapa, Veracruz
                                        </p>
                                        <p className="text-sm font-medium text-theme-tertiary opacity-60 uppercase tracking-widest">
                                            México
                                        </p>
                                    </div>
                                    <a
                                        href="https://maps.google.com/?q=Xalapa,Veracruz,Mexico"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block text-vape-400 hover:text-vape-300 font-bold text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Ver en Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="glass-premium rounded-[2.5rem] p-8 border border-white/10 spotlight-container">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                    <Clock className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase italic mb-6">
                                        Horario
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-theme-tertiary font-bold uppercase tracking-wider text-[10px]">Lunes - Viernes</span>
                                            <span className="text-white font-black">10:00 AM - 8:00 PM</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                                            <span className="text-theme-tertiary font-bold uppercase tracking-wider text-[10px]">Sábado</span>
                                            <span className="text-white font-black">10:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                                            <span className="text-theme-tertiary font-bold uppercase tracking-wider text-[10px]">Domingo</span>
                                            <span className="text-red-500 font-black uppercase tracking-widest">Cerrado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="glass-premium rounded-[3rem] p-10 border border-white/10 shadow-2xl spotlight-container">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">
                                Envíanos un Mensaje
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-theme-tertiary opacity-40">
                                Serás redirigido a WhatsApp vía API
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary ml-1">
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Tu nombre"
                                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-vape-500 transition-all font-bold"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary ml-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="tu@email.com"
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-vape-500 transition-all font-bold"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary ml-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="228..."
                                        className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-vape-500 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary ml-1">
                                    Tu consulta
                                </label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="¿En qué podemos ayudarte?"
                                    rows={4}
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-vape-500/50 focus:border-vape-500 transition-all font-bold resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
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
