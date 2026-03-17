import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * REPAIR RULES (Phase 2D Refined)
 * - Only handle the 18 specific technical tags found in registry audit.
 * - Only upsert missing spec if context is unambiguous (Section + Category).
 */

const REPAIR_MAPS: Record<string, { key: string; sections: string[] }> = {
    'mg': { key: 'nicotina', sections: ['vape'] },
    'w': { key: 'potencia', sections: ['vape'] },
    'watts': { key: 'potencia', sections: ['vape'] },
    '510': { key: 'conector', sections: ['vape'] },
    '510-thread': { key: 'conector', sections: ['vape'] }
};

const CATEGORY_MAPS: Record<string, Record<string, string>> = {
    'mg': {
        'comestibles': 'dosis_por_porcion',
        'extractos': 'concentracion',
        'flores': 'thc_percent'
    }
};

function identifySpecMapping(tag: string, section: string, categorySlug: string) {
    const value = tag.match(/(\d+\.?\d*)\s*(mg|w|watts|vatios|510|thread|puffs|mah)/i);
    if (!value) return null;

    const unit = value[2].toLowerCase();
    const numericPart = value[1] + unit;

    // Check mapping based on unit
    let targetKey = '';
    const map = REPAIR_MAPS[unit];
    
    if (map && map.sections.includes(section)) {
        targetKey = map.key;
    } else if (CATEGORY_MAPS[unit] && CATEGORY_MAPS[unit][categorySlug]) {
        targetKey = CATEGORY_MAPS[unit][categorySlug];
    } else if (unit === 'mg' && section === 'vape') {
        targetKey = 'nicotina';
    } else if (unit === 'mg' && section === '420') {
        // Ambiguous without category mapping
        return null;
    }

    if (!targetKey) return null;

    return { key: targetKey, value: numericPart };
}

async function runRepair() {
    console.log('🚀 Iniciando Reparación de Tags Técnicos (Phase 2D)...');
    const apply = process.argv.includes('--apply');
    
    // 1. Obtener productos con tags
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, tags, specs, section, category_id')
        .not('tags', 'is', null);

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    // 2. Fetch category slugs for context
    const { data: categories } = await supabase.from('categories').select('id, slug');
    const catMap = Object.fromEntries(categories?.map(c => [c.id, c.slug]) || []);

    const audit: any[] = [];
    let metrics = {
        total: 0,
        cleaned: 0,
        upserted: 0,
        skipped: 0
    };

    const TECHNICAL_PATTERNS = [
        /\d+\s*mg\b/i,
        /\d+\s*(?:w|watts|vatios)\b/i,
        /\b(?:510|thread)\b/i
    ];

    for (const p of products) {
        const productTags = p.tags as string[];
        const techTags = productTags.filter(t => TECHNICAL_PATTERNS.some(pat => pat.test(t)));

        if (techTags.length === 0) continue;

        const catSlug = catMap[p.category_id] || '';
        const specs = (p.specs as Record<string, string>) || {};
        let tagsToKeep = [...productTags];
        let specsToUpdate = { ...specs };
        let productModified = false;

        for (const tag of techTags) {
            metrics.total++;
            const mapping = identifySpecMapping(tag, p.section, catSlug);
            
            if (!mapping) {
                audit.push({
                    product: p.name,
                    tag,
                    action: 'SKIPPED',
                    reason: 'Ambiguous context or unit'
                });
                metrics.skipped++;
                continue;
            }

            // check if already exists in specs
            const existingVal = specs[mapping.key];
            const normalizedTag = tag.toLowerCase().replace(/\s+/, '');
            const normalizedSpec = (existingVal || '').toLowerCase().replace(/\s+/, '');

            if (existingVal && (normalizedTag === normalizedSpec || normalizedSpec.includes(normalizedTag))) {
                // Safe to remove tag
                tagsToKeep = tagsToKeep.filter(t => t !== tag);
                audit.push({
                    product: p.name,
                    tag,
                    action: 'REMOVED',
                    reason: `Equivalent exists in specs: ${mapping.key}=${existingVal}`
                });
                productModified = true;
                metrics.cleaned++;
            } else if (!existingVal) {
                // Safe to upsert?
                // Strict check: only upsert if we are 100% sure of the mapping and value
                tagsToKeep = tagsToKeep.filter(t => t !== tag);
                specsToUpdate[mapping.key] = mapping.value;
                audit.push({
                    product: p.name,
                    tag,
                    action: 'UPSERTED_SPEC_AND_REMOVED',
                    reason: `Migrated to specs.${mapping.key}=${mapping.value}`
                });
                productModified = true;
                metrics.upserted++;
                metrics.cleaned++;
            } else {
                audit.push({
                    product: p.name,
                    tag,
                    action: 'REVIEW_REQUIRED',
                    reason: `Spec conflict: tag=${tag}, spec=${mapping.key}=${existingVal}`
                });
                metrics.skipped++;
            }
        }

        if (productModified && apply) {
            const { error: updateError } = await supabase
                .from('products')
                .update({ 
                    tags: tagsToKeep,
                    specs: specsToUpdate
                })
                .eq('id', p.id);
            
            if (updateError) console.error(`Error updating product ${p.name}:`, updateError);
        }
    }

    // 3. Generar Reporte
    let md = `# Repair Wave Audit Report (Phase 2D)\n\n`;
    md += `**Status**: ${apply ? '✅ APPLIED' : '🔍 DRY RUN'}\n`;
    md += `**Fecha**: ${new Date().toLocaleString()}\n\n`;
    
    md += `## Métricas\n`;
    md += `- **Tags técnicos detectados**: ${metrics.total}\n`;
    md += `- **Tags eliminados**: ${metrics.cleaned}\n`;
    md += `- **Specs auto-insertados**: ${metrics.upserted}\n`;
    md += `- **Casos omitidos (Review)**: ${metrics.skipped}\n\n`;

    md += `## Detalle de Acciones\n\n`;
    md += `| Producto | Tag | Acción | Razón |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    audit.forEach(a => {
        md += `| ${a.product} | \`${a.tag}\` | **${a.action}** | ${a.reason} |\n`;
    });

    const reportPath = path.join(process.cwd(), 'scripts/admin/results/repair-audit.md');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, md);

    console.log(`\n✨ Reporte generado en: ${reportPath}`);
    console.log(`Resultados: ${metrics.cleaned} removidos, ${metrics.skipped} omitidos.`);
}

runRepair();
