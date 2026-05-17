export const CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT = 'customer_intelligence_no_write_v1' as const;

export type CustomerIntelligenceSuppressedWrite =
  | 'ai_customer_memory'
  | 'ai_analytics';

export type CustomerIntelligenceSuppressedCall =
  | 'cesarin-qa-judge';

export interface CustomerIntelligenceNoWriteSmokeMetadata {
  active: boolean;
  contract: typeof CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT;
  scope: 'concierge_chat_knowledge_path';
  suppressed_writes: CustomerIntelligenceSuppressedWrite[];
  suppressed_calls: CustomerIntelligenceSuppressedCall[];
}

export function isCustomerIntelligenceNoWriteSmokeRequest(
  body: Record<string, unknown>,
  action: unknown,
): boolean {
  return action === 'concierge_chat'
    && body.no_write_smoke === true
    && body.smoke_contract === CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT;
}

export function buildCustomerIntelligenceNoWriteSmokeMetadata(): CustomerIntelligenceNoWriteSmokeMetadata {
  return {
    active: true,
    contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
    scope: 'concierge_chat_knowledge_path',
    suppressed_writes: ['ai_customer_memory', 'ai_analytics'],
    suppressed_calls: ['cesarin-qa-judge'],
  };
}

export function buildCustomerIntelligenceNoWriteSmokeErrorFields(
  metadata: CustomerIntelligenceNoWriteSmokeMetadata | null,
): { no_write_smoke: CustomerIntelligenceNoWriteSmokeMetadata } | Record<string, never> {
  return metadata ? { no_write_smoke: metadata } : {};
}

export function shouldSuppressCustomerIntelligenceWrite(
  metadata: CustomerIntelligenceNoWriteSmokeMetadata | null,
  surface: CustomerIntelligenceSuppressedWrite,
): boolean {
  return metadata?.active === true && metadata.suppressed_writes.includes(surface);
}

export function shouldSuppressCustomerIntelligenceCall(
  metadata: CustomerIntelligenceNoWriteSmokeMetadata | null,
  surface: CustomerIntelligenceSuppressedCall,
): boolean {
  return metadata?.active === true && metadata.suppressed_calls.includes(surface);
}
