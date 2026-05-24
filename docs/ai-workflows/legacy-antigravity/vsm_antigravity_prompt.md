# VSM Store — Prompt de Ejecución para Antigravity
> Correcciones basadas en análisis del código fuente real.  
> Repositorio: `github.com/ventasdoodles/vsm-store`  
> **Ejecuta los pasos EN ORDEN. Después de cada paso: `npm run lint` → 0 errores → commit.**

---

## CONTEXTO

Eres una IA ejecutora de código en el proyecto VSM Store, e-commerce de vape y cannabis en producción activa en `vsm-store.pages.dev`. Stack: React 18 + TypeScript + Vite + Supabase + Zustand + React Query. Cloudflare Pages para deploy.

**Reglas:**
1. Ejecuta los pasos en el orden indicado — hay dependencias entre ellos.
2. Después de cada paso: `npm run lint` (es `tsc --noEmit`) → debe dar 0 errores.
3. No modifiques nada fuera de lo especificado en cada paso.
4. Si encuentras algo que contradice lo descrito, detente y reporta antes de continuar.
5. Cada paso termina con el commit indicado.

---

## PASO 1 — `src/stores/cart.store.ts` 🔴 CRÍTICO

**Problema:** `addItem` agrega productos sin verificar `product.stock`. Dos usuarios pueden comprar el último artículo simultáneamente. `updateQuantity` tampoco respeta el stock. Además, `selectTotal` y `selectSubtotal` son funciones idénticas — una es dead code.

### Cambio 1A — Reemplazar `addItem` completo:

```typescript
// ANTES
addItem: (product: Product, quantity = 1) => {
    set((state) => {
        const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
        );
        if (existingIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: updatedItems[existingIndex].quantity + quantity,
            };
            return { items: updatedItems };
        }
        return { items: [...state.items, { product, quantity }] };
    });
},

// DESPUÉS
addItem: (product: Product, quantity = 1) => {
    // Producto inactivo o discontinuado: no agregar
    if (!product.is_active || product.status === 'discontinued') return;

    set((state) => {
        const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
        );

        if (existingIndex >= 0) {
            const currentQty = state.items[existingIndex]?.quantity ?? 0;
            const newQty = currentQty + quantity;
            // No exceder stock disponible
            if (newQty > product.stock) return state;
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: newQty,
            };
            return { items: updatedItems };
        }

        // Verificar stock antes de agregar nuevo item
        if (quantity > product.stock) return state;
        return { items: [...state.items, { product, quantity }] };
    });
},
```

### Cambio 1B — Reemplazar `updateQuantity`:

```typescript
// ANTES
updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
        get().removeItem(productId);
        return;
    }
    set((state) => ({
        items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
        ),
    }));
},

// DESPUÉS
updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
        get().removeItem(productId);
        return;
    }
    set((state) => ({
        items: state.items.map((item) => {
            if (item.product.id !== productId) return item;
            // Clamp al stock disponible
            const clampedQty = Math.min(quantity, item.product.stock);
            return { ...item, quantity: clampedQty };
        }),
    }));
},
```

### Cambio 1C — Reemplazar los dos selectores al final del archivo:

```typescript
// ANTES (idénticos — bug)
export const selectSubtotal = (state: CartState) =>
    state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

export const selectTotal = (state: CartState) =>
    state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

// DESPUÉS
export const selectTotalItems = (state: CartState) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0);

// Subtotal: suma de productos sin descuentos ni envío
export const selectSubtotal = (state: CartState) =>
    state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

// Total final — actualmente igual a subtotal.
// TODO: cuando se implemente descuentos/envío, recibir como parámetros aquí.
export const selectTotal = selectSubtotal;
```

```bash
git add src/stores/cart.store.ts
git commit -m "fix(cart): validación de stock en addItem/updateQuantity, eliminar selectTotal duplicado"
```

---

## PASO 2 — `src/contexts/AuthContext.tsx` 🔴 CRÍTICO

**Problema A:** Las líneas con `alert()` para cuentas baneadas/suspendidas usan el alert nativo del browser — bloqueante, no estilizable, se comporta diferente en PWA mode. El proyecto ya tiene `ToastContainer` en App.tsx.

**Acción previa:** Busca en `src/stores/` o `src/hooks/` el mecanismo de toasts que usa `ToastContainer`. Identifica el nombre exacto de la función para disparar un toast desde fuera de un componente. Una vez identificado, reemplaza los dos `alert()` en `loadProfile` con esa función.

