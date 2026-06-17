import type { CustomerPreferenceSummary } from './memory.ts';

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function includesAnyTerm(haystack: string, terms: string[]): boolean {
  return terms.some((term) => haystack.includes(normalizeText(term)));
}

function hasQueryBudgetSignal(query: string): boolean {
  return /(barato|economico|economica|presupuesto|no tan caro|premium|algo mas pro|mas pro|subirle un poco)/.test(query);
}

function hasQueryFlavorSignal(query: string): boolean {
  return /(frutal|dulce|fresco|menta|ice|tabaco|cremoso|tropical|mango|fresa|sandia|melon|uva|mora|cereza|caramelo)/.test(query);
}

function hasQueryFormatSignal(query: string): boolean {
  return /(desechable|pod|sales|liquido|cartucho|kit|mod)/.test(query);
}

function hasQueryIntensitySignal(query: string): boolean {
  return /(suave|tranqui|leve|fuerte|intenso|pegador)/.test(query);
}

function hasQueryExperienceSignal(query: string): boolean {
  return /(simple|sencillo|facil|sin tanto rollo|avanzado|algo mas avanzado|pro)/.test(query);
}

function looksBroadCommercialQuery(query: string): boolean {
  return /(recomiend|algo|busco|quiero|me conviene|me late|cual|cuales|opcion|opciones)/.test(query);
}

function hasStrongCommercialMemory(summary: CustomerPreferenceSummary | null | undefined): boolean {
  if (!summary) return false;

  return (
    summary.confirmed_likes.length > 0 ||
    summary.explicit_likes.length > 0 ||
    summary.rejected_preferences.length > 0 ||
    summary.format_preferences.length > 0 ||
    summary.brand_affinity.length > 0 ||
    Boolean(summary.budget_posture) ||
    Boolean(summary.intensity_posture) ||
    Boolean(summary.experience_posture)
  );
}

export function buildCesarinCommercialMemoryPromptGuidance(
  summary: CustomerPreferenceSummary | null | undefined,
  query: string,
): string | null {
  if (!hasStrongCommercialMemory(summary)) return null;

  const normalizedQuery = normalizeText(query);
  const parts: string[] = [];
  const broadCommercialQuery = looksBroadCommercialQuery(normalizedQuery);

  if (broadCommercialQuery) {
    parts.push(
      'Si la peticion viene amplia y la memoria trae senal fuerte, reduce preguntas redundantes y arranca por la opcion que mejor encaje con lo que ya le suele latir.',
    );
  }

  if (hasQueryFlavorSignal(normalizedQuery) && includesAnyTerm(normalizedQuery, summary?.rejected_preferences ?? [])) {
    parts.push('Si hoy el cliente trae una preferencia nueva que choque con rechazos previos, gana lo de hoy.');
  }

  if ((summary?.rejected_preferences?.length ?? 0) > 0 && !hasQueryFlavorSignal(normalizedQuery)) {
    parts.push(
      `Evita insistir en caminos que ya rechazo si no hay una senal actual que los reactive: ${summary?.rejected_preferences?.join(', ')}.`,
    );
  }

  if ((summary?.confirmed_likes?.length ?? 0) > 0 && !hasQueryFlavorSignal(normalizedQuery)) {
    parts.push(
      `Cuando la consulta sea abierta, puedes sesgar la primera recomendacion hacia gustos confirmados sin venderlos como ley: ${summary?.confirmed_likes?.join(', ')}.`,
    );
  }

  if ((summary?.explicit_likes?.length ?? 0) > 0 && !hasQueryFlavorSignal(normalizedQuery)) {
    parts.push(
      `Los gustos explicitos recientes sirven como sesgo comercial suave, no como verdad absoluta: ${summary?.explicit_likes?.join(', ')}.`,
    );
  }

  if (summary?.budget_posture && !hasQueryBudgetSignal(normalizedQuery)) {
    parts.push(`Respeta la postura de presupuesto al sugerir o cerrar: ${summary.budget_posture}.`);
  }

  if (summary?.format_preferences?.length && !hasQueryFormatSignal(normalizedQuery)) {
    parts.push(`Si nada en el turno actual pide otro formato, empieza por formatos que ya le cierran: ${summary.format_preferences.join(', ')}.`);
  }

  if (summary?.brand_affinity?.length && !includesAnyTerm(normalizedQuery, summary.brand_affinity)) {
    parts.push(`La afinidad de marca solo sirve para desempatar o priorizar mejor, no para cerrar en automatico: ${summary.brand_affinity.join(', ')}.`);
  }

  if (summary?.intensity_posture && !hasQueryIntensitySignal(normalizedQuery)) {
    parts.push(`Usa la postura de intensidad solo como sesgo de comparacion o desempate: ${summary.intensity_posture}.`);
  }

  if (summary?.experience_posture && !hasQueryExperienceSignal(normalizedQuery)) {
    parts.push(`Si la memoria ya marca simple vs avanzado, evita preguntas de mas salvo que el turno actual contradiga eso: ${summary.experience_posture}.`);
  }

  parts.push('En comparaciones o recovery aproximado, usa la memoria para ordenar mejor opciones y evitar callejones repetidos, pero nunca para inventar diferencias ni vender aproximaciones como exactas.');

  return parts.join(' ');
}
