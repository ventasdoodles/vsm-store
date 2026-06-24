// ─── Admin Products Service ──────────────────────
import { supabase } from '@/lib/supabase';
import { 
    GenerateProductCopyRequestSchema, 
    EnrichProductRequestSchema, 
    EmbeddingsProcessorRequestSchema,
    AdminProductRequestSchema
} from '@/lib/contracts/admin-products-contract';

import type { Section, ProductStatus } from '@/types/constants';
import type { ProductVariant } from '@/types/variant';
import type { Product } from '@/types/product';

export interface ProductFormData {
    name: string;
    slug: string;
    description: string;
    short_description: string;
    price: number;
    compare_at_price: number | null;
    stock: number;
    sku: string;
    section: Section;
    category_id: string;
    tags: string[];
    status: ProductStatus;
    images: string[];
    cover_image: string | null;
    is_featured: boolean;
    is_featured_until: string | null;
    is_new: boolean;

    is_new_until: string | null;
    is_bestseller: boolean;
    variants?: ProductVariant[];
    is_bestseller_until: string | null;
    is_active: boolean;
    // New Ontology Fields
    specs: Record<string, string>;
    badges: string[];
    ai_sales_note: string | null;
    ai_is_featured: boolean;
    ai_exclude: boolean;
}

type BatchUpdateRow = { id: string; updates: Partial<ProductFormData> };
type ProductBatchColumn = Exclude<keyof ProductFormData, 'variants'>;

const BATCH_UPDATE_RETURN_SELECT = 'id';

const PRODUCT_BATCH_COLUMNS: ProductBatchColumn[] = [
    'name',
    'slug',
    'description',
    'short_description',
    'price',
    'compare_at_price',
    'stock',
    'sku',
    'section',
    'category_id',
    'tags',
    'status',
    'images',
    'cover_image',
    'is_featured',
    'is_featured_until',
    'is_new',
    'is_new_until',
    'is_bestseller',
    'is_bestseller_until',
    'is_active',
    'specs',
    'badges',
    'ai_sales_note',
    'ai_is_featured',
    'ai_exclude',
];

class BulkProductUpdateError extends Error {
    constructor(
        message: string,
        public readonly details?: {
            failedId?: string;
            appliedIds?: string[];
            rollbackFailedIds?: string[];
        }
    ) {
        super(message);
        this.name = 'BulkProductUpdateError';
    }
}

function mergeBatchUpdates(updates: BatchUpdateRow[]): BatchUpdateRow[] {
    const merged = new Map<string, Partial<ProductFormData>>();

    for (const row of updates) {
        const current = merged.get(row.id) ?? {};
        merged.set(row.id, { ...current, ...row.updates });
    }

    return Array.from(merged.entries()).map(([id, nextUpdates]) => ({ id, updates: nextUpdates }));
}

function getRollbackColumns(updates: BatchUpdateRow[]): ProductBatchColumn[] {
    const columns = new Set<ProductBatchColumn>();

    for (const row of updates) {
        for (const key of Object.keys(row.updates) as (keyof ProductFormData)[]) {
            if (key === 'variants') continue;
            if (PRODUCT_BATCH_COLUMNS.includes(key as ProductBatchColumn)) {
                columns.add(key as ProductBatchColumn);
            }
        }
    }

    return Array.from(columns);
}

function buildRollbackPayload(
    snapshot: { id: string } & Partial<Record<ProductBatchColumn, ProductFormData[ProductBatchColumn]>>,
    columns: ProductBatchColumn[]
): Partial<ProductFormData> {
    const rollbackPayload: Partial<ProductFormData> = {};
    const mutableRollbackPayload =
        rollbackPayload as Partial<Record<ProductBatchColumn, ProductFormData[ProductBatchColumn]>>;

    for (const column of columns) {
        const snapshotValue = snapshot[column];
        if (snapshotValue !== undefined) {
            mutableRollbackPayload[column] = snapshotValue;
        }
    }

    return rollbackPayload;
}

function assertSingleRow<T extends { id: string }>(
    data: T | null,
    error: unknown
): T {
    if (error) throw error;
    if (!data || typeof data !== 'object' || !('id' in data)) {
        throw new Error('Supabase single-row mutation did not return a product row.');
    }

    return data;
}

