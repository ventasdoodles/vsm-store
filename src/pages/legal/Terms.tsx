import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';

export function Terms() {
    return (
        <div className="min-h-screen bg-primary-950 pb-20 pt-20 md:pt-24">
            <SEO
                title="Términos y Condiciones"
                description="Términos y condiciones de uso de VSM Store - Vape y productos 420 en Xalapa, Veracruz."
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
                        <div className="rounded-xl bg-vape-500/10 p-3 border border-vape-500/30">
                            <FileText className="h-6 w-6 text-vape-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-primary-100">Términos y Condiciones</h1>
                            <p className="text-sm text-primary-500">Última actualización: Febrero 2026</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-primary-800/50 bg-primary-900/20 p-6 md:p-8 backdrop-blur-sm">
                    <div className="prose prose-invert prose-primary max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">1. Aceptación de Términos</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Al acceder y utilizar VSM Store (en adelante, "la Tienda"), usted acepta estar sujeto a estos Términos y Condiciones,
                                todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.
                                Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">2. Uso del Servicio</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                VSM Store es una plataforma de comercio electrónico que ofrece productos de vapeo y cannabis para mayores de edad.
                                Al utilizar nuestros servicios, usted declara y garantiza que:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Es mayor de 18 años</li>
                                <li>Tiene capacidad legal para celebrar contratos vinculantes</li>
                                <li>Utilizará los productos adquiridos de manera responsable y conforme a la legislación mexicana</li>
                                <li>La información proporcionada es precisa y veraz</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">3. Productos y Precios</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Todos los precios están expresados en Pesos Mexicanos (MXN) e incluyen IVA cuando aplique.
                                Nos reservamos el derecho de modificar precios sin previo aviso. Los precios aplicables serán
                                los vigentes al momento de realizar el pedido.
                            </p>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Las imágenes de productos son ilustrativas. Nos esforzamos por mostrar los colores con precisión,
                                pero no podemos garantizar que la visualización en su dispositivo sea exacta.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">4. Proceso de Compra</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                El proceso de compra se realiza a través de nuestra plataforma en línea. Al finalizar su pedido:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Recibirá confirmación vía WhatsApp con los detalles de su pedido</li>
                                <li>Nuestro equipo coordinará el pago y envío directamente con usted</li>
                                <li>Los pedidos están sujetos a disponibilidad de inventario</li>
                                <li>Nos reservamos el derecho de rechazar o cancelar pedidos a nuestra discreción</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">5. Métodos de Pago</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Aceptamos los siguientes métodos de pago:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Efectivo (pago en punto de entrega)</li>
                                <li>Transferencia bancaria</li>
                                <li>Mercado Pago (cuando esté disponible)</li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                El pedido será procesado una vez confirmado el pago.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">6. Envío y Entrega</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Realizamos entregas en Xalapa, Veracruz y zona metropolitana. Los tiempos de entrega son estimados
                                y pueden variar según disponibilidad y ubicación. Los costos de envío se calculan según la distancia
                                y se informan antes de confirmar el pedido.
                            </p>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                No somos responsables por retrasos causados por circunstancias fuera de nuestro control.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">7. Política de Devoluciones</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Por razones de higiene y salud, los productos de vapeo y consumibles no son retornables una vez
                                abiertos o utilizados. Aceptamos devoluciones únicamente en los siguientes casos:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>Producto defectuoso de fábrica</li>
                                <li>Producto incorrecto enviado</li>
                                <li>Daños durante el envío</li>
                            </ul>
                            <p className="text-primary-300 leading-relaxed mt-4">
                                Las devoluciones deben solicitarse dentro de las 48 horas posteriores a la recepción del producto,
                                presentando evidencia fotográfica.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">8. Programa de Lealtad</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Nuestro programa de lealtad otorga puntos por compras realizadas. Los puntos:
                            </p>
                            <ul className="list-disc list-inside text-primary-300 space-y-2 ml-4">
                                <li>No tienen valor monetario</li>
                                <li>No son transferibles</li>
                                <li>Pueden ser canjeados según las condiciones del programa</li>
                                <li>Expiran según las políticas vigentes</li>
                                <li>Pueden modificarse o cancelarse sin previo aviso</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">9. Propiedad Intelectual</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Todo el contenido de este sitio, incluyendo textos, gráficos, logos, iconos, imágenes y software,
                                es propiedad de VSM Store o sus proveedores de contenido y está protegido por las leyes mexicanas
                                e internacionales de derechos de autor.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">10. Limitación de Responsabilidad</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                VSM Store no será responsable por daños indirectos, incidentales, especiales o consecuentes
                                derivados del uso o la imposibilidad de uso de nuestros productos o servicios.
                            </p>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                El uso de productos de vapeo y cannabis es responsabilidad exclusiva del consumidor.
                                Recomendamos consultar con profesionales de la salud antes de su uso.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">11. Privacidad</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                El uso de nuestros servicios también está regido por nuestra{' '}
                                <Link to="/legal/privacy" className="text-vape-400 hover:text-vape-300 underline">
                                    Política de Privacidad
                                </Link>
                                . Al aceptar estos Términos, también acepta nuestra Política de Privacidad.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">12. Modificaciones</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                                Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio.
                                Es su responsabilidad revisar estos términos periódicamente.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">13. Jurisdicción</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.
                                Cualquier disputa será resuelta en los tribunales de Xalapa, Veracruz, México.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-primary-100 mb-4">14. Contacto</h2>
                            <p className="text-primary-300 leading-relaxed mb-4">
                                Para preguntas sobre estos Términos y Condiciones, puede contactarnos:
                            </p>
                            <ul className="list-none text-primary-300 space-y-2">
                                <li><strong className="text-primary-200">WhatsApp:</strong> +52 228 123 4567</li>
                                <li><strong className="text-primary-200">Ubicación:</strong> Xalapa, Veracruz, México</li>
                                <li>
                                    <strong className="text-primary-200">Sitio web:</strong>{' '}
                                    <Link to="/contact" className="text-vape-400 hover:text-vape-300 underline">
                                        Formulario de contacto
                                    </Link>
                                </li>
                            </ul>
                        </section>

                        <div className="mt-10 pt-6 border-t border-primary-800/50">
                            <p className="text-sm text-primary-500 italic">
                                Al utilizar VSM Store, usted reconoce que ha leído, entendido y acepta estar sujeto a estos
                                Términos y Condiciones.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
