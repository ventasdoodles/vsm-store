# Dictamen: Cesarin está sobreprotegido en el lugar equivocado

**Coincido con el diagnóstico, con una precisión importante:** los cinco hallazgos son causas plausibles y concretas de una voz artificial, pero no todos tienen el mismo peso. El problema principal no parece ser que César tenga demasiados límites operativos; es que **límites pensados para controlar acciones y hechos terminaron controlando también la forma de hablar**.

La transformación correcta no es «quitarle reglas». Es separar dos capas:

- **Innegociable:** qué productos puede mostrar, qué datos puede afirmar, qué acciones puede ejecutar y cuándo necesita confirmación.
- **Flexible:** cómo escucha, explica, pregunta y acompaña al cliente.

Esta evaluación se basa en los fragmentos y rutas proporcionados; antes de cambiar código, confirmaría el orden real de ejecución y qué mensajes pasan efectivamente por cada recortador.

## 1. Evaluación de los cinco hallazgos

| Hallazgo | Dictamen | Prioridad |
|---|---|---|
| Saludo defensivo | Acertado. Anunciar de entrada «no invento» desplaza la conversación hacia las limitaciones del sistema antes de conocer al cliente. | Alta; arreglo sencillo |
| Recorte a dos frases | Probablemente el mayor responsable de respuestas telegráficas. Si opera *después* de generar, puede destruir explicaciones correctas y dejar referencias sin contexto. | **Crítica** |
| Eliminación de cierres por expresión regular | Acertado, pero requiere matiz: algunos cierres sí son muletillas. El error es declarar redundante una oración por **cómo empieza**, no por lo que aporta. | Alta |
| Fallbacks técnicos o regañones | Acertado. Exponen arquitectura interna o trasladan al cliente la fricción de una restricción operativa. | Alta |
| Micromanagement del prompt | Acertado. «Máximo dos frases» y «una jugada» convierten una guía de concisión en una prohibición de explicar. | **Crítica** |

**La combinación es peor que cada defecto individual.** El modelo puede producir una respuesta razonable y el posprocesamiento mutilarla; a continuación, los prompts se endurecen para compensar salidas raras, y los fallbacks vuelven a introducir lenguaje de sistema. Cambiar solo el `SYSTEM_PERSONA` no resolverá eso.

### Otros puntos del pipeline que auditaría

1. **Ensamblaje de la respuesta final.** Revisar si texto del modelo, tarjetas, avisos, CTA y resumen repiten la misma recomendación. El usuario percibe *toda* la pantalla, no solo `assistant.content`.
2. **Fragmentación del contexto.** Si cada handler recibe poca conversación previa, Cesarin volverá a preguntar talla, presupuesto, dispositivo o preferencia ya expresados.
3. **Preguntas automáticas.** Una pregunta en cada turno suena a formulario. A veces la mejor respuesta termina en una recomendación completa, sin interrogatorio.
4. **Manejo de fallas parciales.** Catálogo sin resultados, latencia o tool failures deben producir respuestas distintas. Un fallback universal hace que situaciones diferentes suenen idénticas.
5. **Personalización mecánica.** Repetir el nombre, usar «¡Qué onda!» en cada turno o insertar modismos por cuota tiene el efecto contrario al buscado.
6. **Inconsistencia entre superficies.** Un saludo cálido seguido de tarjetas con copy seco, o un chat humano seguido de un error de carrito técnico, rompe la persona.
7. **Veracidad mal comunicada.** «No sé» es correcto cuando corresponde; anunciar preventivamente que no se inventarán cosas no lo es. La honestidad debe aparecer **en el punto de incertidumbre**, no como eslogan de bienvenida.

## 2. Riesgos al liberar la voz — y cómo contenerlos

No establecería una nueva cuota de «4–5 oraciones». Eso solo sustituiría una guillotina por otra. Usaría **longitud según la tarea**:

| Situación | Forma deseada |
|---|---|
| Saludo o confirmación simple | Una o dos frases naturales |
| Recomendación con productos visibles | Elección o comparación breve + razón basada en datos confirmados + siguiente paso útil; normalmente 2–4 oraciones |
| Compatibilidad, stock incierto o política | Las oraciones necesarias para dar una respuesta completa y correctamente matizada |
| Error operativo | Qué pasó en términos comprensibles + alternativa concreta; sin detalles internos |

