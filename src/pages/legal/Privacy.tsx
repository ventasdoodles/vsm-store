import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';

export function Privacy() {
    return (
        <div className="min-h-screen bg-primary-950 pb-20 pt-20 md:pt-24">
            <SEO
                title="Política de Privacidad"
                description="Política de privacidad y protección de datos de VSM Store."
            />

            <div className="container-vsm max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-200 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-herbal-500/10 p-3 border border-herbal-500/30">
                            <Shield className="h-6 w-6 text-herbal-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-primary-100">Política de Privacidad</h1>
                            <p className="text-sm text-primary-500">Última actualización: Febrero 2026</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-primary-800/50 bg-primary-900/20 p-6 md:p-8 backdrop-blur-sm">
                    <div className="prose prose-invert prose-primary max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">1. Responsable del Tratamiento de Datos</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                VSM Store, con domicilio en Xalapa, Veracruz, México, es responsable del tratamiento de sus datos
                                personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares
                                (LFPDPPP).
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">2. Datos Personales Recopilados</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Recopilamos los siguientes datos personales cuando usted:
                            </p>

                            <h3 className="text-lg font-semibold text-primary-200 mb-3 mt-6">Al Crear una Cuenta:</h3>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Nombre completo</li>
                                <li>Correo electrónico</li>
                                <li>Número de teléfono</li>
                                <li>Número de WhatsApp</li>
                                <li>Fecha de nacimiento (opcional)</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-primary-200 mb-3 mt-6">Al Realizar una Compra:</h3>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Dirección de entrega (calle, número, colonia, código postal, ciudad, estado)</li>
                                <li>Información de pago (según el método seleccionado)</li>
                                <li>Historial de pedidos</li>
                                <li>Preferencias de productos</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-primary-200 mb-3 mt-6">Datos Técnicos:</h3>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Dirección IP</li>
                                <li>Tipo de navegador y dispositivo</li>
                                <li>Sistema operativo</li>
                                <li>Páginas visitadas y tiempo de navegación</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">3. Finalidad del Tratamiento</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Utilizamos sus datos personales para las siguientes finalidades:
                            </p>

                            <h3 className="text-lg font-semibold text-primary-200 mb-3 mt-6">Finalidades Necesarias:</h3>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Procesar y entregar sus pedidos</li>
                                <li>Gestionar pagos y facturación</li>
                                <li>Proporcionar servicio al cliente</li>
                                <li>Cumplir con obligaciones legales</li>
                                <li>Prevenir fraudes y garantizar seguridad</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-primary-200 mb-3 mt-6">Finalidades Secundarias (Requieren Consentimiento):</h3>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Enviar promociones y ofertas especiales</li>
                                <li>Personalizar su experiencia de compra</li>
                                <li>Realizar estudios de mercado</li>
                                <li>Mejorar nuestros productos y servicios</li>
                                <li>Gestionar programa de lealtad</li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                Puede oponerse al tratamiento de sus datos para finalidades secundarias en cualquier momento
                                contactándonos vía WhatsApp.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">4. Almacenamiento y Seguridad</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Sus datos personales se almacenan en servidores seguros proporcionados por Supabase
                                (servicio de base de datos con infraestructura en la nube). Implementamos las siguientes
                                medidas de seguridad:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Cifrado de datos en tránsito (HTTPS/TLS)</li>
                                <li>Cifrado de datos en reposo</li>
                                <li>Autenticación de dos factores para acceso administrativo</li>
                                <li>Control de acceso basado en roles</li>
                                <li>Auditorías de seguridad periódicas</li>
                                <li>Respaldos automáticos diarios</li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                Sus contraseñas se almacenan usando algoritmos de hash seguros y nunca son accesibles
                                en texto plano.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">5. Compartir Información</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                No vendemos ni alquilamos sus datos personales a terceros. Compartimos información únicamente en
                                los siguientes casos:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li><strong className="text-primary-200">Proveedores de servicios:</strong> Supabase (hosting de base de datos),
                                    servicios de mensajería (WhatsApp Business), procesadores de pago</li>
                                <li><strong className="text-primary-200">Cumplimiento legal:</strong> Cuando sea requerido por ley o autoridades competentes</li>
                                <li><strong className="text-primary-200">Protección de derechos:</strong> Para hacer cumplir nuestros términos o
                                    proteger nuestros derechos legales</li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                Todos nuestros proveedores están obligados contractualmente a proteger su información y usarla
                                únicamente para los fines especificados.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">6. Derechos ARCO</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                De acuerdo con la LFPDPPP, usted tiene derecho a:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li><strong className="text-primary-200">Acceso:</strong> Conocer qué datos personales tenemos sobre usted</li>
                                <li><strong className="text-primary-200">Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos</li>
                                <li><strong className="text-primary-200">Cancelación:</strong> Solicitar la eliminación de sus datos (sujeto a obligaciones legales)</li>
                                <li><strong className="text-primary-200">Oposición:</strong> Oponerse al tratamiento de sus datos para fines específicos</li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                Para ejercer sus derechos ARCO, puede:
                            </p>
                            <ul className="list-none text-primary-300 space-y-2 mt-4">
                                <li>• Acceder a su perfil en <Link to="/profile" className="text-vape-400 hover:text-vape-300 underline">Mi Cuenta</Link> para
                                    actualizar o eliminar información</li>
                                <li>• Contactarnos vía WhatsApp al +52 228 123 4567</li>
                                <li>• Enviar solicitud formal a través de nuestro <Link to="/contact" className="text-vape-400 hover:text-vape-300 underline">
                                    formulario de contacto</Link></li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                Responderemos a su solicitud dentro de los 20 días hábiles establecidos por la ley.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">7. Cookies y Tecnologías Similares</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Utilizamos localStorage (almacenamiento local del navegador) para:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Mantener su sesión activa</li>
                                <li>Recordar los productos en su carrito de compras</li>
                                <li>Guardar preferencias de navegación</li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                <strong className="text-primary-200">No utilizamos cookies de terceros para rastreo o publicidad.</strong>
                                Puede borrar el localStorage en cualquier momento desde la configuración de su navegador.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">8. Retención de Datos</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Conservamos sus datos personales durante el tiempo necesario para cumplir con las finalidades
                                descritas en este aviso, excepto que:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>La ley requiera un período de retención específico</li>
                                <li>Existan obligaciones fiscales o contables pendientes</li>
                                <li>Sea necesario para resolver disputas o hacer cumplir acuerdos</li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                Los datos de cuentas inactivas por más de 2 años pueden ser eliminados previo aviso.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">9. Transferencias Internacionales</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Sus datos pueden ser transferidos y procesados en servidores ubicados fuera de México
                                (Supabase utiliza infraestructura de AWS). Estas transferencias cumplen con estándares
                                internacionales de protección de datos y están sujetas a acuerdos de procesamiento que
                                garantizan el mismo nivel de protección que las leyes mexicanas.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">10. Menores de Edad</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Nuestros servicios están dirigidos únicamente a personas mayores de 18 años.
                                No recopilamos intencionalmente datos de menores de edad. Si detectamos que hemos
                                recopilado información de un menor, la eliminaremos inmediatamente.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">11. Cambios a esta Política</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento.
                                Los cambios sustanciales serán notificados a través de:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Aviso destacado en el sitio web</li>
                                <li>Notificación por correo electrónico o WhatsApp (para cambios importantes)</li>
                                <li>Actualización de la fecha "Última actualización" en este documento</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">12. Contacto</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Para cualquier pregunta sobre esta Política de Privacidad o el tratamiento de sus datos personales:
                            </p>
                            <ul className="list-none text-primary-300 space-y-2">
                                <li><strong className="text-primary-200">WhatsApp:</strong> +52 228 123 4567</li>
                                <li><strong className="text-primary-200">Ubicación:</strong> Xalapa, Veracruz, México</li>
                                <li>
                                    <strong className="text-primary-200">Formulario:</strong>{' '}
                                    <Link to="/contact" className="text-vape-400 hover:text-vape-300 underline">
                                        Contacto
                                    </Link>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">13. Autoridad de Protección de Datos</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Si considera que sus derechos de protección de datos han sido vulnerados, puede acudir ante el
                                Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI):
                            </p>
                            <ul className="list-none text-primary-300 space-y-2">
                                <li><strong className="text-primary-200">Sitio web:</strong> <a href="https://home.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-vape-400 hover:text-vape-300 underline">home.inai.org.mx</a></li>
                                <li><strong className="text-primary-200">Teléfono:</strong> 800 835 4324</li>
                            </ul>
                        </section>

                        <div className="mt-10 pt-6 border-t border-primary-800/50">
                            <p className="text-sm text-primary-500 italic">
                                Al utilizar VSM Store, usted acepta los términos de esta Política de Privacidad.
                                Le recomendamos leerla periódicamente para estar informado sobre cómo protegemos su información.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
