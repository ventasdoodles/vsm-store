<!--
Generado con:
- Modelo de lenguaje: Codex (GPT-5)
- IDE: Visual Studio Code
-->

# AI Surface Inventory + Utilization Audit

## 1. Files inspected

- `src/pages/admin/AdminCesarinOS.tsx`
- `src/components/admin/cesarin/TabAnalytics.tsx`
- `src/components/admin/cesarin/TabLearning.tsx`
- `src/components/admin/cesarin/TabQuality.tsx`
- `src/components/admin/cesarin/TabSimulator.tsx`
- `src/components/admin/cesarin/TabKnowledge.tsx`
- `src/components/admin/cesarin/TabConcepts.tsx`
- `src/components/admin/cesarin/TabPilot.tsx`
- `src/components/admin/cesarin/PilotTelemetry.tsx`
- `src/components/admin/cesarin/PilotParityDiagnostics.tsx`
- `src/components/admin/cesarin/ReviewDrawer.tsx`
- `src/components/admin/cesarin/TabPersona.tsx`
- `src/components/admin/cesarin/TabRules.tsx`
- `src/hooks/useAIConcierge.ts`
- `src/services/concierge.service.ts`
- `src/services/admin/admin-pilot-ops.service.ts`
- `src/hooks/admin/useAdminPilotOps.ts`
- `src/services/admin/admin-eval.service.ts`
- `src/services/admin/admin-products.service.ts`
- `src/components/admin/products/ProductEditorDrawer.tsx`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`

## 2. AI surfaces encontradas

- `AIConcierge` storefront chat + `useAIConcierge` + `concierge.service`: runtime principal.
- Cesarin OS tabs reales: `Persona`, `Rules`, `Simulator`, `Learning`, `Quality`, `Knowledge`, `Pilot`, `Concepts`.
- Pilot/telemetry surfaces: `TabPilot`, `PilotTelemetry`, `PilotParityDiagnostics`, `ReviewDrawer`.
- Knowledge/retrieval surfaces: `store_knowledge`, `knowledge-ingestor`, embeddings/retrieval stack documentado en canon.
- Concepts/compatibility surfaces: `TabConcepts`.
- Product AI/enrichment surfaces: `admin-products.service.ts` + `ProductEditorDrawer.tsx`.
- Decorative or legacy-looking AI surface: `TabAnalytics.tsx`.

## 3. Qué quedó validado como uso real

- Storefront AI sí está cableada a runtime real vía `customer-intelligence`, semantic/neural search y cápsulas; no es UI de adorno.
- `TabKnowledge` sí opera sobre `store_knowledge` y safe-edit sync; impacta retrieval y contexto operativo.
- `TabSimulator` sí usa runtime real y persiste sesiones/métricas; aporta valor operativo.
- `TabQuality` sí escribe/lee evaluaciones reales (`ai_simulation_reports`) y usa `cesarin-qa-judge`.
- `PilotTelemetry` sí consume `ai_analytics`; es la superficie de observabilidad real.
- `ReviewDrawer` + `admin-eval.service.ts` sí sostienen human evaluation real.
- `TabConcepts` sí carga conceptos, aliases y relaciones; no es sólo UI.
- La generación AI de copy en productos sí existe y, si se guarda, afecta campos que el storefront muestra.

## 4. Qué quedó validado como redundante / huérfano / dudoso

- `TabAnalytics.tsx`: redundante/decorativo. Tiene contenido estático y no parece ser la telemetría operativa real.
- `TabLearning` no está huérfano, pero sí conceptualmente solapado con `TabRules`; hoy vale, mañana puede pedir convergencia.
- `TabConcepts` no está huérfano, pero su creación de conceptos está incompleta; el botón `Nuevo Concepto` sigue siendo placeholder.
- `TabQuality` es útil, pero tiene señales dudosas de hardcodeo parcial, por ejemplo el `judge_model` fijo.
- Varias edge functions AI existen en el repo/documentación, pero no quedó evidenciado en este barrido que todas tengan consumo operativo actual; no corresponde llamarlas muertas sin auditoría dedicada.

## 5. Impacto real en storefront o runtime

- Alto impacto real: `AIConcierge`, `customer-intelligence`, retrieval/embeddings, `TabKnowledge`, product AI copy, telemetry/evaluation loop.
- Impacto indirecto pero real: `TabConcepts` y compatibilidad enriquecen operación semántica y admin tooling.
- Impacto operativo interno: `TabSimulator`, `TabQuality`, `PilotTelemetry`, `ReviewDrawer`.
- Bajo o nulo impacto real hoy: `TabAnalytics` como tab separada; no parece afectar runtime ni decisiones reales.

## 6. Riesgos de complejidad innecesaria

- Exceso de superficies admin para funciones parecidas: `Learning`, `Rules`, `Quality`, `Pilot`, `Analytics`.
- Riesgo de confundir `telemetry real` con `analytics decorativo` por coexistencia de `PilotTelemetry` y `TabAnalytics`.
- Riesgo de mantener UI incompleta como si fuera módulo maduro, especialmente en `TabConcepts`.
- Riesgo de drift entre canon y strings hardcodeadas de modelos o stack esperado.
- Riesgo de acumular edge functions AI con valor poco visible si no se audita consumo real por dominio.

## 7. Recommendation matrix (KEEP / MERGE / REDESIGN / DEPRECATE CANDIDATE)

| Surface / Module | Status | Motivo |
|---|---|---|
| `AIConcierge` + `useAIConcierge` + `concierge.service` | KEEP + HARDEN | Nucleo runtime real del piloto/storefront |
| `TabKnowledge` + `knowledge-ingestor` | KEEP + HARDEN | Operativo y conectado a retrieval real |
| `TabSimulator` | KEEP | Herramienta real de prueba y trazabilidad |
| `TabQuality` | KEEP + HARDEN | QA real, pero con señales de configuración rígida |
| `PilotTelemetry` | KEEP | Observabilidad real desde `ai_analytics` |
| `ReviewDrawer` / human eval | KEEP | Cierra loop humano real |
| `TabPilot` | KEEP | Consolida runbook + parity/telemetry |
| `PilotParityDiagnostics` | KEEP | Útil para soporte/parity, no decorativo |
| `TabConcepts` | REDESIGN | Valor real, pero creación incompleta y UX todavía parcial |
| `TabLearning` | KEEP + HARDEN | Útil, pero necesita mejor encaje con `Rules` |
| `TabRules` | KEEP + HARDEN | Sigue siendo control operativo válido |
| `TabLearning` + `TabRules` | MERGE | Candidato futuro por solape funcional |
| `TabAnalytics` | DEPRECATE CANDIDATE | Static/demo, superseded por telemetry real |
| Product AI copy generation | KEEP | Sí impacta campos visibles del producto |
| Edge functions AI no auditadas en consumo real | REMOVE ONLY IF EXPLICITLY APPROVED | No hay evidencia suficiente para matarlas |

## 8. Quick wins sugeridos

- Aclarar en UI que `TabAnalytics` no es la fuente operativa, o retirarla del flujo principal si se aprueba.
- Conectar mejor `TabLearning` con `TabRules` para que el paso de insight a regla sea menos fragmentado.
- Completar o esconder el botón placeholder de creación en `TabConcepts`.
- Revisar strings hardcodeadas de modelos en `TabQuality` y surfaces diagnósticas.
- Etiquetar explícitamente qué tabs son `operación real` vs `diagnóstico` vs `experimental`.
- Hacer una auditoría separada de consumo real para edge functions AI periféricas antes de decidir deprecaciones.

## 9. Qué NO recomiendas tocar todavía

- No tocar `AIConcierge`, retrieval, `TabKnowledge`, `PilotTelemetry`, `TabPilot`, `ReviewDrawer` ni el loop de evaluación.
- No borrar edge functions AI sólo porque hoy no estén claramente visibles en UI.
- No mezclar esta auditoría con el carril actual de pilot-gate/PWA parity.
- No convertir `TabConcepts` o `TabQuality` en refactor grande sin una wave dedicada.

## 10. Veredicto final del ecosistema AI actual

- El ecosistema AI actual sí tiene núcleo real y operativamente justificado; no es `AI por decoración`.
- Lo que aporta valor claro hoy está en storefront concierge, retrieval/knowledge, simulator/quality, pilot telemetry y human evaluation.
- La principal deuda no es falta de IA, sino exceso de superficies admin parcialmente solapadas y una o dos tabs que ya parecen legado visual.
- Resumen frío: el core AI merece defensa; la periferia admin necesita poda selectiva y rediseño, no demolición impulsiva.