export async function getAllProducts() {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id, name, slug, description, short_description, price, compare_at_price, 
            stock, sku, section, category_id, status, tags, images, cover_image, 
            is_featured, is_featured_until, is_new, is_new_until, 
            is_bestseller, is_bestseller_until, is_active,
            specs, badges, ai_sales_note, ai_is_featured, ai_exclude,
            created_at, updated_at
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
}

/**
 * System Content Helper — Product Description Generator
 * Genera copys, descripciones y sugerencias de SEO para un producto.
 */
export async function generateProductCopy(name: string, currentDesc?: string): Promise<{ description: string; short_description: string; tags: string[] }> {
    try {
        const payload = GenerateProductCopyRequestSchema.parse({
            body: { name, description: currentDesc, action: 'generate_copy' }
        });

        const { data, error } = await supabase.functions.invoke('product-intelligence', payload);

        if (error) throw error;
        return data;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error generating product copy:', error);
        }
        throw error;
    }
}

/**
 * Enrichment package returned by the enrich_product action.
 * All fields are suggestions — none are applied without operator review.
 */
export interface EnrichmentPackage {
    description: string;
    short_description: string;
    ai_sales_note: string;
    specs: Record<string, string>;
    tags: string[];
    confidence: 'high' | 'medium' | 'low';
    warnings: string[];
}

/**
 * System Content Helper — Product Enrichment (category-aware)
 * Returns a structured enrichment package for operator review.
 * Does NOT write to the database — caller is responsible for applying approved fields.
 */
export async function enrichProduct(
    name: string,
    section: string,
    category_slug: string,
    current_specs?: Record<string, string>,
    description?: string
): Promise<EnrichmentPackage> {
    try {
        const payload = EnrichProductRequestSchema.parse({
            body: {
                action: 'enrich_product',
                name,
                section,
                category_slug,
                current_specs: current_specs ?? {},
                description: description ?? '',
            }
        });

        const { data, error } = await supabase.functions.invoke('product-intelligence', payload);

        if (error) throw error;
        return data as EnrichmentPackage;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error enriching product:', error);
        }
        throw error;
    }
}

async function syncProductEmbedding(id: string, name: string, description: string, section: string) {
    const textToEmbed = `Producto: ${name}. Categoría: ${section}. Descripción: ${description}`.trim();
    
    const payload = EmbeddingsProcessorRequestSchema.parse({
        body: { text: textToEmbed }
    });

    const { data: embedData, error: embedError } = await supabase.functions.invoke('embeddings-processor', payload);
    
    if (embedError || !embedData?.embedding) {
        console.error('Error generating product embedding:', embedError);
        return;
    }
    
    await supabase.from('products').update({ embedding: embedData.embedding }).eq('id', id);
}

export async function createProduct(product: ProductFormData): Promise<Product> {
    const validatedData = AdminProductRequestSchema.parse(product);
    const { data, error } = await supabase
        .from('products')
        .insert({
            ...validatedData,
            is_active: validatedData.status === 'active'
        })
        .select()
        .single();

    if (error) throw error;

    // Auto-sync AI embedding
    syncProductEmbedding(data.id, product.name || '', product.description || '', product.section || '').catch(console.error);

    return data;
}

export async function updateProduct(id: string, updates: Partial<ProductFormData>): Promise<Product> {
    const PartialSchema = AdminProductRequestSchema.partial();
    const validatedData = PartialSchema.parse(updates);
    
    // Si cambia status, mantener sincronizado is_active
    const payload = { ...validatedData } as any;
    if (validatedData.status) {
        payload.is_active = validatedData.status === 'active';
    }

    const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    // Re-sync AI embedding only if text fields changed
    if (updates.name !== undefined || updates.description !== undefined || updates.section !== undefined) {
        syncProductEmbedding(data.id, data.name || '', data.description || '', data.section || '').catch(console.error);
    }

    return data;
}

export async function deleteProduct(id: string) {
    // Soft delete: marcar como inactivo y status inactive
    const { error } = await supabase
        .from('products')
        .update({ is_active: false, status: 'inactive' })
        .eq('id', id);

    if (error) throw error;
}

export async function toggleProductFlag(id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', value: boolean) {
    const { error } = await supabase
        .from('products')
        .update({ [flag]: value })
        .eq('id', id);

    if (error) throw error;
}

