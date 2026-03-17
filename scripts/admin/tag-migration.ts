/**
 * // ─── ADMIN: Controlled Tag Migration Utility ───
 * // Proposito: Migrar tags de alta confianza a 'specs' y 'badges' sin borrar la fuente original.
 * // Modos: 
 * //   - Dry-run: Reporta lo que haria.
 * //   - Apply: Ejecuta los cambios en Supabase.
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
    categories?: string[];
    priority: number;
}

const RULES: PatternRule[] = [
    { name: 'Badge: Nuevo', regex: /\b(?:nuevo|new|reciente)\b/i, target: 'badge', proposedKey: 'NUEVO', baseConfidence: 0.95, priority: 10 },
    { name: 'Badge: Hot', regex: /\b(?:hot|tendencia|fuego|bestseller)\b/i, target: 'badge', proposedKey: 'HOT', baseConfidence: 0.95, priority: 10 },
    { name: 'Badge: Oferta', regex: /\b(?:oferta|sale|descuento|promo)\b/i, target: 'badge', proposedKey: 'OFERTA', baseConfidence: 0.90, priority: 10 },
    { name: 'Nicotina (Vape)', regex: /\b\d+\s*mg\b/i, target: 'spec', proposedKey: 'Nicotina', baseConfidence: 0.90, sections: ['vape'], priority: 8 },
    { name: 'Potencia (Vape)', regex: /\b\d+(?:\.\d+)?\s*(?:w|watts|vatios)\b/i, target: 'spec', proposedKey: 'Potencia', baseConfidence: 0.95, sections: ['vape'], priority: 8 },
    { name: 'VG/PG Ratio', regex: /\b\d{2}\/\d{2}\b|\b\d{2}vg\b|\b\d{2}pg\b/i, target: 'spec', proposedKey: 'Ratio VG/PG', baseConfidence: 0.90, sections: ['vape'], priority: 8 },
    { name: 'Resistencia (Vape)', regex: /\b\d+(?:\.\d+)?\s*(?:ohm|ohms|Ω)\b/i, target: 'spec', proposedKey: 'Resistencia', baseConfidence: 0.95, sections: ['vape'], priority: 8 },
    { name: 'Dosis (Edibles)', regex: /\b\d+\s*mg\b/i, target: 'spec', proposedKey: 'Dosis por Porción', baseConfidence: 0.85, sections: ['420'], categories: ['comestibles', 'gomitas'], priority: 9 },
    { name: 'Puffs Count', regex: /\b\d+\s*puffs\b/i, target: 'spec', proposedKey: 'Puffs', baseConfidence: 0.95, priority: 5 },
    { name: 'Batería mAh', regex: /\b\d+\s*mah\b/i, target: 'spec', proposedKey: 'Capacidad Batería', baseConfidence: 0.95, priority: 5 },
    { name: 'Conector/Thread', regex: /\b(?:510|thread|eGO)\b/i, target: 'spec', proposedKey: 'Conector', baseConfidence: 0.90, priority: 5 },
];

async function runMigration() {
    const isApply = process.argv.includes('--apply');
    console.log(`🚀 Iniciando migración controlada de tags... [MODO: ${isApply ? 'APPLY' : 'DRY-RUN'}]`);

    // 1. Cargar contexto
    const { data: categories } = await supabase.from('categories').select('id, slug');
    const categoryMap = (categories || []).reduce((acc: any, c) => ({ ...acc, [c.id]: c.slug }), {});

    const { data: products, error } = await supabase.from('products').select('id, name, tags, section, category_id, specs, badges');
    if (error || !products) {
        console.error('Error cargando productos:', error);
        return;
    }

    const migrationSummary: any[] = [];
    const updates: any[] = [];

    for (const product of products) {
        const currentTags = product.tags || [];
        const currentSpecs = product.specs || {};
        const currentBadges = product.badges || [];
        const section = product.section?.toLowerCase();
        const categorySlug = categoryMap[product.category_id] || '';

        const newSpecsAdded: Record<string, string> = {};
        const newBadgesAdded: string[] = [];
        const skippedTags: string[] = [];

        // Agrupar tags por tipo de regla para detectar cardinalidad
        const patternMatches: Record<string, { rule: PatternRule, value: string }[]> = {};

        currentTags.forEach(tag => {
            const applicableRules = RULES.filter(r => {
                if (!r.regex.test(tag)) return false;
                if (r.sections && !r.sections.includes(section)) return false;
                if (r.categories && !r.categories.includes(categorySlug)) return false;
                return true;
            }).sort((a, b) => b.priority - a.priority);

            if (applicableRules.length > 0) {
                const bestRule = applicableRules[0];
                const key = bestRule.name;
                if (!patternMatches[key]) patternMatches[key] = [];
                patternMatches[key].push({ rule: bestRule, value: tag });
            }
        });

        // Aplicar logica de migracion basada en cardinalidad
        Object.entries(patternMatches).forEach(([ruleName, matches]) => {
            const rule = matches[0].rule;
            
            if (rule.target === 'badge') {
                matches.forEach(m => {
                    const badgeValue = rule.proposedKey!;
                    if (!currentBadges.includes(badgeValue) && !newBadgesAdded.includes(badgeValue)) {
                        newBadgesAdded.push(badgeValue);
                    }
                });
            } else if (rule.target === 'spec') {
                // CARDINALIDAD: Si hay mas de un valor del mismo tipo, es un VARIANT CANDIDATE (No migrar automatico)
                if (matches.length === 1) {
                    const specKey = rule.proposedKey!;
                    const specValue = matches[0].value;
                    
                    // Solo añadir si la llave no existe o tiene el mismo valor
                    if (!currentSpecs[specKey]) {
                        newSpecsAdded[specKey] = specValue;
                    } else {
                        skippedTags.push(`${matches[0].value} (Key conflict: ${specKey})`);
                    }
                } else {
                    matches.forEach(m => skippedTags.push(`${m.value} (Cardinality > 1: Potential Variant)`));
                }
            }
        });

        if (Object.keys(newSpecsAdded).length > 0 || newBadgesAdded.length > 0) {
            const finalSpecs = { ...currentSpecs, ...newSpecsAdded };
            const finalBadges = Array.from(new Set([...currentBadges, ...newBadgesAdded])).map(b => b.toUpperCase());

            migrationSummary.push({
                product: product.name,
                specsAdded: newSpecsAdded,
                badgesAdded: newBadgesAdded,
                skipped: skippedTags
            });

            if (isApply) {
                const { error: upError } = await supabase
                    .from('products')
                    .update({ specs: finalSpecs, badges: finalBadges })
                    .eq('id', product.id);
                
                if (upError) console.error(`Error actualizando ${product.name}:`, upError.message);
            }
        }
    }

    // 3. Reporte
    const resultsDir = path.join(process.cwd(), 'scripts/admin/results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

    const auditPath = path.join(resultsDir, 'migration-audit.md');
    let md = `# Migration Audit Report - ${isApply ? 'APPLIED' : 'DRY-RUN'}\n\n`;
    md += `**Fecha**: ${new Date().toLocaleString()}\n`;
    md += `**Productos con cambios**: ${migrationSummary.length}\n\n`;

    md += `| Producto | Specs Añadidas | Badges Añadidos | Saltados |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    migrationSummary.forEach(s => {
        md += `| ${s.product} | ${JSON.stringify(s.specsAdded)} | ${s.badgesAdded.join(', ')} | ${s.skipped.join(', ')} |\n`;
    });

    fs.writeFileSync(auditPath, md);
    
    console.log(`✅ Proceso finalizado. Reporte en: ${auditPath}`);
}

runMigration();
