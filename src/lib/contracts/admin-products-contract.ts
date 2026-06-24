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
