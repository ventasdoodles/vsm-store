/**
 * // ─── ADMIN: Technical Tag Cleanup Utility (Phase 2D) ───
 * // Proposito: Identificar tags redundantes que ya existen como 'specs' estructuradas.
 * // Modo: Solo Dry-run (Análisis y Reporte).
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

// --- CONFIGURACIÓN ---

const TECHNICAL_SPEC_KEYS = [
    'potencia',
    'nicotina',
    'ratio_vg_pg',
    'conector',
    'dosis_por_porcion',
    'resistencia',
    'puffs',
    'capacidad_bateria'
];

// Palabras ambiguas que NO deben ser borradas automáticamente aunque coincidan
const AMBIGUITY_GUARD = [
    '3', '6', '12', '18', '24', '50', // Números solos son peligrosos
    'vape', '420', 'menta', 'fresa', 'uva', // Palabras que pueden ser descriptores
    'uno', 'dual', 'single'
];

/**
 * Normaliza un string para comparación (lowercase, sin espacios, sin unidades pegadas)
 * Ejemplo: "50 mg" -> "50mg", "6MG" -> "6mg"
 */
function normalize(val: string): string {
    if (!val) return '';
    return val.toLowerCase()
        .replace(/\s+/g, '') // Quitar todos los espacios
        .replace(/([0-9])([a-z])/g, '$1$2') // Asegurar que n-unit sea consistente (aunque ya sin espacios se logra)
        .trim();
}

async function runCleanup() {
    const isApply = process.argv.includes('--apply');
    console.log(`🔍 Iniciando Análisis de Limpieza de Tags (Fase 2D)... [MODO: ${isApply ? 'APPLY' : 'DRY-RUN'}]`);

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, tags, specs');

    if (error || !products) {
        console.error('Error cargando productos:', error);
        return;
    }

    const cleanupActions: any[] = [];
    let metrics = {
        totalTechDetected: 0,
        safeToClean: 0,
        ambiguous: 0,
        semanticPreserved: 0,
        productsAffected: 0,
        actuallyCleaned: 0
    };

    for (const product of products) {
        const specs = product.specs || {};
        const tags = [...(product.tags || [])];
        const productActions: any[] = [];
        let tagsToRemove: string[] = [];

        tags.forEach(tag => {
            const normTag = normalize(tag);
            let matchedSpecKey: string | null = null;
            let matchedSpecValue: string | null = null;

            // Buscar coincidencia en specs técnicos
            for (const key of TECHNICAL_SPEC_KEYS) {
                if (specs[key]) {
                    const normSpecValue = normalize(specs[key]);
                    if (normTag === normSpecValue) {
                        matchedSpecKey = key;
                        matchedSpecValue = specs[key];
                        break;
                    }
                }
            }

            if (matchedSpecKey) {
                metrics.totalTechDetected++;
                
                // Verificar si es ambiguo
                const isAmbiguous = AMBIGUITY_GUARD.includes(normTag) || tag.length < 3;

                if (isAmbiguous) {
                    metrics.ambiguous++;
                    productActions.push({
                        tag,
                        action: 'review',
                        reason: `Matched ${matchedSpecKey} but value is ambiguous`,
                        key: matchedSpecKey,
                        value: matchedSpecValue
                    });
                } else {
                    metrics.safeToClean++;
                    tagsToRemove.push(tag);
                    productActions.push({
                        tag,
                        action: 'safe_to_clean',
                        reason: `Redundant technical data (Current: specs.${matchedSpecKey})`,
                        key: matchedSpecKey,
                        value: matchedSpecValue
                    });
                }
            } else {
                metrics.semanticPreserved++;
            }
        });

        if (productActions.length > 0) {
            metrics.productsAffected++;
            
            const safeToRemoveInThisProduct = productActions
                .filter(a => a.action === 'safe_to_clean')
                .map(a => a.tag);

            if (isApply && safeToRemoveInThisProduct.length > 0) {
                const finalTags = tags.filter(t => !safeToRemoveInThisProduct.includes(t));
                
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ tags: finalTags })
                    .eq('id', product.id);

                if (updateError) {
                    console.error(`❌ Error actualizando ${product.name}:`, updateError.message);
                } else {
                    metrics.actuallyCleaned += safeToRemoveInThisProduct.length;
                    console.log(`✅ ${product.name}: Limpiados ${safeToRemoveInThisProduct.length} tags.`);
                }
            }

            cleanupActions.push({
                id: product.id,
                name: product.name,
                actions: productActions
            });
        }
    }

    // --- GENERAR REPORTE ---
    const resultsDir = path.join(process.cwd(), 'scripts/admin/results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

    const reportFileName = isApply ? 'cleanup-audit.md' : 'cleanup-dry-run.md';
    const reportPath = path.join(resultsDir, reportFileName);
    let md = `# Cleanup Audit Report (Phase 2D) - ${isApply ? 'APPLIED' : 'DRY-RUN'}\n\n`;
    md += `**Fecha**: ${new Date().toLocaleString()}\n\n`;

    md += `## Resumen de Métricas\n`;
    md += `- **Tags técnicos detectados**: ${metrics.totalTechDetected}\n`;
    md += `- **Seguros para limpiar**: ${metrics.safeToClean}\n`;
    if (isApply) md += `- **Tags realmente eliminados**: ${metrics.actuallyCleaned}\n`;
    md += `- **Requieren revisión (ambiguos)**: ${metrics.ambiguous}\n`;
    md += `- **Tags semánticos preservados**: ${metrics.semanticPreserved}\n`;
    md += `- **Productos afectados**: ${metrics.productsAffected}\n\n`;

    md += `## Detalle por Producto\n\n`;
    md += `| Producto | Tag | Acción Propuesta | Match en Spec | Razón |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;

    cleanupActions.forEach(p => {
        p.actions.forEach((a: any) => {
            const statusEmoji = a.action === 'safe_to_clean' ? (isApply ? '🗑️' : '✅') : '⚠️';
            const actionText = isApply && a.action === 'safe_to_clean' ? 'CLEANED' : a.action.toUpperCase();
            md += `| ${p.name} | \`${a.tag}\` | ${statusEmoji} ${actionText} | \`${a.key}: ${a.value}\` | ${a.reason} |\n`;
        });
    });

    fs.writeFileSync(reportPath, md);

    console.log(`\n✅ Proceso finalizado [${isApply ? 'APPLY' : 'DRY-RUN'}].`);
    console.log(`📊 Productos afectados: ${metrics.productsAffected}`);
    if (isApply) console.log(`🗑️ Tags eliminados: ${metrics.actuallyCleaned}`);
    console.log(`👉 Reporte generado en: ${reportPath}`);
}

runCleanup();
