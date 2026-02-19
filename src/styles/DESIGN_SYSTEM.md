# SISTEMA DE DISEÑO VSM STORE

## ⚠️ REGLAS ESTRICTAS

### NUNCA USAR

```typescript
❌ bg-primary-900
❌ bg-primary-800
❌ bg-purple-500
❌ bg-violet-600
❌ text-primary-100
❌ border-primary-700
❌ Colores inline: style={{ background: '#...' }}
```

### SIEMPRE USAR

```typescript
✅ bg-theme-primary      // Fondo principal
✅ bg-theme-secondary    // Fondo cards/sections
✅ bg-theme-tertiary     // Fondo images/disabled
✅ text-theme-primary    // Texto principal
✅ text-theme-secondary  // Texto secundario
✅ border-theme          // Bordes
✅ bg-accent-primary     // Accent (CTA, links importantes)
✅ text-accent-primary   // Accent text
```

## COLORES POR FUNCIÓN

### Backgrounds

- **Principal (body):** `bg-theme-primary`
- **Cards/Sections:** `bg-theme-secondary`
- **Inputs/Images:** `bg-theme-tertiary`

### Text

- **Headers/Important:** `text-theme-primary`
- **Body/Secondary:** `text-theme-secondary`
- **Links/Actions:** `text-accent-primary`

### Borders

- **Todos los bordes:** `border-theme`

### Buttons

- **Primary CTA:** `bg-accent-primary hover:bg-accent-primary/90 text-white`
- **Secondary:** `bg-theme-secondary hover:bg-theme-tertiary text-theme-primary`
- **Outline:** `border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white`

### Status Colors (pueden ser hardcoded)

- **Success:** `bg-green-500 text-green-600`
- **Error:** `bg-red-500 text-red-600`
- **Warning:** `bg-orange-500 text-orange-600`
- **Info:** `bg-blue-500 text-blue-600`

## COMPONENTES COMUNES

### Card

```typescript
<div className="bg-theme-secondary rounded-xl p-6 border border-theme">
  <h3 className="text-lg font-bold text-theme-primary mb-2">Title</h3>
  <p className="text-sm text-theme-secondary">Description</p>
</div>
```

### Input

```typescript
<input
  className="w-full h-12 px-4 bg-theme-primary border border-theme rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
/>
```

### Button Primary

```typescript
<button className="h-12 px-6 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold rounded-lg transition-all hover:scale-105">
  Action
</button>
```

### Button Secondary

```typescript
<button className="h-12 px-6 bg-theme-secondary hover:bg-theme-tertiary text-theme-primary font-semibold rounded-lg border border-theme transition-colors">
  Action
</button>
```

## VERIFICACIÓN

Antes de cada commit, ejecutar:

```bash
# Buscar colores hardcoded
grep -r "bg-primary-[0-9]" src/ --include="*.tsx"
grep -r "text-primary-[0-9]" src/ --include="*.tsx"
grep -r "bg-purple-" src/ --include="*.tsx"
grep -r "bg-violet-" src/ --include="*.tsx"

# NO DEBE RETORNAR NADA (excepto node_modules)
```

## RESPONSABLE

**Cada desarrollador** debe:

1. Leer esta guía antes de crear componentes
2. Usar SOLO clases theme-aware
3. Verificar con grep antes de commit
4. Actualizar componentes viejos que encuentre

**NO HAY EXCUSAS para usar colores hardcoded.**
