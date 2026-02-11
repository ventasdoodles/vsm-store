# 🔀 Git Workflow

## Convención de Commits

```
tipo(scope): descripción corta en español

Tipos:
  feat     → Nueva funcionalidad
  fix      → Corrección de bug
  refactor → Refactorización sin cambio funcional
  style    → Cambios visuales/CSS
  docs     → Documentación
  chore    → Config, deps, scripts
  test     → Tests
```

### Ejemplos

```
feat(products): agregar grid de productos con filtro por sección
fix(cart): corregir cálculo de total con descuentos
style(header): ajustar spacing del logo en mobile
docs(context): actualizar current.md con progreso Bloque 2
chore(deps): actualizar React Query a v5.18
```

## Branches

```
main        → Producción estable
develop     → Desarrollo activo
feat/xxx    → Feature branches
fix/xxx     → Bugfix branches
```

## Workflow

1. Crear branch desde `develop`: `git checkout -b feat/product-grid`
2. Hacer commits atómicos siguiendo la convención
3. Push y crear PR hacia `develop`
4. Merge a `main` cuando esté listo para producción

## Regla de Oro

> Antes de commitear: actualizar `.context/state/current.md`