El patrón a seguir (adapta el nombre de función al que encuentres):

```typescript
// ANTES
alert('Tu cuenta ha sido baneada permanentemente. Contacta a soporte.');

// DESPUÉS — usando el sistema de toasts existente del proyecto
tuFuncionDeToast({
    type: 'error',
    message: 'Tu cuenta ha sido baneada permanentemente. Contacta a soporte.',
    duration: 8000,
});
```

Aplica lo mismo al `alert()` del bloque `suspended`.

---

**Problema B:** Race condition — `loading` pasa a `false` antes de que `loadProfile` termine. Cualquier componente que lea `profile` ve `null` por un flash aunque el usuario esté autenticado.

```typescript
// ANTES
supabase.auth.getSession().then(({ data: { session } }) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    setLoading(false); // ← false ANTES de tener perfil
    if (currentUser) {
        loadProfile(currentUser.id); // fire-and-forget
    }
});

// DESPUÉS
supabase.auth.getSession().then(async ({ data: { session } }) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    if (currentUser) {
        await loadProfile(currentUser.id); // esperar perfil
    }
    setLoading(false); // ← false DESPUÉS de tener perfil
});
```

---

**Problema C:** `handleSignIn`, `handleSignUp`, `handleSignOut` no están en `useCallback` — referencias nuevas en cada render. El `useMemo` del value no ayuda porque las funciones adentro cambian.

```typescript
// ANTES
const handleSignUp = async (email: string, password: string, fullName: string, phone?: string) => {
    await authService.signUp(email, password, fullName, phone);
};

const handleSignIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
};

const handleSignOut = async () => {
    await authService.signOut();
    setProfile(null);
};

// DESPUÉS — useCallback ya está importado en este archivo
const handleSignUp = useCallback(async (
    email: string, password: string, fullName: string, phone?: string
) => {
    await authService.signUp(email, password, fullName, phone);
}, []); // authService es import estático

const handleSignIn = useCallback(async (email: string, password: string) => {
    await authService.signIn(email, password);
}, []);

const handleSignOut = useCallback(async () => {
    await authService.signOut();
    setProfile(null);
}, []); // setProfile es estable (useState setter)

const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
}, [user, loadProfile]);
```

```bash
git add src/contexts/AuthContext.tsx
git commit -m "fix(auth): eliminar alert() nativo, race condition loading/profile, estabilizar callbacks"
```

---

## PASO 3 — `src/services/orders.service.ts` 🟡 ALTO

**Problema A:** `updateOrderStatus` acepta `string` libre. El type `OrderStatus` existe en el mismo archivo pero no se usa donde debería.

```typescript
// ANTES
export async function updateOrderStatus(id: string, status: string, notes?: string) {

// DESPUÉS
export async function updateOrderStatus(id: string, status: OrderStatus, notes?: string) {
```

---

**Problema B:** `order_number: ''` en el insert es semánticamente incorrecto. El trigger SQL lo genera — no enviar el campo.

```typescript
// ANTES — dentro de createOrder, en el .insert({...})
order_number: '', // El trigger genera automáticamente  ← ELIMINAR ESTA LÍNEA

// DESPUÉS — simplemente omitir esa línea del objeto insert
// order_number es generado automáticamente por trigger SQL (trg_set_order_number)
```

---

**Problema C:** Si `addLoyaltyPoints` falla, la orden existe pero el usuario pierde sus puntos silenciosamente. No hay forma de saberlo.

```typescript
// ANTES
const points = calculateLoyaltyPoints(data.total);
if (points > 0) {
    await addLoyaltyPoints(
        data.customer_id,
        points,
        order.id,
        `Compra #${order.order_number}`
    );
}
return order as OrderRecord;

