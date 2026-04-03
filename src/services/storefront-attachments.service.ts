import { supabase } from '@/lib/supabase';
import type { InternalCapsuleContract } from '@/types/ai-capsule';

type StorefrontAttachmentOffer = NonNullable<InternalCapsuleContract['attachment_offer']>;

interface AttachmentLookupResponse {
  attachment_offers?: StorefrontAttachmentOffer[];
}

export async function resolveStorefrontAttachmentOffers(
  productIds: string[],
): Promise<StorefrontAttachmentOffer[]> {
  const normalizedIds = [...new Set(productIds.filter((value) => typeof value === 'string' && value.length > 0))];
  if (normalizedIds.length === 0) return [];

  const { data, error } = await supabase.functions.invoke<AttachmentLookupResponse>('customer-intelligence', {
    body: {
      action: 'resolve_storefront_attachments',
      product_ids: normalizedIds,
    },
  });

  if (error) {
    throw error;
  }

  return Array.isArray(data?.attachment_offers) ? data.attachment_offers : [];
}
