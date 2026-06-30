import { Link } from '@tanstack/react-router';
import { ArrowLeft, Shield } from 'lucide-react';
import { SEO } from '@/components/seo/SEO';

export function Privacy() {
    return (
        <div className="min-h-screen bg-theme-primary pb-20 pt-20 md:pt-24">
            <SEO
                title="Pol�tica de Privacidad"
                description="Pol�tica de privacidad y protecci�n de datos de VSM Store."
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
                        <div className="rounded-xl bg-herbal-500/10 p-3 border border-herbal-500/30">
                            <Shield className="h-6 w-6 text-herbal-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-theme-primary">Pol�tica de Privacidad</h1>
                            <p className="text-sm text-theme-secondary">�ltima actualizaci�n: Febrero 2026</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-2xl border border-theme bg-theme-primary/20 p-6 md:p-8 backdrop-blur-sm">
                    <div className="prose prose-invert prose-primary max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">1. Responsable del Tratamiento de Datos</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                VSM Store, con domicilio en Acapulco, Guerrero, M�xico, es responsable del tratamiento de sus datos
                                personales conforme a la Ley Federal de Protecci�n de Datos Personales en Posesi�n de los Particulares
                                (LFPDPPP).
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">2. Datos Personales Recopilados</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Recopilamos los siguientes datos personales cuando usted:
                            </p>

                            <h3 className="text-lg font-semibold text-theme-primary mb-3 mt-6">Al Crear una Cuenta:</h3>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Nombre completo</li>
                                <li>Correo electr�nico</li>
                                <li>N�mero de tel�fono</li>
                                <li>N�mero de WhatsApp</li>
                                <li>Fecha de nacimiento (opcional)</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-theme-primary mb-3 mt-6">Al Realizar una Compra:</h3>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Direcci�n de entrega (calle, n�mero, colonia, c�digo postal, ciudad, estado)</li>
                                <li>Informaci�n de pago (seg�n el m�todo seleccionado)</li>
                                <li>Historial de pedidos</li>
                                <li>Preferencias de productos</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-theme-primary mb-3 mt-6">Datos T�cnicos:</h3>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Direcci�n IP</li>
                                <li>Tipo de navegador y dispositivo</li>
                                <li>Sistema operativo</li>
                                <li>P�ginas visitadas y tiempo de navegaci�n</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">3. Finalidad del Tratamiento</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Utilizamos sus datos personales para las siguientes finalidades:
                            </p>

                            <h3 className="text-lg font-semibold text-theme-primary mb-3 mt-6">Finalidades Necesarias:</h3>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Procesar y entregar sus pedidos</li>
                                <li>Gestionar pagos y facturaci�n</li>
                                <li>Proporcionar servicio al cliente</li>
                                <li>Cumplir con obligaciones legales</li>
                                <li>Prevenir fraudes y garantizar seguridad</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-theme-primary mb-3 mt-6">Finalidades Secundarias (Requieren Consentimiento):</h3>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Enviar promociones y ofertas especiales</li>
                                <li>Personalizar su experiencia de compra</li>
                                <li>Realizar estudios de mercado</li>
                                <li>Mejorar nuestros productos y servicios</li>
                                <li>Gestionar programa de lealtad</li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                Puede oponerse al tratamiento de sus datos para finalidades secundarias en cualquier momento
                                contact�ndonos v�a WhatsApp.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">4. Almacenamiento y Seguridad</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Sus datos personales se almacenan en servidores seguros proporcionados por Supabase
                                (servicio de base de datos con infraestructura en la nube). Implementamos las siguientes
                                medidas de seguridad:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Cifrado de datos en tr�nsito (HTTPS/TLS)</li>
                                <li>Cifrado de datos en reposo</li>
                                <li>Autenticaci�n de dos factores para acceso administrativo</li>
                                <li>Control de acceso basado en roles</li>
                                <li>Auditor�as de seguridad peri�dicas</li>
                                <li>Respaldos autom�ticos diarios</li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                Sus contrase�as se almacenan usando algoritmos de hash seguros y nunca son accesibles
                                en texto plano.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">5. Compartir Informaci�n</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                No vendemos ni alquilamos sus datos personales a terceros. Compartimos informaci�n �nicamente en
                                los siguientes casos:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li><strong className="text-theme-primary">Proveedores de servicios:</strong> Supabase (hosting de base de datos),
                                    servicios de mensajer�a (WhatsApp Business), procesadores de pago</li>
                                <li><strong className="text-theme-primary">Cumplimiento legal:</strong> Cuando sea requerido por ley o autoridades competentes</li>
                                <li><strong className="text-theme-primary">Protecci�n de derechos:</strong> Para hacer cumplir nuestros t�rminos o
                                    proteger nuestros derechos legales</li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                Todos nuestros proveedores est�n obligados contractualmente a proteger su informaci�n y usarla
                                �nicamente para los fines especificados.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">6. Derechos ARCO</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                De acuerdo con la LFPDPPP, usted tiene derecho a:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li><strong className="text-theme-primary">Acceso:</strong> Conocer qu� datos personales tenemos sobre usted</li>
                                <li><strong className="text-theme-primary">Rectificaci�n:</strong> Solicitar la correcci�n de datos inexactos o incompletos</li>
                                <li><strong className="text-theme-primary">Cancelaci�n:</strong> Solicitar la eliminaci�n de sus datos (sujeto a obligaciones legales)</li>
                                <li><strong className="text-theme-primary">Oposici�n:</strong> Oponerse al tratamiento de sus datos para fines espec�ficos</li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                Para ejercer sus derechos ARCO, puede:
                            </p>
                            <ul className="list-none text-theme-secondary space-y-2 mt-4">
                                <li>� Acceder a su perfil en <Link to={"/profile" as any} className="text-vape-400 hover:text-vape-300 underline">Mi Cuenta</Link> para
                                    actualizar o eliminar informaci�n</li>
                                <li>� Contactarnos v�a WhatsApp al +52 228 123 4567</li>
                                <li>� Enviar solicitud formal a trav�s de nuestro <Link to={"/contact" as any} className="text-vape-400 hover:text-vape-300 underline">
                                    formulario de contacto</Link></li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                Responderemos a su solicitud dentro de los 20 d�as h�biles establecidos por la ley.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">7. Cookies y Tecnolog�as Similares</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Utilizamos localStorage (almacenamiento local del navegador) para:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Mantener su sesi�n activa</li>
                                <li>Recordar los productos en su carrito de compras</li>
                                <li>Guardar preferencias de navegaci�n</li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                <strong className="text-theme-primary">No utilizamos cookies de terceros para rastreo o publicidad.</strong>
                                Puede borrar el localStorage en cualquier momento desde la configuraci�n de su navegador.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">8. Retenci�n de Datos</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Conservamos sus datos personales durante el tiempo necesario para cumplir con las finalidades
                                descritas en este aviso, excepto que:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>La ley requiera un per�odo de retenci�n espec�fico</li>
                                <li>Existan obligaciones fiscales o contables pendientes</li>
                                <li>Sea necesario para resolver disputas o hacer cumplir acuerdos</li>
                            </ul>
                            <p className="text-theme-secondary leading-relaxed mt-4">
                                Los datos de cuentas inactivas por m�s de 2 a�os pueden ser eliminados previo aviso.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">9. Transferencias Internacionales</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Sus datos pueden ser transferidos y procesados en servidores ubicados fuera de M�xico
                                (Supabase utiliza infraestructura de AWS). Estas transferencias cumplen con est�ndares
                                internacionales de protecci�n de datos y est�n sujetas a acuerdos de procesamiento que
                                garantizan el mismo nivel de protecci�n que las leyes mexicanas.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">10. Menores de Edad</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Nuestros servicios est�n dirigidos �nicamente a personas mayores de 18 a�os.
                                No recopilamos intencionalmente datos de menores de edad. Si detectamos que hemos
                                recopilado informaci�n de un menor, la eliminaremos inmediatamente.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">11. Cambios a esta Pol�tica</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Nos reservamos el derecho de actualizar esta Pol�tica de Privacidad en cualquier momento.
                                Los cambios sustanciales ser�n notificados a trav�s de:
                            </p>
                            <ul className="list-disc list-inside text-theme-secondary space-y-2 ml-4">
                                <li>Aviso destacado en el sitio web</li>
                                <li>Notificaci�n por correo electr�nico o WhatsApp (para cambios importantes)</li>
                                <li>Actualizaci�n de la fecha "�ltima actualizaci�n" en este documento</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">12. Contacto</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Para cualquier pregunta sobre esta Pol�tica de Privacidad o el tratamiento de sus datos personales:
                            </p>
                            <ul className="list-none text-theme-secondary space-y-2">
                                <li><strong className="text-theme-primary">WhatsApp:</strong> +52 228 123 4567</li>
                                <li><strong className="text-theme-primary">Ubicaci�n:</strong> Acapulco, Guerrero, M�xico</li>
                                <li>
                                    <strong className="text-theme-primary">Formulario:</strong>{' '}
                                    <Link to={"/contact" as any} className="text-vape-400 hover:text-vape-300 underline">
                                        Contacto
                                    </Link>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-theme-primary mb-4">13. Autoridad de Protecci�n de Datos</h2>
                            <p className="text-theme-secondary leading-relaxed mb-4">
                                Si considera que sus derechos de protecci�n de datos han sido vulnerados, puede acudir ante el
                                Instituto Nacional de Transparencia, Acceso a la Informaci�n y Protecci�n de Datos Personales (INAI):
                            </p>
                            <ul className="list-none text-theme-secondary space-y-2">
                                <li><strong className="text-theme-primary">Sitio web:</strong> <a href="https://home.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-vape-400 hover:text-vape-300 underline">home.inai.org.mx</a></li>
                                <li><strong className="text-theme-primary">Tel�fono:</strong> 800 835 4324</li>
                            </ul>
                        </section>

                        <div className="mt-10 pt-6 border-t border-theme">
                            <p className="text-sm text-theme-secondary italic">
                                Al utilizar VSM Store, usted acepta los t�rminos de esta Pol�tica de Privacidad.
                                Le recomendamos leerla peri�dicamente para estar informado sobre c�mo protegemos su informaci�n.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
