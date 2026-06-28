# Ya VOY — Controlled Pilot Demo Presenter Pack

> **Estatus del documento**: Guía oficial para demostraciones controladas.
> **Clasificación**: Uso interno / No contractual.
> **Restricción de ejecución**: Este documento es únicamente una guía de presentación controlada y NO un manual de operación en producción.

---

## 1. Introducción y Estado de Evidencia

Este documento sirve como marco técnico y narrativo para que Carlos o cualquier presentador pueda demostrar el estado actual del ecosistema **Ya VOY** ante inversores, stakeholders o equipos internos de forma transparente y verídica, respetando estrictamente los límites del desarrollo actual.

### Límites de Evidencia Aceptados
El ecosistema de Ya VOY ha sido evaluado bajo criterios rigurosos de QA, definiendo claramente qué se ha probado y bajo qué condiciones:
* **Entorno de Datos**: Se ha completado la validación en base de datos en un entorno remoto de desarrollo/QA, probando flujos de transaccionalidad e historiales de eventos exclusivamente con registros simulados.
* **Simulación en Navegador**: El comportamiento de la interfaz de usuario se ha verificado mediante visualización de flujos simulados a nivel local (emulación de viewport móvil y de escritorio en navegadores locales).
* **Límite de Hardware y Despliegue**: No se dispone de pruebas en dispositivos móviles físicos, aplicaciones PWA instaladas nativamente, conexiones de red reales de operadores móviles, o entornos reales de producción.
* **Exclusión de Módulos Reales**: El sistema carece de integraciones con proveedores reales de pagos, liquidaciones físicas, pasarelas de cobro bancario, rastreo satelital GPS activo, mapas comerciales interactivos dinámicos, servicios reales de envío de paquetes, o plataformas de mensajería (SMS/Push) activas.

---

## 2. Directrices de Comunicación (Guardias del Presentador)

Para garantizar la honestidad técnica y proteger la integridad del proyecto, el presentador debe adherirse estrictamente a las siguientes reglas de comunicación:

| Qué SE DEBE decir (Must Say) | Qué NO SE DEBE decir (Must Not Say) |
| :--- | :--- |
| "Esta es una demostración controlada que se ejecuta en un entorno de desarrollo/QA local." | "El sistema está listo para producción (production ready)." |
| "Las ubicaciones de los servicios y datos del cliente están difuminadas o protegidas para preservar la privacidad." | "La aplicación cuenta con seguimiento satelital / GPS real." |
| "El balance y cobro de comisiones que se muestra es un registro contable lógico de simulación." | "El sistema realiza cobros con pasarelas de pago reales o transferencias de dinero reales." |
| "Las asignaciones e interacciones de conductores son parte de un flujo lógico emulado." | "La aplicación ya cuenta con repartidores reales operando activamente en la calle." |
| "Los estados de los pedidos se actualizan utilizando un registro inmutable en base de datos para auditorías." | "El sistema envía notificaciones push reales a los teléfonos." |
| "El diseño de la aplicación móvil está optimizado con patrones Premium Dark para una experiencia inmersiva." | "El software está completamente validado y probado en teléfonos físicos o PWA instalada nativamente." |
| "Las tarifas de negociación están restringidas por topes matemáticos de seguridad." | "El sistema cuenta con certificaciones completas de seguridad o cumplimiento regulatorio." |

---

## 3. Modos de Demostración

La presentación del ecosistema debe realizarse utilizando uno de los siguientes dos enfoques claramente diferenciados:

### A. Modo de Presentación Seguro (Safe Presentation Mode)
* **Descripción**: Se basa exclusivamente en capturas de pantalla, grabaciones pre-registradas del flujo correcto, o la navegación estática y guiada por las vistas del navegador sin realizar clics en botones interactivos de acción.
* **Impacto en Base de Datos**: Cero (0) mutaciones, escrituras o ejecuciones en la base de datos de desarrollo.
* **Uso Recomendado**: **(Altamente Recomendado)** Para revisiones de negocio, comités de producto, demostraciones con inversionistas y presentaciones generales.
* **Ventaja**: Elimina cualquier riesgo de error en vivo, problemas de conexión o corrupción de datos simulados en la base de datos compartida.

