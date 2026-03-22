# Guía de Revisión de Telemetría — Piloto Cesarin AI
**Para: Equipo de piloto | Sin conocimientos técnicos requeridos**
**Versión: A85-PILOTO-v1.0**

---

## ¿Qué es esto y para qué sirve?

Cesarin es el asistente de inteligencia artificial del negocio. Cada vez que un cliente le hace una pregunta o le pide algo, el sistema anota automáticamente qué pasó: si entendió bien la pregunta, si encontró el producto, si tuvo algún problema.

Esta guía te dice **qué revisar, cuándo revisarlo y qué hacer según lo que veas.** No necesitas saber programar — solo necesitas poder leer tablas y seguir pasos.

---

## Glosario rápido — Las palabras que vas a ver

| Término | Qué significa en palabras simples |
|---------|----------------------------------|
| **Sesión** | Una conversación de un cliente con Cesarin |
| **Cápsula** | El "motor" que resuelve cada tipo de pregunta (búsqueda de producto, política de la tienda, carrito) |
| **EXITOSA** | La cápsula funcionó sin problemas |
| **DEGRADADA** | La cápsula tuvo dificultades pero respondió algo |
| **FALLIDA** | La cápsula no pudo responder en absoluto |
| **Guardarraíl** | El sistema de seguridad que corrige a Cesarin si malinterpreta algo |
| **Override** | Cuando el guardarraíl tuvo que corregir a Cesarin porque no entendió bien |
| **TERMINAL_RECOVERY** | Cesarin no entendió absolutamente nada y el guardarraíl lo rescató |
| **Match strategy** | Cómo encontró (o no encontró) el producto que el cliente pedía |

---

## Cómo ver los datos

Alguien del equipo técnico debe darte acceso a un panel o consulta en Supabase (la base de datos) donde puedas ver una tabla llamada `ai_analytics`. Cada fila es una conversación.

Las columnas más importantes que vas a usar:

| Columna | Qué te dice |
|---------|-------------|
| `created_at` | Cuándo ocurrió la conversación |
| `user_message` | Qué le dijo el cliente a Cesarin |
| `ai_response` | Qué respondió Cesarin |
| `capsule_execution_status` | Si la cápsula fue EXITOSA, DEGRADADA o FALLIDA |
| `capsule_match_strategy` | Cómo encontró el producto (o por qué no lo encontró) |
| `detected_intent` | Qué tipo de pregunta detectó el sistema |

> **Nota:** Si no tienes acceso directo a la tabla, pídele al equipo técnico que te prepare un reporte cada mañana con los números clave. Con los números ya calculados puedes hacer toda esta revisión sin tocar la base de datos.

---

## REVISIÓN DIARIA
*Tiempo estimado: 5 a 10 minutos. Hazlo cada mañana.*

---

### Paso 1 — ¿Hay suficientes datos para analizar?

Mira cuántas conversaciones hubo ayer.

- **Menos de 15 conversaciones** → Anota "volumen bajo" en el registro del equipo y no sigas analizando. Con tan pocas conversaciones los números no son confiables.
- **15 o más** → Continúa con los siguientes pasos.

---

### Paso 2 — ¿Cuántas cápsulas fallaron ayer?

De todas las conversaciones de ayer, cuenta cuántas terminaron como EXITOSA, DEGRADADA o FALLIDA.

**Lo que esperamos ver (normal):**
- EXITOSA: la mayoría, más del 80%
- DEGRADADA: hasta un 15–20% es aceptable en piloto
- FALLIDA: casi cero (menos del 5%)

**Qué hacer según lo que veas:**

| Lo que ves | Qué hacer |
|------------|-----------|
| FALLIDA > 5% | **Alerta inmediata** al equipo técnico |
| DEGRADADA entre 15–20% | Anota en el registro. Monitorea los siguientes días |
| DEGRADADA > 20% | Alerta al equipo técnico ese mismo día |
| Todo dentro de lo normal | Solo anota el número diario y sigue |

---

### Paso 3 — ¿Hubo alguna "Recuperación de Emergencia"?

Busca si hubo alguna sesión donde aparezca `TERMINAL_RECOVERY`. Esto significa que Cesarin no entendió absolutamente nada y el sistema de seguridad tuvo que rescatarlo.

