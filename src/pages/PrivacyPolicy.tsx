// Aviso de Privacidad - VSM Store
import { useEffect } from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export function PrivacyPolicy() {
    useEffect(() => {
        document.title = 'Aviso de Privacidad | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    return (
        <div className="container-vsm py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-theme-primary mb-2">Aviso de Privacidad</h1>
            <p className="text-theme-primary0 mb-8">Última actualización: Febrero 2026</p>

            <div className="space-y-8 text-theme-secondary leading-relaxed">
                {/* 1. Identidad */}
                <section>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-vape-400 mb-4">
                        <Shield className="h-5 w-5" />
                        1. Identidad y Domicilio
                    </h2>
                    <p>
                        VSM Store ("nosotros", "nuestro"), con domicilio en Av. Principal #123, Xalapa, Veracruz, México,
                        es responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
                    </p>
                </section>

                {/* 2. Datos Recabados */}
                <section>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-vape-400 mb-4">
                        <DatabaseIcon className="h-5 w-5" />
                        2. Datos Personales Recabados
                    </h2>
                    <p className="mb-3">
                        Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos los siguientes datos personales:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-theme-secondary">
                        <li>Nombre completo</li>
                        <li>Correo electrónico</li>
                        <li>Teléfono y/o WhatsApp</li>
                        <li>Dirección de entrega y facturación</li>
                        <li>Historial de compras y preferencias de productos</li>
                    </ul>
                </section>

                {/* 3. Finalidades */}
                <section>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-vape-400 mb-4">
                        <FileText className="h-5 w-5" />
                        3. Finalidades del Tratamiento
                    </h2>
                    <p className="mb-3">
                        Los datos personales que recabamos de usted, los utilizaremos para las siguientes finalidades que son necesarias para el servicio que solicita:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-theme-secondary">
                        <li>Procesamiento, envío y entrega de sus pedidos.</li>
                        <li>Facturación y cobro.</li>
                        <li>Comunicación relacionada con el estado de sus compras.</li>
                        <li>Atención a consultas y servicio al cliente.</li>
                    </ul>
                    <p className="mt-3">
                        De manera adicional, utilizaremos su información personal para las siguientes finalidades secundarias:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-theme-secondary mt-1">
                        <li>Programa de lealtad y beneficios.</li>
                        <li>Envío de promociones y novedades (puede darse de baja en cualquier momento).</li>
                        <li>Mejora de nuestros servicios y sitio web.</li>
                    </ul>
                </section>

                {/* 4. Transferencia */}
                <section>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-vape-400 mb-4">
                        <Lock className="h-5 w-5" />
                        4. Transferencia de Datos
                    </h2>
                    <p>
                        Le informamos que sus datos personales no son compartidos con terceros ajenos a VSM Store, salvo las excepciones previstas por la ley,
                        o cuando sea necesario para la prestación del servicio (por ejemplo, servicios de paquetería y mensajería para la entrega de productos).
                    </p>
                </section>

                {/* 5. Derechos ARCO */}
                <section>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-vape-400 mb-4">
                        <Eye className="h-5 w-5" />
                        5. Derechos ARCO
                    </h2>
                    <p>
                        Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso).
                        Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación);
                        que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación);
                        así como oponerse al uso de sus datos personales para fines específicos (Oposición).
                    </p>
                    <p className="mt-3">
                        Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través del correo electrónico:
                        <span className="text-theme-primary font-medium ml-1">info@vsmstore.com</span>
                    </p>
                </section>

                {/* 6. Cambios */}
                <section>
                    <h2 className="text-xl font-semibold text-vape-400 mb-4">
                        6. Cambios al Aviso de Privacidad
                    </h2>
                    <p>
                        El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales;
                        de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad;
                        o por otras causas. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad,
                        a través de este sitio web.
                    </p>
                </section>
            </div>
        </div>
    );
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}