// DESPUÉS
const points = calculateLoyaltyPoints(data.total);
if (points > 0) {
    try {
        await addLoyaltyPoints(
            data.customer_id,
            points,
            order.id,
            `Compra #${order.order_number}`
        );
    } catch (loyaltyError) {
        // La orden existe pero los puntos fallaron.
        // No bloquear la compra, pero registrar para revisión.
        console.error('[VSM] Loyalty points failed for order:', {
            orderId: order.id,
            orderNumber: order.order_number,
            pointsExpected: points,
            error: loyaltyError,
        });
        // TODO: implementar retry o mover a trigger SQL para atomicidad real.
    }
}
return order as OrderRecord;
```

```bash
git add src/services/orders.service.ts
git commit -m "fix(orders): type safety en updateOrderStatus, omitir order_number vacío, logging en loyalty points"
```

---

## PASO 4 — `src/App.tsx` 🟡 ALTO

**Problema:** `Home` es el único componente importado directamente (no lazy) — el más pesado de todos, va al bundle inicial. `SocialProofToast` también va al bundle principal siendo un componente de marketing no crítico.

```typescript
// ANTES — imports directos en la parte superior del archivo
import { Home } from '@/pages/Home';
import { SocialProofToast } from '@/components/ui/SocialProofToast';

// DESPUÉS — mover a lazy junto con los demás
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const SocialProofToast = lazy(
    () => import('@/components/ui/SocialProofToast')
        .then(m => ({ default: m.SocialProofToast }))
);
```

**Verificación:** Después del cambio, corre `npm run build` y confirma en la salida que `Home` aparece como chunk separado, no dentro de `index-[hash].js`.

```bash
git add src/App.tsx
git commit -m "perf(app): lazy loading en Home y SocialProofToast para reducir bundle inicial"
```

---

## PASO 5 — `src/hooks/useAppMonitoring.ts` 🟡 ALTO

**Problema:** La presenceKey anónima se genera con `Math.random()` dentro del `useEffect`. El effect se re-ejecuta en cada cambio de `location.pathname`. Resultado: nueva key aleatoria en cada navegación → múltiples channels de Presence abiertos en Supabase sin cerrar el anterior correctamente → leak de conexiones WebSocket.

```typescript
// ANTES — dentro del useEffect
const channel = supabase.channel(MONITORING_CHANNEL, {
    config: {
        presence: {
            key: user?.id || 'anon-' + Math.random().toString(36).substring(2, 9), // ← nueva key cada render
        },
    },
});

// DESPUÉS — agregar useRef al import y generar la key una sola vez
import { useEffect, useRef } from 'react'; // agregar useRef

export function useAppMonitoring() {
    const location = useLocation();
    const { user } = useAuth();

    // Key anónima estable para toda la sesión del browser
    const anonKey = useRef<string>(
        'anon-' + Math.random().toString(36).substring(2, 9)
    );

    useEffect(() => {
        const presenceKey = user?.id || anonKey.current; // ← estable

        const channel = supabase.channel(MONITORING_CHANNEL, {
            config: {
                presence: { key: presenceKey },
            },
        });

        // ... resto del código del effect sin cambios
```

```bash
git add src/hooks/useAppMonitoring.ts
git commit -m "fix(monitoring): presenceKey anónima estable con useRef para evitar WebSocket channel leak"
```

---

## PASO 6 — `vite.config.ts` 🟡 ALTO

**Problema:** El config actual es el template de "hola mundo". Sin sourcemaps el debugging en producción es ciego. Sin `manualChunks` el chunking admin/storefront depende de heurísticas de Rollup que pueden fallar.

```typescript
// REEMPLAZAR el archivo completo con:
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    // Source maps para debugging real en producción
    // No son públicos por defecto — subirlos a Sentry cuando se implemente
    sourcemap: true,

    target: 'es2020',

    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor: no cambian entre deploys, cache-friendly
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // Admin: nunca debe descargarlo un cliente del storefront
          'admin': [
            './src/pages/admin/AdminDashboard',
            './src/pages/admin/AdminProducts',
            './src/pages/admin/AdminProductForm',
            './src/pages/admin/AdminOrders',
            './src/pages/admin/AdminCategories',
            './src/pages/admin/AdminCustomers',
            './src/pages/admin/AdminCustomerDetails',
            './src/pages/admin/AdminCoupons',
            './src/pages/admin/AdminSettings',
            './src/pages/admin/AdminMonitoring',
          ],
        },
      },
    },
  },
})
```

**Verificación:** `npm run build` → en la salida deben aparecer chunks `vendor-react`, `vendor-query`, `vendor-supabase`, `admin` y el chunk principal. El chunk inicial (`index`) debe ser menor a 200KB.

```bash
git add vite.config.ts
git commit -m "perf(build): sourcemaps, target es2020, manualChunks admin/vendor explícitos"
```

---

## PASO 7 — `tsconfig.json` 🟠 MEDIO

**Problema:** Falta `noUncheckedIndexedAccess`. Sin esta flag, `items[0]` es tipo `Product`, no `Product | undefined`. Crashes en runtime que TypeScript podría prevenir.

```json
// Dentro de "compilerOptions", agregar después de "noFallthroughCasesInSwitch":
"noUncheckedIndexedAccess": true
```

**⚠️ IMPORTANTE:** Después de agregar esta flag, corre `npm run lint`. Aparecerán nuevos errores de TypeScript — accesos a arrays sin verificar `undefined`. Corrígelos TODOS antes de continuar.

Patrón de fix:

```typescript
// ❌ ANTES — crash potencial si array vacío
const name = items[0].product.name;

