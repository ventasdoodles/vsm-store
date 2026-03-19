/**
 * Cart Operator Capsule — Execution Middleware
 * Boundary Status: MIDDLEWARE (Consumes pure contract, mutates store state)
 * Responsibility: Executing safe mutations to cart.store.ts based on capsule proposals.
 */

import { useCartStore } from '@/stores/cart.store';
import { getProductsByIds } from '@/services/products.service';
import type { InternalCartOperatorContractType } from '@/types/ai-capsule';

export interface CartExecutionResult {
    executed: boolean;
    code: 'ADDED' | 'REMOVED' | 'UPDATED' | 'AMBIGUOUS' | 'UNSAFE' | 'NOT_FOUND' | 'ERROR';
    product?: string;
    qty?: number;
}

export async function executeCartMutation(
    contract: InternalCartOperatorContractType
): Promise<CartExecutionResult> {
    // 1. Safe Execution Gating
    // Reject anything that is not explicitly confirmed as an EXACT mutation
    if (contract.match_strategy !== 'EXACT_MUTATION_PROPOSED' || !contract.mutation_proposal) {
        if (contract.match_strategy === 'AMBIGUOUS_MUTATION') {
            return { executed: false, code: 'AMBIGUOUS' };
        }
        if (contract.match_strategy === 'UNSAFE_MUTATION') {
            return { executed: false, code: 'UNSAFE' };
        }
        return { executed: false, code: 'ERROR' };
    }

    const proposal = contract.mutation_proposal;
    const store = useCartStore.getState();

    if (!proposal.resolved_product_id) {
        return { executed: false, code: 'NOT_FOUND' };
    }

    try {
        // 2. Fetch Strict Catalog Truth
        // We do not trust the LLM's pricing or info; we fetch the real product entity
        const products = await getProductsByIds([proposal.resolved_product_id]);
        if (!products || products.length === 0 || !products[0]) {
            return { executed: false, code: 'NOT_FOUND' };
        }
        
        const product = products[0];

        // 3. Dispatch to Zustand Store
        switch (proposal.type) {
            case 'ADD':
                store.addItem(product, proposal.quantity);
                return { executed: true, code: 'ADDED', product: product.name, qty: proposal.quantity };
            
            case 'REMOVE':
                store.removeItem(product.id, proposal.resolved_variant_id ?? null);
                return { executed: true, code: 'REMOVED', product: product.name };
            
            case 'UPDATE_QTY':
                store.updateQuantity(product.id, proposal.quantity, proposal.resolved_variant_id ?? null);
                return { executed: true, code: 'UPDATED', product: product.name, qty: proposal.quantity };
            
            default:
                return { executed: false, code: 'ERROR' };
        }
    } catch (e) {
        console.error('[CartOperator] Execution failed:', e);
        return { executed: false, code: 'ERROR' };
    }
}
