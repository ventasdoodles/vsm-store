import { Link } from '@tanstack/react-router';
import { ArrowLeft, FileText } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';

export function Terms() {
    return (
        <div className="min-h-screen bg-theme-primary pb-20 pt-20 md:pt-24">
            <SEO
                title="T�rminos y Condiciones"
                description="T�rminos y condiciones de uso de VSM Store - Vape y productos 420 en Acapulco, Guerrero."
            />

            <div className="container-vsm max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to={"/" as any}
                        className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-vape-500/10 p-3 border border-vape-500/30">
                            <FileText className="h-6 w-6 text-vape-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-theme-primary">T�rminos y Condiciones</h1>
                            <p className="text-sm text-theme-secondary">�ltima actualizaci�n: Febrero 2026</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-theme bg-theme-primary/20 p-6 md:p-8 backdrop-blur-sm">
                    <div className="prose prose-invert prose-primary max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">1. Aceptaci�n de T�rminos</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Al acceder y utilizar VSM Store (en adelante, "la Tienda"), usted acepta estar sujeto a estos T�rminos y Condiciones,
                                todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables.
                                Si no est� de acuerdo con alguno de estos t�rminos, tiene prohibido usar o acceder a este sitio.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">2. Uso del Servicio</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                VSM Store es una plataforma de comercio electr�nico que ofrece productos de vapeo y cannabis para mayores de edad.
                                Al utilizar nuestros servicios, usted declara y garantiza que:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Es mayor de 18 a�os</li>
                                <li>Tiene capacidad legal para celebrar contratos vinculantes</li>
                                <li>Utilizar� los productos adquiridos de manera responsable y conforme a la legislaci�n mexicana</li>
                                <li>La informaci�n proporcionada es precisa y veraz</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">3. Productos y Precios</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Todos los precios est�n expresados en Pesos Mexicanos (MXN) e incluyen IVA cuando aplique.
                                Nos reservamos el derecho de modificar precios sin previo aviso. Los precios aplicables ser�n
                                los vigentes al momento de realizar el pedido.
                            </p>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Las im�genes de productos son ilustrativas. Nos esforzamos por mostrar los colores con precisi�n,
                                pero no podemos garantizar que la visualizaci�n en su dispositivo sea exacta.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">4. Proceso de Compra</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                El proceso de compra se realiza a trav�s de nuestra plataforma en l�nea. Al finalizar su pedido:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Recibir� confirmaci�n v�a WhatsApp con los detalles de su pedido</li>
                                <li>Nuestro equipo coordinar� el pago y env�o directamente con usted</li>
                                <li>Los pedidos est�n sujetos a disponibilidad de inventario</li>
                                <li>Nos reservamos el derecho de rechazar o cancelar pedidos a nuestra discreci�n</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">5. M�todos de Pago</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Aceptamos los siguientes m�todos de pago:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Efectivo (pago en punto de entrega)</li>
                                <li>Transferencia bancaria</li>
                                <li>Mercado Pago (cuando est� disponible)</li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                El pedido ser� procesado una vez confirmado el pago.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">6. Env�o y Entrega</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Realizamos entregas en Acapulco, Guerrero y zona metropolitana. Los tiempos de entrega son estimados
                                y pueden variar seg�n disponibilidad y ubicaci�n. Los costos de env�o se calculan seg�n la distancia
                                y se informan antes de confirmar el pedido.
                            </p>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                No somos responsables por retrasos causados por circunstancias fuera de nuestro control.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">7. Pol�tica de Devoluciones</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Por razones de higiene y salud, los productos de vapeo y consumibles no son retornables una vez
                                abiertos o utilizados. Aceptamos devoluciones �nicamente en los siguientes casos:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Producto defectuoso de f�brica</li>
                                <li>Producto incorrecto enviado</li>
                                <li>Da�os durante el env�o</li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                Las devoluciones deben solicitarse dentro de las 48 horas posteriores a la recepci�n del producto,
                                presentando evidencia fotogr�fica.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">8. Programa de Lealtad</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Nuestro programa de lealtad otorga puntos por compras realizadas. Los puntos:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>No tienen valor monetario</li>
                                <li>No son transferibles</li>
                                <li>Pueden ser canjeados seg�n las condiciones del programa</li>
                                <li>Expiran seg�n las pol�ticas vigentes</li>
                                <li>Pueden modificarse o cancelarse sin previo aviso</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">9. Propiedad Intelectual</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Todo el contenido de este sitio, incluyendo textos, gr�ficos, logos, iconos, im�genes y software,
                                es propiedad de VSM Store o sus proveedores de contenido y est� protegido por las leyes mexicanas
                                e internacionales de derechos de autor.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">10. Limitaci�n de Responsabilidad</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                VSM Store no ser� responsable por da�os indirectos, incidentales, especiales o consecuentes
                                derivados del uso o la imposibilidad de uso de nuestros productos o servicios.
                            </p>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                El uso de productos de vapeo y cannabis es responsabilidad exclusiva del consumidor.
                                Recomendamos consultar con profesionales de la salud antes de su uso.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">11. Privacidad</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                El uso de nuestros servicios tambi�n est� regido por nuestra{' '}
                                <Link to={"/legal/privacy" as any} className="text-vape-400 hover:text-vape-300 underline">
                                    Pol�tica de Privacidad
                                </Link>
                                . Al aceptar estos T�rminos, tambi�n acepta nuestra Pol�tica de Privacidad.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">12. Modificaciones</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Nos reservamos el derecho de modificar estos t�rminos en cualquier momento.
                                Las modificaciones entrar�n en vigor inmediatamente despu�s de su publicaci�n en el sitio.
                                Es su responsabilidad revisar estos t�rminos peri�dicamente.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">13. Jurisdicci�n</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Estos t�rminos se rigen por las leyes de los Estados Unidos Mexicanos.
                                Cualquier disputa ser� resuelta en los tribunales de Acapulco, Guerrero, M�xico.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">14. Contacto</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Para preguntas sobre estos T�rminos y Condiciones, puede contactarnos:
                            </p>
                            <ul className="list-none text-theme-secondary space-y-2">
                                <li><strong className="text-theme-primary">WhatsApp:</strong> +52 228 123 4567</li>
                                <li><strong className="text-theme-primary">Ubicaci�n:</strong> Acapulco, Guerrero, M�xico</li>
                                <li>
                                    <strong className="text-theme-primary">Sitio web:</strong>{' '}
                                    <Link to={"/contact" as any} className="text-vape-400 hover:text-vape-300 underline">
                                        Formulario de contacto
                                    </Link>
                                </li>
                            </ul>
                        </section>

                        <div className="mt-10 pt-6 border-t border-theme">
                            <p className="text-sm text-theme-secondary italic">
                                Al utilizar VSM Store, usted reconoce que ha le�do, entendido y acepta estar sujeto a estos
                                T�rminos y Condiciones.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
