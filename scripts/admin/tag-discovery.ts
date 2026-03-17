/**
 * // ─── ADMIN: Refined Tag Discovery & Classification Utility ───
 * // Proposito: Analizar el catálogo con inteligencia de contexto (Sección/Categoría).
 * // Proceso: Detectar tags legados y clasificarlos en Specs, Variants o Badges.
 * // Salida: Reporte con razonamiento detallado y niveles de confianza mejorados.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Credenciales de Supabase no encontradas en .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIGURACIÓN DE MODELOS ---

interface PatternRule {
    name: string;
    regex: RegExp;
    target: 'spec' | 'badge' | 'variant_candidate' | 'semantic_tag_keep';
    proposedKey?: string;
    baseConfidence: number;
    sections?: string[];
    categories?: string[]; // Slugs
    priority: number; // 0 (bajo) a 10 (alto)
}

interface ClassificationResult {
    tag: string;
    target: string;
    proposedKey: string;
    confidence: number;
    reason: string;
    affectedProducts: { name: string; section: string; category: string }[];
}

// --- REGLAS BASADAS EN ONTOLOGÍA (CONTEXT-AWARE) ---

const RULES: PatternRule[] = [
    // --- BADGES (ALTA PRIORIDAD) ---
    { name: 'Badge: Nuevo', regex: /\b(?:nuevo|new|reciente)\b/i, target: 'badge', proposedKey: 'NUEVO', baseConfidence: 0.95, priority: 10 },
    { name: 'Badge: Hot', regex: /\b(?:hot|tendencia|fuego|bestseller)\b/i, target: 'badge', proposedKey: 'HOT', baseConfidence: 0.95, priority: 10 },
    { name: 'Badge: Oferta', regex: /\b(?:oferta|sale|descuento|promo)\b/i, target: 'badge', proposedKey: 'OFERTA', baseConfidence: 0.90, priority: 10 },

    // --- VAPE CONTEXT ---
    { name: 'Nicotina (Vape)', regex: /\b\d+\s*mg\b/i, target: 'variant_candidate', proposedKey: 'Nicotina', baseConfidence: 0.90, sections: ['vape'], priority: 8 },
    { name: 'Volumen (E-Liquid)', regex: /\b\d+\s*ml\b/i, target: 'variant_candidate', proposedKey: 'Contenido', baseConfidence: 0.90, sections: ['vape'], categories: ['liquidos', 'sales'], priority: 8 },
    { name: 'Resistencia (Vape)', regex: /\b\d+(?:\.\d+)?\s*(?:ohm|ohms|Ω)\b/i, target: 'spec', proposedKey: 'Resistencia', baseConfidence: 0.95, sections: ['vape'], priority: 8 },
    { name: 'Potencia (Vape)', regex: /\b\d+(?:\.\d+)?\s*(?:w|watts|vatios)\b/i, target: 'spec', proposedKey: 'Potencia', baseConfidence: 0.95, sections: ['vape'], priority: 8 },
    { name: 'VG/PG Ratio', regex: /\b\d{2}\/\d{2}\b|\b\d{2}vg\b|\b\d{2}pg\b/i, target: 'spec', proposedKey: 'Ratio VG/PG', baseConfidence: 0.90, sections: ['vape'], priority: 8 },

    // --- 420 CONTEXT ---
    { name: 'Cannabinoides (420)', regex: /\b\d+(?:\.\d+)?\s*%?\s*(?:thc|cbd|hhc)\b/i, target: 'spec', proposedKey: 'Potencia Cannabinoide', baseConfidence: 0.95, sections: ['420'], priority: 8 },
    { name: 'Dosis (Edibles)', regex: /\b\d+\s*mg\b/i, target: 'variant_candidate', proposedKey: 'Dosis por Porción', baseConfidence: 0.85, sections: ['420'], categories: ['comestibles', 'gomitas'], priority: 9 },
    { name: 'Contenido (Extractos)', regex: /\b\d+\s*ml\b/i, target: 'variant_candidate', proposedKey: 'Contenido', baseConfidence: 0.80, sections: ['420'], categories: ['extractos', 'gotas'], priority: 8 },

    // --- GENERIC TECHNICAL ---
    { name: 'Puffs Count', regex: /\b\d+\s*puffs\b/i, target: 'variant_candidate', proposedKey: 'Puffs', baseConfidence: 0.95, priority: 5 },
    { name: 'Batería mAh', regex: /\b\d+\s*mah\b/i, target: 'spec', proposedKey: 'Capacidad Batería', baseConfidence: 0.95, priority: 5 },
    { name: 'Conector/Thread', regex: /\b(?:510|thread|eGO)\b/i, target: 'spec', proposedKey: 'Conector', baseConfidence: 0.90, priority: 5 },

    // --- SEMANTIC KEEP ---
    { name: 'Flavors/Terps', regex: /\b(?:menta|fresa|mentol|blue|berry|ice|sweet|mango|watermelon)\b/i, target: 'semantic_tag_keep', baseConfidence: 0.80, priority: 3 },
];

async function runRefinedDiscovery() {
    console.log('🚀 Iniciando descubrimiento de tags (CON REFINAMIENTO CONTEXTUAL)...');

    // 1. Cargar Categorías para resolver Slugs
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug');
    
    if (catError) {
        console.error('Error al cargar categorías:', catError);
        return;
    }

    const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.id] = cat;
        return acc;
    }, {} as Record<string, any>);

    // 2. Obtener productos
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, tags, section, category_id, specs');

    if (error) {
        console.error('Error al obtener productos:', error);
        return;
    }

    console.log(`📦 Analizando ${products.length} productos con inteligencia contextual...`);

    const resultsByTag: Record<string, ClassificationResult> = {};

    products.forEach(product => {
        const tags = product.tags || [];
        const section = product.section?.toLowerCase();
        const category = categoryMap[product.category_id as string];
        const categorySlug = category?.slug?.toLowerCase() || '';

        tags.forEach(tag => {
            const normalizedTag = tag.trim();
            if (!normalizedTag) return;

            // Encontrar coincidencias aplicables
            const applicableRules = RULES.filter(rule => {
                if (!rule.regex.test(normalizedTag)) return false;
                
                // Filtro de sección (si existe)
                if (rule.sections && !rule.sections.includes(section)) return false;
                
                // Filtro de categoría (si existe)
                if (rule.categories && !rule.categories.includes(categorySlug)) return false;

                return true;
            });

            if (applicableRules.length > 0) {
                // Ordenar por prioridad y elegir la mejor
                const bestRule = applicableRules.sort((a, b) => b.priority - a.priority)[0];
                
                // Calcular confianza final basada en hits contextuales
                let finalConfidence = bestRule.baseConfidence;
                let contextReason = `Coincidencia con regla "${bestRule.name}"`;

                if (bestRule.sections) {
                    finalConfidence += 0.05;
                    contextReason += ` + Hit de Sección (${section})`;
                }
                if (bestRule.categories) {
                    finalConfidence += 0.05;
                    contextReason += ` + Hit de Categoría (${categorySlug})`;
                }

                // Asegurar que no exceda 1.0
                finalConfidence = Math.min(finalConfidence, 1.0);

                if (!resultsByTag[normalizedTag]) {
                    resultsByTag[normalizedTag] = {
                        tag: normalizedTag,
                        target: bestRule.target,
                        proposedKey: bestRule.proposedKey || '',
                        confidence: finalConfidence,
                        reason: contextReason,
                        affectedProducts: []
                    };
                }
                
                // Registrar producto afectado
                const productInfo = { 
                    name: product.name, 
                    section: section, 
                    category: category?.name || 'N/A' 
                };
                
                if (!resultsByTag[normalizedTag].affectedProducts.some(p => p.name === product.name)) {
                    resultsByTag[normalizedTag].affectedProducts.push(productInfo);
                }
            }
        });
    });

    // 3. Generar Reporte Refinado
    const classificationList = Object.values(resultsByTag).sort((a, b) => b.confidence - a.confidence);
    
    const resultsDir = path.join(process.cwd(), 'scripts/admin/results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

    const mdPath = path.join(resultsDir, 'classification-summary.md');
    let mdContent = `# Refined Transformation Report - Phase 2A (Context-Aware)\n\n`;
    mdContent += `**Fecha**: ${new Date().toLocaleString()}\n`;
    mdContent += `**Productos Escaneados**: ${products.length}\n`;
    mdContent += `**Tags Legados Clasificados**: ${classificationList.length}\n\n`;

    mdContent += `## Inteligencia Contextual Aplicada\n`;
    mdContent += `- **mg Differentiation**: Separación de Nicotina (Vape) y Dosis (420 Edibles).\n`;
    mdContent += `- **ml Context**: Asociación específica a líquidos o extractos.\n`;
    mdContent += `- **Confidence Scoring**: Incremento de confianza por coincidencia exacta de Sección/Categoría.\n\n`;

    mdContent += `## Detalle de Clasificación\n\n`;
    mdContent += `| Tag | Target:Key | Confianza | Razón (Contexto) | Cant. Productos |\n`;
    mdContent += `| :--- | :--- | :--- | :--- | :--- |\n`;

    classificationList.forEach(res => {
        mdContent += `| ${res.tag} | ${res.target}:${res.proposedKey} | ${(res.confidence * 100).toFixed(0)}% | ${res.reason} | ${res.affectedProducts.length} |\n`;
    });

    fs.writeFileSync(mdPath, mdContent);

    console.log(`✅ Reporte REFINADO generado en: ${mdPath}`);
}

runRefinedDiscovery();
