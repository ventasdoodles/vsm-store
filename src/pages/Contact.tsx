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
        <div className="min-h-screen pb-20 pt-6 bg-theme-primary">
            <SEO
                title="Contacto"
                description="Contáctanos por WhatsApp, visítanos en Xalapa o envíanos un mensaje."
            />

            <div className="container-vsm">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
                        Contáctanos
                    </h1>
                    <p className="text-theme-secondary max-w-2xl mx-auto">
                        ¿Tienes alguna pregunta? Estamos aquí para ayudarte. Contáctanos por WhatsApp
                        o completa el formulario.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Left: Contact Info */}
                    <div className="space-y-6">
                        {/* WhatsApp Card */}
                        <div className="bg-theme-secondary rounded-xl p-6 border border-theme hover:border-accent-primary transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-theme-primary mb-2">
                                        WhatsApp
                                    </h3>
                                    <p className="text-sm text-theme-secondary mb-3">
                                        La forma más rápida de contactarnos
                                    </p>
                                    <a
                                        href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-green-500 hover:text-green-600 font-semibold transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        +52 228 123 4567
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="bg-theme-secondary rounded-xl p-6 border border-theme">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-accent-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-theme-primary mb-2">
                                        Ubicación
                                    </h3>
                                    <p className="text-theme-secondary mb-1">
                                        Xalapa, Veracruz
                                    </p>
                                    <p className="text-theme-secondary mb-3">
                                        México
                                    </p>
                                    <a
                                        href="https://maps.google.com/?q=Xalapa,Veracruz,Mexico"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                                    >
                                        Ver en Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="bg-theme-secondary rounded-xl p-6 border border-theme">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-theme-primary mb-3">
                                        Horario de Atención
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-theme-secondary">Lunes - Viernes</span>
                                            <span className="text-theme-primary font-medium">10:00 AM - 8:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-theme-secondary">Sábado</span>
                                            <span className="text-theme-primary font-medium">10:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-theme-secondary">Domingo</span>
                                            <span className="text-red-500 font-medium">Cerrado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="bg-theme-secondary rounded-xl p-8 border border-theme">
                        <h2 className="text-2xl font-bold text-theme-primary mb-2">
                            Envíanos un Mensaje
                        </h2>
                        <p className="text-sm text-theme-secondary mb-6">
                            Completa el formulario y nos pondremos en contacto contigo vía WhatsApp
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-theme-primary mb-2">
                                    Nombre completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Tu nombre"
                                    className="w-full h-12 px-4 bg-theme-primary border border-theme rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-theme-primary mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="tu@email.com"
                                    className="w-full h-12 px-4 bg-theme-primary border border-theme rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-theme-primary mb-2">
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="228..."
                                    className="w-full h-12 px-4 bg-theme-primary border border-theme rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-theme-primary mb-2">
                                    Mensaje *
                                </label>
                                <textarea
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="¿En qué podemos ayudarte?"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-theme-primary border border-theme rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full h-12 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                            >
                                <Send className="w-5 h-5" />
                                Enviar por WhatsApp
                            </button>

                            <p className="text-xs text-theme-secondary text-center">
                                Al enviar este formulario, serás redirigido a WhatsApp con tu mensaje prellenado
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
