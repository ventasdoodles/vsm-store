/**
 * // ─── ADMIN: Global Tag Registry Audit (Phase 2E) ───
 * // Proposito: Analizar el estado de la tabla 'product_tags' tras la limpieza de productos.
 * // Identifica: Tags huérfanos, dependencias de búsqueda y preparación para el borrado final.
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

const TECHNICAL_PATTERNS = [
    /\b\d+\s*mg\b/i,           // Nicotina/Dosis
    /\b\d+\s*(?:w|watts)\b/i,  // Potencia
    /\b\d{2}\/\d{2}\b/i,       // VG/PG
    /\b\d+\s*(?:ohm|ohms)\b/i, // Resistencia
    /\b\d+\s*puffs\b/i,        // Puffs
    /\b\d+\s*mah\b/i,          // Batería
    /\b(?:510|thread)\b/i      // Conector
];

async function runRegistryAudit() {
    console.log('🔍 Iniciando Auditoría del Registro Global de Tags (Fase 2E)...');

    // 1. Obtener todos los tags del registro global
    const { data: globalTags, error: tagError } = await supabase
        .from('product_tags')
        .select('name');

    if (tagError || !globalTags) {
        console.error('Error cargando product_tags:', tagError);
        return;
    }

    // 2. Obtener todos los tags actualmente en uso por productos
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('tags');

    if (prodError || !products) {
        console.error('Error cargando productos:', prodError);
        return;
    }

    const tagsInUse: Record<string, string[]> = {};
    products.forEach(p => {
        (p.tags || []).forEach(t => {
            const lowerT = t.toLowerCase();
            if (!tagsInUse[lowerT]) tagsInUse[lowerT] = [];
            tagsInUse[lowerT].push(p.name);
        });
    });

    // 3. Cruzar datos
    const auditResults: any[] = [];
    let metrics = {
        totalGlobal: globalTags.length,
        technicalLegacy: 0,
        orphanedTechnical: 0,
        stillReferencedTechnical: 0,
        semanticTotal: 0
    };

    globalTags.forEach(gt => {
        const tagName = gt.name;
        const lowerName = tagName.toLowerCase();
        const productsReferencing = tagsInUse[lowerName] || [];
        const isInUse = productsReferencing.length > 0;
        
        const isTechnical = TECHNICAL_PATTERNS.some(p => p.test(tagName));

        if (isTechnical) {
            metrics.technicalLegacy++;
            if (!isInUse) {
                metrics.orphanedTechnical++;
                auditResults.push({
                    name: tagName,
                    status: 'orphaned',
                    type: 'technical',
                    action: 'SAFE_TO_DELETE',
                    referencing: []
                });
            } else {
                metrics.stillReferencedTechnical++;
                auditResults.push({
                    name: tagName,
                    status: 'referenced',
                    type: 'technical',
                    action: 'KEEP_TEMP_REVIEW',
                    referencing: productsReferencing
                });
            }
        } else {
            metrics.semanticTotal++;
        }
    });

    // --- GENERAR REPORTE ---
    const resultsDir = path.join(process.cwd(), 'scripts/admin/results');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

    const reportPath = path.join(resultsDir, 'registry-cleanup-audit.md');
    let md = `# Global Tag Registry Cleanup Audit (Phase 2E)\n\n`;
    md += `**Fecha**: ${new Date().toLocaleString()}\n\n`;

    md += `## Resumen del Registro\n`;
    md += `- **Total de etiquetas en registro**: ${metrics.totalGlobal}\n`;
    md += `- **Etiquetas técnicas identificadas**: ${metrics.technicalLegacy}\n`;
    md += `    - **Huérfanas (Sin uso en productos)**: ${metrics.orphanedTechnical} 🟢\n`;
    md += `    - **Aún referenciadas**: ${metrics.stillReferencedTechnical} 🟡\n`;
    md += `- **Etiquetas semánticas (Flavor/SEO)**: ${metrics.semanticTotal}\n\n`;

    md += `## Detalle de Tags Técnicos\n\n`;
    md += `| Tag | Estado | Tipo | Acción Propuesta | Referenciado por |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;

    auditResults.forEach(r => {
        const statusEmoji = r.status === 'orphaned' ? '✅' : '⚠️';
        md += `| \`${r.name}\` | ${statusEmoji} ${r.status.toUpperCase()} | ${r.type} | **${r.action}** | ${r.referencing.join(', ') || '-'} |\n`;
    });

    fs.writeFileSync(reportPath, md);

    console.log(`✅ Auditoría finalizada.`);
    console.log(`📊 Tags huérfanos detectados: ${metrics.orphanedTechnical}`);
    console.log(`👉 Reporte generado en: ${reportPath}`);
}

runRegistryAudit();
