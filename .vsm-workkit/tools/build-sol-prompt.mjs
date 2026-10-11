import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const diff = execSync('git show f4391fed -- src/', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

const prompt = `# VSM STORE — AUDITORÍA TÉCNICA DE REMEDIACIÓN (LANES 6, 7 Y 8)
## Evaluador: OpenAI GPT-6 Sol Pro (High Reasoning / Prompt Caching)
## Objetivo: Validación exhaustiva de parches contra el dictamen REJECT de Claude Opus 5.5

Eres **Sol Pro GPT-6**, el Principal Systems & Security Auditor de VSM Store.
Previamente, el modelo Claude Opus 5.5 emitió un veredicto formal de **REJECT** sobre la refactorización arquitectónica de las Lanes 6, 7 y 8, señalando 10 hallazgos críticos y severos.

El equipo de ingeniería acaba de implementar y desplegar el commit \`f4391fed\` para remediar la totalidad de los hallazgos. Tu misión es ejecutar una contra-auditoría despiadada, técnica e imparcial sobre este parche.

---

### CONTEXTO DE LOS 10 HALLAZGOS DE OPUS 5.5 QUE SE DEBÍAN RESOLVER:

1. **L6-C1 [Prototype Pollution en Dispatcher]:** Despacho por objeto plano susceptible a \`constructor\`, \`__proto__\`, \`toString\`.
   - *Solución esperada:* Tupla cerrada \`CAPSULE_NAMES\`, tipo \`CapsuleName\`, \`Object.freeze\`, \`satisfies Record<CapsuleName, CapsuleHandlerFn>\`, verificación estricta \`Object.prototype.hasOwnProperty.call\`.

2. **L6-C2 [Aislamiento de Fallos & Señales Laxas]:** Cero \`try/catch\` en el despacho; desreferencias síncronas de \`*.signal.kind\` que tumban el turno si el orquestador falla; telemetría no protegida.
   - *Solución esperada:* Envoltorio \`try/catch\` en \`dispatchClientCapsule\` con respuesta segura de fallback; optional chaining (\`?.kind\`) en todas las señales de los 11 handlers; llamadas a telemetría protegidas con \`.catch()\`.

3. **L6-C4 [Ciclo de Dependencias Circular]:** \`capsule-dispatcher.ts\` importaba \`handlers\`, y todos los handlers importaban interfaces de \`capsule-dispatcher.ts\`.
   - *Solución esperada:* Extracción limpia a \`src/services/concierge/dispatch.types.ts\` e imports con \`import type\`.

4. **L6-C3 / L6-C5 [Catalog Gate & Contratos de Retorno]:** Gating de productos y preservación de \`next_step_view\`.
   - *Solución esperada:* Compatibilidad e inventario preservan sus productos resueltos con \`next_step_view\` compacto verificado en Stage 4.

5. **L7-C1 [Invariante de Seguridad del Carrito]:** Se había eliminado la aserción \`expect(addItemMock).not.toHaveBeenCalled()\` en los tests de UI.
   - *Solución esperada:* Restauración de la aserción estricta en \`AIConcierge.test.tsx\`.

6. **L7-C3 & L7-C4 [Pureza, Clamping de Cantidad y Rutas Dinámicas]:** \`convertCartOperatorToAdvisoryCta\` mutaba argumentos, aceptaba cantidades 0 o desmedidas, y hardcodeaba \`section: 'vape'\` y \`slug: ''\`.
   - *Solución esperada:* Función completamente pura (retorna nuevo objeto sin mutación); \`Math.floor\` antes de validar; acotado a [1, 99]; derivación dinámica de sección y slug.

7. **L7-C5 [Heurística de Turnos & ReDoS / Substring Collisions]:** \`isCurrentTurnClearlyNonSearch\` daba falsos negativos con subcadenas (ej. 'pod' en 'podrías') y no truncaba inputs grandes.
   - *Solución esperada:* Límites de palabra (\\b), raíces léxicas y truncamiento a 2,000 chars.

8. **L8-C1, L8-C2, L8-C3 [Ciclo de Vida Realtime & Concurrencia]:** Callbacks ejecutados tras unmount, tópico fijo \`public:orders_pulse\` con colisión de canales, y churn de suscripción por \`[onNewOrder]\`.
   - *Solución esperada:* Flag \`disposed\` en el servicio de realtime; tópico único con UUID (\`orders_pulse_\${uuid}\`); estabilización de callback con \`useRef\` y deps \`[]\` en el hook.

9. **L8 Resiliencia de Servicios:** \`checkBackendHealth\` sin timeout; scanner perdiendo \`cause\` del error.
   - *Solución esperada:* \`AbortSignal.timeout(5000)\` en PostgREST query; error \`cause\` preservado en Visual Scanner.

10. **L8 Test Arquitectónico:** Falta de pruebas de regresión para imports de DB en hooks.
    - *Solución esperada:* Test estático automatizado en \`db-isolation-services.test.ts\` confirmando 0 imports de Supabase en \`src/hooks/**\`.

---

### EVIDENCIA DE EJECUCIÓN LOCAL:
- \`npm run typecheck\` (\`tsc --noEmit\`): **0 errores** (salida limpia).
- \`npx vitest run src/services/__tests__/concierge.service.stage4.test.ts\`: **48/48 PASS**.
- \`npx vitest run src/services/__tests__\`: **138/138 PASS** (18 archivos de prueba en verde).
- \`npx vitest run src/components/ui/ai/__tests__/AIConcierge.test.tsx\`: **30/30 PASS**.

---

### DIFF COMPLETO DEL COMMIT f4391fed (SRC/):

\`\`\`diff
${diff}
\`\`\`

---

### INSTRUCCIONES PARA TU DICTAMEN:
1. Revisa línea por línea el diff de los 28 archivos modificados.
2. Evalúa si cada uno de los 10 hallazgos fue remediado de raíz o si quedó deuda oculta o side-effects.
3. Evalúa la higiene de código (TypeScript, tipos, inmutabilidad, memory leaks, concurrency).
4. Emite tu Scorecard detallado y tu Veredicto Formal: **ACCEPT**, **REJECT** o **ACCEPT WITH RESIDUAL RISK**.
`;

const targetPath = path.resolve('docs/audits/2026-10/sol-pro-audit-prompt.md');
fs.writeFileSync(targetPath, prompt, 'utf8');
console.log(`Audit prompt written successfully to: ${targetPath} (${prompt.length} bytes)`);
