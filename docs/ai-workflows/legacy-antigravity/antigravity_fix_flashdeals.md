# FIX URGENTE — FlashDeals TypeScript Errors

**Errores:**
1. `featured` no existe en `useProducts` params
2. `discountPercent` puede ser undefined
3. Tipo incompatible en array

**Tiempo:** 5 minutos

---

## PARA ANTIGRAVITY

### Archivo: `src/components/home/FlashDeals.tsx`

**Error 1: Línea 15**

**Buscar:**
```typescript
const { data: products = [] } = useProducts({ featured: true, limit: 8 });
```

**Reemplazar con:**
```typescript
const { data: products = [] } = useProducts({ limit: 8 });
```

---

**Error 2: Línea 55-57**

**Buscar:**
```typescript
const flashDeals: FlashDeal[] = products.slice(0, 6).map((product, idx) => {
    const discountPercent = [30, 40, 50, 35, 45, 40][idx % 6];
    const originalPrice = Math.round(product.price / (1 - discountPercent / 100));
```

**Reemplazar con:**
```typescript
const flashDeals: FlashDeal[] = products.slice(0, 6).map((product, idx) => {
    const discounts = [30, 40, 50, 35, 45, 40];
    const discountPercent = discounts[idx % 6] ?? 30; // Fallback a 30%
    const originalPrice = Math.round(product.price / (1 - discountPercent / 100));
```

---

### Verificar Build

```bash
npm run build
```

**Resultado esperado:** Build exitoso sin errores TypeScript.

---

### Commit

```bash
git add src/components/home/FlashDeals.tsx
git commit -m "fix(home): resolve TypeScript errors in FlashDeals component

- Remove 'featured' param from useProducts (not supported)
- Add nullish coalescing for discountPercent to prevent undefined
- Ensure type safety in flash deals array"

git push origin main
```

---

## EXPLICACIÓN DE LOS FIXES

### Fix 1: Remove `featured` param
El hook `useProducts` no acepta parámetro `featured`. Solo acepta:
- `section?: 'vape' | '420'`
- `categoryId?: string`
- `limit?: number`

Usamos solo `limit: 8` para obtener productos.

### Fix 2: Nullish coalescing
Agregamos `?? 30` para garantizar que `discountPercent` nunca sea `undefined`:
```typescript
const discountPercent = discounts[idx % 6] ?? 30;
```

Esto satisface el tipo `FlashDeal` que espera `discountPercent: number`.

---

## TIEMPO ESTIMADO

- Fix: 2 minutos
- Build: 2 minutos
- Deploy: 2 minutos
- **Total: 6 minutos**

---

**CRÍTICO:** Ejecutar inmediatamente para que Cloudflare Pages pueda deployar.
