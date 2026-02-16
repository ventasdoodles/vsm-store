// Página de Contacto - VSM Store
import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Send, MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';

export function Contact() {
    useEffect(() => {
        document.title = 'Contacto | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const text = `
Hola VSM Store, mi nombre es *${formData.name}*.

📧 Email: ${formData.email}
📱 Teléfono: ${formData.phone || 'N/A'}
📝 Asunto: *${formData.subject}*

${formData.message}
        `.trim();

        const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');

        // Reset opcional
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container-vsm py-12">
            <div className="grid gap-12 lg:grid-cols-2">

                {/* Columna Izquierda: Información */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-100 mb-2">Contáctanos</h1>
                        <p className="text-primary-400">
                            ¿Tienes dudas sobre algún producto o pedido? Estamos aquí para ayudarte.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-vape-400">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary-200">Visítanos</h3>
                                <p className="text-sm text-primary-400 mt-1">
                                    {SITE_CONFIG.location.address}<br />
                                    {SITE_CONFIG.location.city}, {SITE_CONFIG.location.state}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-herbal-400">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary-200">WhatsApp</h3>
                                <p className="text-sm text-primary-400 mt-1 mb-2">
                                    Atención rápida y personalizada
                                </p>
                                <a
                                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-vape-400 hover:text-vape-300 transition-colors"
                                >
                                    Enviar mensaje →
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-blue-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary-200">Correo Electrónico</h3>
                                <p className="text-sm text-primary-400 mt-1 mb-2">
                                    Para consultas generales
                                </p>
                                <a
                                    href={`mailto:${SITE_CONFIG.contact.email}`}
                                    className="text-sm font-medium text-vape-400 hover:text-vape-300 transition-colors"
                                >
                                    {SITE_CONFIG.contact.email}
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-orange-400">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-primary-200">Teléfono</h3>
                                <p className="text-sm text-primary-400 mt-1">
                                    {SITE_CONFIG.contact.phone}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mapa Embebido */}
                    <div className="aspect-video w-full overflow-hidden rounded-xl border border-primary-800 bg-primary-900/50">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120044.8647226573!2d-96.99347587178082!3d19.52737529816568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85db2f7eb1203061%3A0xe549e35492dcc639!2sXalapa-Enr%C3%ADquez%2C%20Ver.!5e0!3m2!1ses!4v1709840000000!5m2!1ses"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>

                {/* Columna Derecha: Formulario */}
                <div className="rounded-2xl border border-primary-800 bg-primary-900/30 p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-semibold text-primary-200">Envíanos un mensaje</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-primary-400">Nombre completo *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-lg bg-primary-950 border border-primary-800 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 focus:border-vape-500/50 focus:ring-2 focus:ring-vape-500/10 transition-all outline-none"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-primary-400">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full rounded-lg bg-primary-950 border border-primary-800 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 focus:border-vape-500/50 focus:ring-2 focus:ring-vape-500/10 transition-all outline-none"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-primary-400">Teléfono</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full rounded-lg bg-primary-950 border border-primary-800 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 focus:border-vape-500/50 focus:ring-2 focus:ring-vape-500/10 transition-all outline-none"
                                        placeholder="(Opcional)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="mb-1.5 block text-xs font-medium text-primary-400">Asunto *</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full rounded-lg bg-primary-950 border border-primary-800 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 focus:border-vape-500/50 focus:ring-2 focus:ring-vape-500/10 transition-all outline-none"
                                    placeholder="¿En qué podemos ayudarte?"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-primary-400">Mensaje *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full rounded-lg bg-primary-950 border border-primary-800 px-4 py-2.5 text-sm text-primary-200 placeholder:text-primary-600 focus:border-vape-500/50 focus:ring-2 focus:ring-vape-500/10 transition-all outline-none resize-none"
                                    placeholder="Escribe tu mensaje aquí..."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-vape-500 py-3 text-sm font-semibold text-white shadow-lg shadow-vape-500/25 transition-all hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Send className="h-4 w-4" />
                            Enviar mensaje
                        </button>

                        <p className="text-center text-xs text-primary-500">
                            Se abrirá WhatsApp para enviar tu mensaje
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
