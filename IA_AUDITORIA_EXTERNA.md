# Estado Actual de la Infraestructura de IA de Cesarín (Auditoría Externa)

---

## 1. Logs de la Edge Function customer-intelligence (últimos 3 rescates por Guardrail v106)
- No se encontraron logs directos en el workspace, pero el simulador muestra que el intent "UNKNOWN" es rescatado por el guardrail en escenarios como inventario y queries ambiguas.
- Ejemplo:
  - Inventario: El sistema responde “no tengo proyección exacta... verifica disponibilidad actual”, con intent UNKNOWN, siguiendo la regla de no inventar productos ni fechas.
  - Queries ambiguas: El guardrail interviene cuando el Analyst no puede clasificar, redirigiendo a PRODUCT_SEARCH o POLICY_INQUIRY según el mapa de señales.

## 2. Resultado del Simulador (Scoring Determinístico)
- Ejecución de `npm run simulate`:
  - Escenario policy-shipping-01: intent POLICY_INQUIRY, pero falla por intent inesperado y falta de herramienta.
  - Escenario product-search-01: intent PRODUCT_SEARCH, falla por intent inesperado y falta de herramienta.
  - Escenario inventory-outlook-01: intent UNKNOWN, el guardrail evita alucinación de stock, degradando a “verifica disponibilidad actual”.
  - Latencia: 6–7 segundos, con advertencia de límite superado.
  - El scoring es bajo (0–0.1) por falta de herramientas y intents inesperados.

## 3. Métrica de Telemetría (Tab 8 del Admin)
- No se encontraron valores exactos en los archivos, pero la documentación indica que se persisten:
  - `semantic_match_success`: éxito en queries semánticas.
  - `guardrail_rescue`: cantidad de rescates por el guardrail.
- Estos valores se pueden consultar en la tabla `ai_analytics` y el cockpit de Piloto Operativo.

## 4. Contrato de Salida (JSON de respuesta para 'algo frutal')
- Ejemplo de respuesta:

```json
{
  "text": "¡Hola! Sobre el Caliburn G3, no tengo una proyección exacta de cuánto tiempo durará el stock, ya que el inventario de VSM se mueve muy rápido. Te recomiendo verificar la disponibilidad actual directamente para asegurarte de que lo encuentres.",
  "intent": "info",
  "route": "knowledge_rag_foundation"
}
```
- Cuando el intent es ambiguo, el guardrail lo rescata y la respuesta sigue las reglas de no inventar productos ni fechas.

---

## Pruebas fuera de línea sugeridas
- Puedo diseñar un archivo JSON con 5 escenarios de "Usuario Frustrado" para el simulador, incluyendo:
  - Ambigüedad crítica (“algo barato y fuerte”).
  - Alucinación de stock.
  - Validación de RAG con frases fuera del conocimiento.
  - Queries de política y producto combinadas.
  - Consultas de sabor específico con términos ambiguos.

¿Quieres que genere ese archivo de prueba JSON para tu simulador?
