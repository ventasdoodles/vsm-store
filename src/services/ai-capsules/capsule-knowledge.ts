import { supabase } from '@/lib/supabase';




import { knowledgeToolSchema } from '@/lib/ai-capsule-schemas';

import {
    buildDegradedKnowledgeContract,
    evaluateKnowledgeRAGTree
} from '@/lib/knowledge-rag-capsule';

import { InternalKnowledgeContractType } from '@/types/ai-capsule';































export async function executeKnowledgeCapsule(
  rawArgs: unknown
): Promise<InternalKnowledgeContractType> {
  const startMs = Date.now();

  // 1. INPUT NORMALIZATION & SCHEMA VALIDATION
  const validation = knowledgeToolSchema.safeParse(rawArgs);
  if (!validation.success) {
    return buildDegradedKnowledgeContract('SCHEMA_ERROR', Date.now() - startMs);
  }

  const toolArgs = validation.data;
  
  try {
    // 2. KNOWLEDGE RETRIEVAL HANDOFF
    // Generate embedding for query
    const { data: embedData, error: embedError } = await supabase.functions.invoke('embeddings-processor', {
      body: { text: toolArgs.query }
    });
    
    if (embedError || !embedData?.embedding) {
      return buildDegradedKnowledgeContract('VECTOR_TIMEOUT', Date.now() - startMs);
    }

    // Match against RAG store
    const { data: matches, error: matchError } = await supabase.rpc('match_knowledge', {
      query_embedding: embedData.embedding,
      match_threshold: 0.5,
      match_count: 3
    });
    
    if (matchError) {
      return buildDegradedKnowledgeContract('DB_LATENCY', Date.now() - startMs);
    }

    // 3. CAPSULE EVALUATION
    const contract = evaluateKnowledgeRAGTree(matches || [], toolArgs.is_ambiguous, Date.now() - startMs, toolArgs.query);
    
    // 4. STRUCTURED RESULT RETURN
    return contract;
  } catch (error) {
    console.error('[ai-capsule-orchestrator] Knowledge Error in executeKnowledgeCapsule:', error);
    return buildDegradedKnowledgeContract('DB_LATENCY', Date.now() - startMs);
  }
}
