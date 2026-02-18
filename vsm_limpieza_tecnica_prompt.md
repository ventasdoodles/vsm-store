# VSM Store — Prompt de Limpieza Técnica
**Commit base:** `555c312`  
**Stack:** React 18 + TypeScript + Vite + Supabase  
**Repositorio:** `github.com/ventasdoodles/vsm-store`

---

## Instrucción Global

Ejecuta los siguientes 4 pasos en orden. Para cada paso:
1. Lee el archivo actual del repo antes de editar
2. Aplica los cambios exactos descritos
3. Corre `npx tsc --noEmit` — 0 errores antes de continuar al siguiente paso
4. Commit con el mensaje indicado

**NO muestres el código en el chat. Escríbelo directamente a los archivos.**

---

## Paso 1 — Cosmético: App.tsx + useAppMonitoring.ts

### 1A · `src/App.tsx`

**Problema:** Hay dos bloques con el mismo comentario `// Lazy-loaded storefront pages`, y los imports directos (`CartSidebar`, `ProtectedRoute`, `ToastContainer`, `SEO`, `OrderNotifications`, `isSupabaseConfigured`, `useAppMonitoring`) están intercalados en medio de los `lazy()`.

**Solución:** Reorganizar en este orden, sin cambiar ninguna lógica:

```
1. imports de React y react-router-dom
2. imports directos (componentes críticos, lib, hooks)
3. bloques const lazy() agrupados con comentario de sección
4. función PageLoader
5. export function App()
```

El bloque de imports directos debe quedar así:

```ts
// ─── Componentes críticos (no lazy — necesarios en primer render) ─────────────
import { Layout }              from '@/components/layout/Layout';
import { CartSidebar }         from '@/components/cart/CartSidebar';
import { ProtectedRoute }      from '@/components/auth/ProtectedRoute';
import { ToastContainer }      from '@/components/notifications/ToastContainer';
import { SEO }                 from '@/components/seo/SEO';
import { OrderNotifications }  from '@/components/notifications/OrderNotifications';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAppMonitoring }    from '@/hooks/useAppMonitoring';
```

Todos los `lazy()` van después, agrupados en dos bloques con comentario:
```ts
// ─── Páginas lazy (storefront) ────────────────────────────────────────────────
const Home = lazy(...);
// ... resto igual

// ─── Páginas lazy (admin) ─────────────────────────────────────────────────────
const AdminGuard = lazy(...);
// ... resto igual
```

### 1B · `src/hooks/useAppMonitoring.ts`

**Problema:** El comentario `// Key anónima estable para toda la sesión del browser` aparece 3 veces consecutivas.

**Solución:** Dejar solo una línea, eliminar las dos duplicadas.

```ts
// ANTES:
// Key anónima estable para toda la sesión del browser
// Key anónima estable para toda la sesión del browser
// Key anónima estable para toda la sesión del browser
const [anonKey] = useState(...)

// DESPUÉS:
// Key anónima estable para toda la sesión del browser
const [anonKey] = useState(...)
```

**Commit:**
```
refactor(ui): clean up import order in App.tsx and fix duplicate comment in useAppMonitoring
```

---

## Paso 2 — Magic Strings: Section → Constantes

### 2A · Crear `src/types/constants.ts` (archivo nuevo)

```ts
// Constantes de dominio - VSM Store
// Single source of truth para valores que aparecen en múltiples archivos

export const SECTIONS = {
    VAPE:     'vape',
    CANNABIS: '420',
} as const;

export type Section = typeof SECTIONS[keyof typeof SECTIONS];

export const PRODUCT_STATUS = {
    ACTIVE:       'active',
    LEGACY:       'legacy',
    DISCONTINUED: 'discontinued',
    COMING_SOON:  'coming_soon',
} as const;

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];
```

### 2B · Actualizar `src/types/product.ts`

Reemplazar las definiciones de `Section` y `ProductStatus` con re-exports desde constants.ts. El resto del archivo (interface Product, ProductInsert, ProductUpdate) no cambia.

```ts
// ANTES:
export type Section = 'vape' | '420';
export type ProductStatus = 'active' | 'legacy' | 'discontinued' | 'coming_soon';

// DESPUÉS:
export type { Section, ProductStatus } from '@/types/constants';
```

### 2C · Actualizar `src/pages/SectionSlugResolver.tsx`

```ts
// ANTES:
import type { Section } from '@/types/product';
function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return pathname.startsWith('/420') ? '420' : 'vape';
}

// DESPUÉS:
import { SECTIONS } from '@/types/constants';
import type { Section } from '@/types/constants';
function useSectionFromPath(): Section {
    const { pathname } = useLocation();
    return pathname.startsWith('/420') ? SECTIONS.CANNABIS : SECTIONS.VAPE;
}
```

### 2D · Actualizar imports en hooks y services

