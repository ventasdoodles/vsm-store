import { 
  InternalResolvedProduct, 
  PublicAttachment, 
  FrontendResponseContract, 
  InternalCapsuleContract 
} from '../lib/ai-capsule-schemas';

import { z } from 'zod';
import { 
  productSearchToolSchema,
  knowledgeToolSchema,
  internalResolvedProductSchema,
  publicAttachmentSchema,
  frontendResponseSchema,
  internalCapsuleContractSchema,
  internalKnowledgeChunkSchema,
  internalKnowledgeContractSchema,
  cartOperatorToolSchema,
  internalCartOperatorContractSchema
} from '../lib/ai-capsule-schemas';

export type ProductSearchToolArgs = z.infer<typeof productSearchToolSchema>;
export type InternalResolvedProductType = z.infer<typeof internalResolvedProductSchema>;
export type PublicAttachmentType = z.infer<typeof publicAttachmentSchema>;
export type FrontendResponseContractType = z.infer<typeof frontendResponseSchema>;
export type InternalCapsuleContractType = z.infer<typeof internalCapsuleContractSchema>;

export type KnowledgeToolArgs = z.infer<typeof knowledgeToolSchema>;
export type InternalKnowledgeChunkType = z.infer<typeof internalKnowledgeChunkSchema>;
export type InternalKnowledgeContractType = z.infer<typeof internalKnowledgeContractSchema>;

export type CartOperatorToolArgs = z.infer<typeof cartOperatorToolSchema>;
export type InternalCartOperatorContractType = z.infer<typeof internalCartOperatorContractSchema>;
