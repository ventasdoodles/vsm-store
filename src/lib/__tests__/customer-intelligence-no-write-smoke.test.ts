import { describe, expect, it } from 'vitest';

import {
  buildCustomerIntelligenceNoWriteSmokeRequestFields,
  CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
  isCustomerIntelligenceNoWriteSmokeActive,
} from '../customer-intelligence-no-write-smoke';
import {
  buildCustomerIntelligenceNoWriteSmokeErrorFields,
  buildCustomerIntelligenceNoWriteSmokeMetadata,
  isCustomerIntelligenceNoWriteSmokeRequest,
  shouldSuppressCustomerIntelligenceCall,
  shouldSuppressCustomerIntelligenceWrite,
} from '../../../supabase/functions/customer-intelligence/no-write-smoke';

describe('customer-intelligence no-write smoke contract', () => {
  it('requires the explicit concierge_chat smoke contract before activating', () => {
    expect(isCustomerIntelligenceNoWriteSmokeRequest({
      no_write_smoke: true,
      smoke_contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
    }, 'concierge_chat')).toBe(true);

    expect(isCustomerIntelligenceNoWriteSmokeRequest({
      no_write_smoke: true,
      smoke_contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
    }, 'semantic_search')).toBe(false);

    expect(isCustomerIntelligenceNoWriteSmokeRequest({
      no_write_smoke: true,
      smoke_contract: 'wrong_contract',
    }, 'concierge_chat')).toBe(false);
  });

  it('declares memory, analytics, and QA judge suppression for audit', () => {
    const metadata = buildCustomerIntelligenceNoWriteSmokeMetadata();

    expect(metadata).toMatchObject({
      active: true,
      contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
      scope: 'concierge_chat_knowledge_path',
      suppressed_writes: ['ai_customer_memory', 'ai_analytics'],
      suppressed_calls: ['cesarin-qa-judge'],
    });
    expect(shouldSuppressCustomerIntelligenceWrite(metadata, 'ai_customer_memory')).toBe(true);
    expect(shouldSuppressCustomerIntelligenceWrite(metadata, 'ai_analytics')).toBe(true);
    expect(shouldSuppressCustomerIntelligenceCall(metadata, 'cesarin-qa-judge')).toBe(true);
  });

  it('lets the storefront request and response sides agree on the same contract', () => {
    const requestFields = buildCustomerIntelligenceNoWriteSmokeRequestFields();
    const responseMetadata = buildCustomerIntelligenceNoWriteSmokeMetadata();

    expect(requestFields).toEqual({
      no_write_smoke: true,
      smoke_contract: CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_CONTRACT,
    });
    expect(isCustomerIntelligenceNoWriteSmokeActive(responseMetadata)).toBe(true);
    expect(isCustomerIntelligenceNoWriteSmokeActive({
      ...responseMetadata,
      suppressed_writes: ['ai_customer_memory'],
    })).toBe(false);
  });

  it('adds sanitized no-write metadata to recognized error responses only', () => {
    const responseMetadata = buildCustomerIntelligenceNoWriteSmokeMetadata();

    expect(buildCustomerIntelligenceNoWriteSmokeErrorFields(responseMetadata)).toEqual({
      no_write_smoke: responseMetadata,
    });
    expect(buildCustomerIntelligenceNoWriteSmokeErrorFields(null)).toEqual({});
  });
});
