




































export const PRODUCT_SEARCH_SELECT = `
  id, slug, section, name, price, stock, ai_is_featured, ai_sales_note, description, specs,
  variants:product_variants(
    id, product_id, sku, price, stock, is_active,
    options:product_variant_options(
      variant_id, attribute_value_id,
      attribute_value:product_attribute_values(
        id, attribute_id, value,
        attribute:product_attributes(name)
      )
    )
  )
`;

export const PRODUCT_RECOVERY_STOPWORDS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas',
  'para', 'por', 'con', 'sin', 'quiero', 'necesito', 'busco', 'buscame',
  'tengo', 'tienes', 'tienen', 'hay', 'algo', 'que', 'me', 'recomiendas',
  'recomiendame', 'favor', 'porfa', 'modelo', 'serie', 'ademas', 'tambien',
  'todavia', 'anda', 'ando', 'este', 'ese', 'esa', 'cual', 'como', 'va',
  'pero', 'muy', 'mas', 'entre', 'esos', 'esas', 'llevo', 'trae', 'viene',
  'hoy', 'hora', 'horario', 'abren', 'cierran', 'cuando',
]);

export const RECOVERY_FRUIT_HINTS = ['frutal', 'fruta', 'uva', 'mango', 'berry', 'cereza', 'fresa', 'kiwi', 'lychee', 'sandia', 'tropical', 'limon', 'apple'];

export const RECOVERY_MINT_HINTS = ['menta', 'mint', 'mentol', 'menthol', 'ice', 'helado', 'fresco'];

export const RECOVERY_BUDGET_HINTS = ['barato', 'barata', 'economico', 'economica', 'precio', 'presupuesto', 'menos', 'accesible', 'caro', 'cara', 'no muy caro', 'no tan caro'];

export const RECOVERY_VAPE_HINTS = ['vape', 'vapear', 'pod', 'pods', 'mod', 'mods', 'kit', 'kits', 'pen', 'device', 'starter', 'nic', 'nicsalt', 'salt', 'liquido', 'liquidos', 'juice', 'eliquid'];

export const RECOVERY_420_HINTS = ['thc', 'cbd', 'gomitas', 'brownies', 'paletas', 'herb', 'dry herb', 'convection', 'balloon', 'desktop vape', 'vaporizador', 'vaporizer', 'hemp'];

export const RECOVERY_LIQUID_HINTS = ['liquido', 'liquidos', 'juice', 'juicee', 'eliquid', 'e-liquid', 'salt', 'nicsalt', 'nic salt', 'ml', 'nicotina'];

export const RECOVERY_DEVICE_HINTS = ['vape', 'pod', 'kit', 'mod', 'pen', 'device', 'starter', 'equipo', 'aparato', 'chico', 'compacto', 'compacta'];

export const RECOVERY_SMALL_HINTS = ['chico', 'chica', 'compacto', 'compacta', 'mini', 'micro', 'slim', 'stealth', 'bolsillo', 'portatil', 'portatil'];

export const RECOVERY_MIXED_HINTS = ['ademas', 'tambien', ' y ', ' junto con ', ' aparte '];

export const RECOVERY_EXPLORATION_HINTS = ['busco', 'quiero', 'algo', 'no se cual', 'recomiendame', 'conviene', 'entre esos dos', 'cual conviene', 'me llevo', 'me lo llevo', 'ese'];

export const RECOVERY_NOT_FOUND_HINTS = ['no encuentro', 'no encontre', 'no sale', 'no aparece', 'no lo veo'];

export const RECOVERY_FACT_NICOTINE_HINTS = ['nicotina', 'mg'];

export const RECOVERY_FACT_FLAVOR_HINTS = ['sabor', 'frutal', 'fruta', 'menta', 'mint', 'ice', 'uva', 'mango', 'berry', 'cereza', 'fresa', 'sandia', 'tropical', 'apple'];

export const VARIANT_COLOR_HINTS = ['rojo', 'azul', 'verde', 'negro', 'blanco', 'gris', 'rosa', 'morado', 'amarillo', 'naranja', 'cafe', 'marron', 'silver', 'gold'];

export const VARIANT_ATTRIBUTE_HINTS = {
  color: ['color', 'colores', 'tono', 'shade'],
  resistance: ['ohm', 'ohms', 'resistencia', 'coil'],
  nicotine: ['nicotina', 'nicotine', 'mg', '%'],
  flavor: ['sabor', 'flavor', 'perfil'],
  model: ['modelo', 'version', 'variante', 'serie', 'linea', 'línea'],
  size: ['tamano', 'tamaño', 'size', 'ml', 'contenido'],
  presentation: ['presentacion', 'presentación', 'formato', 'tipo'],
} as const;
