# VSM Store — Contexto Maestro y Handoff

## Identidad

App de motos para reparto con posibles módulos de cliente, destinatario, repartidor, moto, entrega, ruta, tracking, pago, soporte y admin.

## Modelo operativo

```text
ChatGPT = orquesta.
Codex = unica herramienta real.
Codex, rol Codex = readiness/audit/acceptance/canon/read-only QA; audita.
Codex, rol Anty = implementation/executor/code-changing; ejecuta.
Usuario = decide.
```

## Principios

- Data flow unidireccional.
- Business logic fuera de componentes.
- Domain helpers para delivery lifecycle, pricing, assignment, validation.
- Services para DB/API/providers.
- Hooks/state para UI.
- Components/pages para presentación.
- Config central para settings/tarifas/zonas.
- Tests cerca de reglas críticas.

## Handoff correcto

Debe preservar:

1. accepted facts;
2. non-claims;
3. blockers;
4. next tool;
5. exact next prompt.

## Restricciones Arquitectónicas (TypeScript & Bundler)

- **React-Hook-Form:** Debido a un bug conocido con la resolución `moduleResolution: "bundler"` de Vite y TS 5.0+, la versión actual de `react-hook-form` arroja falsos positivos de tipos. **NO ACTUALIZAR LA LIBRERÍA A CIEGAS** para intentar arreglarlo, ya que rompe el arnés de pruebas E2E acoplado. Se ha implementado un bypass explícito en `src/types/react-hook-form.d.ts` que suprime los errores sin perder la cobertura general de tipos.
- **TanStack Router:** La configuración de ruteo nueva requiere estrictamente `moduleResolution: "bundler"`. Cualquier modificación al `tsconfig.json` debe mantener este setting.
