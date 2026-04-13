/**
 * VSM AI Validation Harness — Canonical Configuration
 * 
 * This file defines the architectural standards for the project's
 * semantic retrieval layer. Changing these values will cause the
 * suite to fail until infra is aligned.
 */

export const TEST_CONFIG = {
    // Canonical Model for Embeddings
    EMBEDDING_MODEL: 'models/gemini-embedding-001',
    
    // Canonical Dimensions (Standardized Dec 2025/March 2026)
    EMBEDDING_DIMENSIONS: 768,

    // Thresholds for Retrieval
    MIN_PRODUCT_SIMILARITY: 0.65,
    MIN_KNOWLEDGE_SIMILARITY: 0.50,
    
    // Test Queries (Golden Scenarios)
    SCENARIOS: [
        {
            query: '¿qué vapes tienes?',
            expected_capsule: 'product_search_integrity',
            must_include_products: false // It routes now
        },
        {
            query: '¿cuál es la política de envíos?',
            expected_capsule: 'knowledge_rag_foundation',
            must_include_text: null
        },
        {
            query: 'hola',
            expected_capsule: 'general_concierge_dialog',
            must_include_text: null
        }
    ]
};
