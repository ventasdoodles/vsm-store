# Deploy / Runtime Parity Hygiene (PWA-Aware)

**Generado con modelo de lenguaje:** Codex (GPT-5)  
**IDE:** Workspace local del usuario (nombre de IDE no especificado en el contexto compartido)

Fecha: 2026-03-19  
Proyecto: `VSM Storefront AI Pilot / Cesarin OS`  
Modo: `PARALLEL SAFE / SHADOW MODE / READ-ONLY`

## Contexto

Wave 192 ya está cerrada como `DONE`.  
La línea estratégica vigente es:

- `DEPLOY / RUNTIME PARITY HYGIENE (PWA-AWARE)`

Este documento es de soporte paralelo. No implica cambios aplicados, reapertura de waves ni intervención sobre el carril principal.

## 1. Files inspected

- `src/main.tsx`
- `src/App.tsx`
- `public/sw.js`
- `public/manifest.json`
- `src/components/ui/ai/PilotDebugBadge.tsx`
- `src/components/admin/cesarin/TabPilot.tsx`
- `src/components/admin/cesarin/PilotParityDiagnostics.tsx`
- `vite.config.ts`
- `src/vite-env.d.ts`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`

## 2. Qué cambió realmente

- No se aplicó ningún cambio.
- El entendimiento del problema se ajustó: el repo ya contiene parte importante de la línea de parity hygiene.
- Ya existen:
  - fingerprints declarados en `src/vite-env.d.ts`
  - comparación de fingerprint en `src/main.tsx`
  - superficie diagnóstica en `PilotParityDiagnostics.tsx`
  - versionado de cache alineado con el carril parity en `public/sw.js`

## 3. Qué quedó validado

### Fingerprint / version discipline

Se validó que el repo ya tiene señales explícitas de versión/runtime:

- `__CANON_BASE_BUILD__`
- `__RUNTIME_BUILD_FINGERPRINT__`
- `__BUILD_TIMESTAMP__`

También se validó que:

- `src/main.tsx` compara fingerprint previo vs fingerprint actual
- `public/sw.js` ya usa `CACHE_VERSION = 'v112.1-parity'`
- `AI_CONTEXT.md` ya muestra `Build: v112`

### Browser vs PWA installed variance

Se validó que `PilotParityDiagnostics.tsx` detecta:

- modo `PWA Installed`
- modo `Standard Browser`

Eso da una superficie real para distinguir contexto de ejecución.

### Pilot gate / session behavior

Se validó que `App.tsx` implementa:

1. lectura de `?pilot=cesarin`
2. persistencia en `sessionStorage`
3. limpieza del query param
4. doble gate:
   - `is_ai_assistant_enabled`
   - `isPilotAuthorized`

### Reuse of debug surfaces

Se validó que ya existen dos superficies reutilizables:

- `PilotDebugBadge`
- `PilotParityDiagnostics`

### Contaminación documental/canónica

No se detectó una contradicción canónica fuerte activa en este carril.
El canon principal ya refleja `v112`.

## 4. Qué sigue abierto

- No quedó evidenciado en los archivos inspeccionados cómo se inyectan en build los valores de:
  - `__CANON_BASE_BUILD__`
  - `__RUNTIME_BUILD_FINGERPRINT__`
  - `__BUILD_TIMESTAMP__`
- No quedó evidenciado que browser normal y PWA instalada compartan exactamente el mismo comportamiento del pilot gate en todos los casos.
- No quedó evidenciado si el prompt principal obliga explícitamente a reutilizar superficies existentes antes de crear nuevas.
- Sigue abierto el riesgo de diagnósticos que parezcan exactos pero sólo estén leyendo estado local del navegador.

## 5. Drift real detectado o no detectado

### Drift real detectado

- Drift potencial de especificación:
  - el prompt puede asumir que falta instrumentación, cuando el repo ya la tiene parcialmente materializada
- Gap real de wiring:
  - existen fingerprints declarados, pero su origen no quedó evidenciado en `vite.config.ts`

### Drift no detectado

- no se detectó un nuevo drift funcional de Wave 192
- no se detectó desalineación fuerte entre canon principal y este carril parity
- no se detectó necesidad de reabrir Wave 191 o Wave 192

## 6. Riesgos prioritarios

### 1. Duplicación diagnóstica

Riesgo:

- crear una tercera superficie de debug cuando ya existen dos

Señal temprana:

- paneles redundantes o mensajes inconsistentes entre debug surfaces

### 2. Sobrerrefactor

Riesgo:

- tocar simultáneamente `main.tsx`, `sw.js`, `TabPilot` y docs cuando el repo ya tiene base suficiente

Señal temprana:

- cambios grandes para resolver un problema pequeño de parity

### 3. Diagnóstico con falsa certeza

Riesgo:

- usar `sessionStorage` o `localStorage` como si fueran verdad completa de runtime

Señal temprana:

- UI muestra un build/fingerprint, pero runtime real no coincide

### 4. Source of truth difusa para fingerprints

Riesgo:

- fingerprints declarados sin wiring visible de build

Señal temprana:

- valores vacíos, defaults engañosos o placeholders en runtime

## 7. Huecos o ambigüedades del prompt de Antigravity

- No obliga explícitamente a reutilizar `PilotParityDiagnostics` y `PilotDebugBadge`.
- No prioriza de forma dura:
  1. verificar wiring de fingerprints
  2. verificar browser vs PWA variance
  3. recién después tocar cache/SW
- No define qué cuenta como evidencia suficiente para afirmar parity real.
- No bloquea con suficiente claridad la creación de diagnósticos redundantes.
- No explicita que diagnóstico local no equivale automáticamente a verdad de runtime.

## 8. Microajustes sugeridos al prompt

- “Reutiliza superficies existentes de diagnóstico antes de crear nuevas.”
- “Confirma cómo se alimentan `__CANON_BASE_BUILD__`, `__RUNTIME_BUILD_FINGERPRINT__` y `__BUILD_TIMESTAMP__` antes de confiar en ellos.”
- “No declares runtime parity solved sólo por leer storage local.”
- “Evita tocar a la vez `main.tsx`, `public/sw.js` y `TabPilot` salvo necesidad estricta.”
- “Si el repo ya materializa parity diagnostics, reduce el scope a consolidación mínima.”

## 9. Patch candidate propuesto o “no patch candidate”

`no patch candidate`

Motivo:

- el carril principal ya parece estar trabajando exactamente estas superficies
- el mayor valor paralelo en este momento es mejorar la especificación y reducir duplicación

## 10. Veredicto paralelo

`requiere ajuste`

La línea va bien en dirección general, pero no necesita reinvención.
Lo que necesita es más disciplina de especificación:

- reutilizar lo ya existente
- exigir evidencia real del wiring de fingerprints
- evitar duplicación diagnóstica
- evitar vender estado local como verdad completa de runtime
