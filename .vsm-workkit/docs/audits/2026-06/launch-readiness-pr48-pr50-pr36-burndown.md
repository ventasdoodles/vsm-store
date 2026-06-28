# Launch Readiness PR48/PR50/PR36 Burn-down

Fecha: 2026-06-18

## Veredicto

Estado actual: MVP/piloto controlado avanzado con gates vivos verdes en Client y Admin.

No es produccion completa. No quedan PRs abiertos ni blockers de credenciales/deploy para el piloto web controlado actual. Persisten riesgos de producto real fuera de este cierre: pagos reales, GPS/tracking fisico, push delivery, operaciones de incidente, cumplimiento y hardening operativo completo.

## Main vivo

- Client repo `ventasdoodles/ivoy`: `main` en `a3c89eb937311f848978df7942accf7919b1cc68`.
- Admin repo `ventasdoodles/ivoy-admin`: `main` en `7fe28839c7c1d2e7aa58e00fcb06fd60bc70ef17`.
- Client URL: `https://ivoyapp.vercel.app`.
- Admin URL: `https://ivoy-admin.vercel.app`.

## Decisiones ejecutadas

- Client PR #48 fue mergeado: hardening QA/service-role y readiness.
- Client PR #50 fue mergeado: home/radar driver y dashboard de ingresos.
- Client PR #51 fue mergeado: el counteroffer de driver deja de llamar RPC restringida desde browser y usa Edge Function.
- Admin PR #36 fue mergeado: estabiliza critical monitor, agrega `driver-create-counteroffer`, despliega la funcion y corrige CORS/runtime.
- Admin PR #37 fue mergeado: estabiliza el click de asignacion manual en E2E vivo para evitar timeout por virtualized cards.

## Evidencia

- Client main latest runs verdes: Client Quality Gates, Deploy Client to Vercel, Deploy Client to GitHub Pages, Smoke Public Runtime, Lighthouse CI.
- Admin main latest runs verdes: Quality Gates, Deploy Admin to Vercel, Deploy Admin to GitHub Pages, Deploy Supabase Functions, Lighthouse CI.
- Admin critical live E2E paso en main, incluyendo `driver-create-counteroffer` con HTTP 200 y `offer_id`.
- Supabase Functions runtime smoke paso para `driver-create-counteroffer` y funciones existentes.

## Limpieza local

Se eliminaron worktrees temporales mergeados en `_scratch` y el worktree viejo `ivoy-client-navigation-fix`.

Se preservaron intencionalmente:

- `C:\dev\vsm-store-fresh\.vsm-workkit`: workkit/canon/promocionales/documentacion operativa.
- `F:\ivoy\ivoy1.6` y `F:\ivoy\ivoy-admin`: repos legacy/locales con dirty state historico.
- `F:\ivoy\ivoy-admin-monitor-fix`: dirty worktree con cambios no canonizados; no se destruye hasta decidir si se rescata, se archiva o se descarta con respaldo.
- Worktrees bajo `C:\Users\dgcar\.config\superpowers\worktrees\...`: pertenecen a Superpowers y no se tocaron.

## Siguiente paso de alto valor

Ejecutar una lane de hardening de producto real, no mas credenciales:

1. convertir los E2E live criticos en evidencia estable con artifacts utiles;
2. revisar el dirty worktree `ivoy-admin-monitor-fix` y clasificarlo como rescatar/cerrar/archivar;
3. quemar riesgos reales restantes: pagos simulados vs reales, push/notifications, GPS/tracking fisico, observabilidad/alertas e incident response.
