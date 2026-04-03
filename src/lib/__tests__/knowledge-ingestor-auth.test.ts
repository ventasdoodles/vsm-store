import { describe, expect, it } from 'vitest';

import {
  canMutateKnowledgeAsRole,
  decodeJwtClaims,
  extractBearerToken,
  isServiceRoleToken,
} from '../../../supabase/functions/knowledge-ingestor/auth';

function buildJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('knowledge-ingestor auth helpers', () => {
  it('extracts bearer tokens and recognizes service role claims', () => {
    const token = buildJwt({ role: 'service_role' });
    const claims = decodeJwtClaims(extractBearerToken(`Bearer ${token}`));

    expect(extractBearerToken(`Bearer ${token}`)).toBe(token);
    expect(isServiceRoleToken(claims)).toBe(true);
  });

  it('allows only admin-capable operator roles to mutate knowledge', () => {
    expect(canMutateKnowledgeAsRole('admin')).toBe(true);
    expect(canMutateKnowledgeAsRole('super_admin')).toBe(true);
    expect(canMutateKnowledgeAsRole('viewer')).toBe(false);
    expect(canMutateKnowledgeAsRole(null)).toBe(false);
  });
});
