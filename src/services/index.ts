/**
 * Storefront Services Barrel
 * Centraliza las exportaciones de los servicios públicos/storefront.
 */

export * from './addresses.service';
export * from './auth.service';
export * from './brands.service';
export * from './bundle.service';
export * from './categories.service';
export * from './concierge.service';
export * from './coupons.service';
export * from './flash-deals.service';
export * from './gamification.service';
export * from './inventory.service';
export * from './loyalty.service';
export * from './monitoring.service';
export * from './notifications.service';
export * from './orders.service';
export * from './products.service';
export * from './search.service';
export * from './settings.service';
export * from './stats.service';
export * from './storage.service';
export * from './testimonials.service';
export * from './tracking.service';
export * from './voice.service';
export * from './wishlist.service';
export * from './payments/mercadopago.service';
export { STOREFRONT_ORDER_STATUS as ORDER_STATUS } from '@/lib/domain/orders';
export type { StorefrontOrderStatus as OrderStatus } from '@/lib/domain/orders';
export type { OrderRecord, OrderItem, CreateOrderData } from '@/types/order';



