/**
 * // ─── ADMIN: SQL Migration Generator ───
 * // Proposito: Generar un script SQL para aplicar los cambios de la Fase 2B.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

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
    { name: 'Nicotina (Vape)', regex: /\b\d+\s*mg\b/i, target: 'spec', proposedKey: 'nicotina', baseConfidence: 0.90, sections: ['vape'], priority: 8 },
    { name: 'Potencia (Vape)', regex: /\b\d+(?:\.\d+)?\s*(?:w|watts|vatios)\b/i, target: 'spec', proposedKey: 'potencia', baseConfidence: 0.95, sections: ['vape'], priority: 8 },
    { name: 'VG/PG Ratio', regex: /\b\d{2}\/\d{2}\b|\b\d{2}vg\b|\b\d{2}pg\b/i, target: 'spec', proposedKey: 'ratio_vg_pg', baseConfidence: 0.90, sections: ['vape'], priority: 8 },
    { name: 'Resistencia (Vape)', regex: /\b\d+(?:\.\d+)?\s*(?:ohm|ohms|Ω)\b/i, target: 'spec', proposedKey: 'resistencia', baseConfidence: 0.95, sections: ['vape'], priority: 8 },
    { name: 'Dosis (Edibles)', regex: /\b\d+\s*mg\b/i, target: 'spec', proposedKey: 'dosis_por_porcion', baseConfidence: 0.85, sections: ['420'], categories: ['comestibles', 'gomitas'], priority: 9 },
    { name: 'Puffs Count', regex: /\b\d+\s*puffs\b/i, target: 'spec', proposedKey: 'puffs', baseConfidence: 0.95, priority: 5 },
    { name: 'Batería mAh', regex: /\b\d+\s*mah\b/i, target: 'spec', proposedKey: 'capacidad_bateria', baseConfidence: 0.95, priority: 5 },
    { name: 'Conector/Thread', regex: /\b(?:510|thread|eGO)\b/i, target: 'spec', proposedKey: 'conector', baseConfidence: 0.90, priority: 5 },
];

async function generateSQL() {
    console.log('-- Generando SQL de migración...');
    
    const { data: categories } = await supabase.from('categories').select('id, slug');
    const categoryMap = (categories || []).reduce((acc: any, c) => ({ ...acc, [c.id]: c.slug }), {});

    const { data: products } = await supabase.from('products').select('id, name, tags, section, category_id, specs, badges');
    if (!products) return;

    let sql = `-- MIGRACIÓN FASE 2B: LIMPIEZA TÉCNICA DE TAGS\n`;
    sql += `-- Fecha: ${new Date().toLocaleString()}\n`;
    sql += `-- Propósito: Migrar tags de alta confianza a specs/badges sin borrar tags originales.\n\n`;
    sql += `BEGIN;\n\n`;

    let count = 0;

    for (const product of products) {
        const currentTags = product.tags || [];
        const currentSpecs = product.specs || {};
        const currentBadges = product.badges || [];
        const section = product.section?.toLowerCase();
        const categorySlug = categoryMap[product.category_id] || '';

        const newSpecsAdded: Record<string, string> = {};
        const newBadgesAdded: string[] = [];

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

        Object.entries(patternMatches).forEach(([ruleName, matches]) => {
            const rule = matches[0].rule;
            if (rule.target === 'badge') {
                matches.forEach(m => {
                    const b = rule.proposedKey!.toUpperCase();
                    if (!currentBadges.includes(b)) newBadgesAdded.push(b);
                });
            } else if (rule.target === 'spec') {
                if (matches.length === 1) {
                    const k = rule.proposedKey!;
                    if (!currentSpecs[k]) newSpecsAdded[k] = matches[0].value;
                }
            }
        });

        if (Object.keys(newSpecsAdded).length > 0 || newBadgesAdded.length > 0) {
            count++;
            sql += `-- Producto: ${product.name}\n`;
            
            let updateParts = [];
            
            if (Object.keys(newSpecsAdded).length > 0) {
                const specsJson = JSON.stringify(newSpecsAdded);
                updateParts.push(`specs = COALESCE(specs, '{}'::jsonb) || '${specsJson}'::jsonb`);
            }
            
            if (newBadgesAdded.length > 0) {
                const badgesArray = `ARRAY['${newBadgesAdded.join("','")}']`;
                updateParts.push(`badges = (SELECT array_agg(DISTINCT b) FROM unnest(COALESCE(badges, ARRAY[]::text[]) || ${badgesArray}) b)`);
            }
            
            sql += `UPDATE products SET ${updateParts.join(', ')} WHERE id = '${product.id}';\n\n`;
        }
    }

    sql += `COMMIT;\n`;

    const outputPath = path.join(process.cwd(), 'scripts/admin/results/apply_phase_2b_migration.sql');
    fs.writeFileSync(outputPath, sql);
    console.log(`✅ SQL generado en: ${outputPath} (${count} productos afectados)`);
}

generateSQL();
