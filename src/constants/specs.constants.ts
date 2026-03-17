/**
 * // ─── CONSTANTES: Specs Constants ───
 * // Arquitectura: Domain Rules / Catalog Ontology
 * // Proposito principal: Definir las llaves sugeridas para especificaciones técnicas
 *    basadas en la categoría y reglas de normalización para evitar duplicados.
 */
import { Section } from '@/types/product';

/**
 * Mapeo de sugerencias de especificaciones técnicas por slug de categoría.
 * Se usan slugs para mayor estabilidad frente a cambios de ID.
 */
export const SUGGESTED_SPECS: Record<string, string[]> = {
    // VAPE
    'disposables': ['Puffs', 'Capacidad', 'Batería', 'Nicotina', 'Puerto de Carga'],
    'vape-kits': ['Watts', 'Batería', 'Capacidad', 'Resistencia Incluida', 'Puerto de Carga'],
    'pods': ['Resistencia', 'Capacidad', 'Compatibilidad'],
    'liquidos': ['Nicotina', 'VG/PG', 'Volumen'],
    'accesorios-vape': ['Compatibilidad', 'Material'],
    
    // 420
    'flores': ['THC%', 'CBD%', 'Genética', 'Efecto', 'Terpenos'],
    'extractos': ['Concentración', 'Método de Extracción', 'Tipo', 'THC%'],
    'comestibles': ['Dosis por Porción', 'Total Cannabinoides', 'Sabor'],
    'vapes-420': ['Capacidad', 'Voltaje Variable', 'Batería', 'THC%'],
    'parafernalia': ['Material', 'Tamaño', 'Compatibilidad']
};

/**
 * Sugerencias genéricas por sección si no hay una categoría específica mapeada.
 */
export const SECTION_DEFAULT_SPECS: Record<Section, string[]> = {
    'vape': ['Marca', 'Modelo', 'Color'],
    '420': ['Marca', 'Tipo', 'Efecto']
};

/**
 * Mapa de normalización de llaves.
 * Convierte variaciones comunes a la llave canónica del sistema.
 */
export const SPEC_KEY_NORMALIZATION: Record<string, string> = {
    // Vape common variations
    'watt': 'Watts',
    'watts': 'Watts',
    'vatios': 'Watts',
    'wats': 'Watts',
    'puf': 'Puffs',
    'puff': 'Puffs',
    'puffs': 'Puffs',
    'hits': 'Puffs',
    'nic': 'Nicotina',
    'nicotine': 'Nicotina',
    'nico': 'Nicotina',
    'resistencia': 'Resistencia',
    'ohm': 'Resistencia',
    'ohms': 'Resistencia',
    'coil': 'Resistencia',
    
    // 420 common variations
    'thc': 'THC%',
    'thc%': 'THC%',
    'cbd': 'CBD%',
    'cbd%': 'CBD%',
    'cannabinoides': 'Total Cannabinoides',
    'terps': 'Terpenos',
    'terpenos': 'Terpenos',
    
    // Generic variations
    'battery': 'Batería',
    'bateria': 'Batería',
    'cap': 'Capacidad',
    'capacity': 'Capacidad',
    'size': 'Tamaño',
    'material': 'Material',
    'color': 'Color',
    'marca': 'Marca',
    'brand': 'Marca'
};

/**
 * Normaliza una llave de especificación según el diccionario y reglas básicas.
 */
export function normalizeSpecKey(key: string): string {
    const cleanKey = key.toLowerCase().trim().replace(/[:=]$/, '');
    return SPEC_KEY_NORMALIZATION[cleanKey] || (key.charAt(0).toUpperCase() + key.slice(1).trim());
}