export async function getProductById(id: string) {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id, name, slug, description, short_description, price, compare_at_price, stock, sku, section, category_id, tags, status, images, cover_image, 
            is_featured, is_featured_until, is_new, is_new_until, is_bestseller, is_bestseller_until, is_active,
            specs, badges, ai_sales_note, ai_is_featured, ai_exclude,
            created_at, updated_at,
            variants:product_variants(
                id, product_id, sku, price, stock, images, is_active, created_at, updated_at,
                options:product_variant_options(
                    variant_id, attribute_value_id,
                    attribute_value:product_attribute_values(
                        id, attribute_id, value,
                        attribute:product_attributes(name)
                    )
                )
            )
        `)
        .eq('id', id)
        .single();

    if (error) throw error;

    // Aplanamiento opcional de opciones para la UI
    interface VariantOptionRoot {
        options?: { attribute_value?: { attribute?: { name?: string } } }[];
        [key: string]: unknown;
    }

    if (data?.variants) {
        data.variants = ((data.variants as unknown as VariantOptionRoot[]).map((v) => ({
            ...v,
            options: v.options?.map((opt) => ({
                ...opt,
                attribute_name: opt.attribute_value?.attribute?.name
            }))
        }))) as unknown as typeof data.variants;
    }

    return data;
}

/**
 * Sube una imagen al bucket público de productos en Supabase Storage
 * Genera un nombre único basado en timestamp para evitar colisiones.
 */
export async function uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `raw/${fileName}`;

    const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        if (import.meta.env.DEV) {
            console.error('Error uploading image to Supabase:', error);
        }
        throw error;
    }

    // Obtener la URL pública de la imagen usando el método getPublicUrl
    const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

/**
 * Actualiza múltiples productos en un solo bloque.
 * Optimizado para el Batch Manager.
 */
export async function bulkUpdateProducts(updates: { id: string; updates: Partial<ProductFormData> }[]) {
    if (updates.length === 0) return [];

    try {
        const mergedUpdates = mergeBatchUpdates(updates);
        const rollbackColumns = getRollbackColumns(mergedUpdates);

        if (rollbackColumns.length === 0) return [];

        const ids = mergedUpdates.map((row) => row.id);
        const snapshotSelect = ['id', ...rollbackColumns].join(', ');

        const { data: snapshots, error: snapshotError } = await supabase
            .from('products')
            .select(snapshotSelect)
            .in('id', ids);

        if (snapshotError) throw snapshotError;
        if (!snapshots || snapshots.length !== ids.length) {
            throw new BulkProductUpdateError('No se pudo construir un snapshot completo antes del batch update.');
        }

        const snapshotMap = new Map<string, { id: string } & Partial<Record<ProductBatchColumn, ProductFormData[ProductBatchColumn]>>>();
        for (const row of snapshots as unknown as Array<Record<string, unknown>>) {
            if (!('id' in row) || typeof row.id !== 'string') {
                throw new BulkProductUpdateError('Snapshot batch returned a malformed product row.');
            }

            snapshotMap.set(
                row.id,
                row as { id: string } & Partial<Record<ProductBatchColumn, ProductFormData[ProductBatchColumn]>>
            );
        }

        const appliedIds: string[] = [];
        const updatedRows: unknown[] = [];

        for (const row of mergedUpdates) {
            const { data, error } = await supabase
                .from('products')
                .update(row.updates)
                .eq('id', row.id)
                .select(BATCH_UPDATE_RETURN_SELECT)
                .single();

            if (error) {
                const rollbackFailedIds: string[] = [];

                for (const appliedId of [...appliedIds].reverse()) {
                    const snapshot = snapshotMap.get(appliedId);
                    if (!snapshot) {
                        rollbackFailedIds.push(appliedId);
                        continue;
                    }

                    const rollbackPayload = buildRollbackPayload(snapshot, rollbackColumns);
                    const { error: rollbackError } = await supabase
                        .from('products')
                        .update(rollbackPayload)
                        .eq('id', appliedId);

                    if (rollbackError) {
                        rollbackFailedIds.push(appliedId);
                    }
                }

                throw new BulkProductUpdateError(
                    rollbackFailedIds.length > 0
                        ? 'El batch falló y el rollback compensatorio quedó incompleto.'
                        : 'El batch falló y los cambios previos fueron revertidos.',
                    {
                        failedId: row.id,
                        appliedIds,
                        rollbackFailedIds,
                    }
                );
            }

            const confirmedRow = assertSingleRow(data, error);
            appliedIds.push(row.id);
            updatedRows.push(confirmedRow);
        }

        return updatedRows;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Error in bulkUpdateProducts:', error);
        }
        throw error;
    }
}