- **0 recuperaciones de emergencia** → Normal. Anota y sigue.
- **1 recuperación de emergencia** → Busca esa conversación y léela. ¿Qué le dijo el cliente? ¿Era una pregunta muy rara o algo que debería entender?
- **Más de 2 en un solo día** → **Alerta inmediata** al equipo técnico.

---

### Paso 4 — ¿Aparece algún tipo de corrección desconocida?

El sistema anota cuándo tuvo que corregir a Cesarin y por qué. Los tipos de corrección que son normales son:

- `COMPATIBILITY_FORCE` — Ajuste de compatibilidad
- `UNKNOWN_RESOLVE_INVENTORY` — No sabía si era búsqueda de producto
- `UNKNOWN_RESOLVE_POLICY` — No sabía si era pregunta de política
- `UNKNOWN_RESOLVE_PRODUCT` — No sabía qué producto era
- `UNKNOWN_RESOLVE_CHIT_CHAT` — No sabía si era conversación casual
- `TERMINAL_RECOVERY` — Recuperación de emergencia

**Si aparece cualquier otro tipo de corrección que no esté en esa lista → Alerta inmediata al equipo técnico.** Significa que algo raro pasó en el sistema.

---

### Paso 5 — ¿El carrito está funcionando bien?

Revisa las conversaciones donde el cliente quiso agregar, quitar o cambiar algo del carrito. En todas esas conversaciones, el sistema debería anotar que el tipo de pregunta fue `cart_operation` (operación de carrito).

- Si aparece alguna marcada como `search` (búsqueda) siendo una operación de carrito → **Alerta inmediata.** Hay una regresión técnica.

---

## REVISIÓN CADA 3 DÍAS
*Tiempo estimado: 15 a 20 minutos. Hazla el día 3, 6, 9... del piloto.*

---

### Paso A — ¿El porcentaje de correcciones está subiendo o bajando?

Compara el porcentaje de conversaciones donde el guardarraíl tuvo que corregir a Cesarin en cada uno de los últimos 3 días.

**Cómo leerlo:**

| Tendencia | Qué significa | Qué hacer |
|-----------|---------------|-----------|
| Porcentaje estable | Cesarin es consistente | Solo anota |
| Porcentaje bajando | Cesarin está mejorando | Excelente, anota |
| Porcentaje subiendo cada día | Cesarin se está "confundiendo" más | Alerta al equipo técnico |
| Porcentaje = 0% en un día con muchas sesiones | Puede ser un error técnico (el sistema no está anotando las correcciones) | Alerta al equipo técnico para verificar |

---

### Paso B — ¿Cómo está encontrando los productos?

Cuando un cliente busca un producto, el sistema anota cómo lo encontró. Estas son las categorías:

| Cómo lo encontró | Qué significa | ¿Es bueno o malo? |
|-----------------|---------------|------------------|
| `EXACT` — Coincidencia exacta | Encontró exactamente lo que pedían | Muy bueno |
| `SEMANTIC` — Coincidencia semántica | Entendió la idea aunque no fue exacto | Bueno |
| `FEATURED_FALLBACK` — Mostró productos destacados | No encontró lo que pedían, mostró populares | Señal de alerta si supera el 30% |
| `OUT_OF_STOCK_ALTERNATIVE` — Alternativa sin stock | El producto pedido no está disponible | Es info de inventario, no problema de IA |
| `NO_MATCH` — Sin resultado | No encontró nada | Señal de alerta si supera el 15% |

**Qué hacer si `FEATURED_FALLBACK` o `NO_MATCH` son altos:**
- Lee 3–5 de esas conversaciones manualmente
- ¿El cliente pedía algo que sí existe en el catálogo? → El sistema tiene un hueco de cobertura. Reportar al equipo técnico para una mejora de catálogo
- ¿El cliente pedía algo muy raro o que no vendemos? → Normal, no es un defecto

---

### Paso C — ¿Las preguntas de política se están respondiendo bien?

Cuando un cliente pregunta sobre envíos, devoluciones, garantías, etc., el sistema debería responder con alta confianza.

**Lo que esperamos ver:**
- `HIGH_CONFIDENCE_POLICY_MATCH` — La mayoría de las preguntas de política

