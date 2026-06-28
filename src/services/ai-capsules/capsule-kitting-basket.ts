import { resolveStorefrontKittingBasket } from '@/services/storefront-kitting-basket.service';























import { storefrontKittingToolSchema } from '@/lib/ai-capsule-schemas';

import { InternalKittingBasketContractType } from '@/types/ai-capsule';













export async function executeStorefrontKittingBasketCapsule(
  rawArgs: unknown,
): Promise<InternalKittingBasketContractType> {
  const validation = storefrontKittingToolSchema.safeParse(rawArgs);

  if (!validation.success) {
    return {
      capsule_name: 'storefront_kitting_basket',
      capsule_version: '1.0.0',
      execution_status: 'DEGRADED',
      match_strategy: 'NO_GROUNDED_KIT',
      customer_response_draft: 'No pude interpretar bien tu idea de kit. Dime si buscas equipo, pods o liquido y lo aterrizo mejor.',
      latency_ms: 0,
      degraded_reason: 'SCHEMA_ERROR',
      kitting_signal: {
        kind: 'NO_GROUNDED_KIT',
        setup_focus: 'mixed_setup',
        scope: 'NONE',
        base_product: null,
        consumable_product: null,
        liquid_product: null,
        missing_piece: 'base_device',
        flavor_preference: null,
        nicotine_preference: null,
        format_preference: null,
        upgrade_intent: false,
        wants_device: false,
        wants_consumable: false,
        wants_liquid: false,
        kit_size: 0,
      },
      resolved_products: [],
      retrieval_source: 'NONE',
      capsule_reasoning: validation.error.message,
    };
  }

  return resolveStorefrontKittingBasket(validation.data);
}