Los riesgos reales son:

- **Palabrería y dispersión:** varias opciones sin una recomendación clara. **Control:** una idea principal por párrafo y motivos concretos; no imponer una sola idea por *turno* cuando el cliente pidió comparar.
- **Afirmaciones no sustentadas:** más texto da más oportunidades de inventar autonomía, compatibilidad, stock, promociones o tiempos de entrega. **Control:** que cada afirmación verificable se apoye en un campo confirmado o se exprese como incertidumbre. No inferir especificaciones a partir del nombre del producto.
- **Cortesía que promete acciones:** «te lo aparto», «te lo agrego» o «sí te llega mañana» pueden sonar amables y ser falsos. **Control:** distinguir ayuda conversacional de acciones confirmadas.
- **Presión comercial:** des-censurar «si te late» no significa añadir un CTA al final de cada mensaje. La invitación debe aportar un próximo paso útil, no ser un tic.
- **Pérdida de autoridad técnica:** un registro relajado no debe convertirse en seguridad fingida. Ante compatibilidad, precios, pagos, envíos o devoluciones, usar lenguaje llano pero exacto, con la fuente vigente o una derivación cuando falte información.
- **Cumplimiento:** al tratarse de vapeo en México, validar con asesoría legal las restricciones aplicables a exhibición, promoción y venta, así como edad. La calibración de voz no debe introducir mensajes dirigidos a menores, incentivos improcedentes ni afirmaciones sanitarias no acreditadas.

La regla editorial sería: **cálido en el trato, sobrio en los hechos y explícito sobre lo que aún no se ha confirmado**.

## 3. Prompt engineering: menos órdenes de estilo, mejor jerarquía

Reemplazaría el micromanagement por una instrucción corta sobre identidad, una pauta de respuesta adaptable y una frontera inequívoca para los datos. Propuesta conceptual para `customer-intelligence`:

```text
IDENTIDAD
Eres César (“Cesarin”), asesor de mostrador de VSM Store. Hablas en español
mexicano natural: cercano, claro y respetuoso. Conoces la categoría, escuchas
lo que pide la persona y explicas tu criterio sin sonar a guion ni exagerar
modismos. No te presentas como humano ni afirmas haber hecho acciones que no hiciste.

CÓMO AYUDAS
Responde primero a la intención del cliente. Cuando recomiendes, di qué opción
encaja mejor y por qué, usando solo información confirmada. Si hay una diferencia
importante entre opciones, explíquela con sencillez. Pregunta únicamente por el
dato que realmente impida avanzar; si puedes ayudar sin preguntar, hazlo.

Da a cada respuesta el espacio que necesite: breve para algo sencillo y más
explicativa para una comparación, compatibilidad o decisión con matices.
Evita repeticiones, cierres de venta automáticos y muletillas. Puedes usar
expresiones mexicanas naturales cuando encajen; no las fuerces.

FRONTERA DE DATOS Y ACCIONES
El catálogo, disponibilidad, precio, compatibilidad y políticas se rigen por
los datos y validaciones autorizados para este turno. No completes huecos con
suposiciones. No prometas apartados, cambios de carrito, descuentos, entregas
ni confirmaciones de pago sin el resultado correspondiente de la herramienta
autorizada. Si falta un dato, dilo con naturalidad y ofrece el siguiente paso
que sí puedes realizar.

Si una opción no está habilitada por el catálogo o las reglas operativas, no la
recomiendes ni la presentes como disponible. Mantén las restricciones de edad,
cumplimiento y comunicación comercial aplicables.
```

**Importante:** el prompt ayuda a expresar el límite; **no constituye el límite**. `catalogGate`, stock, validaciones de carrito, políticas y permisos deben seguir aplicándose en código del lado servidor.

También retiraría «máximo una pregunta» como prohibición absoluta. Es una buena preferencia editorial, pero una consulta compleja puede necesitar dos datos; en tal caso conviene pedirlos juntos y explicar por qué. Asimismo, «una sola jugada central» puede quedar como *prioriza una recomendación*, no como impedimento para comparar cuando el usuario lo solicita.

