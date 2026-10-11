import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleStorefrontKittingBasket } from '@/services/concierge/handlers/storefront-kitting-basket.handler';
import { handleStorefrontInventoryOutlook } from '@/services/concierge/handlers/storefront-inventory-outlook.handler';
import * as orchestrator from '@/services/ai-capsule-orchestrator.service';
import * as productsService from '@/services/products.service';
import * as stage5 from '@/lib/cesarin-stage5';
import { logAITelemetry } from '@/services/concierge/telemetry';
import type { DispatchClientCapsuleParams } from '@/services/concierge/dispatch.types';

vi.mock('@/services/concierge/telemetry', () => ({
    logAITelemetry: vi.fn().mockResolvedValue(undefined),
}));

describe('Kitting and Inventory Action Publishing Gates (Blocker 1)', () => {
    const mockProduct = {
        id: 'prod-1',
        name: 'Vape Pod Kit',
        slug: 'vape-pod-kit',
        price: 500,
        section: 'vape',
    } as any;

    const openCatalogGate = {
        is_open: true,
        reason: 'explicit_product_request' as const,
        primary_intent: 'search',
        explicit_product_request: true,
        search_leading: true,
        needs_clarification: false,
    };

    const closedCatalogGate = {
        is_open: false,
        reason: 'non_catalog_lane' as const,
        primary_intent: 'support',
        explicit_product_request: false,
        search_leading: false,
        needs_clarification: false,
    };

    const baseParams: DispatchClientCapsuleParams = {
        data: { tool_args: { query: 'test' } },
        query: 'test query',
        history: [],
        catalogGate: openCatalogGate,
        turnAnalysis: {
            turn_priority: 'primary',
            primary_intent: 'search',
            secondary_intents: [],
            commercial_move: 'KEEP_EXPLORING',
            turn_focus: 'catalog',
            current_turn_decision: 'USE_CAPABILITY',
        },
        invokeStart: Date.now(),
        effectiveTelemetrySessionId: 'sess-123',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(productsService, 'getProductsByIds').mockResolvedValue([mockProduct]);
    });

    describe('handleStorefrontKittingBasket', () => {
        it('suppresses next_step_view and visible products when catalog gate is closed', async () => {
            vi.spyOn(orchestrator, 'executeStorefrontKittingBasketCapsule').mockResolvedValue({
                execution_status: 'SUCCESS',
                match_strategy: 'FULL_KIT',
                resolved_products: [{ id: 'prod-1' } as any],
                customer_response_draft: 'Aquí está tu kit',
            } as any);

            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
                message: 'Aquí está tu kit',
                nextStep: {
                    family: 'ADD_READY',
                    surfaceKind: 'ACTIONABLE',
                    renderHint: 'SHOW',
                    guidance: 'Confirmar kit',
                    primaryAction: { kind: 'ADD_TO_CART', label: 'Agregar', product: mockProduct, quantity: 1 },
                    secondaryAction: null,
                    assistAction: null,
                },
            } as any);

            const result = await handleStorefrontKittingBasket(
                {
                    ...baseParams,
                    catalogGate: closedCatalogGate,
                },
                false
            );

            expect(result?.suggestedProducts).toEqual([]);
            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
        });

        it('suppresses next_step_view when renderHint is HIDE even if gate is open and products exist', async () => {
            vi.spyOn(orchestrator, 'executeStorefrontKittingBasketCapsule').mockResolvedValue({
                execution_status: 'SUCCESS',
                match_strategy: 'FULL_KIT',
                resolved_products: [{ id: 'prod-1' } as any],
                customer_response_draft: 'Aquí está tu kit',
            } as any);

            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
                message: 'Aquí está tu kit',
                nextStep: {
                    family: 'ADD_READY',
                    surfaceKind: 'ACTIONABLE',
                    renderHint: 'HIDE',
                    guidance: 'Confirmar kit',
                    primaryAction: { kind: 'ADD_TO_CART', label: 'Agregar', product: mockProduct, quantity: 1 },
                    secondaryAction: null,
                    assistAction: null,
                },
            } as any);

            const result = await handleStorefrontKittingBasket(baseParams, false);

            expect(result?.suggestedProducts).toHaveLength(1);
            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
        });

        it('publishes next_step_view when gate is open, products exist, and renderHint is SHOW', async () => {
            vi.spyOn(orchestrator, 'executeStorefrontKittingBasketCapsule').mockResolvedValue({
                execution_status: 'SUCCESS',
                match_strategy: 'FULL_KIT',
                resolved_products: [{ id: 'prod-1' } as any],
                customer_response_draft: 'Aquí está tu kit',
            } as any);

            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
                message: 'Aquí está tu kit',
                nextStep: {
                    family: 'ADD_READY',
                    surfaceKind: 'ACTIONABLE',
                    renderHint: 'SHOW',
                    guidance: 'Confirmar kit',
                    primaryAction: { kind: 'ADD_TO_CART', label: 'Agregar', product: mockProduct, quantity: 1 },
                    secondaryAction: null,
                    assistAction: null,
                },
            } as any);

            const result = await handleStorefrontKittingBasket(baseParams, false);

            expect(result?.suggestedProducts).toHaveLength(1);
            expect(result?.capsule_contract?.next_step_view).toBeDefined();
            expect(result?.capsule_contract?.next_step_view?.family).toBe('ADD_READY');
        });

        it('suppresses next_step_view and emits zero_results: true when gate is open but 0 products resolved', async () => {
            vi.spyOn(productsService, 'getProductsByIds').mockResolvedValue([]);
            vi.spyOn(orchestrator, 'executeStorefrontKittingBasketCapsule').mockResolvedValue({
                execution_status: 'SUCCESS',
                match_strategy: 'FULL_KIT',
                resolved_products: [{ id: 'prod-non-existent' } as any],
                customer_response_draft: 'Kit no disponible',
            } as any);

            const result = await handleStorefrontKittingBasket(baseParams, false);

            expect(result?.suggestedProducts).toEqual([]);
            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
            expect(logAITelemetry).toHaveBeenCalledWith(
                expect.objectContaining({
                    zero_results: true,
                    product_card_count: 0,
                    has_product_cards: false,
                    catalog_gate_open: true,
                })
            );
        });
    });

    describe('handleStorefrontInventoryOutlook', () => {
        it('suppresses next_step_view and visible products when catalog gate is closed', async () => {
            vi.spyOn(orchestrator, 'executeStorefrontInventoryOutlookCapsule').mockResolvedValue({
                execution_status: 'SUCCESS',
                match_strategy: 'EXACT_MATCH',
                inventory_outlook_signal: { kind: 'IN_STOCK_ONLINE' },
                resolved_products: [{ id: 'prod-1' } as any],
                customer_response_draft: 'Producto disponible',
            } as any);

            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
                message: 'Producto disponible',
                nextStep: {
                    family: 'REVIEW_ONE',
                    surfaceKind: 'ACTIONABLE',
                    renderHint: 'SHOW',
                    guidance: 'Ver disponibilidad',
                    primaryAction: { kind: 'SELECT_OPTION', label: 'Ver', product: mockProduct },
                    secondaryAction: null,
                    assistAction: null,
                },
            } as any);

            const result = await handleStorefrontInventoryOutlook(
                {
                    ...baseParams,
                    catalogGate: closedCatalogGate,
                },
                false
            );

            expect(result?.suggestedProducts).toEqual([]);
            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
        });

        it('suppresses next_step_view when renderHint is HIDE even if gate is open and product is in stock', async () => {
            vi.spyOn(orchestrator, 'executeStorefrontInventoryOutlookCapsule').mockResolvedValue({
                execution_status: 'SUCCESS',
                match_strategy: 'EXACT_MATCH',
                inventory_outlook_signal: { kind: 'IN_STOCK_ONLINE' },
                resolved_products: [{ id: 'prod-1' } as any],
                customer_response_draft: 'Producto disponible',
            } as any);

            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
                message: 'Producto disponible',
                nextStep: {
                    family: 'REVIEW_ONE',
                    surfaceKind: 'ACTIONABLE',
                    renderHint: 'HIDE',
                    guidance: 'Ver disponibilidad',
                    primaryAction: { kind: 'SELECT_OPTION', label: 'Ver', product: mockProduct },
                    secondaryAction: null,
                    assistAction: null,
                },
            } as any);

            const result = await handleStorefrontInventoryOutlook(baseParams, false);

            expect(result?.suggestedProducts).toHaveLength(1);
            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
        });

        it('suppresses next_step_view when stock signal is not reviewable/restock (e.g. OUT_OF_STOCK)', async () => {
            vi.spyOn(orchestrator, 'executeStorefrontInventoryOutlookCapsule').mockResolvedValue({
                execution_status: 'SUCCESS',
                match_strategy: 'EXACT_MATCH',
                inventory_outlook_signal: { kind: 'OUT_OF_STOCK' as any },
                resolved_products: [{ id: 'prod-1' } as any],
                customer_response_draft: 'Agotado',
            } as any);

            vi.spyOn(stage5, 'buildCesarinActionableNextStepView').mockReturnValue({
                message: 'Agotado',
                nextStep: {
                    family: 'KEEP_EXPLORING',
                    surfaceKind: 'INFORMATIONAL',
                    renderHint: 'SHOW',
                    guidance: 'Explorar otras opciones',
                    primaryAction: null,
                    secondaryAction: null,
                    assistAction: null,
                },
            } as any);

            const result = await handleStorefrontInventoryOutlook(baseParams, false);

            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
        });

        it('suppresses next_step_view and emits zero_results: true when gate is open but 0 products resolved', async () => {
            vi.spyOn(productsService, 'getProductsByIds').mockResolvedValue([]);
            vi.spyOn(orchestrator, 'executeStorefrontInventoryOutlookCapsule').mockResolvedValue({
                execution_status: 'SUCCESS',
                match_strategy: 'EXACT_MATCH',
                inventory_outlook_signal: { kind: 'IN_STOCK_ONLINE' },
                resolved_products: [{ id: 'prod-non-existent' } as any],
                customer_response_draft: 'Producto no disponible',
            } as any);

            const result = await handleStorefrontInventoryOutlook(baseParams, false);

            expect(result?.suggestedProducts).toEqual([]);
            expect(result?.capsule_contract?.next_step_view).toBeUndefined();
            expect(logAITelemetry).toHaveBeenCalledWith(
                expect.objectContaining({
                    zero_results: true,
                    product_card_count: 0,
                    has_product_cards: false,
                    catalog_gate_open: true,
                })
            );
        });
    });
});
