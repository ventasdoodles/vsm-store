# Shadow Architecture: Home Migration (Service Selection) v1

## Scope
Client commit `9d707fa` introduce la migración de la pantalla principal (`ServiceSelectionStep.tsx`) hacia la arquitectura en la sombra (TanStack Router) en `src/routes/index.tsx`. Se aplicó el Premium Design System adaptando la tarjeta visual principal a un componente `PremiumGradientCard.tsx` nativo con *Glassmorphism*.

## Rationale
Se migra la pantalla de manera completamente aislada para no interferir con el entorno principal (`App.tsx`) que ejecuta pruebas críticas automatizadas y de compatibilidad con librerías frágiles. Esta ruta paralela permite depurar la experiencia premium de enrutamiento y UI sin bloquear el pipeline de CI/CD.

## Pre-flight Checks
- [x] TypeScript `tsc --noEmit` completado exitosamente sin introducir errores nuevos en la codebase principal.
- [x] Eslint preservado sin inyectar advertencias nuevas a componentes limpios.
- [x] No se alteró `App.tsx` ni dependencias E2E relacionadas a Playwright o React Hook Form.

## Canon Validation
Alineado estrictamente a `CONTEXTO_MAESTRO_HANDOFF.md` y las reglas de aislamiento operacional.
