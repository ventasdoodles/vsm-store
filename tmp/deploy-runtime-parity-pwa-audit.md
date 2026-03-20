# Deploy / Runtime Parity Hygiene (PWA-Aware)

Fecha: 2026-03-19  
Proyecto: `VSM Storefront AI Pilot / Cesarin OS`  
Modo: `PARALLEL SAFE / SHADOW MODE / READ-ONLY`  
Rol: `Codex shadow auditor`

## Contexto

Wave 192 ya está cerrada como `DONE`.  
La línea estratégica vigente no es abrir una wave nueva, sino reducir incertidumbre operativa en:

- deploy drift
- runtime drift
- service worker / cache drift
- variancia entre navegador normal y PWA instalada
- pilot gate variance
- admin/auth claims variance
- desalineación entre canon y código real

Este documento es sólo de soporte. No implica cambios aplicados ni reapertura de frentes cerrados.

---

## 1. Files inspected

- `src/main.tsx`
- `src/App.tsx`
- `public/sw.js`
- `public/manifest.json`
- `src/components/ui/ai/PilotDebugBadge.tsx`
- `vite.config.ts`
- `package.json`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`

---

## 2. Qué cambió realmente

- No se aplicó ningún cambio.
- Se detectó drift real de fingerprint/versioning entre:
  - canon operativo `v112`
  - residual documental `v111`
  - frontend boot fingerprint `W143-RECOVERY-A`
  - service worker cache version `v141`
- Se detectó fragilidad real en parity PWA-aware:
  - el bootstrap desregistra service workers existentes y luego vuelve a registrar `/sw.js`
  - el pilot gate depende de `sessionStorage`
  - eso puede comportarse distinto entre navegador normal y PWA instalada

---

## 3. Qué quedó validado

### Build / Version Fingerprint

Se confirmó que no existe una señal unificada y visible de build/runtime actual.

Hallazgos:

- Canon principal:
  - `Base Build v112`
- Residuo documental:
  - `Build: v111 (Tested 19-March-2026)`
- Frontend boot:
  - `VSM_VERSION = 'W143-RECOVERY-A'`
- Service worker:
  - `CACHE_VERSION = 'v141'`

Conclusión:

- hoy el repo no habla un único lenguaje de versión
- eso debilita cualquier análisis de “¿estoy viendo runtime nuevo o viejo?”

### Pilot Gate

Se confirmó que el gate existe y sigue esta ruta:

1. lee `?pilot=cesarin`
2. persiste `vsm_storefront_ai_pilot_enabled` en `sessionStorage`
3. limpia el query param con `history.replaceState`
4. monta el assistant sólo si:
   - `is_ai_assistant_enabled`
   - `isPilotAuthorized`

Conclusión:

- el gate funcional existe
- no se detectó rotura obvia en navegador normal
- sí existe fragilidad de parity entre browser normal y PWA instalada por depender de `sessionStorage`

### Service Worker / Cache

Se confirmó que:

- el SW existe en `public/sw.js`
- no cachea llamadas a Supabase API
- sí cachea assets estáticos, imágenes, páginas y offline fallback
- el bootstrap de `main.tsx` fuerza limpieza dura de SW y caches al detectar mismatch de versión local

Conclusión:

- el diseño actual reduce ciertos drifts de datos
- pero complica el modelo mental de parity entre versión cargada, cache SW y runtime activo

### Señales diagnósticas

Se confirmó que existe una señal parcial en `PilotDebugBadge`:

- query param detectado
- persistencia en session
- estado del global gate
- resultado final del pilot gate

Conclusión:

- sí hay debug útil para gate
- no hay fingerprint claro para build/runtime/cache parity

---

## 4. Qué sigue abierto

- No está evidenciado si la estrategia actual de unregister + re-register del SW genera bug activo o sólo fragilidad.
- No está evidenciado si la PWA instalada pierde el pilot gate más que el navegador normal, pero el uso de `sessionStorage` lo vuelve plausible.
- No existe una forma simple y visible de distinguir:
  - build canónica
  - runtime activo
  - cache version
  - recovery version
- Sigue existiendo residuo documental `v111` que contradice el cierre operativo `v112`.
- Existe un bug potencial en el SW:
  - se referencia `fallback` sin definición explícita en el flujo offline
  - no se asocia todavía a un fallo activo de producto, pero sí a riesgo de parity/offline hygiene

---

## 5. Drift real detectado o no detectado

### Drift real detectado

#### 1. Versioning / fingerprint drift

- canon principal: `v112`
- residuo documental: `v111`
- frontend boot: `W143-RECOVERY-A`
- SW cache: `v141`

Esto sí es drift real.

#### 2. PWA-aware pilot gate fragility

- el gate depende de `sessionStorage`
- eso es una base frágil para paridad entre contexts instalados y browser estándar

No prueba bug activo, pero sí riesgo real.

#### 3. Runtime observability gap

- existe debug para gate
- no existe fingerprint equivalente para versión/build/runtime/cache

Esto también es drift operativo real.

### Drift no detectado

- no se detectó cache explícita de llamadas Supabase API por el SW
- no se detectó un nuevo drift funcional de Wave 192
- no se detectó rotura obvia del pilot gate en navegación browser normal

---

## 6. Riesgos prioritarios

### 1. Pilot gate variance entre browser y PWA instalada

Por qué importa:

- el estado depende de `sessionStorage`
- installed PWA y browser tab no necesariamente comparten el mismo contexto operativo

Señal temprana:

- el assistant aparece en navegador normal pero no en PWA instalada
- o viceversa

Validación rápida:

- probar `?pilot=cesarin` en ambos contextos
- confirmar persistencia real tras cleanup del query param

### 2. Fingerprint de versión no unificado

Por qué importa:

- dificulta saber qué build corre realmente el usuario
- complica distinguir runtime nuevo vs cache viejo

Señal temprana:

- reportes ambiguos del tipo “sigo viendo comportamiento viejo”

Validación rápida:

- comparar canon, localStorage version y cache version observada

### 3. Unregister forzado de service worker

Por qué importa:

- puede introducir comportamiento no intuitivo al arrancar
- puede producir diferencias entre actualización normal web y experiencia instalada

Señal temprana:

- recargas inesperadas
- pérdida de cache
- comportamiento inconsistente tras update

Validación rápida:

- observar primer arranque con versión nueva en web y PWA instalada

### 4. Offline/cache path hygiene

Por qué importa:

- el SW tiene una referencia a `fallback` no definida

Señal temprana:

- errores en escenarios offline o de red degradada

Validación rápida:

- simulación de red caída y revisión del fallback real

### 5. Canon/runtime parity confusion

Por qué importa:

- el canon dice una versión, pero el repo mantiene fingerprints dispares

Señal temprana:

- soporte operativo ambiguo
- debugging lento

Validación rápida:

- reconciliar visualmente las referencias de versión

---

## 7. Microajustes sugeridos

No implementarlos desde este carril. Sólo quedan señalados.

- Unificar fingerprint operacional de build/runtime/cache.
- Separar claramente:
  - versión canónica de release
  - versión interna de recovery
  - versión de cache SW
- Añadir una señal diagnóstica visible para soporte técnico en admin/debug.
- Revisar la robustez del pilot gate en contexto PWA-aware.
- Revisar el path offline del SW por la referencia a `fallback`.

---

## 8. Qué NO recomiendo tocar

- No recomiendo reabrir Wave 191.
- No recomiendo reabrir Wave 192 sin regresión real verificable.
- No recomiendo tocar auth, policies, schema o runtime como reacción a esta auditoría.
- No recomiendo refactor grande del SW sin evidencia de bug activo.
- No recomiendo cleanup ornamental fuera de parity hygiene.

---

## 9. Si hace falta patch o no

No hace falta patch inmediato sólo con esta auditoría.

Sí hay zonas que justifican patch quirúrgico futuro si aparece regresión real:

- version/fingerprint parity
- pilot gate parity PWA-aware
- hygiene del offline path del service worker

---

## 10. Si Antigravity debe actuar o no

Sí, pero sólo dentro de la línea ya aprobada:

`DEPLOY / RUNTIME PARITY HYGIENE (PWA-AWARE)`

No para cirugía grande.

Si Antigravity entra a este carril, los focos correctos serían:

1. unificación de fingerprints de versión
2. varianza entre browser normal y PWA instalada
3. higiene del SW / offline path

Si no entra todavía a ese carril, esta auditoría no obliga movimiento inmediato.

---

## Resumen ejecutivo

- No hay evidencia de un nuevo bug funcional grande.
- Sí hay drift real de versioning/fingerprint.
- Sí hay fragilidad real de parity entre browser y PWA instalada.
- Sí hay déficit de observabilidad para distinguir runtime viejo vs nuevo.
- No hace falta patch inmediato.
- Si se actúa, debe ser con microhigiene de parity, no con reescritura.