**Señales de alerta:**
- `LOW_CONFIDENCE_FALLBACK` más del 25% → El sistema no tiene suficiente información sobre ese tema en su base de conocimiento
- `DEGRADED` cualquier aparición → Fallo técnico, avisar al equipo

---

### Paso D — ¿Cesarin malinterpretó el mismo tipo de pregunta varias veces?

Revisa si hubo casos donde el sistema de seguridad anotó que Cesarin entendió una cosa pero era otra. Por ejemplo: el cliente preguntó por un producto pero Cesarin pensó que era una pregunta de política.

- Si el mismo tipo de malinterpretación aparece **3 veces o más en 3 días** → Anota el patrón exacto y el tipo de pregunta que lo causó. Reportar al equipo técnico para mejorar los ejemplos de entrenamiento.

---

## REVISIÓN SEMANAL
*Tiempo estimado: 30 a 45 minutos. Hazla al final de la semana 1, semana 2 y semana 3 del piloto.*

---

### Punto 1 — ¿Tenemos suficientes datos?

Verifica el total acumulado de conversaciones (ver §8 más abajo). Si no se alcanzó el mínimo, **extiende el piloto** antes de sacar conclusiones.

---

### Punto 2 — ¿El carrito se está resolviendo bien?

Para las conversaciones donde el cliente quiso hacer algo con el carrito, clasifícalas en:

| Resultado | Qué significa |
|-----------|---------------|
| `EXACT_MUTATION_PROPOSED` — Propuesta exacta | El sistema supo exactamente qué hacer |
| `AMBIGUOUS_MUTATION` — Mutación ambigua | No estaba seguro de qué producto era |
| `UNSAFE_MUTATION` — Operación bloqueada | Algo no era seguro de ejecutar |
| `NO_OP` — Sin acción | No hizo nada |

**Meta:** Más del 60% deben ser `EXACT_MUTATION_PROPOSED`.
- Si está por debajo del 60% semana tras semana → Hay un problema con el reconocimiento de productos en el carrito. Reportar al equipo técnico.

---

### Punto 3 — ¿Las correcciones del guardarraíl están disminuyendo?

Con una semana de datos, compara el porcentaje de correcciones de los primeros 3 días contra los últimos 3 días.

- Si los tipos `UNKNOWN_RESOLVE_*` **no están disminuyendo** después de 14 días de piloto → El sistema no está mejorando su reconocimiento de intenciones. Reportar para revisión de ejemplos de entrenamiento.

---

### Punto 4 — ¿Cuál es la causa raíz de las cápsulas DEGRADADAS?

Cuando una cápsula aparece como DEGRADADA, el sistema anota por qué. Las razones son:

| Razón | Qué significa | Quién lo resuelve |
|-------|---------------|------------------|
| `VECTOR_TIMEOUT` — Tiempo de espera del vector | El servidor de búsqueda tardó demasiado | Infraestructura (no es problema de IA) |
| `DB_LATENCY` — Lentitud de base de datos | La base de datos tardó demasiado | Infraestructura |
| `SCHEMA_ERROR` — Error de esquema | El formato de datos no coincidió | Equipo técnico — **urgente** |
| `QUOTA_LIMIT` — Límite de cuota | Se agotó el presupuesto de la API de IA | Operaciones — revisar facturación |

---

### Punto 5 — Decisión semanal Go / No-Go

Con base en todo lo anterior, aplica las reglas de decisión del siguiente apartado.

---

## SEÑALES DE ALERTA INMEDIATA
*Para. Avisa al equipo técnico ahora mismo. No esperes a la próxima revisión.*

| Señal | Cuándo actuar |
|-------|--------------|
| Cápsulas FALLIDAS > 5% en un día | Inmediatamente |
| Más de 2 `TERMINAL_RECOVERY` en un día | Inmediatamente |
| Aparece un tipo de corrección desconocido | Inmediatamente |
| Conversaciones de carrito marcadas como `search` | Inmediatamente |
| `capsule_execution_status` vacío en todas las filas del día | Inmediatamente — el sistema de telemetría no está funcionando |
| `analyst_intent` vacío en todas las filas del día | Inmediatamente — el registro de intenciones no está funcionando |

