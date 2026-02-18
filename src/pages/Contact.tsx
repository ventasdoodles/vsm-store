import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, MessageCircle, Clock, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
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

        // Generate WhatsApp message
        const whatsappMessage = `
*Contacto desde VSM Store*

*Nombre:* ${formData.name}
*Email:* ${formData.email}
*Teléfono:* ${formData.phone}

*Mensaje:*
${formData.message}
        `.trim();

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/5212281234567?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        // Clear form
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-primary-950 pb-20 pt-20 md:pt-24">
            <SEO
                title="Contacto"
                description="Contáctanos en VSM Store - Vape y productos 420 en Xalapa, Veracruz."
            />

            <div className="container-vsm max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-200 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-primary-100 mb-2">Contacto</h1>
                        <p className="text-primary-400">¿Tienes alguna pregunta? Estamos aquí para ayudarte</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        {/* WhatsApp */}
                        <div className="rounded-2xl border border-primary-800/50 bg-primary-900/20 p-6 backdrop-blur-sm">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-vape-500/10 p-3 border border-vape-500/30 shrink-0">
                                    <MessageCircle className="h-6 w-6 text-vape-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-primary-100 mb-2">WhatsApp</h3>
                                    <p className="text-primary-400 mb-3">
                                        La forma más rápida de contactarnos
                                    </p>
                                    <a
                                        href="https://wa.me/5212281234567"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-vape-400 hover:text-vape-300 font-medium"
                                    >
                                        <Phone className="h-4 w-4" />
                                        +52 228 123 4567
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="rounded-2xl border border-primary-800/50 bg-primary-900/20 p-6 backdrop-blur-sm">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-herbal-500/10 p-3 border border-herbal-500/30 shrink-0">
                                    <MapPin className="h-6 w-6 text-herbal-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-primary-100 mb-2">Ubicación</h3>
                                    <p className="text-primary-300 mb-3">
                                        Xalapa, Veracruz<br />
                                        México
                                    </p>
                                    <a
                                        href="https://maps.google.com/?q=Xalapa,Veracruz,Mexico"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-herbal-400 hover:text-herbal-300 font-medium text-sm"
                                    >
                                        Ver en Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="rounded-2xl border border-primary-800/50 bg-primary-900/20 p-6 backdrop-blur-sm">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-blue-500/10 p-3 border border-blue-500/30 shrink-0">
                                    <Clock className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-primary-100 mb-3">Horario de Atención</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-primary-300">
                                            <span>Lunes - Viernes</span>
                                            <span className="font-medium">10:00 AM - 8:00 PM</span>
                                        </div>
                                        <div className="flex justify-between text-primary-300">
                                            <span>Sábado</span>
                                            <span className="font-medium">10:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between text-primary-300">
                                            <span>Domingo</span>
                                            <span className="font-medium">Cerrado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-2xl border border-primary-800/50 bg-primary-900/20 p-6 md:p-8 backdrop-blur-sm">
                        <h2 className="text-2xl font-bold text-primary-100 mb-2">Envíanos un Mensaje</h2>
                        <p className="text-primary-400 mb-6 text-sm">
                            Completa el formulario y nos pondremos en contacto contigo vía WhatsApp
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-primary-300 mb-2">
                                    Nombre completo *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl border border-primary-800 bg-primary-900/50 px-4 py-2.5 text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none transition-colors"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-primary-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-xl border border-primary-800 bg-primary-900/50 px-4 py-2.5 text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none transition-colors"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-primary-300 mb-2">
                                    Teléfono *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full rounded-xl border border-primary-800 bg-primary-900/50 px-4 py-2.5 text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none transition-colors"
                                    placeholder="228..."
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-primary-300 mb-2">
                                    Mensaje *
                                </label>
                                <textarea
                                    id="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full rounded-xl border border-primary-800 bg-primary-900/50 px-4 py-2.5 text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none resize-none transition-colors"
                                    placeholder="¿En qué podemos ayudarte?"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-vape-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-vape-900/20 transition-all hover:bg-vape-500 hover:shadow-vape-500/20 hover:-translate-y-0.5"
                            >
                                <Send className="h-5 w-5" />
                                Enviar por WhatsApp
                            </button>

                            <p className="text-xs text-primary-500 text-center">
                                Al enviar este formulario, serás redirigido a WhatsApp con tu mensaje prellenado
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
