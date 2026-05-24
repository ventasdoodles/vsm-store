/**
 * // ─── CONSTANTES: Specs Constants ───
 * // Arquitectura: Domain Rules / Catalog Ontology
 * // Proposito principal: Definir las llaves sugeridas para especificaciones técnicas
 *    basadas en la categoría y reglas de normalización para evitar duplicados.
 */
import { Section } from '@/types/product';
import {
    getVape420SectionDefaultSpecs,
    getVape420SpecKeyNormalization,
    getVape420SuggestedSpecs,
    normalizeVape420SpecKey,
} from '@/config/productization';

/**
 * Mapeo de sugerencias de especificaciones técnicas por slug de categoría.
 * Se usan slugs para mayor estabilidad frente a cambios de ID.
 */
export const SUGGESTED_SPECS: Record<string, string[]> = getVape420SuggestedSpecs();

/**
 * Sugerencias genéricas por sección si no hay una categoría específica mapeada.
 */
export const SECTION_DEFAULT_SPECS: Record<Section, string[]> = getVape420SectionDefaultSpecs();

/**
 * Mapa de normalización de llaves.
 * Convierte variaciones comunes a la llave canónica del sistema.
 */
export const SPEC_KEY_NORMALIZATION: Record<string, string> = getVape420SpecKeyNormalization();

/**
 * Normaliza una llave de especificación según el diccionario y reglas básicas.
 */
export function normalizeSpecKey(key: string): string {
    return normalizeVape420SpecKey(key);
}
