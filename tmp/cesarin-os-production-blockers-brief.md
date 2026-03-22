# Cesarin OS — Diagnóstico de Bloqueos Críticos de Producción

## Objetivo

Habilitar un despliegue más seguro de Cesarín OS a producción en una ventana corta, atacando tres bloqueos de infraestructura sin tocar:

- cápsulas cliente
- inyección del system prompt
- diseño actual de base de datos

## Resumen ejecutivo

Hay tres riesgos reales sobre la ruta productiva actual:

1. **Autorización server-side insuficiente para el acceso piloto**
2. **Ausencia de un fallback estructural robusto ante fallos de Gemini**
3. **QA productivo todavía demasiado dependiente de revisión manual**

No todos pesan igual para una ventana de 4 horas.

Mi lectura honesta es:

- **Fatal real e inmediato:** bloqueo 1
- **Fatal real y muy cercano a inmediato:** bloqueo 2
- **Muy importante, pero no del mismo nivel de bloqueo para hoy:** bloqueo 3

---

## Bloqueo 1 — Pilot Gate sólo client-side

### Diagnóstico

Hoy el cliente manda la señal de piloto desde:

- `src/services/concierge.service.ts`

La Edge Function principal:

- `supabase/functions/customer-intelligence/index.ts`

no muestra al inicio una validación fuerte de autorización piloto del lado servidor antes de consumir Gemini.

Además, esa función crea un cliente con:

- `SUPABASE_SERVICE_ROLE_KEY`

lo que vuelve todavía más importante separar claramente:

- autenticación del request
- autorización del uso del lane piloto

### Riesgo

Este punto sí es serio:

- un request directo al endpoint público puede forzar consumo de Gemini
- hoy no se ve una barrera server-side equivalente al gate del cliente
- el piloto queda demasiado expuesto a abuso, gasto o tráfico no previsto

### Fix pedido

- validar auth server-side al inicio
- si no está autorizado: `403 Forbidden`
- hacerlo antes de Analyst, embeddings o Sommelier

### Opinión honesta

Estoy de acuerdo con el diagnóstico.

Este sí es un **bloqueo de producción real**.

Lo único que matizaría es la solución exacta:

- si hoy el modelo de piloto es sólo cookie local, entonces “validar Supabase Auth” no es automáticamente compatible con el sistema actual
- para 4 horas, el fix más seguro no es una solución elegante de producto, sino una barrera clara y mínima

En corto:

> el problema está bien detectado; la implementación debe priorizar seguridad pragmática antes que pureza conceptual.

---

## Bloqueo 2 — Sin circuit breaker / fallback de emergencia

### Diagnóstico

`customer-intelligence/index.ts` hace múltiples llamadas a Gemini:

- Analyst
- Sommelier
- y partes auxiliares del flujo

Sí existe manejo general de errores y hay algunos checks parciales, pero no se ve un fallback realmente contractual para todos los caminos de fallo.

### Riesgo

También es real:

- `429`
- timeout
- error upstream de Gemini
- respuesta parseable incompleta

pueden romper la experiencia o devolver algo que no sea el contrato más estable para UI.

### Fix pedido

- `try/catch` robusto
- timeout seguro
- objeto JSON siempre válido
- mensaje in-character de degradación temporal

### Opinión honesta

También coincido.

Este es un **bloqueo muy real** y sí es razonable tratarlo como urgente.

Mi matiz:

- el sistema actual no está totalmente “sin nada”; sí tiene `catch` global y algunos guardrails de texto
- pero eso no equivale a un circuit breaker ni a un fallback contractual serio

En otras palabras:

> el problema no es “cero manejo”; el problema es “manejo insuficiente para producción”.

Para una ventana de 4 horas, este fix es **mucho más realista y defendible** que intentar rediseñar QA productivo completo.

---

## Bloqueo 3 — Juez aislado / QA manual exclusivo

### Diagnóstico

Hoy `cesarin-qa-judge` vive separado en:

- `supabase/functions/cesarin-qa-judge/index.ts`

y su uso visible actual está amarrado al admin manual desde:

- `src/components/admin/cesarin/TabQuality.tsx`

Además, por lo que se ve en código:

- `cesarin-qa-judge` devuelve evaluación JSON
- `TabQuality` persiste eso dentro de `ai_simulation_reports`
- no se observa aquí un flujo ya listo que guarde automáticamente en `ai_evaluations` para turnos productivos

### Riesgo

La preocupación de producto es válida:

- una alucinación real puede llegar al cliente sin red de seguridad caliente
- los admins pueden enterarse tarde

### Fix pedido

- trigger asíncrono cuando:
  - `frustration_detected = true`
  - o `zero_results = true`
- mandar el turno al juez en background
- guardar reporte sin sumar latencia

### Opinión honesta

Aquí sí discrepo parcialmente con la clasificación de “fatal”.

Lo veo así:

- **sí es una mejora importante**
- **sí ayuda a vigilancia productiva**
- **pero no lo pondría al mismo nivel de bloqueo inmediato que 1 y 2**

Razón:

- no evita abuso del endpoint
- no evita colapso contractual del turno en tiempo real
- además, el target técnico propuesto no está tan listo como suena: hoy el juez no parece estar cableado directamente a `ai_evaluations` como camino operativo estándar

Entonces mi lectura honesta es:

> como mejora de red de seguridad, sí; como blocker “en las próximas 4 horas”, está un escalón por debajo.

---

## Priorización honesta para una ventana de 4 horas

### Prioridad 1

**Cerrar el acceso server-side del piloto**

Porque hoy protege costo, superficie pública y control real del lane.

### Prioridad 2

**Añadir fallback contractual / circuit breaker mínimo**

Porque evita que un fallo de Gemini rompa la experiencia de usuario.

### Prioridad 3

**QA asíncrono mínimo viable**

Sí conviene, pero lo trataría como:

- “si da el tiempo”
- o “siguiente pass inmediato post-release hardening”

---

## Mi veredicto, honestamente

El resumen está bien orientado, pero yo no lo presentaría como “tres fatales del mismo peso”.

Lo presentaría así:

- **Fatal 1:** sí
- **Fatal 2:** sí, casi al mismo nivel
- **Fatal 3:** importante, pero no del mismo orden de urgencia para liberar producción en pocas horas

Si el objetivo real es desplegar con más seguridad en 4 horas, la secuencia correcta no es repartir atención pareja.

La secuencia correcta es:

1. blindar autorización server-side
2. blindar fallback contractual ante fallo Gemini
3. si aún hay margen, agregar QA asíncrono mínimo

---

## Recomendación operativa

Si este brief se usa para ejecución:

- tratar 1 y 2 como **release blockers**
- tratar 3 como **high-priority follow-up**, salvo que ya exista una integración muy simple y probada para persistir esos juicios sin abrir deuda nueva

## Archivos más directamente implicados

- `supabase/functions/customer-intelligence/index.ts`
- `supabase/functions/cesarin-qa-judge/index.ts`
- `src/components/admin/cesarin/TabQuality.tsx`
- `src/services/concierge.service.ts`

## Cierre

El diagnóstico base es bueno.

Mi ajuste honesto no es de dirección, sino de severidad:

> 1 y 2 son blockers inmediatos de producción.  
> 3 es una mejora muy valiosa de resiliencia operativa, pero no lo pondría en el mismo nivel si la ventana real es de 4 horas.
