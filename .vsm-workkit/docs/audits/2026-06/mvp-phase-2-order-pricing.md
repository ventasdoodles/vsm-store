# MVP Phase 2: Order Creation & Pricing

Al auditar la implementación actual del repositorio descubrimos que la Fase 2 ya estaba completada.
1. La UI de cliente (en `DetailsFormStep.tsx` y `new/$serviceType.tsx`) captura de forma robusta la información de origen, destino, descripción y método de pago (validado por E2E tests).
2. El motor de tarifas base (`pricingService.ts`) implementa las tarifas base correctas por tipo de servicio.
3. El submit handler (`useOrderSubmit.ts`) inserta en la base de datos `base_fare`, `customer_offer_fare` y `estimated_cost`.

Se procedió a reconciliar la documentación `VSM_STORE_DOMAIN_MODEL.md` para reflejar el modelo de marketplace (`base_fare`, `customer_offer_fare`, etc) sobre el antiguo concepto de `quoted_price`.
- `npm run typecheck` and `npm run lint` passed cleanly.
- Tests automáticos reportaron éxito.
