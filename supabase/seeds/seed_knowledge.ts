/**
 * VSM Store — Knowledge RAG Seed Script (Phase 3.2B)
 *
 * Purpose: Seeds the initial `store_knowledge` table with the 5 core
 * knowledge documents that Cesarin needs to answer operational questions
 * without relying on static prompts in persona.ts.
 *
 * How to run:
 *   1. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
 *   2. Run: npx tsx supabase/seeds/seed_knowledge.ts
 *      OR invoke `knowledge-ingestor` directly via Supabase dashboard
 *      with each payload below.
 *
 * @author VSM Store / Antigravity
 * @version 1.0.0 (Phase 3.2B Seed)
 */

// ---------------------------------------------------------------------------
// SEED DOCUMENTS
// ---------------------------------------------------------------------------

export const SEED_DOCUMENTS = [
    {
        title: 'Política de Envíos',
        source_id: 'politica-envios-v1',
        category: 'shipping',
        source_type: 'policy_doc',
        source_filename: 'politica-envios.md',
        raw_text: `
## Política de Envíos — VSM Store

VSM Store realiza envíos a toda la República Mexicana exclusivamente a través de **DHL EXPRESS**.

### Modalidad de entrega

Los envíos son únicamente a **sucursal OCURRE**. No realizamos entregas a domicilio.

El cliente debe recoger su paquete en la sucursal DHL más cercana a su domicilio.
Puedes consultar la sucursal DHL más cercana en: https://www.dhl.com/mx-es/home/nuestros-servicios/tracking.html

### Tiempos de entrega

- Pedidos pagados **antes de las 5:00 PM (hora de México Central)**: salen el mismo día hábil.
- Pedidos pagados **después de las 5:00 PM**: salen el siguiente día hábil.
- Entrega estimada: 1-3 días hábiles dependiendo de tu ciudad.

### Costos de envío

El costo del envío varía según el peso y destino del paquete. Se calcula automáticamente al finalizar tu pedido.

### Restricciones

No realizamos envíos internacionales. No realizamos envíos a P.O. Box. El inventario no tiene apartados — si pagas, enviamos; si no, el producto puede agotarse.
        `.trim()
    },
    {
        title: 'Métodos de Pago',
        source_id: 'politica-pagos-v1',
        category: 'payments',
        source_type: 'policy_doc',
        source_filename: 'politica-pagos.md',
        raw_text: `
## Métodos de Pago — VSM Store

VSM Store acepta exclusivamente pagos mediante **transferencia bancaria** o **depósito bancario**.

### Datos bancarios

Para completar tu pedido, realiza la transferencia o depósito a los datos que recibirás al confirmar tu orden por WhatsApp.

### ¿Cómo completar tu pago?

1. Realiza tu pedido en la tienda y selecciona el método de pago.
2. Recibirás nuestros datos bancarios por WhatsApp o correo.
3. Realiza la transferencia o depósito con el monto exacto.
4. Envía el comprobante de pago por WhatsApp.
5. Una vez verificado, procesamos y enviamos tu pedido.

### Consideraciones

- Solo procesamos pedidos con pago confirmado.
- No aceptamos efectivo, tarjetas de crédito ni pagos por PayPal.
- El pago debe ser exacto — no procesamos pedidos con diferencias.
- Las transferencias SPEI se verifican en minutos en días hábiles.
        `.trim()
    },
    {
        title: 'Guía de Vapeo: Tipos de Nicotina',
        source_id: 'guia-vapeo-nicotina-v1',
        category: 'vape_basics',
        source_type: 'policy_doc',
        source_filename: 'guia-vapeo-nicotina.md',
        raw_text: `
## Guía de Vapeo: Tipos de Nicotina

### Nicotina en Sales (Nic Salts)

Las **sales de nicotina** son una forma modificada de nicotina que se absorbe más rápido en el torrente sanguíneo.

**Ventajas:**
- Golpe de garganta suave, incluso en concentraciones altas (35-50 mg).
- Absorción rápida — satisfacción más rápida que la nicotina freebase.
- Ideal para ex fumadores o quienes buscan saciar el antojo rápido.

**Mejor para:** Pods de bajo wattaje (12-25W), sistemas MTL (boca a pulmón).

### Nicotina Freebase

La **nicotina freebase** es la forma estándar de nicotina en líquidos de vapeo.

**Ventajas:**
- Golpe de garganta pronunciado en concentraciones medias (3-12 mg).
- Sabor más limpio a bajas concentraciones.
- Ideal para mods y dispositivos de alto wattaje.

**Mejor para:** Dispositivos de sub-ohm, DTL (directo a pulmón), mods de 40W+.

### ¿Cuál elegir?

- Si eres ex fumador o usas pods: **Sales de nicotina**.
- Si ya llevas tiempo vapeando y usas mod potente: **Freebase 3-6 mg**.
- Si buscas producción de vapor máxima: **Freebase 0-3 mg** con dispositivo DTL.
        `.trim()
    },
    {
        title: 'Preguntas Frecuentes sobre Pedidos',
        source_id: 'faq-pedidos-v1',
        category: 'faq',
        source_type: 'policy_doc',
        source_filename: 'faq-pedidos.md',
        raw_text: `
## Preguntas Frecuentes — Pedidos

### ¿Tienen apartados?

No. El inventario de VSM Store opera en tiempo real. No realizamos apartados. Si el producto está disponible y realizas tu pago, el producto es tuyo. Si no pagas, puede agotarse.

### ¿Puedo cancelar mi pedido?

Los pedidos pueden cancelarse siempre que no hayan sido enviados. Para cancelar, contáctanos por WhatsApp inmediatamente después de realizarlo.

### ¿Hacen devoluciones?

Aceptamos devoluciones dentro de los 3 días hábiles después de recibir tu pedido, siempre que:
- El producto esté en su empaque original sin abrir.
- Exista un defecto de fábrica documentado.

No aceptamos devoluciones por cambio de opinión.

### ¿Cuándo recibiré mi pedido?

Una vez confirmado el pago antes de las 5 PM, tu pedido sale el mismo día por DHL EXPRESS. Los tiempos de entrega son 1-3 días hábiles a la mayoría de las ciudades de México.

### ¿Cómo rastrea mi pedido?

Una vez enviado, te compartiremos el número de guía DHL por WhatsApp para que puedas rastrearlo en https://www.dhl.com/mx-es/home.html
        `.trim()
    },
    {
        title: 'Guía de Inicio para Nuevos Compradores',
        source_id: 'guia-onboarding-v1',
        category: 'onboarding',
        source_type: 'policy_doc',
        source_filename: 'guia-onboarding.md',
        raw_text: `
## Bienvenido a VSM Store

¡Gracias por elegirnos! Somos una tienda especializada en vapeo y accesorios 420 con atención personalizada y envíos rápidos a toda la República Mexicana.

### ¿Cómo comprar?

1. **Explora el catálogo**: Usa el buscador o navega por categorías (Vape, 420, Mods, Líquidos).
2. **Agrega al carrito**: Selecciona el producto que te interesa y agrégalo al carrito.
3. **Revisa tu pedido**: Confirma los productos, cantidades y variantes seleccionadas.
4. **Realiza el pago**: Sigue las instrucciones para transferencia o depósito bancario.
5. **Envía tu comprobante**: Compártenos el comprobante de pago por WhatsApp.
6. **Recibe tu pedido**: Enviamos por DHL EXPRESS a la sucursal OCURRE más cercana.

### ¿Qué necesitas saber?

- Solo aceptamos pago por transferencia o depósito bancario.
- Envíos únicamente a sucursal DHL OCURRE — no a domicilio.
- Sin apartados — el inventario vuela, ¡te recomendamos pagar de inmediato!

### ¿Necesitas asesoría?

Nuestro asistente Cesarin puede ayudarte a elegir el producto ideal según tu experiencia y presupuesto. ¡Pregúntale lo que quieras!
        `.trim()
    },
    {
        title: 'Métodos de Pago Expandidos',
        source_id: 'politica-pagos-v2',
        category: 'payments',
        source_type: 'policy_doc',
        source_filename: 'politica-pagos-v2.md',
        raw_text: `
## Métodos de Pago Aceptados — VSM Store

Aceptamos múltiples métodos de pago para tu comodidad y seguridad:

### 1. Tarjetas de Crédito y Débito
Procesamos pagos de forma segura vía **MercadoPago**. Aceptamos:
- Visa
- Mastercard
- American Express

### 2. Transferencia Bancaria (SPEI)
Puedes realizar transferencias directas. Nuestra CLABE interbancaria se muestra automáticamente al finalizar tu pedido en el checkout.

### 3. Efectivo (Solo Xalapa)
Aceptamos pagos en efectivo únicamente para entregas personales previamente acordadas en la ciudad de Xalapa, Veracruz.

**Nota:** Todos los pedidos nacionales deben ser liquidados antes del envío.
        `.trim()
    },
    {
        title: 'Guía: Cómo Dejar de Fumar con Vapeo',
        source_id: 'guia-dejar-fumar-v1',
        category: 'vape_basics',
        source_type: 'manual',
        source_filename: 'guia-dejar-fumar.md',
        raw_text: `
## Guía para Dejar de Fumar — VSM Store

Si estás buscando una alternativa para dejar el cigarro tradicional, el vapeo puede ser tu mejor aliado.

### ¿Por dónde empezar?
Recomendamos iniciar con un **Starter Kit** (Kit de Inicio). Estos equipos son simples, no requieren configuraciones complejas y emulan la sensación de fumar.

### La Nicotina Ideal
- **Si fumas mucho (1 cajetilla+ al día):** Recomendamos **Sales de Nicotina** (35mg - 50mg) en un sistema de Pod.
- **Si buscas sabor y menos golpe:** Recomendamos líquidos de **Base Libre** (3mg - 6mg) en un equipo tipo Mod o Pen.

### Beneficios
Al vapear eliminas la combustión, el alquitrán y cientos de químicos tóxicos presentes en el humo del tabaco.
        `.trim()
    },
    {
        title: 'Envíos Detallados y Costos',
        source_id: 'politica-envios-detallada-v1',
        category: 'shipping',
        source_type: 'policy_doc',
        source_filename: 'politica-envios-v2.md',
        raw_text: `
## Envíos y Entregas — Información Detallada

### 1. Envíos Locales (Xalapa)
- **Costo:** Aproximadamente $35 - $50 MXN dependiendo de la zona.
- **Tiempos:** Entrega el mismo día si el pago se confirma antes de las 4:00 PM.
- **Zonas:** Cubrimos toda el área metropolitana de Xalapa.

### 2. Envíos Nacionales
- **Costo:** Fijo entre $150 y $180 MXN.
- **Paquetería:** DHL Express o Estafeta (según cobertura).
- **Tiempos:** 2 a 4 días hábiles.

### 3. Rastreo
Todos los envíos generan un número de guía que te compartiremos por WhatsApp para que sigas tu paquete en tiempo real.
        `.trim()
    },
    {
        title: 'Entregas Personales y Ubicación',
        source_id: 'info-ubicacion-xalapa-v1',
        category: 'policies',
        source_type: 'manual',
        source_filename: 'ubicacion-vsm.md',
        raw_text: `
## Ubicación y Retiro de Pedidos

VSM Store es una **Tienda en Línea**. No contamos con un local físico de exhibición abierto al público.

### Entregas Personales (Xalapa)
Ofrecemos puntos de entrega establecidos para que recojas tu pedido sin costo de envío (previa confirmación por WhatsApp):
- **Plaza Cristal** (Zona Comercial)
- **Parque Los Berros**
- **CAXA** (Terminal de Autobuses)

### Horarios de Atención
Atendemos dudas y confirmamos pedidos por WhatsApp de Lunes a Sábado, de 10:00 AM a 7:00 PM.
        `.trim()
    },
    {
        title: '¿Qué es un Kit de Inicio (Starter Kit)?',
        source_id: 'guia-starter-kits-v1',
        category: 'vape_basics',
        source_type: 'manual',
        source_filename: 'guia-starter-kits.md',
        raw_text: `
## Entendiendo los Kits de Inicio

Un **Starter Kit** es un paquete diseñado para que un principiante pueda empezar a vapear de inmediato, incluyendo lo esencial: batería, atomizador y cargador.

### Características Principales
- **Simplicidad:** Pocos botones o activado por calada.
- **Batería Integrada:** Se carga por USB como un celular.
- **Resistencias Reemplazables:** Fácil mantenimiento.

### Modelos Recomendados
1. **Vape Pen 22:** Un clásico confiable y potente para iniciar.
2. **SMOK Caliburn:** El rey de los Pods por su sabor y portabilidad.
3. **Uwell Koko:** Compacto y eficiente para sales de nicotina.
        `.trim()
    }
]
