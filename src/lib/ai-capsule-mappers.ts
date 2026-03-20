import { 
  InternalCapsuleContract, 
  FrontendResponseContract, 
  PublicAttachment 
} from '../types/ai-capsule';

/**
 * Transforms an internal capsule contract into a safe, client-facing response.
 * Completely sanitizes internal state, truncates attachments to max 4,
 * and formats the final UI intent.
 */
export function mapCapsuleToFrontendResponse(
  internal: InternalCapsuleContract
): FrontendResponseContract {
  // 1. Map execution status to operational response state
  let responseState: FrontendResponseContract['response_state'] = 'OPTIMAL';
  if (internal.execution_status === 'DEGRADED') {
    responseState = 'DEGRADED';
  } else if (internal.execution_status === 'FAILED') {
    responseState = 'FATAL';
  }

  // 2. Map structural UI intent
  let uiIntent: FrontendResponseContract['ui_intent'] = 'CHAT_ONLY';
  if (internal.execution_status === 'FAILED') {
    uiIntent = 'SYSTEM_ERROR';
  } else if (internal.resolved_products && internal.resolved_products.length > 0) {
    uiIntent = 'PRODUCT_DISPLAY';
  }

  // 3. Map constraints and sanitize private data (e.g. raw_stock, cost_price go away)
  let attachments: PublicAttachment[] | undefined = undefined;
  
  if (internal.resolved_products && internal.resolved_products.length > 0) {
    attachments = internal.resolved_products
      // Truncate to maximum 4 display items as per UI constraints
      .slice(0, 4)
      .map((prod) => ({
        public_id: prod.slug,
        title: prod.name,
        display_price: prod.display_price,
        availability_label:
          prod.status_signal === 'IN_STOCK' ? 'En existencia' :
          prod.status_signal === 'LOW_STOCK' ? 'Pocas unidades' :
          prod.status_signal === 'COMING_SOON' ? 'Próximamente' : 'Agotado',
        ...(prod.ai_sales_note ? { ai_sales_note: prod.ai_sales_note } : {})
      }));
  }

  // 4. Return final public contract
  return {
    message: internal.customer_response_draft,
    ui_intent: uiIntent,
    response_state: responseState,
    attachments
  };
}
