/**
 * // ─── SERVICIO: admin-variants.service ───
 * // Arquitectura: Service Layer (Admin) — Admin exception §1.1
 * // Proposito principal: CRUD de atributos globales (`product_attributes`),
 *    valores de atributo y sincronización de variantes por producto.
 * // Regla / Notas: Sin `any`. Named exports. Solo desde admin panel.
 */
import { supabase } from '@/lib/supabase';
import type { ProductAttribute, ProductAttributeValue, ProductVariant } from '@/types/variant';

/**
 * Obtiene todos los atributos globales con sus valores
 */
// --- READ OPERATIONS ---

/**
 * Obtiene todos los atributos globales con sus respectivos valores.
 * Se utiliza principalmente en el panel de administración de atributos y el editor de productos.
 */
export async function getAllAttributes(): Promise<ProductAttribute[]> {
    const { data, error } = await supabase
        .from('product_attributes')
        .select(`
            id, name, created_at,
            values:product_attribute_values(id, attribute_id, value, created_at)
        `)
        .order('name');

    if (error) throw error;
    return data || [];
}

/**
 * Crea un nuevo atributo global
 */
// --- WRITE OPERATIONS (ATTRIBUTES) ---

/**
 * Crea un nuevo atributo global (ej: "Color", "Talla").
 */
export async function createAttribute(name: string): Promise<ProductAttribute> {
    const { data, error } = await supabase
        .from('product_attributes')
        .insert({ name })
        .select('id, name, created_at')
        .single();

    if (error) throw error;
    return data;
}

/**
 * Crea un valor para un atributo
 */
// --- WRITE OPERATIONS (VALUES) ---

/**
 * Añade un valor específico a un atributo existente (ej: "Rojo" para "Color").
 */
export async function createAttributeValue(attributeId: string, value: string): Promise<ProductAttributeValue> {
    const { data, error } = await supabase
        .from('product_attribute_values')
        .insert({ attribute_id: attributeId, value })
        .select('id, attribute_id, value, created_at')
        .single();

    if (error) throw error;
    return data;
}

/**
 * Elimina un atributo global
 */
/**
 * Elimina un atributo global y todos sus valores asociados (cascada por DB).
 */
export async function deleteAttribute(id: string): Promise<void> {
    const { error } = await supabase
        .from('product_attributes')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Elimina un valor de atributo
 */
export async function deleteAttributeValue(id: string): Promise<void> {
    const { error } = await supabase
        .from('product_attribute_values')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Obtiene las variantes de un producto específico
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
        .from('product_variants')
        .select(`
            id, product_id, sku, price, stock, images, is_active, created_at,
            options:product_variant_options(
                id, variant_id, attribute_value_id,
                attribute_value:product_attribute_values(
                    id, attribute_id, value,
                    attribute:product_attributes(name)
                )
            )
        `)
        .eq('product_id', productId);

    if (error) throw error;

    // Mapear para facilitar el uso en UI
    return (data || []).map(variant => ({
        ...variant,
        options: (variant.options as unknown as Array<{ attribute_value?: { attribute?: { name: string } } }>).map((opt) => ({
            ...opt,
            attribute_name: opt.attribute_value?.attribute?.name || ''
        }))
    })) as ProductVariant[];
}

/**
 * Guarda o actualiza las variantes de un producto
 * Nota: En una implementación real, esto debería manejar el borrado de las que no vienen en el array
 */
// --- WRITE OPERATIONS (VARIANTS) ---

/**
 * Orquesta el guardado de variantes para un producto.
 * Primero elimina las variantes existentes y luego inserta la nueva matriz de variaciones.
 */

/** Shape de una variante recibida del formulario de admin */
interface VariantInput {
    sku: string;
    price: number;
    stock: number;
    images?: string[];
    optionValueIds?: string[];
}

export async function syncProductVariants(productId: string, variants: VariantInput[]): Promise<void> {
    // 1. Borrar variantes existentes (o marcarlas como inactivas)
    // Para simplificar esta primera versión, borramos y recreamos
    // ADVERTENCIA: En producción esto borraría IDs referenciados en pedidos. Usar soft delete o upsert real.

    const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);

    if (deleteError) throw deleteError;

    if (!variants.length) return;

    for (const v of variants) {
        // a) Insertar variante
        const { data: newVariant, error: vError } = await supabase
            .from('product_variants')
            .insert({
                product_id: productId,
                sku: v.sku,
                price: v.price,
                stock: v.stock,
                images: v.images || []
            })
            .select('id, product_id, sku, price, stock, images, is_active, created_at')
            .single();

        if (vError) throw vError;

        // b) Insertar opciones (relaciones con valores)
        if (v.optionValueIds && v.optionValueIds.length > 0) {
            const options = v.optionValueIds.map((valId: string) => ({
                variant_id: newVariant.id,
                attribute_value_id: valId
            }));

            const { error: optError } = await supabase
                .from('product_variant_options')
                .insert(options);

            if (optError) throw optError;
        }
    }
}

