import type { 
  InternalResolvedProduct, 
  InternalCapsuleContract,
  InternalKnowledgeContract,
  InternalCartOperatorContract,
  InternalOrderTrackingContract,
  InternalWarrantyTriageContract,
  InternalLoyaltyStatusContract,
  InternalKittingBasketContract,
  PublicAttachment,
  FrontendResponseContract
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
  internalCartOperatorContractSchema,
  orderTrackingToolSchema,
  internalOrderTrackingContractSchema,
  warrantyTriageToolSchema,
  internalWarrantyTriageContractSchema,
  loyaltyStatusToolSchema,
  internalLoyaltyStatusContractSchema,
  storefrontKittingToolSchema,
  internalKittingBasketContractSchema,
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

export type OrderTrackingToolArgs = z.infer<typeof orderTrackingToolSchema>;
export type InternalOrderTrackingContractType = z.infer<typeof internalOrderTrackingContractSchema>;
export type WarrantyTriageToolArgs = z.infer<typeof warrantyTriageToolSchema>;
export type InternalWarrantyTriageContractType = z.infer<typeof internalWarrantyTriageContractSchema>;
export type LoyaltyStatusToolArgs = z.infer<typeof loyaltyStatusToolSchema>;
export type InternalLoyaltyStatusContractType = z.infer<typeof internalLoyaltyStatusContractSchema>;
export type KittingBasketToolArgs = z.infer<typeof storefrontKittingToolSchema>;
export type InternalKittingBasketContractType = z.infer<typeof internalKittingBasketContractSchema>;

// Re-exporting for consistency across orchestrated services
export type { 
  InternalCapsuleContract, 
  InternalResolvedProduct,
  InternalKnowledgeContract,
  InternalCartOperatorContract,
  InternalOrderTrackingContract,
  InternalWarrantyTriageContract,
  InternalLoyaltyStatusContract,
  InternalKittingBasketContract,
  PublicAttachment,
  FrontendResponseContract
};
