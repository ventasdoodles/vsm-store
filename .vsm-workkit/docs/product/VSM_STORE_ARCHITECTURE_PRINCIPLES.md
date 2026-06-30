# VSM Store — Architecture Principles

## Data flow

```text
Database/API → services → hooks/state → components/pages
```

## Separación

- Domain helpers: estados, pricing, assignment, validation.
- Services: IO externo, DB/API, providers.
- Hooks/state: consumo UI.
- Components: presentación.
- Pages/routes: composición.
- Config: settings/toggles/zonas.

## Standard Libraries

- **Routing:** `@tanstack/react-router` (Type-safe routing). Do not use `react-router-dom`.
- **Tables/Data Grids:** `@tanstack/react-table` (Headless UI). Do not use other table libraries as the standard.

## No hacer

- reglas críticas en JSX;
- duplicar estados;
- folio como proof key;
- tracking fake;
- payment status fake;
- producción sin rollback.

## Regla

Componente bonito no prueba flujo real. Tabla DB no prueba UX. Mock no prueba producción.
