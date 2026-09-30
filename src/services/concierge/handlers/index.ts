import { DispatchClientCapsuleParams, ClientCapsuleDispatchResult } from '../capsule-dispatcher';
import { handleProductSearchIntegrity } from './product-search-integrity.handler';
import { handleStorefrontKittingBasket } from './storefront-kitting-basket.handler';
import { handleStorefrontBudgetRescue } from './storefront-budget-rescue.handler';
import { handleStorefrontCompatibilityCheck } from './storefront-compatibility-check.handler';
import { handleKnowledgeRagFoundation } from './knowledge-rag-foundation.handler';
import { handleStorefrontInventoryOutlook } from './storefront-inventory-outlook.handler';
import { handleAuthenticatedOrderTracking } from './authenticated-order-tracking.handler';
import { handleAuthenticatedWarrantyTriage } from './authenticated-warranty-triage.handler';
import { handleAuthenticatedLoyaltyStatus } from './authenticated-loyalty-status.handler';
import { handleStorefrontCheckoutReadiness } from './storefront-checkout-readiness.handler';
import { handleCartOperator } from './cart-operator.handler';


export type CapsuleHandlerFn = (params: DispatchClientCapsuleParams, noWriteSmokeActive: boolean) => Promise<ClientCapsuleDispatchResult | null>;

export const capsuleHandlers: Record<string, CapsuleHandlerFn> = {
    'product_search_integrity': handleProductSearchIntegrity,
    'storefront_kitting_basket': handleStorefrontKittingBasket,
    'storefront_budget_rescue': handleStorefrontBudgetRescue,
    'storefront_compatibility_check': handleStorefrontCompatibilityCheck,
    'knowledge_rag_foundation': handleKnowledgeRagFoundation,
    'storefront_inventory_outlook': handleStorefrontInventoryOutlook,
    'authenticated_order_tracking': handleAuthenticatedOrderTracking,
    'authenticated_warranty_triage': handleAuthenticatedWarrantyTriage,
    'authenticated_loyalty_status': handleAuthenticatedLoyaltyStatus,
    'storefront_checkout_readiness': handleStorefrontCheckoutReadiness,
    'cart_operator': handleCartOperator,
};


