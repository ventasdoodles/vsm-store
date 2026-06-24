import { z } from 'zod';

// ==========================================
// Admin Products (Product Intelligence) Contract
// ==========================================

export const GenerateProductCopyRequestSchema = z.object({
  body: z.object({
    action: z.literal('generate_copy'),
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional()
  })
});

export const EnrichProductRequestSchema = z.object({
  body: z.object({
    action: z.literal('enrich_product'),
    name: z.string().min(1, "Product name is required"),
    section: z.string().min(1, "Section is required"),
    category_slug: z.string().min(1, "Category slug is required"),
    current_specs: z.record(z.string(), z.any()),
    description: z.string()
  })
});

export const EmbeddingsProcessorRequestSchema = z.object({
  body: z.object({
    text: z.string().min(1, "Text for embedding cannot be empty")
  })
});

export type GenerateProductCopyRequest = z.infer<typeof GenerateProductCopyRequestSchema>;
export type EnrichProductRequest = z.infer<typeof EnrichProductRequestSchema>;
export type EmbeddingsProcessorRequest = z.infer<typeof EmbeddingsProcessorRequestSchema>;

export const AdminProductRequestSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    slug: z.string().regex(/^[a-z0-9-]+$/, { message: "El slug solo puede contener minúsculas, números y guiones" }),
    description: z.string().optional().nullable(),
    short_description: z.string().optional().nullable(),
    price: z.number().min(0, { message: "El precio no puede ser negativo" }),
    compare_at_price: z.number().min(0).optional().nullable(),
    cost_price: z.number().min(0).optional().nullable(),
    stock: z.number().int().min(0, { message: "El inventario no puede ser negativo" }),
    brand_id: z.string().uuid().optional().nullable(),
    category_id: z.string().uuid({ message: "La categoría debe ser válida" }),
    section: z.enum(['vape', '420']),
    status: z.enum(['active', 'draft', 'archived']),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.any()).optional().nullable(),
}).refine(data => {
    if (data.compare_at_price !== undefined && data.compare_at_price !== null) {
        return data.compare_at_price >= data.price;
    }
    return true;
}, {
    message: "El precio de comparación (antes) no puede ser menor al precio actual",
    path: ["compare_at_price"]
});

export type AdminProductRequest = z.infer<typeof AdminProductRequestSchema>;

