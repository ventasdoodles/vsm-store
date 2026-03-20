# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Cold Bug Audit — Product Editor Attribute Selection Rehydration Drift

## 1. What changed

- La evidencia apunta lejos de una pérdida dura de persistencia.
- El bug se comporta como drift de rehidratación / estado derivado UI dentro del editor de variantes.

## 2. What is validated

### Dónde se inicializa el estado de selección

- En `src/components/admin/products/ProductVariantsEditor.tsx`
- Estado local:
  - `selectedAttributes`
  - `selectedValues`
  - `variants`

### De qué campos guardados se supone que se rehidrata

- `ProductEditorDrawer.tsx` pasa:
  - `existingVariants={formData.variants || []}`
- `formData.variants` viene de `getProductById()`
- `getProductById()` trae:
  - `product_variants`
  - `product_variant_options`
  - `attribute_value.attribute_id`
  - `attribute_value.value`
  - `attribute.name`

### Qué indica eso

- La fuente de verdad al reabrir sí existe en datos guardados.
- El guardado también parece simétrico:
  - `syncProductVariants()` elimina/reinserta variantes y sus option links
  - `getProductById()` las vuelve a leer con los IDs de atributo/valor necesarios

### Drift más fuerte detectado

- En `ProductVariantsEditor.tsx`, la rehidratación corre sólo si:
  - `existingVariants.length > 0`
  - `variants.length === 0`
- Eso hace que la UI dependa de estado local previo para reconstruir selección visual.
- El problema se ve como:
  - `source-of-truth` guardada correcta
  - estado visual local no rehidratado de forma robusta

## 3. What remains open

- No se puede demostrar por archivos solamente si el drift ocurre sólo:
  - al reabrir
  - al cambiar de producto
  - al reusar el drawer sin reset completo
- Pero el olor técnico sí es claro:
  - rehidratación one-shot
  - condición dependiente de `variants.length`

## 4. What is approved

- Diagnóstico aprobado:
  - `derived UI state + form-state rehydration mismatch`
- No aprobado como causa principal:
  - pérdida de persistencia
  - fallo DB
  - save payload asimétrico

### Minimum safe future fix surface

- `src/components/admin/products/ProductVariantsEditor.tsx`

### Optional secondary inspection only if implementation needs it

- `src/components/admin/products/ProductEditorDrawer.tsx`

## 5. Exact next move

- Abrir un lane pequeño centrado en:
  - `src/components/admin/products/ProductVariantsEditor.tsx`
- Objetivo:
  - rehidratar selección de atributos/valores directamente desde `existingVariants`
  - sin depender de estado local viejo (`variants.length`)
  - sin tocar persistencia ni backend