### B. Modo Interactivo Controlado (Controlled Interactive Dev Mode)
* **Descripción**: Ejecución del flujo interactivo en tiempo real con clics del presentador sobre las interfaces móviles y de administración en un navegador local conectado al servidor de desarrollo.
* **Requisito Obligatorio**: **Este modo NO puede ejecutarse de manera casual.** Requiere la autorización previa y la ejecución de una fase o carril de alto riesgo para poblar la base de datos con registros temporales dedicados y planificar su posterior limpieza (rollback/cleanup).
* **Restricción**: Si no se cuenta con una fase de preparación interactiva previamente autorizada y ejecutada, **el presentador debe limitarse estrictamente al Modo A.**

---

## 4. Secuencia Narrativa de Presentación Segura (Paso a Paso)

Durante el *Modo de Presentación Seguro*, el presentador recorrerá el ecosistema describiendo la experiencia de usuario y las bases tecnológicas sin realizar mutaciones directas. Siga este guion paso a paso:

### Paso 1: Pantalla de Inicio del Cliente y Selector de Servicios
* **Narración**: *"Aquí observamos la interfaz principal de Ya VOY para el cliente. Destaca su diseño Premium Dark con componentes de vidrio esmerilado (glassmorphism) y colores corporativos coherentes. Los touch targets se han ampliado a un estándar de 56px para facilitar el uso por parte de usuarios en movimiento. Desde aquí se pueden seleccionar servicios como 'Mensajería' y 'Compras'."*
* **Límite**: No haga clic en tarjetas de servicio ni modifique selecciones que inicien un flujo de creación.

### Paso 2: Vista de Radar de Búsqueda
* **Narración**: *"Una vez que el cliente solicita un servicio, se activa una interfaz visual con un efecto de barrido de radar. Esta pantalla muestra mensajes de espera honestos y transparentes, indicando que el pedido es visible para los conductores disponibles cercanos. No se inventan tiempos de llegada ficticios ni se muestran falsas localizaciones de motocicletas; la copia de texto refleja la realidad operativa de la búsqueda."*
* **Límite**: No intente forzar la creación o inserción de una orden.

### Paso 3: Panel de Ofertas del Conductor (Marketplace)
* **Narración**: *"Cambiamos a la perspectiva del conductor. La aplicación protege la privacidad de los usuarios difuminando las ubicaciones exactas de origen y destino en un radio aproximado de 1 kilómetro mediante cálculos matemáticos en la base de datos. El conductor puede revisar los pedidos disponibles de forma totalmente segura sin ver datos personales sensibles."*
* **Límite**: No presione los botones de aceptación directa ni interactúe con los listados de órdenes.

### Paso 4: Mecanismo de Contraofertas Acotadas
* **Narración**: *"El conductor no está obligado a aceptar una tarifa fija; puede realizar contraofertas. Para evitar abusos o distorsiones de precios en el mercado, el sistema restringe estas ofertas a incrementos predefinidos y acotados matemáticamente (+10%, +20%, +30% del precio base). Esto mantiene la competencia de manera sana y controlada."*
* **Límite**: No pulse los botones de selección de incrementos de tarifa ni envíe contraofertas en vivo.

### Paso 5: Aceptación y Rechazo por parte del Cliente
* **Narración**: *"El cliente recibe las ofertas de los conductores en su bandeja de entrada en tiempo real. Tiene la total libertad de aceptar o rechazar una contraoferta. Si la rechaza, el conductor es notificado sin fricciones y la orden regresa a su estado original en el marketplace, garantizando un flujo de negociación fluido y seguro."*
* **Límite**: No haga clic en los botones de aceptar o rechazar ofertas en la vista del cliente.

### Paso 6: Consola de Administración (Admin Dispatch Board)
* **Narración**: *"Desde el panel del administrador, se supervisa la salud del sistema. Los pedidos se organizan de forma limpia y transparente según su estado operativo: No Asignados, Activos e Incidencias. El panel lee un historial de eventos inmutable registrado automáticamente por funciones seguras en la base de datos, lo que garantiza auditorías precisas en caso de discrepancias."*
* **Límite**: No asigne conductores manualmente ni resuelva alertas de incidencias ficticias en la consola.

### Paso 7: Ledger Lógico del Monedero del Conductor
* **Narración**: *"El sistema cuenta con un modelo lógico de contabilidad (ledger) que registra las ganancias del conductor y deduce automáticamente una comisión fija del 15% al completarse cada pedido. Este registro es puramente numérico e interno de la base de datos para la simulación operativa; no maneja cuentas bancarias, pasarelas de pago ni transferencias de dinero reales."*
* **Límite**: No realice abonos o deducciones de saldo en los paneles del conductor o del administrador.

---

## 5. Lista de Acciones Prohibidas (No Hacer Clic)

Durante el **Modo de Presentación Seguro**, quedan estrictamente prohibidas las siguientes interacciones en vivo en las interfaces:

1. **En la aplicación del Cliente**:
   * NO presionar "Crear Pedido" o "Confirmar Orden".
   * NO presionar "Aceptar Oferta" o "Rechazar Oferta".
   * NO introducir cupones, datos de tarjetas ficticias o contraseñas.
2. **En la aplicación del Conductor**:
   * NO presionar "Aceptar Pedido" en el Marketplace.
   * NO presionar "Enviar Contraoferta" (+10%, +20%, +30%).
   * NO realizar transiciones de estado del pedido ("Iniciar recogida", "Pedido recolectado", "En ruta", "Entregado").
3. **En la Consola de Administración**:
   * NO presionar "Asignar Conductor".
   * NO presionar "Marcar Incidencia" o "Confirmar Cancelación".
   * NO modificar los saldos o balances en el historial de transacciones.
4. **General**:
   * NO ejecutar scripts de inicialización o rollback de base de datos desde consolas visibles durante la demo.

---

## 6. Prerrequisitos para Demostraciones Interactivas

Si en el futuro se autoriza un **carril específico de alto riesgo** para ejecutar una demostración interactiva en vivo con mutaciones reales en la base de datos, se deberán cumplir de forma estricta los siguientes prerrequisitos técnicos (los datos de pruebas anteriores son meramente históricos y no se encuentran disponibles para reuso activo):

### Prerrequisitos de Base de Datos
* **Generación de Nuevos Registros**: Se debe crear un script SQL específico con UUIDs únicos para un cliente simulado y un conductor simulado válidos exclusivamente para el día de la prueba.
* **Límites de Saldo**: Cargar el saldo lógico necesario en el monedero del conductor temporal para garantizar la reserva de comisiones.
* **Plan de Rollback**: Disponer de un script de limpieza automática que elimine por completo el pedido, las ofertas y los eventos generados inmediatamente después de concluir la demostración, restableciendo los saldos iniciales.

### Pruebas de Referencia Históricas (Totalmente Depuradas y Limpias)
Como evidencia de la fiabilidad técnica de este proceso, se hace constar que los flujos transaccionales e interactivos fueron probados con éxito y posteriormente eliminados en fases anteriores del desarrollo utilizando los siguientes identificadores históricos:
* *ID del pedido demo histórico*: `9e6231bd-f009-4f31-a2fb-bd051e16b999` (Eliminado de la base de datos).
* *UUID del cliente simulado histórico*: `63cc3cda-bc02-4794-96c4-579dd7360e1d` (Depurado del flujo de órdenes).
* *UUID del conductor simulado histórico*: `4c0882b4-7cd3-4fc7-b9bb-309891c49842` (Reestablecido a su saldo y balance original).

**Importante**: Estos identificadores son de registro histórico. No intente usarlos ni asuma que están activos o disponibles en el sistema durante su presentación.

---

## 7. Matriz de Respuestas a Preguntas de la Audiencia (Q&A)

El presentador debe responder a las preguntas de la audiencia utilizando las siguientes respuestas técnicas validadas y alineadas con la verdad del desarrollo actual:

* **P: ¿La aplicación ya funciona en producción?**
  * *R*: *"Actualmente el sistema está completamente validado a nivel transaccional y visual en nuestro entorno de desarrollo y QA controlado. No hemos iniciado la fase de despliegue a producción comercial ni la distribución pública en tiendas de aplicaciones."*
* **P: ¿La aplicación cuenta con GPS y rastreo de ruta real?**
  * *R*: *"El ecosistema de Ya VOY está diseñado con un fuerte enfoque en la privacidad. La ubicación del cliente y el destino están difuminados en un rango de 1 kilómetro para los conductores en el marketplace. El rastreo de la ruta en la interfaz móvil está simulado a nivel de vista; no consumimos servicios de localización GPS satelital activa en tiempo real ni APIs de mapas de pago en esta fase."*
* **P: ¿Se pueden procesar cobros y pagos con dinero real?**
  * *R*: *"No. Toda la gestión del monedero del conductor y las comisiones de la plataforma operan bajo un ledger de simulación lógica dentro de la base de datos. No se realiza ningún procesamiento de tarjetas de crédito, débito o integraciones con pasarelas de pago financieras reales."*
* **P: ¿Ya se cuenta con repartidores operando en la calle?**
  * *R*: *"No. Los flujos de aceptación y contraoferta se muestran utilizando cuentas y perfiles de conductores emulados con fines de desarrollo y verificación operativa. No contamos con una flota de mensajeros reales dando servicio en esta etapa."*