---

## SEÑALES DE VIGILANCIA
*Observa pero no actúes todavía. Si se mantienen 3 días seguidos, entonces reporta.*

| Señal | Cuándo preocuparse más |
|-------|------------------------|
| DEGRADADA entre 15–20% | Si sube o se mantiene 3 días |
| `FEATURED_FALLBACK` entre 20–30% | Si aumenta semana a semana |
| Porcentaje de correcciones subiendo cada día | Si llega al 40% acumulado |
| `AMBIGUOUS_MUTATION` > 10% del carrito | Si llega al 15% |
| `LOW_CONFIDENCE_FALLBACK` > 20% de políticas | Si usuarios se quejan también |
| Misma malinterpretación > 3 veces en 3 días | Si llega a 5+ veces |

---

## QUÉ CONVERSACIONES REVISAR MANUALMENTE

Una vez a la semana, lee 3–5 ejemplos de cada uno de estos tipos de conversaciones. No necesitas entender el código — solo lee qué le dijo el cliente y qué respondió Cesarin.

---

**Tipo R1 — Recuperaciones de emergencia (`TERMINAL_RECOVERY`)**
Busca las conversaciones donde apareció este evento.

- ¿Qué preguntó el cliente?
- ¿Era una pregunta que debería poder responder?
- ¿Es un patrón que se repite o un caso muy raro?

---

**Tipo R2 — Errores de esquema (`SCHEMA_ERROR`)**
Busca conversaciones donde la cápsula falló por error de formato.

- ¿En qué tipo de pregunta ocurrió (producto, política, carrito)?
- ¿Qué respondió Cesarin en ese caso?
- Reportar al equipo técnico con la fecha y hora exacta.

---

**Tipo R3 — Sin resultado de producto (`NO_MATCH`)**
Busca conversaciones donde no se encontró ningún producto.

- ¿Qué producto pedía el cliente?
- ¿Ese producto existe en el catálogo con otro nombre?
- Si existe pero no se encontró → problema de cobertura de catálogo. Reportar.
- Si no existe → normal.

---

**Tipo R4 — Malinterpretaciones del tipo de pregunta**
Busca conversaciones donde el sistema entendió un tipo de pregunta diferente al que era.

- ¿Qué dijo exactamente el cliente?
- ¿Qué debería haber entendido Cesarin?
- ¿Es una forma de preguntar que los clientes usan frecuentemente?
- Si sí → reportar al equipo técnico como candidato para nuevo ejemplo de entrenamiento.

---

**Tipo R5 — Carritos ambiguos (`AMBIGUOUS_MUTATION`)**
Busca conversaciones donde el cliente quiso agregar algo al carrito pero el sistema no supo exactamente qué.

- ¿Mencionó el nombre del producto?
- ¿El producto existe en el catálogo?
- ¿El problema fue que hay varias variantes (tallas, sabores, etc.)?
- Si el producto existe claramente → problema de reconocimiento, reportar.
- Si había varias opciones similares → puede ser normal, el sistema necesita que el cliente especifique más.

---

## REGLAS DE DECISIÓN

Estas reglas te dicen qué hacer con los resultados de las revisiones.

---

### Abrir una tarea de corrección de defecto cuando:
- Cualquier señal de alerta inmediata se sostiene más de 1 día
- DEGRADADA > 20% confirmado en ventana de 3 días
- `TERMINAL_RECOVERY` aparece en 3 o más sesiones en 3 días
- `SCHEMA_ERROR` aparece en cualquier momento (tolerancia cero)
- `detected_intent = 'search'` reaparece en conversaciones de carrito

---

### Abrir una tarea de mejora de cobertura cuando:
- `FEATURED_FALLBACK` > 30% de búsquedas en 7 días
- `NO_MATCH` > 15% y las revisiones manuales muestran productos que sí existen
- `LOW_CONFIDENCE_FALLBACK` > 25% de preguntas de política en 7 días

---

### Abrir una tarea de mejora de reconocimiento cuando:
- El mismo tipo de malinterpretación ocurre 5 o más veces en 7 días
- Los `UNKNOWN_RESOLVE_*` no disminuyen después del día 14 del piloto
- `AMBIGUOUS_MUTATION` del carrito > 15% sostenido en 3 días