### Ejemplos de antes y después

Los ejemplos siguientes ilustran **voz y estructura**, no autorizan afirmar características de productos sin datos confirmados.

| Caso | Antes | Después |
|---|---|---|
| Saludo general | «Qué onda, soy Cesarin. Te ayudo a ubicar algo de volada y si no me la sé, te lo digo derecho.» | «¡Qué onda! Soy Cesarin. ¿Buscas algo en particular o te ayudo a encontrar una opción?» |
| Saludo con nombre | «Qué onda, Ana. Soy Cesarin; te ayudo a encontrar algo y, si algo me agarra en curva, te lo digo sin inventarte cosas.» | «¡Qué onda, Ana! Soy Cesarin. Cuéntame qué traes en mente y lo vemos juntos.» |
| Recomendación de pod, **con compatibilidad confirmada** | «Este te conviene. Abre la ficha.» | «Para el dispositivo que me dijiste, **[cartucho confirmado compatible]** es la opción que sí puedo confirmar. Te muestro la ficha para que revises los detalles antes de decidir; si usas otra versión del equipo, dime el modelo exacto y lo verificamos.» |
| Consulta sobre líquidos **sin dato suficiente** | «Te dejo unas opciones. Si quieres, te paso más.» | «Va. Para no recomendarte algo que no le quede a tu equipo, dime el modelo exacto y reviso las opciones compatibles que haya disponibles.» |
| Carrito sin producto inequívoco | «No voy a mover tu carrito automáticamente. Dime el producto exacto o abre la ficha para confirmarlo.» | «Claro, te ayudo. Veo más de una opción posible y no quiero agregar la equivocada: dime cuál es o selecciónala desde su ficha.» |
| Falla de acción especializada | «No fue posible completar la acción especializada de la consulta…» | «No pude completar esa consulta ahora mismo. Podemos intentarlo de nuevo o, si me dices el modelo que tienes, te ayudo a ubicar la refacción.» |

Hay una diferencia deliberada entre **«no quiero agregar la equivocada»** y **«ya quedó agregada»**: la primera explica con tacto por qué se requiere confirmación; la segunda solo debe aparecer tras una mutación exitosa y verificada.

## 4. Plan de implementación

### A. Frontend: lo que ve el cliente

**`src/hooks/useAIConcierge.ts`**
- Sustituir ambos saludos defensivos.
- Mantener una bienvenida corta; no insertar el nombre si genera una personalización rara o no está disponible con confianza.
- Comprobar que el saludo no reaparezca al restaurar una conversación.

**`src/lib/cesarin-text-utils.ts`**
- Eliminar la clasificación que equipara inicios como `si quieres`, `te paso` o `yo arrancaría` con redundancia.
- Preferir **deduplicación semántica o estructural**: quitar un cierre solo si repite una acción ya expresada, no por contener una fórmula cordial.
- Auditar `compactCesarinCopy`: si corta oraciones generadas, moverlo —si aún hace falta— a saneamiento de espacios, duplicados evidentes y límites de UI. **No debe truncar una explicación válida.**
- Probar expresamente abreviaturas, precios y decimales: un separador ingenuo de oraciones también puede estropear contenido factual.

**UI**
- Dejar que una recomendación de 3–5 oraciones se lea bien en móvil sin convertirla en un bloque interminable.
- Separar visualmente explicación, tarjetas de producto y acciones. Evitar que el botón repita el CTA escrito por Cesarin.
- Mostrar estados de acción distintos: *pendiente*, *confirmada* y *no completada*. No usar copy de éxito hasta recibir confirmación del backend.

### B. Edge Functions: reglas de expresión y fuentes de verdad

**`customer-intelligence/handlers/concierge-chat.ts` y `persona.ts`**
- Actualizar persona y reglas de turno con la jerarquía anterior.
- Dar ejemplos contrastivos para saludo, recomendación, incertidumbre, compatibilidad, fallo y carrito. Los ejemplos deberían incluir buenas respuestas **breves**, no solo respuestas más largas.
- Sustituir «me agarraste en curva» como fallback universal: puede ser simpático una vez, pero repetido delata la plantilla.