En los siguientes 4 archivos cambiar **solo la línea de import** de `Section`. La firma de las funciones no cambia.

```ts
// src/hooks/useProducts.ts
// ANTES:  import type { Section } from '@/types/product';
// DESPUÉS: import type { Section } from '@/types/constants';

// src/hooks/useCategories.ts
// ANTES:  import type { Section } from '@/types/product';
// DESPUÉS: import type { Section } from '@/types/constants';

// src/services/products.service.ts
// ANTES:  import type { Product, Section } from '@/types/product';
// DESPUÉS: import type { Product } from '@/types/product';
//          import type { Section } from '@/types/constants';

// src/services/categories.service.ts
// ANTES:  import type { Section } from '@/types/product';
// DESPUÉS: import type { Section } from '@/types/constants';
```

> ⚠️ Después de este paso correr `npx tsc --noEmit`. Si hay otros archivos que importaban `Section` desde `@/types/product`, TypeScript los detectará con el error `Module '@/types/product' has no exported member 'Section'`. Actualizar esos imports también antes de continuar.

**Commit:**
```
refactor(types): extract Section and ProductStatus to constants.ts for single source of truth
```

---

## Paso 3 — Separar Notificaciones de auth.service.ts

**Problema:** `auth.service.ts` llama a `useNotificationsStore.getState()` directamente. Los servicios deben ser agnósticos de UI — lanzan errores o retornan datos, y quien los llama decide cómo notificar.

### 3A · Limpiar `src/services/auth.service.ts`

Eliminar el import de `useNotificationsStore` y todas sus llamadas. Las tres funciones afectadas quedan así:

```ts
// ELIMINAR esta línea:
import { useNotificationsStore } from '@/stores/notifications.store';

// signUp — eliminar el bloque if (data.user) { useNotificationsStore... }
// Resultado:
export async function signUp(email, password, fullName, phone?) {
    const { data, error } = await supabase.auth.signUp({ ... });
    if (error) throw error;
    if (data.user) {
        await createCustomerProfile(data.user.id, { ... });
    }
    return data;
}

// signIn — eliminar el bloque useNotificationsStore...
// Resultado:
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ ... });
    if (error) throw error;
    return data;
}

// signOut — eliminar el bloque useNotificationsStore...
// Resultado:
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
```

### 3B · Agregar notificaciones en `src/contexts/AuthContext.tsx`

> ⚠️ Leer el archivo actual antes de editar. Ya fue modificado en el sprint anterior.

`AuthContext.tsx` ya importa `useNotification`. Verificar qué métodos expone el hook. Si expone `error`, `success` e `info`, usarlos. Si solo expone `error`, revisar `src/hooks/useNotification.ts` y agregar los métodos faltantes antes de continuar.

Agregar las notificaciones en los handlers:

```ts
// Destructurar los métodos necesarios:
const { error: notifyError, success: notifySuccess, info: notifyInfo } = useNotification();

// handleSignUp — después de await authService.signUp(...):
const handleSignUp = useCallback(async (email, password, fullName, phone?) => {
    await authService.signUp(email, password, fullName, phone);
    notifySuccess('¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente.');
}, [notifySuccess]);

// handleSignIn — después de await authService.signIn(...):
const handleSignIn = useCallback(async (email, password) => {
    await authService.signIn(email, password);
    notifyInfo('Sesión iniciada', 'Bienvenido de nuevo a VSM Store.');
}, [notifyInfo]);

// handleSignOut — después de await authService.signOut():
const handleSignOut = useCallback(async () => {
    await authService.signOut();
    setProfile(null);
    notifyInfo('Sesión cerrada', 'Has cerrado sesión correctamente.');
}, [notifyInfo]);
```

Actualizar el `useMemo` del value para incluir las nuevas dependencias si cambian.

**Commit:**
```
refactor(auth): move UI notifications out of auth.service into AuthContext
```

---

## Paso 4 — Verificación Final

```bash
# 1. TypeScript — debe dar 0 errores
npx tsc --noEmit

# 2. ESLint — 0 errores (warnings son OK)
npm run lint

# 3. Build de producción
npm run build

# 4. Commit de cierre
git add .
git commit -m "chore(tech-debt): complete cosmetic and structural cleanup sprint"
git push origin main
```

Si el build falla por el refactor de `Section`, el error más probable es:
```
Module '@/types/product' has no exported member 'Section'
```
Solución: encontrar el archivo que produce ese error y cambiar su import a `@/types/constants`.

---

## Resumen

| Paso | Archivos | Riesgo |
|------|----------|--------|
| 1 — Cosmético | App.tsx, useAppMonitoring.ts | Ninguno |
| 2 — Magic strings | constants.ts (nuevo) + 5 archivos | Bajo — solo imports |
| 3 — Notificaciones | auth.service.ts, AuthContext.tsx | Bajo — mismo comportamiento |
| 4 — Verificación | — | — |