---

### Seguir observando sin acción cuando:
- Todos los números están dentro de los rangos normales
- El porcentaje de correcciones es estable (no sube ni baja mucho)
- No aparecen nuevos tipos de corrección
- DEGRADADA < 15% y sin `SCHEMA_ERROR`
- Carrito con resolución limpia > 60%

---

### Extender el piloto cuando:
- No se alcanzó el volumen mínimo de datos al final de la semana 1
- Todo el tráfico llegó en pocas horas de un solo día (no es representativo)
- Se resolvió una alerta a mitad de semana — reiniciar la ventana de observación de 7 días

---

## VOLUMEN MÍNIMO DE DATOS

Antes de sacar conclusiones, necesitas suficientes conversaciones. Con muy pocos datos, los porcentajes no son confiables.

| Para decidir sobre... | Mínimo de conversaciones necesarias |
|----------------------|-------------------------------------|
| Revisión diaria del pulso | 15 conversaciones en el día |
| Tendencia de correcciones en 3 días | 45 conversaciones en 3 días |
| Distribución de búsqueda de productos | 30 conversaciones de ese tipo |
| Detección de malinterpretaciones repetidas | 60 conversaciones en total |
| Decisión semanal final Go/No-Go | 150 conversaciones en total |
| Análisis del carrito | 30 conversaciones de carrito (puede tomar más tiempo) |

**Si el volumen es bajo (menos de 5 sesiones por día):**
- Haz la revisión "diaria" cada 2 días
- Haz la revisión de "3 días" cada semana
- Espera a tener 150 conversaciones antes de tomar cualquier decisión grande, sin importar cuántos días hayan pasado

---

## LO QUE ESTA GUÍA NO PUEDE DECIRTE

Es importante saber las limitaciones para no sacar conclusiones equivocadas.

---

**1. No sabemos si el cliente quedó satisfecho.**
Que una cápsula marque "EXITOSA" solo significa que el sistema funcionó sin errores técnicos. No significa que el cliente encontró lo que buscaba o quedó contento con la respuesta. Para saber eso, necesitarías encuestas de satisfacción o revisión manual.

---

**2. Los números solos no te dicen qué preguntó el cliente.**
Para entender el contexto real de cada número, tienes que ir a leer las conversaciones manualmente (sección de muestras). Los porcentajes te dicen *cuánto* pasó algo; la lectura manual te dice *por qué*.

---

**3. `FEATURED_FALLBACK` puede significar dos cosas distintas.**
A veces aparece porque el cliente fue vago ("quiero un vape" sin especificar cuál). A veces aparece porque el cliente fue específico pero el sistema no encontró ese producto. El número solo no te dice cuál fue. Necesitas leer esas conversaciones.

---

**4. Las conversaciones de carrito son minoría.**
La mayoría de las interacciones son búsquedas de producto o preguntas. Las operaciones de carrito pueden ser menos del 20% del total. Para tener 30 conversaciones de carrito, puede que necesites esperar más tiempo que para otros análisis.

---

**5. No hay punto de comparación con antes.**
No existe registro de cómo funcionaba el sistema antes de esta versión. Solo puedes comparar el piloto consigo mismo: semana 1 vs. semana 2 vs. semana 3.

---

**6. Los primeros días pueden no representar a los clientes reales.**
Si el piloto empieza con el equipo interno haciendo pruebas, las preguntas serán muy diferentes a las de clientes reales. Los números pueden cambiar significativamente cuando lleguen los primeros clientes reales. Considera reiniciar el análisis después de las primeras 500 conversaciones de clientes reales.

---

## Registro diario sugerido

Para mantener un historial del piloto, llena esto cada día:

```
Fecha: ________________
Conversaciones del día: ________
EXITOSAS: ___% | DEGRADADAS: ___% | FALLIDAS: ___%
Recuperaciones de emergencia: ____
Tipos de corrección nuevos o desconocidos: Sí / No
¿Alguna alerta inmediata? Sí / No — Cuál: ________________
Notas: ________________________________________________
```

---

*Guía preparada para el piloto de Cesarin AI — VSM Store*
*Versión: A85-PILOTO-v1.0 | Actualizada: 2026-03-21*
