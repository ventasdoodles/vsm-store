export type KnowledgeOperatorRole = 'admin' | 'super_admin' | 'viewer';

export function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

export function decodeJwtClaims(token: string | null): Record<string, unknown> | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) return null;

  const normalized = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');

  try {
    return JSON.parse(atob(normalized)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isServiceRoleToken(claims: Record<string, unknown> | null): boolean {
  const role = typeof claims?.role === 'string' ? claims.role : null;
  return role === 'service_role' || role === 'supabase_admin';
}

export function canMutateKnowledgeAsRole(role: string | null | undefined): role is KnowledgeOperatorRole {
  return role === 'admin' || role === 'super_admin';
}
