---
name: vsm-ui-framework-audit
description: Auditoría exhaustiva y estandarización de UI/UX, Design Tokens, Framework de Componentes Primitivos, Iconografía y Theming Dinámico Multi-Vertical para Storefront y Admin.
---

# VSM UI Framework & UX Audit Skill

Esta habilidad define los estándares y procedimientos obligatorios para auditar, refactorizar y garantizar un sistema de diseño consistente, reutilizable y personalizable en **VSM Store** (Storefront y Admin OS).

---

## 1. Principios Fundamentales del Sistema de Diseño

### 1.1 Zero Arbitrary Code (Cero Código Hardcodeado)
- **Prohibición de Hex Crudo**: Ningún componente debe contener clases como `text-[#3b82f6]` o estilos en línea `style={{ color: '#...' }}`. Todos los colores deben provenir de tokens semánticos de Tailwind (`text-theme-primary`, `bg-accent-primary`, `border-surface-subtle`, etc.).
- **Prohibición de Dimensiones Arbitrarias**: Clases como `w-[400px]`, `h-[500px]`, `text-[9px]`, `blur-[70px]`, `rounded-[20px]` están prohibidas a menos que correspondan a una necesidad matemática estricta de SVG o layout de canvas que no pueda resolverse con la escala canónica.
- **Normalización de Blur**: Usar exclusivamente los tokens semánticos `blur-sm`, `blur-md`, `blur-lg`, `blur-xl`, `blur-2xl`, `blur-3xl`, `blur-4xl` (80px), `blur-5xl` (100px), `blur-6xl` (120px).

### 1.2 Jerarquía y Escalas Canónicas

#### A. Tipografía y Jerarquía
- Usar siempre el componente polimórfico `<Heading>` para títulos (`as="h1"` hasta `as="h6"`), el cual auto-infiere el nivel visual preservando la semántica accesible.
- Escala de fuentes:
  - `text-3xs` (8px / 12px) - Indicadores microscópicos, badges de contador.
  - `text-2xs` (10px / 14px) - Etiquetas secundarias, tracking macro (`tracking-macro`).
  - `text-xs` (12px / 16px) - Textos de ayuda, metadatos, captions.
  - `text-sm` (14px / 20px) - Cuerpo secundario, inputs, botones pequeños.
  - `text-base` (16px / 24px) - Cuerpo principal de lectura.
  - `text-lg` a `text-5xl` - Títulos principales y hero displays.
- Rótulos y Etiquetas: Usar siempre `.vsm-label` con `tracking-macro` y `text-2xs` o `text-xs`.

#### B. Escala de Radio de Borde (Border Radius)
- `rounded-sm`: 4px (pills diminutos, checkboxes).
- `rounded-md`: 8px (tags, chips, pequeños botones).
- `rounded-lg`: 10px (botones estándar, inputs, status badges).
- `rounded-xl`: 12px (tarjetas medianas, modales de formulario).
- `rounded-2xl`: 14px (tarjetas grandes, galerías).
- `rounded-3xl`: 16px (secciones destacadas).
- `rounded-4xl`: 2rem / 32px (paneles amplios, mega menús).
- `rounded-5xl`: 2.5rem / 40px (hero containers, side drawers).
- `rounded-6xl`: 3rem / 48px (modales flotantes principales).
- `rounded-full`: Círculos perfectos y pills redondeados.

#### C. Escala de Iconografía
- Todos los iconos deben provenir de `lucide-react`.
- Escala estricta de tamaños mediante utilidades `size-*` o `w-* h-*`:
  - Micro / Inline: `size-3.5` (14px)
  - Botón compacto / Chip: `size-4` (16px)
  - Estándar / Acción: `size-5` (20px)
  - Destacado / Tarjeta: `size-6` (24px)
  - Hero / Empty State: `size-8` a `size-12` (32px - 48px)
- `strokeWidth`: Estandarizado en `1.5` o `2` según densidad visual. Prohibido mezclar grosores aleatorios en la misma superficie.

---

## 2. Framework de Componentes Primitivos (Reutilización Obligatoria)

Para evitar duplicación masiva de clases (utility-soup):
1. **`<Button>`** (`src/components/ui/Button.tsx`):
   - Variantes: `primary`, `secondary`, `outline`, `ghost`, `danger`, `accent`.
   - Tamaños: `sm`, `md`, `lg`, `xl`, `icon`.
   - Maneja loading spinner accesible, haptics automáticos y estados disabled.
2. **`<Heading>`** (`src/components/ui/Heading.tsx`):
   - Inferencia automática de tracking, font-black y espaciado rítmico.
3. **`<Card>`** (`src/components/ui/Card.tsx`):
   - Fondos estandarizados `bg-surface-card` o `bg-surface-elevated` con `border-surface-subtle`.
4. **`<Input>`** (`src/components/ui/Input.tsx`):
   - Envoltorios de accesibilidad ARIA, manejo de foco y variantes de error.
5. **Layout Containers**:
   - Storefront: `.container-vsm` (`max-w-storefront mx-auto px-4 sm:px-6 lg:px-8`).
   - Admin OS: `.container-admin` (`max-w-admin mx-auto space-y-6 sm:space-y-8 pb-20 px-4 sm:px-6`).

---

## 3. Theming Dinámico Multi-Vertical y Personalización

El sistema está diseñado para vender cualquier vertical (vapeo, 420, refacciones, cosmética, ropa, etc.):
- **CSS Custom Properties**:
  - `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
  - `--accent-primary`, `--accent-secondary`, `--vsm-accent-primary`
  - `--text-primary`, `--text-secondary`, `--text-tertiary`
  - `--border-primary`
- **Presets de Temas Oficiales**:
  1. `vape-neon`: Azul Eléctrico (`59 130 246`) + Violeta Neón (`139 92 246`).
  2. `herbal-420`: Esmeralda Herbal (`16 185 129`) + Bosque Profundo (`5 150 105`).
  3. `monochrome-minimal`: Titanio Neutro (`244 244 245`) + Carbón Puro (`9 9 11`).
  4. `amber-motor`: Ámbar Racing (`245 158 11`) + Naranja Fuego (`234 88 12`) - ideal autopartes/ferretería.
  5. `cyber-crimson`: Carmesí Cibernético (`239 68 68`) + Magenta Oscuro (`217 70 239`).
  6. `custom`: Parámetros RGB definidos por el cliente en `store_settings.vertical_pack_config.theme`.

---

## 4. Checklist de Auditoría para Pull Requests y Commits
- [ ] ¿Hay valores `[#...]` o `style={{ color: ... }}`? (Deben ser 0).
- [ ] ¿Hay valores de píxeles arbitrarios `[...px]` reemplazables por la escala de tokens?
- [ ] ¿Se usaron los componentes primitivos `<Button>`, `<Heading>`, `<Input>` en lugar de etiquetas crudas con clases repetidas?
- [ ] ¿Los iconos usan tamaños estándar `size-4`, `size-5`, `size-6`?
- [ ] ¿El diseño responde correctamente a la inyección dinámica de temas de la tienda?
- [ ] `npm run typecheck` pasa con 0 errores.
- [ ] `npm run test:run` pasa con 100% de pruebas en verde.
