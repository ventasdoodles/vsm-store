# PROMPT PARA ANTIGRAVITY — FIX ESLINT BUILD ERROR

**Objetivo:** Corregir conflicto de dependencias ESLint que impide build en Cloudflare Pages  
**Tiempo estimado:** 2 minutos  
**Commit base:** 1887364

---

## CONTEXTO

El build en Cloudflare Pages falla con este error:
```
npm error ERESOLVE could not resolve
npm error peer eslint@"^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0" 
from eslint-plugin-react-hooks@7.0.1
```

**Causa:** ESLint v10 no es compatible con `eslint-plugin-react-hooks@7.0.1`

**Solución:** Downgrade a versiones compatibles probadas

---

## INSTRUCCIONES PARA ANTIGRAVITY

### Paso 1: Editar `package.json`

**Ubicación:** Archivo raíz `package.json`

**Buscar la sección `devDependencies` y reemplazar COMPLETA con:**

```json
"devDependencies": {
  "@eslint/js": "^9.15.0",
  "@types/node": "^22.10.2",
  "@types/react": "^18.3.18",
  "@types/react-dom": "^18.3.5",
  "@vitejs/plugin-react": "^4.3.4",
  "autoprefixer": "^10.4.20",
  "eslint": "^9.15.0",
  "eslint-plugin-react-hooks": "^5.0.0",
  "eslint-plugin-react-refresh": "^0.4.16",
  "postcss": "^8.4.49",
  "tailwindcss": "^3.4.17",
  "typescript": "~5.6.2",
  "typescript-eslint": "^8.18.2",
  "vite": "^6.0.5"
}
```

**IMPORTANTE:** NO toques la sección `dependencies`, solo `devDependencies`

---

### Paso 2: Eliminar archivos de lock

Ejecutar estos comandos en bash:

```bash
rm -f package-lock.json
rm -rf node_modules
```

---

### Paso 3: Reinstalar dependencias

```bash
npm install
```

---

### Paso 4: Verificar que build funciona

```bash
npm run build
```

**Resultado esperado:**
- Build completa sin errores
- Carpeta `dist/` generada correctamente
- 0 warnings de peer dependencies

---

### Paso 5: Commit

```bash
git add package.json package-lock.json
git commit -m "fix(deps): downgrade eslint to v9 for compatibility with react-hooks plugin

- Change eslint from v10 to v9.15.0
- Change eslint-plugin-react-hooks from v7 to v5.0.0
- Fix Cloudflare Pages build error (ERESOLVE peer dependency conflict)
- Verified: npm install and npm run build work without errors"
```

---

## VERIFICACIÓN

Después de hacer el commit, Cloudflare Pages automáticamente:

1. Detectará el nuevo commit
2. Iniciará un nuevo build
3. Ejecutará `npm clean-install` (ahora funcionará)
4. Ejecutará `npm run build` (generará dist/)
5. Desplegará el sitio

**Tiempo estimado del build:** 2-3 minutos

---

## COMANDOS COMPLETOS (COPY-PASTE)

```bash
# Paso 2 y 3: Limpiar e instalar
rm -f package-lock.json && rm -rf node_modules && npm install

# Paso 4: Verificar build
npm run build

# Paso 5: Commit (si todo funciona)
git add package.json package-lock.json
git commit -m "fix(deps): downgrade eslint to v9 for compatibility with react-hooks plugin

- Change eslint from v10 to v9.15.0
- Change eslint-plugin-react-hooks from v7 to v5.0.0
- Fix Cloudflare Pages build error (ERESOLVE peer dependency conflict)
- Verified: npm install and npm run build work without errors"
```

---

## CHECKLIST

- [ ] package.json editado (devDependencies con versiones exactas de arriba)
- [ ] package-lock.json eliminado
- [ ] node_modules eliminado
- [ ] npm install ejecutado sin errores
- [ ] npm run build ejecutado sin errores
- [ ] Commit realizado
- [ ] Push a main

---

## NOTAS IMPORTANTES

1. **NO cambies `dependencies`** — solo `devDependencies`
2. **NO uses `--force` o `--legacy-peer-deps`** — las versiones de arriba son compatibles
3. **Verifica que build funcione LOCAL** antes de hacer commit
4. **Si sigue fallando:** Avisa inmediatamente con el error exacto

---

**FIN DEL PROMPT**

Antigravity, procede con la corrección siguiendo los pasos exactos de arriba.