* **P: ¿El sistema envía notificaciones en tiempo real al teléfono móvil?**
  * *R*: *"Las interfaces de cliente y conductor se comunican de forma instantánea a través del canal de tiempo real (realtime) de nuestra base de datos. No se envían notificaciones push nativas de iOS/Android o mensajes SMS directos a dispositivos físicos."*
* **P: ¿La aplicación ha sido probada en teléfonos iPhone o Android reales?**
  * *R*: *"La fidelidad del flujo y la responsividad de la interfaz se validan rigurosamente mediante emuladores de pantalla y viewport en navegadores web. No se ha realizado la compilación para descarga o instalación nativa en dispositivos de hardware físico."*
* **P: ¿Qué es exactamente lo que SÍ está probado y funciona hoy?**
  * *R*: *"El núcleo lógico y transaccional es robusto: la creación de pedidos, el despliegue difuminado en el marketplace de conductores, el sistema matemático de contraofertas acotadas, la confirmación/rechazo del cliente, la asignación automática, el registro inmutable de auditoría de eventos en la base de datos y la deducción lógica de comisiones del 15% al monedero del conductor. Todo ello bajo un entorno visual unificado Premium Dark y optimizado para interacción táctil."*
* **P: ¿Qué pasos faltan para lanzar un piloto operativo real?**
  * *R*: *"Para dar el paso a un piloto con mensajeros reales y servicios físicos, requerimos habilitar los carriles de alto riesgo correspondientes para: configurar la infraestructura de producción, integrar pasarelas de pago autorizadas, implementar la geolocalización satelital activa, conectar un proveedor de notificaciones móviles y realizar las auditorías de cumplimiento legal y seguridad de datos correspondientes."*

---

## 8. Riesgos Residuales Técnicos

Es del conocimiento del equipo de ingeniería y del presentador que existen los siguientes riesgos residuales aceptados en el estado actual de las aplicaciones:
* **Fuga de Estilos en Pantallas Secundarias**: Se han centralizado las directrices visuales Premium Dark en componentes clave ( GradientCard y SubtypeSelector), pero existen más de 25 pantallas secundarias del cliente que aún dependen de la clase de diseño heredada `.card-gradient` en `index.css`, lo que podría ocasionar variaciones visuales menores si se navega fuera del flujo principal.
* **Volatilidad del Estado del Conductor**: El estado de conexión activa u offline del conductor se gestiona únicamente en la memoria volátil de la aplicación (React state). Si el navegador del conductor se refresca o se desconecta temporalmente de la red, los datos activos no persistirán y la vista regresará a su estado inicial.
* **Bloqueo en Pruebas de CI Visual**: Las pruebas automatizadas de verificación visual de la interfaz de usuario en el servidor de integración continua se encuentran omitidas de forma segura debido a la ausencia de credenciales de red compartidas, realizándose la validación visual de forma estrictamente manual.
* **Control de Modificaciones de Entorno**: Durante la preparación inicial de datos de simulación en fases tempranas, se realizó la inspección local de archivos `.env` y `.env.local`, una práctica de riesgo que ha sido restringida y no debe repetirse bajo ninguna circunstancia en las fases subsecuentes de la demostración o el desarrollo.

---

## 9. Lista de Verificación de Cierre (Checklist)

### Antes de la Demostración (Pre-Demo)
- [ ] Confirmar con el equipo técnico que se utilizará estrictamente el **Modo de Presentación Seguro (Modo A)**.
- [ ] Validar que las interfaces a mostrar en el navegador local estén cargadas y que no haya consolas de error activas.
- [ ] Asegurarse de que no existan credenciales de base de datos, tokens de sesión o valores de variables de entorno visibles en pantalla o en el historial del terminal.
- [ ] Repasar los límites y las directrices de comunicación de no afirmar el estado de producción o GPS real ante la audiencia.

### Después de la Demostración (Post-Demo)
- [ ] Cerrar todas las pestañas de navegador utilizadas para la demostración de desarrollo.
- [ ] Asegurarse de que no se hayan quedado sesiones de administración abiertas en el equipo de presentación.
- [ ] Confirmar que no se hayan introducido registros adicionales en la base de datos de desarrollo y, en caso de haber utilizado un carril interactivo autorizado por separado, verificar que el script de limpieza (cleanup) haya eliminado todo registro simulado con éxito.
- [ ] Notificar al equipo de ingeniería la conclusión exitosa de la demostración para mantener el control y registro operativo en el ecosistema técnico.
