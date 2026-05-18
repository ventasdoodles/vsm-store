export const CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT = 'customer_intelligence_no_write_v1' as const;

export const CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS = Object.freeze({
  triggerQueryParam: 'ci_no_write_smoke',
  ragQualityQueryParam: 'ci_rag_quality_smoke',
  contractQueryParam: 'smoke_contract',
  contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
  requestField: 'no_write_smoke',
  auditField: 'no_write_smoke_audit',
  edgeMetadataPresentField: 'edge_metadata_present',
  requestContractPresentField: 'request_contract_present',
} as const);

export interface CustomerIntelligenceNoWriteSmokeMetadata {
  active?: boolean;
  contract?: string;
  scope?: string;
  suppressed_writes?: string[];
  suppressed_calls?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export function buildCustomerIntelligenceNoWriteSmokeRequestFields(): {
  no_write_smoke: true;
  smoke_contract: typeof CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT;
} {
  return {
    [CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.requestField]: true,
    [CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS.contractQueryParam]: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
  };
}

export function isCustomerIntelligenceNoWriteSmokeActive(value: unknown): value is CustomerIntelligenceNoWriteSmokeMetadata {
  if (!isRecord(value)) return false;

  return value.active === true
    && value.contract === CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT
    && value.scope === 'concierge_chat_knowledge_path'
    && Array.isArray(value.suppressed_writes)
    && value.suppressed_writes.includes('ai_analytics');
}
