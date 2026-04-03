import { describe, expect, it } from 'vitest';

import {
  resolveAITelemetryContract,
  shouldClientLogAITelemetry,
} from '../ai-telemetry-contract';

describe('ai telemetry ownership contract', () => {
  it('prefers the explicit edge contract and suppresses client fallback when edge already logged', () => {
    const contract = resolveAITelemetryContract({
      telemetry_contract: {
        owner: 'edge',
        edge_logged: true,
        client_should_log_fallback: false,
        reason: 'edge_logged',
      },
      server_telemetry_logged: false,
      requires_client_capsule: true,
    });

    expect(contract).toMatchObject({
      owner: 'edge',
      edge_logged: true,
      client_should_log_fallback: false,
      reason: 'edge_logged',
    });
    expect(shouldClientLogAITelemetry(contract)).toBe(false);
  });

  it('falls back to client ownership for capsule handoff responses without the explicit contract', () => {
    const contract = resolveAITelemetryContract({
      requires_client_capsule: true,
      server_telemetry_logged: false,
    });

    expect(contract).toMatchObject({
      owner: 'client',
      edge_logged: false,
      client_should_log_fallback: true,
      reason: 'legacy_client_capsule',
    });
    expect(shouldClientLogAITelemetry(contract)).toBe(true);
  });
});
