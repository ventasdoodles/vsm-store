# Auditoría de Módulos de IA (Inteligencia Artificial)

**Fecha:** 2026-03-15
**Versión:** 1.12.1-neural

---

## 1. Resumen Técnico

### Hooks y Contextos Principales
### Hooks y Contextos Principales
- `src/hooks/useAIConcierge.ts`: Gestión de mensajes IA, triggers sensoriales, integración UI.
- `src/hooks/useSmartRecommendations.ts`: Recomendaciones IA, integración con productos.
- `src/hooks/useSmartBundleOffer.ts`: Ofertas dinámicas IA.
- `src/contexts/TacticalContext.tsx`: UI sensorial adaptada a preferencias IA.
- `src/hooks/useAppMonitoring.ts`: Monitoreo de actividad y errores, canal de presencia.

### Servicios IA
- `src/services/concierge.service.ts`: Chat IA, búsqueda semántica, neural search, actualización de preferencias, inteligencia 360.
- `src/services/bundle.service.ts`: Ofertas de bundle IA y fallback local.

---
## 2. Flujos de Interacción IA

### Mensajes y Asistente IA
- El usuario envía mensajes mediante `useAIConcierge`.
- El hook gestiona el estado, historial y triggers sensoriales (audio, haptic, speech).
- El servicio `conciergeService` invoca funciones Edge en Supabase (Gemini API) para responder, sugerir productos y extraer intención.

### Recomendaciones Inteligentes
- `useSmartRecommendations` consulta productos relacionados vía IA.
- Usa React Query para cache y actualización.
- El servicio IA puede usar embeddings, vector search o fallback semántico.

### Ofertas Dinámicas IA
- `useSmartBundleOffer` solicita bundles personalizados según el producto y subtotal.
- Si la IA falla, se usa un fallback local para cross-sell.

### UI Sensitiva y Adaptativa
- `TacticalContext` adapta la UI según preferencias IA del usuario.
- Provee métodos de feedback: audio procedural, haptic, speech.
- Sincroniza el tema visual con el perfil IA.

### Monitoreo y Logging
- `useAppMonitoring` crea canales de presencia, trackea actividad y captura errores globales.
- Permite auditoría de actividad y errores en tiempo real.

---
## 3. Dependencias y Integración

- Supabase: Base de datos, funciones Edge, RPC vector search.
- Gemini API: Procesamiento IA, embeddings, chat.
- React Query: Cache y actualización de datos IA.
- Web Audio API, SpeechSynthesis, Vibrate API: Feedback sensorial.

---
## 4. Recomendaciones de Tests

- Tests unitarios para `useAIConcierge`:
  - Mockear servicios IA (chat, neuralSearch).
  - Simular mensajes de usuario y respuestas IA.
  - Verificar triggers sensoriales (audio, haptic, speech).
- Tests para `useSmartRecommendations` y `useSmartBundleOffer`:
  - Mockear servicios de recomendación y bundle.
  - Verificar resultados según input y manejo de errores.
- Tests para `TacticalContext`:
  - Verificar métodos de feedback y adaptación de tema visual.
- Tests para `useAppMonitoring`:
  - Simular actividad, errores y canal de presencia.

---
## 5. Recomendaciones de Documentación

- Documentar flujos de interacción IA, triggers sensoriales y puntos de integración.
- Añadir advertencias sobre dependencias externas y ejemplos de uso.
- Incluir diagramas de secuencia para los flujos IA y recomendaciones.
- Explicar fallback y degradación en caso de error IA.

---
## 6. Ejemplo de Test

---

## 2. Recomendaciones de Tests

- Crear tests unitarios para `useAIConcierge`:
  - Mockear servicios IA (chat, neuralSearch).
  - Simular mensajes de usuario y respuestas IA.
  - Verificar triggers sensoriales (audio, haptic, speech).
- Crear tests para `useSmartRecommendations` y `useSmartBundleOffer`:
  - Mockear servicios de recomendación y bundle.
  - Verificar resultados según input y manejo de errores.
- Añadir tests para `TacticalContext`:
  - Verificar métodos de feedback y adaptación de tema visual.

---

## 3. Recomendaciones de Documentación

- Documentar flujos de interacción IA, triggers sensoriales y puntos de integración.
- Añadir advertencias sobre dependencias externas y ejemplos de uso.
- Incluir diagramas de secuencia para los flujos IA y recomendaciones.

---

## 4. Plantilla de Test (Ejemplo)

```ts
import { renderHook, act } from '@testing-library/react';
import { useAIConcierge } from '../useAIConcierge';

describe('useAIConcierge', () => {
  it('debería gestionar mensajes IA y triggers', () => {
    // Mock servicios IA y simular mensajes
    // ...
  });

  it('debería manejar errores de servicio', () => {
    // Simular error en neuralSearch
    // ...
  });
});
```

---

## 5. Plantilla de Documentación (Ejemplo)

```md
### useAIConcierge
- Permite interacción asistida por IA.
- Integra triggers sensoriales y UI adaptativa.
- Ejemplo de uso:

```js
const { sendMessage, messages, isLoading } = useAIConcierge();
```

- Advertencia: Depende de servicios externos (neuralSearch, chat).
```

---

**Documento generado por GitHub Copilot.**