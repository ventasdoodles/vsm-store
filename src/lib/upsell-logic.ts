/**
 * Motor de Lógica de Smart Upselling - VSM Store
 * Define las reglas de compatibilidad entre categorías para recomendaciones inteligentes.
 */

export const CATEGORY_COMPATIBILITY: Record<string, string[]> = {
    // Reglas para VAPE
    'mods': ['liquidos', 'coils', 'accesorios-vape', 'base-libre', 'sales'],
    'atomizadores': ['coils', 'liquidos', 'accesorios-vape', 'base-libre', 'sales'],
    'liquidos': ['coils', 'mods', 'pod-systems'],
    'base-libre': ['coils', 'mods'],
    'sales': ['coils', 'pod-systems', 'mods'],
    'coils': ['liquidos', 'base-libre', 'sales', 'mods'],
    'pod-systems': ['sales', 'coils'],
    'accesorios-vape': ['mods', 'atomizadores', 'baterias'],

    // Reglas para 420
    'vaporizers': ['accesorios-420', 'concentrados'],
    'fumables': ['accesorios-420'],
    'concentrados': ['vaporizers', 'accesorios-420'],
    'comestibles': ['topicos', 'accesorios-420'],
    'accesorios-420': ['vaporizers', 'fumables', 'concentrados']
};

/**
 * Obtiene los slugs de categorías compatibles para una categoría dada.
 */
export function getCompatibleCategorySlugs(currentCategorySlug: string): string[] {
    return CATEGORY_COMPATIBILITY[currentCategorySlug] || [];
}

/**
 * Determina si dos categorías son complementarias para crear un "Bundle".
 */
export function areCategoriesComplementary(catA: string, catB: string): boolean {
    return CATEGORY_COMPATIBILITY[catA]?.includes(catB) || false;
}
