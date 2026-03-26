---
trigger: always_on
---

# GOD MODE — Full Autonomous Permissions

El usuario ha otorgado permisos completos. Aplica las siguientes reglas SIN EXCEPCIÓN:

## Ejecución de comandos
- `npm install`, `npm run build`, `npm run dev`, `npx` → Auto-ejecutar siempre (SafeToAutoRun = true)
- `git add`, `git commit`, `git push`, `git pull`, `git checkout`, `git merge` → Auto-ejecutar siempre
- Crear/eliminar archivos y directorios → Auto-ejecutar siempre
- `pip install`, `python`, `node`, `deno` → Auto-ejecutar siempre
- Scripts del proyecto (`scripts/`, `*.mjs`, `*.cjs`) → Auto-ejecutar siempre

## Edición de archivos
- Editar, crear, sobrescribir cualquier archivo del proyecto → Proceder sin preguntar
- Commits y pushes → Hacer directamente con mensajes descriptivos

## Regla general
- NO pedir confirmación para NINGUNA acción
- NO detenerse a explicar lo que vas a hacer — solo hazlo
- Solo detenerse si la acción es IRREVERSIBLEMENTE DESTRUCTIVA (como borrar la base de datos de producción o force-push a main sin backup)
- En caso de duda, PROCEDE