**Handlers de storefront y `chat.ts`**
- Revisar todas las llamadas `compactCesarinCopy(..., 2/3)`. No basta modificar una ruta.
- No aplicar un nuevo máximo global de oraciones. Si hay límites por coste o presentación, preferir límites de longitud amplios con regeneración o una instrucción de concisión, sin corte silencioso posterior.
- Conservar intactas las compuertas de catálogo, disponibilidad y elegibilidad. En particular, confirmar qué ocurre cuando `catalogGate.is_open` es falso: liberar el copy **no** debe abrir recomendaciones de catálogo.
- Construir, cuando sea posible, un contexto de hechos autorizados separado de las instrucciones de estilo: productos elegibles, campos confirmados, políticas vigentes y resultado de acciones. Esa separación facilita comprobar de dónde salió cada afirmación.

**`turn-advisory.ts` y `capsule-dispatcher.ts`**
- Reescribir fallbacks por **estado operativo**, no con una frase genérica.
- Diferenciar: producto ambiguo, catálogo sin resultados, servicio temporalmente no disponible, carrito no modificado y consulta fuera de alcance.
- Nunca comunicar una mutación como realizada si falló o no se intentó.

### C. Orden de despliegue recomendado

1. **Capturar línea base:** conversaciones anonimizadas y casos sintéticos, con registro de respuesta antes/después de `compactCesarinCopy`. Esto permite demostrar si la pérdida ocurre en el modelo o en posprocesamiento.
2. **Cambiar saludos y fallbacks**, sin tocar guardrails.
3. **Eliminar el recorte destructivo** y la regla de cortesías; añadir pruebas unitarias y de integración para todos los handlers afectados.
4. **Actualizar prompt y ejemplos**, versionados por separado del código de compuertas.
5. **Canary/A-B** con revisión humana y métricas de seguridad; activar por porcentaje solo después de pasar regresiones.
6. **Revisar conversaciones reales** para corregir repetición, longitud y modismos forzados, no para reinstalar un límite ciego de dos frases.

## 5. Criterios de aceptación

No aprobaría el cambio por «ahora escribe más». Lo aprobaría si supera **dos pruebas independientes**.

### Naturalidad y utilidad

En una muestra ciega de conversaciones representativas, evaluadores mexicanos deben puntuar:

- **Suena como un asesor útil, no como un guion.**
- Responde a lo preguntado sin preámbulos defensivos.
- Explica al menos un motivo concreto cuando recomienda y hay datos para hacerlo.
- No repite nombre, modismos, disculpas ni invitaciones por reflejo.
- Hace preguntas solo cuando ayudan a avanzar.
- Mantiene una longitud proporcionada: no es telegráfico ni verboso.

Conviene evaluar conversaciones de varios turnos, no respuestas aisladas: la naturalidad se pierde mucho por repetición.

### Seguridad y exactitud: umbrales de bloqueo

En el conjunto de regresión no debe haber:

- Productos mostrados o recomendados fuera de las compuertas aplicables.
- Stock, precio, compatibilidad, promociones, envíos o pagos afirmados sin respaldo vigente.
- Carritos modificados sin la validación y confirmación requeridas, ni mensajes que afirmen una modificación inexistente.
- Fallbacks que expongan detalles internos innecesarios o hagan promesas operativas falsas.
- Desviaciones de las restricciones legales y de edad que correspondan.

Instrumentaría además **tasa de respuestas truncadas, repetición de CTA, preguntas innecesarias, afirmaciones factuales sin respaldo y satisfacción por tarea**, segmentadas por handler. La longitud media sola es una métrica engañosa.

## Veredicto ejecutivo

**Sí: hay que liberar a Cesarin del recorte lingüístico y de los textos defensivos. No: no hay que relajar ni una compuerta operativa.** La intervención de mayor impacto es quitar el corte posterior de dos frases y comprobar que ninguna ruta equivalente siga mutilando respuestas. Después, reemplazar la persona basada en prohibiciones de estilo por una pauta sencilla: **escuchar, responder, justificar con hechos confirmados y pedir solo lo necesario**.

Si al terminar Cesarin habla más pero inventa más, la calibración fracasó. Si mantiene la precisión actual y el cliente siente que alguien entendió su pregunta y le explicó su criterio, la transformación funcionó.