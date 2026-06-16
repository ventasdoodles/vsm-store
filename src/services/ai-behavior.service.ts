import { supabase } from '@/lib/supabase';

export interface AIBehaviorRule {
    id: string;
    rule_text: string;
    type: 'MUST_DO' | 'NEVER_DO';
    is_active: boolean;
    created_at: string;
}

export async function getBehaviorRules() {
    const { data, error } = await supabase
        .from('ai_behavior_rules')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AIBehaviorRule[];
}

export async function createBehaviorRule(rule: { rule_text: string; type: 'MUST_DO' | 'NEVER_DO' }) {
    const { data, error } = await supabase
        .from('ai_behavior_rules')
        .insert([rule])
        .select()
        .single();

    if (error) throw error;
    return data as AIBehaviorRule;
}

export async function toggleBehaviorRule(id: string, is_active: boolean) {
    const { data, error } = await supabase
        .from('ai_behavior_rules')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as AIBehaviorRule;
}

export async function deleteBehaviorRule(id: string) {
    const { error } = await supabase
        .from('ai_behavior_rules')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