// ✅ DESPUÉS — opción 1: optional chaining
const name = items[0]?.product.name ?? '';

// ✅ DESPUÉS — opción 2: guard explícito
const first = items[0];
if (!first) return null;
const name = first.product.name;
```

```bash
git add tsconfig.json src/
git commit -m "chore(ts): agregar noUncheckedIndexedAccess, corregir accesos inseguros a arrays"
```

---

## PASO 8 — ESLint (archivo nuevo) 🟠 MEDIO

**Problema:** El proyecto no tiene ESLint. El script `"lint"` en package.json es solo `tsc --noEmit`. ESLint atrapa errores de lógica que TypeScript no detecta.

**Instalar:**

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks
```

**Crear `eslint.config.js` en la raíz:**

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
    },
  },
  { ignores: ['dist/', 'scripts/'] }
);
```

**Actualizar scripts en `package.json`:**

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build && npm run generate-sitemap",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint src/",
  "lint:fix": "eslint src/ --fix",
  "generate-sitemap": "node scripts/generate-sitemap.js"
}
```

Corre `npm run lint` y corrige los errores (los warnings de `no-explicit-any` pueden dejarse para después).

```bash
git add eslint.config.js package.json package-lock.json
git commit -m "chore(lint): agregar ESLint con typescript-eslint y react-hooks, separar typecheck de lint"
```

---

## PASO 9 — `public/_headers` (archivo nuevo) 🟠 MEDIO

**Crear el archivo `public/_headers`** — Cloudflare Pages lo lee automáticamente:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-XSS-Protection: 1; mode=block

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache, no-store, must-revalidate
```

> `/assets/*` con cache inmutable es seguro porque Vite genera hashes en los nombres. `index.html` nunca debe cachearse o los usuarios verán versiones viejas del app.

```bash
git add public/_headers
git commit -m "security: headers HTTP via Cloudflare Pages _headers (X-Frame, nosniff, cache)"
```

---

## PASO 10 — Verificación final 🔴

Ejecutar en este orden exacto:

```bash
# 1. Type check
npm run typecheck
# Esperado: 0 errores

# 2. Lint
npm run lint
# Esperado: 0 errors (warnings aceptables)

# 3. Build de producción
npm run build
# Esperado: build exitoso, ningún chunk > 500KB

# 4. Revisar tamaño de chunks
ls -lh dist/assets/ | sort -k5 -rn | head -15

# 5. Push → deploy automático en Cloudflare
git push origin main
```

Si el build muestra algún chunk > 500KB, identificar cuál con:

```bash
npx vite-bundle-visualizer
```

---

## Resumen de archivos modificados

| Paso | Archivo | Tipo | Prioridad |
|------|---------|------|-----------|
| 1 | `src/stores/cart.store.ts` | Modificar | 🔴 Crítico |
| 2 | `src/contexts/AuthContext.tsx` | Modificar | 🔴 Crítico |
| 3 | `src/services/orders.service.ts` | Modificar | 🟡 Alto |
| 4 | `src/App.tsx` | Modificar | 🟡 Alto |
| 5 | `src/hooks/useAppMonitoring.ts` | Modificar | 🟡 Alto |
| 6 | `vite.config.ts` | Reemplazar | 🟡 Alto |
| 7 | `tsconfig.json` + fixes en `src/` | Modificar | 🟠 Medio |
| 8 | `eslint.config.js` + `package.json` | Crear + Modificar | 🟠 Medio |
| 9 | `public/_headers` | Crear | 🟠 Medio |
| 10 | — | Verificación | — |
