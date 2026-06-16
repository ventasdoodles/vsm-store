import { supabase } from '@/lib/supabase';

export interface Concept {
  id: string;
  name: string;
  concept_type: string;
  brand?: string;
  product_id?: string;
  alias_count?: number;
  relation_count?: number;
}

export interface Alias {
  id: string;
  concept_id: string;
  alias: string;
}

export interface Relation {
  id: string;
  concept_a_id: string;
  concept_b_id: string;
  relation_type: string;
  scope: 'specific_model' | 'class_generalization';
  status: 'confirmed_compatible' | 'confirmed_incompatible' | 'unknown_unconfirmed';
  notes?: string;
  concept_a?: { name: string };
  concept_b?: { name: string };
}

export const adminCompatibilityService = {
  async fetchConcepts(search?: string): Promise<Concept[]> {
    const normalizedSearch = search?.trim().toLowerCase();

    const query = supabase
      .from('product_concepts')
      .select(`
        *,
        concept_aliases(count),
        outgoing_relations:compatibility_relations!concept_a_id(count),
        incoming_relations:compatibility_relations!concept_b_id(count)
      `);

    const { data, error } = await query.order('name');
    if (error) throw error;

    const concepts = data.map((c: { concept_aliases?: { count: number }[], outgoing_relations?: { count: number }[], incoming_relations?: { count: number }[], name: string, id: string, brand: string | null, concept_type: "VEHICLE_MODEL" | "SPARE_PART" | "GENERIC" | "BRAND_ONLY" | "CATEGORY" }) => ({
      ...c,
      brand: c.brand ?? undefined,
      alias_count: c.concept_aliases?.[0]?.count || 0,
      relation_count: (c.outgoing_relations?.[0]?.count || 0) + (c.incoming_relations?.[0]?.count || 0)
    }));

    if (!normalizedSearch) {
      return concepts;
    }

    const { data: aliasMatches, error: aliasError } = await supabase
      .from('concept_aliases')
      .select('concept_id')
      .ilike('alias', `%${search}%`);

    if (aliasError) throw aliasError;

    const aliasConceptIds = new Set((aliasMatches ?? []).map((alias: { concept_id: string }) => alias.concept_id));

    return concepts.filter((concept) => {
      const nameMatch = concept.name.toLowerCase().includes(normalizedSearch);
      const brandMatch = (concept.brand ?? '').toLowerCase().includes(normalizedSearch);
      const aliasMatch = aliasConceptIds.has(concept.id);

      return nameMatch || brandMatch || aliasMatch;
    });
  },

  async fetchAliases(conceptId: string): Promise<Alias[]> {
    const { data, error } = await supabase
      .from('concept_aliases')
      .select('*')
      .eq('concept_id', conceptId);
    
    if (error) throw error;
    return data;
  },

  async fetchRelations(conceptId: string): Promise<Relation[]> {
    const { data, error } = await supabase
      .from('compatibility_relations')
      .select(`
        *,
        concept_a:product_concepts!concept_a_id(name),
        concept_b:product_concepts!concept_b_id(name)
      `)
      .or(`concept_a_id.eq.${conceptId},concept_b_id.eq.${conceptId}`);
    
    if (error) throw error;
    return data;
  },

  async updateRelation(id: string, updates: Partial<Relation>): Promise<void> {
    const { error } = await supabase
      .from('compatibility_relations')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteRelation(id: string): Promise<void> {
    const { error } = await supabase
      .from('compatibility_relations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async addAlias(conceptId: string, alias: string): Promise<void> {
    const { error } = await supabase
      .from('concept_aliases')
      .insert({ concept_id: conceptId, alias });
    
    if (error) throw error;
  },

  async removeAlias(id: string): Promise<void> {
    const { error } = await supabase
      .from('concept_aliases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async addRelation(payload: { concept_a_id: string; concept_b_id: string; relation_type: string; scope: string; status: string; notes?: string }): Promise<void> {
    const { error } = await supabase
      .from('compatibility_relations')
      .insert(payload);
    
    if (error) throw error;
  },

  async addConcept(payload: { name: string; concept_type: string; brand?: string }): Promise<void> {
    const { error } = await supabase
      .from('product_concepts')
      .insert(payload);
    
    if (error) throw error;
  }
};
