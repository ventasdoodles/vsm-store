import { getStorefrontCheckoutTransitionView } from '@/lib/domain/cart';
import { getStorefrontOpenOrderRecoveryView } from '@/lib/domain/orders';
import { checkoutSchema } from '@/lib/domain/validations/checkout.schema';
import { getStorefrontProductPurchaseability, getVariantDisplayName } from '@/lib/domain/products';
import { getAddresses } from '@/services/addresses.service';
import { validateCoupon } from '@/services/coupons.service';
import { getCustomerOpenRecoverableOrder } from '@/services/orders.service';
import { getProductsByIds } from '@/services/products.service';
import { getStoreSettings } from '@/services/settings.service';
import type { CartValidationIssue, CartValidationResult } from '@/stores/cart.store';
import { useCartStore } from '@/stores/cart.store';
import type { CartItem, CheckoutFormData } from '@/types/cart';

type CheckoutReadinessKind =
  | 'READY_TO_CHECKOUT'
  | 'MISSING_REQUIRED_INFO'
  | 'CART_BLOCKER'
  | 'PAYMENT_METHOD_INFO'
  | 'SHIPPING_INFO_AVAILABLE'
  | 'SHIPPING_INFO_PARTIAL'
  | 'AUTH_REQUIRED';

type CheckoutMatchStrategy = CheckoutReadinessKind;

type CheckoutFocus = 'checkout' | 'payment' | 'shipping' | 'cart';
type CheckoutScope = 'CHECKOUT_DRAFT' | 'CART_VALIDATION' | 'PAYMENT_METHODS' | 'AUTHENTICATED_OPEN_ORDER' | 'NONE';
type CheckoutRetrievalSource = 'CHECKOUT_DRAFT' | 'CART_VALIDATION' | 'STORE_PAYMENT_SETTINGS' | 'AUTHENTICATED_ORDER_RECOVERY' | 'NONE';
type MissingField = 'customer_name' | 'customer_phone' | 'shipping_address' | 'payment_method';
type BlockerReason = 'empty_cart' | 'inventory_conflict' | 'open_recoverable_order' | 'mercadopago_auth_required' | 'none';
type EnabledPaymentMethod = 'transfer' | 'mercadopago' | 'cash';

interface CheckoutDraftSnapshot {
  customerName: string;
  customerPhone: string;
  deliveryType: 'pickup' | 'delivery' | null;
  address: string;
  paymentMethod: EnabledPaymentMethod | null;
}

interface CartSnapshot {
  items: CartItem[];
  validationResult: CartValidationResult;
}

interface CouponSignal {
  couponCode: string | null;
  couponValid: boolean | null;
  couponMessage: string | null;
}

export interface StorefrontCheckoutReadinessResolution {
  kind: CheckoutReadinessKind;
  message: string;
  retrievalSource: CheckoutRetrievalSource;
  matchStrategy: CheckoutMatchStrategy;
  signal: {
    kind: CheckoutReadinessKind;
    focus: CheckoutFocus;
    scope: CheckoutScope;
    cart_item_count: number;
    purchasable_item_count: number;
    checkout_status?: 'ready' | 'review' | 'blocked' | null;
    delivery_type?: 'pickup' | 'delivery' | null;
    payment_method?: EnabledPaymentMethod | null;
    enabled_payment_methods: EnabledPaymentMethod[];
    missing_fields: MissingField[];
    blocker_reason?: BlockerReason | null;
    can_proceed_to_checkout: boolean;
    can_submit_checkout: boolean;
    open_order_id?: string | null;
    open_order_number?: string | null;
    coupon_code?: string | null;
    coupon_valid?: boolean | null;
    coupon_message?: string | null;
    shipping_quote_available?: boolean | null;
  };
}

const DEFAULT_PAYMENT_METHODS: Record<EnabledPaymentMethod, boolean> = {
  transfer: true,
  mercadopago: false,
  cash: false,
};

function normalizeText(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s%-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectFocus(query: string): CheckoutFocus {
  const normalized = normalizeText(query);

  if (/\b(ya puedo pagar|puedo pagar ahorita|que me falta para cerrar|que me falta para comprar|me falta algo para comprar|ya esta listo mi carrito|listo mi carrito|listo para pagar|cerrar la compra|cerrar compra|checkout)\b/.test(normalized)) {
    return 'checkout';
  }

  if (/\b(aceptan tarjeta|aceptan efectivo|aceptan transferencia|como pago|como puedo pagar|pago con tarjeta|mercado pago|tarjeta|transferencia|efectivo)\b/.test(normalized)) {
    return 'payment';
  }

  if (/\b(cuanto sale el envio|cuanto cuesta el envio|envio a domicilio|costo de envio|costo del envio|pickup|recoger en tienda|recoger|domicilio|envio)\b/.test(normalized)) {
    return 'shipping';
  }

  return 'checkout';
}

function readCheckoutDraft(): CheckoutDraftSnapshot {
  if (typeof window === 'undefined') {
    return {
      customerName: '',
      customerPhone: '',
      deliveryType: null,
      address: '',
      paymentMethod: null,
    };
  }

  try {
    const raw = window.sessionStorage.getItem('vsm_checkout_form');
    if (!raw) {
      return {
        customerName: '',
        customerPhone: '',
        deliveryType: null,
        address: '',
        paymentMethod: null,
      };
    }

    const parsed = JSON.parse(raw) as Partial<CheckoutFormData> | null;
    const paymentMethod = parsed?.paymentMethod === 'transfer'
      || parsed?.paymentMethod === 'mercadopago'
      || parsed?.paymentMethod === 'cash'
      ? parsed.paymentMethod
      : null;

    return {
      customerName: typeof parsed?.customerName === 'string' ? parsed.customerName : '',
      customerPhone: typeof parsed?.customerPhone === 'string' ? parsed.customerPhone : '',
      deliveryType: parsed?.deliveryType === 'pickup' || parsed?.deliveryType === 'delivery'
        ? parsed.deliveryType
        : null,
      address: typeof parsed?.address === 'string' ? parsed.address : '',
      paymentMethod,
    };
  } catch (error) {
    console.error('[storefront-checkout-readiness] Error extracting checkout values:', error);
    return {
      customerName: '',
      customerPhone: '',
      deliveryType: null,
      address: '',
      paymentMethod: null,
    };
  }
}

async function buildCartSnapshot(items: CartItem[]): Promise<CartSnapshot> {
  if (items.length === 0) {
    return {
      items: [],
      validationResult: {
        issues: [],
        hasIssues: false,
      },
    };
  }

  try {
    const currentProducts = await getProductsByIds(items.map((item) => item.product.id));
    const productMap = new Map(currentProducts.map((product) => [product.id, product]));
    const issues: CartValidationIssue[] = [];
    const normalizedItems: CartItem[] = [];

    for (const item of items) {
      const current = productMap.get(item.product.id);
      const displayName = item.variant_name
        ? `${item.product.name} (${item.variant_name})`
        : item.product.name;

      if (!current || !current.is_active || current.status === 'discontinued') {
        issues.push({
          productId: item.product.id,
          productName: displayName,
          type: 'removed',
        });
        continue;
      }

      const purchaseability = getStorefrontProductPurchaseability(current, {
        selectedVariantId: item.variant_id ?? null,
      });

      if (!purchaseability.canAddToCart) {
        issues.push({
          productId: item.product.id,
          productName: displayName,
          type: item.variant_id || purchaseability.requiresVariantSelection ? 'variant_removed' : 'out_of_stock',
        });
        continue;
      }

      if (current.price !== item.product.price) {
        issues.push({
          productId: item.product.id,
          productName: displayName,
          type: 'price_changed',
          oldValue: item.product.price,
          newValue: current.price,
        });
      }

      const clampedQty = Math.min(item.quantity, purchaseability.maxQuantity);
      if (clampedQty < item.quantity) {
        issues.push({
          productId: item.product.id,
          productName: displayName,
          type: item.variant_id ? 'variant_stock_adjusted' : 'stock_adjusted',
          oldValue: item.quantity,
          newValue: clampedQty,
        });
      }

      normalizedItems.push({
        product: current,
        quantity: clampedQty,
        variant_id: item.variant_id ?? null,
        variant_name: item.variant_id
          ? getVariantDisplayName(purchaseability.selectedVariant)
          : item.variant_name ?? null,
      });
    }

    return {
      items: normalizedItems,
      validationResult: {
        issues,
        hasIssues: issues.length > 0,
      },
    };
  } catch (error) {
    console.error('[storefront-checkout-readiness] Error preparing contextual cart:', error);
    return {
      items,
      validationResult: {
        issues: [],
        hasIssues: false,
      },
    };
  }
}

function listEnabledPaymentMethods(raw: Record<string, unknown> | null | undefined): EnabledPaymentMethod[] {
  const merged = {
    ...DEFAULT_PAYMENT_METHODS,
    ...(raw ?? {}),
  };

  return (Object.entries(merged) as Array<[EnabledPaymentMethod, boolean]>)
    .filter(([, enabled]) => enabled === true)
    .map(([method]) => method);
}

function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
}

function extractCouponCode(query: string): string | null {
  const normalized = normalizeText(query);
  if (!/\b(cupon|coupon|descuento)\b/.test(normalized)) return null;

  const directMatch = query.match(/\b(?:cupon|coupon)\s+([A-Z0-9-]{4,20})\b/i);
  if (directMatch?.[1]) {
    return directMatch[1].trim().toUpperCase();
  }

  return null;
}

async function resolveCouponSignal(query: string, subtotal: number, customerId?: string | null): Promise<CouponSignal> {
  const couponCode = extractCouponCode(query);
  if (!couponCode || subtotal <= 0) {
    return {
      couponCode,
      couponValid: null,
      couponMessage: null,
    };
  }

  try {
    const validation = await validateCoupon(couponCode, subtotal, customerId ?? undefined);
    return {
      couponCode,
      couponValid: validation.valid,
      couponMessage: validation.message,
    };
  } catch (error) {
    console.error('[storefront-checkout-readiness] Error evaluating active coupon:', error);
    return {
      couponCode,
      couponValid: null,
      couponMessage: null,
    };
  }
}

function detectMissingFields(input: {
  draft: CheckoutDraftSnapshot;
  shippingAddressCount: number;
  enabledPaymentMethods: EnabledPaymentMethod[];
}): MissingField[] {
  const missingFields: MissingField[] = [];

  if (!checkoutSchema.shape.customerName.safeParse(input.draft.customerName).success) {
    missingFields.push('customer_name');
  }

  if (!checkoutSchema.shape.customerPhone.safeParse(input.draft.customerPhone).success) {
    missingFields.push('customer_phone');
  }

  if (!input.draft.paymentMethod || !input.enabledPaymentMethods.includes(input.draft.paymentMethod)) {
    missingFields.push('payment_method');
  }

  if (input.draft.deliveryType === 'delivery' && input.draft.address.trim().length < 5 && input.shippingAddressCount === 0) {
    missingFields.push('shipping_address');
  }

  return missingFields;
}

function buildMissingFieldsLine(missingFields: MissingField[], shippingAddressCount: number): string {
  const labels = missingFields.map((field) => {
    switch (field) {
      case 'customer_name':
        return 'nombre';
      case 'customer_phone':
        return 'telefono';
      case 'payment_method':
        return 'metodo de pago';
      case 'shipping_address':
        return shippingAddressCount > 0 ? 'elegir una direccion guardada o capturar una nueva' : 'direccion de envio';
    }
  });

  return labels.join(', ');
}

function describePaymentMethods(enabledPaymentMethods: EnabledPaymentMethod[], isAuthenticated: boolean): string {
  if (enabledPaymentMethods.length === 0) {
    return 'Ahorita no veo metodos de pago activos para prometerte uno desde esta capa.';
  }

  const labels = enabledPaymentMethods.map((method) => {
    switch (method) {
      case 'transfer':
        return 'transferencia o deposito';
      case 'mercadopago':
        return isAuthenticated ? 'tarjeta por Mercado Pago' : 'tarjeta por Mercado Pago entrando a tu cuenta';
      case 'cash':
        return 'efectivo contra entrega';
    }
  });

  return `Ahorita el storefront tiene activo ${labels.join(', ')}.`;
}

function buildResolution(input: {
  kind: CheckoutReadinessKind;
  focus: CheckoutFocus;
  scope: CheckoutScope;
  message: string;
  retrievalSource: CheckoutRetrievalSource;
  matchStrategy: CheckoutMatchStrategy;
  cartItemCount: number;
  purchasableItemCount: number;
  checkoutStatus?: 'ready' | 'review' | 'blocked' | null;
  deliveryType?: 'pickup' | 'delivery' | null;
  paymentMethod?: EnabledPaymentMethod | null;
  enabledPaymentMethods: EnabledPaymentMethod[];
  missingFields?: MissingField[];
  blockerReason?: BlockerReason | null;
  canProceedToCheckout?: boolean;
  canSubmitCheckout?: boolean;
  openOrderId?: string | null;
  openOrderNumber?: string | null;
  coupon?: CouponSignal | null;
  shippingQuoteAvailable?: boolean | null;
}): StorefrontCheckoutReadinessResolution {
  return {
    kind: input.kind,
    message: input.message,
    retrievalSource: input.retrievalSource,
    matchStrategy: input.matchStrategy,
    signal: {
      kind: input.kind,
      focus: input.focus,
      scope: input.scope,
      cart_item_count: input.cartItemCount,
      purchasable_item_count: input.purchasableItemCount,
      checkout_status: input.checkoutStatus ?? null,
      delivery_type: input.deliveryType ?? null,
      payment_method: input.paymentMethod ?? null,
      enabled_payment_methods: input.enabledPaymentMethods,
      missing_fields: input.missingFields ?? [],
      blocker_reason: input.blockerReason ?? null,
      can_proceed_to_checkout: input.canProceedToCheckout ?? false,
      can_submit_checkout: input.canSubmitCheckout ?? false,
      open_order_id: input.openOrderId ?? null,
      open_order_number: input.openOrderNumber ?? null,
      coupon_code: input.coupon?.couponCode ?? null,
      coupon_valid: input.coupon?.couponValid ?? null,
      coupon_message: input.coupon?.couponMessage ?? null,
      shipping_quote_available: input.shippingQuoteAvailable ?? null,
    },
  };
}

function buildCouponLine(coupon: CouponSignal): string {
  if (!coupon.couponCode || !coupon.couponMessage) return '';

  return coupon.couponValid === true
    ? ` Ademas, el cupon ${coupon.couponCode} si valida ahorita: ${coupon.couponMessage}.`
    : ` Sobre el cupon ${coupon.couponCode}, la validacion actual dice: ${coupon.couponMessage}.`;
}

export async function resolveStorefrontCheckoutReadiness(input: {
  customerId?: string | null;
  query: string;
}): Promise<StorefrontCheckoutReadinessResolution> {
  const focus = detectFocus(input.query);
  const draft = readCheckoutDraft();
  const cartState = useCartStore.getState();
  const rawItems = cartState.items ?? [];
  const cartSnapshot = await buildCartSnapshot(rawItems);
  const subtotal = getSubtotal(cartSnapshot.items);
  const [settings, shippingAddresses, openRecoverableOrder, couponSignal] = await Promise.all([
    getStoreSettings().catch(() => null),
    input.customerId ? getAddresses(input.customerId).catch(() => []) : Promise.resolve([]),
    input.customerId ? getCustomerOpenRecoverableOrder(input.customerId).catch(() => null) : Promise.resolve(null),
    resolveCouponSignal(input.query, subtotal, input.customerId ?? null),
  ]);

  const enabledPaymentMethods = listEnabledPaymentMethods(settings?.payment_methods);
  const shippingAddressCount = shippingAddresses.filter((address) => address.type === 'shipping').length;
  const transitionView = getStorefrontCheckoutTransitionView(cartSnapshot.items, cartSnapshot.validationResult, null);
  const recoveryView = openRecoverableOrder ? getStorefrontOpenOrderRecoveryView(openRecoverableOrder) : null;
  const missingFields = detectMissingFields({
    draft,
    shippingAddressCount,
    enabledPaymentMethods,
  });

  if (focus === 'payment') {
    const paymentInfoLine = describePaymentMethods(enabledPaymentMethods, Boolean(input.customerId));
    const selectedMethodLine = draft.paymentMethod
      ? ` En tu draft actual traes ${draft.paymentMethod === 'mercadopago' ? 'Mercado Pago' : draft.paymentMethod === 'transfer' ? 'transferencia' : 'efectivo'} como metodo seleccionado.`
      : '';
    const authLine = !input.customerId && enabledPaymentMethods.includes('mercadopago')
      ? ' Si quieres cerrar con tarjeta desde este storefront, esa via pasa por Mercado Pago con cuenta autenticada.'
      : '';

    return buildResolution({
      kind: 'PAYMENT_METHOD_INFO',
      focus,
      scope: 'PAYMENT_METHODS',
      message: `${paymentInfoLine}${selectedMethodLine}${authLine}${buildCouponLine(couponSignal)}`.trim(),
      retrievalSource: 'STORE_PAYMENT_SETTINGS',
      matchStrategy: 'PAYMENT_METHOD_INFO',
      cartItemCount: rawItems.length,
      purchasableItemCount: cartSnapshot.items.length,
      checkoutStatus: transitionView.status,
      deliveryType: draft.deliveryType,
      paymentMethod: draft.paymentMethod,
      enabledPaymentMethods,
      missingFields,
      blockerReason: draft.paymentMethod === 'mercadopago' && !input.customerId ? 'mercadopago_auth_required' : 'none',
      canProceedToCheckout: transitionView.canProceedToCheckout,
      canSubmitCheckout: transitionView.canSubmitCheckout,
      coupon: couponSignal,
      shippingQuoteAvailable: null,
    });
  }

  if (focus === 'shipping') {
    if (draft.deliveryType === 'pickup') {
      return buildResolution({
        kind: 'SHIPPING_INFO_AVAILABLE',
        focus,
        scope: 'CHECKOUT_DRAFT',
        message: 'En tu draft actual traes recoger en tienda, asi que no depende de envio a domicilio para cerrar la compra.',
        retrievalSource: 'CHECKOUT_DRAFT',
        matchStrategy: 'SHIPPING_INFO_AVAILABLE',
        cartItemCount: rawItems.length,
        purchasableItemCount: cartSnapshot.items.length,
        checkoutStatus: transitionView.status,
        deliveryType: draft.deliveryType,
        paymentMethod: draft.paymentMethod,
        enabledPaymentMethods,
        missingFields,
        blockerReason: 'none',
        canProceedToCheckout: transitionView.canProceedToCheckout,
        canSubmitCheckout: transitionView.canSubmitCheckout,
        coupon: couponSignal,
        shippingQuoteAvailable: true,
      });
    }

    if (draft.deliveryType === 'delivery' && draft.address.trim().length < 5 && shippingAddressCount === 0) {
      return buildResolution({
        kind: 'MISSING_REQUIRED_INFO',
        focus,
        scope: 'CHECKOUT_DRAFT',
        message: 'Si quieres envio a domicilio, te falta una direccion valida antes de cerrar. Ahorita no te voy a inventar una tarifa exacta porque esta capa no expone una cotizacion confiable de envio.',
        retrievalSource: 'CHECKOUT_DRAFT',
        matchStrategy: 'MISSING_REQUIRED_INFO',
        cartItemCount: rawItems.length,
        purchasableItemCount: cartSnapshot.items.length,
        checkoutStatus: transitionView.status,
        deliveryType: draft.deliveryType,
        paymentMethod: draft.paymentMethod,
        enabledPaymentMethods,
        missingFields: Array.from(new Set([...missingFields, 'shipping_address'])),
        blockerReason: 'none',
        canProceedToCheckout: transitionView.canProceedToCheckout,
        canSubmitCheckout: false,
        coupon: couponSignal,
        shippingQuoteAvailable: false,
      });
    }

    return buildResolution({
      kind: 'SHIPPING_INFO_PARTIAL',
      focus,
      scope: draft.deliveryType ? 'CHECKOUT_DRAFT' : 'NONE',
      message: draft.deliveryType === 'delivery'
        ? 'Si vas por envio a domicilio y ya tienes direccion valida, lo que si puedo confirmar es el requisito de direccion. No te voy a inventar una tarifa exacta porque la verdad actual del storefront no expone una cotizacion confiable aqui.'
        : 'El storefront permite recoger o envio a domicilio, pero desde aqui no te voy a inventar una tarifa exacta de envio. Lo que si aplica es que para domicilio hace falta una direccion valida antes de cerrar.',
      retrievalSource: 'CHECKOUT_DRAFT',
      matchStrategy: 'SHIPPING_INFO_PARTIAL',
      cartItemCount: rawItems.length,
      purchasableItemCount: cartSnapshot.items.length,
      checkoutStatus: transitionView.status,
      deliveryType: draft.deliveryType,
      paymentMethod: draft.paymentMethod,
      enabledPaymentMethods,
      missingFields,
      blockerReason: 'none',
      canProceedToCheckout: transitionView.canProceedToCheckout,
      canSubmitCheckout: transitionView.canSubmitCheckout,
      coupon: couponSignal,
      shippingQuoteAvailable: false,
    });
  }

  if (recoveryView?.shouldRecover && openRecoverableOrder) {
    return buildResolution({
      kind: 'CART_BLOCKER',
      focus,
      scope: 'AUTHENTICATED_OPEN_ORDER',
      message: recoveryView.submitBlockedDetail,
      retrievalSource: 'AUTHENTICATED_ORDER_RECOVERY',
      matchStrategy: 'CART_BLOCKER',
      cartItemCount: rawItems.length,
      purchasableItemCount: cartSnapshot.items.length,
      checkoutStatus: transitionView.status,
      deliveryType: draft.deliveryType,
      paymentMethod: draft.paymentMethod,
      enabledPaymentMethods,
      missingFields,
      blockerReason: 'open_recoverable_order',
      canProceedToCheckout: false,
      canSubmitCheckout: false,
      openOrderId: openRecoverableOrder.id,
      openOrderNumber: openRecoverableOrder.order_number,
      coupon: couponSignal,
      shippingQuoteAvailable: null,
    });
  }

  if (rawItems.length === 0 || transitionView.status === 'blocked') {
    return buildResolution({
      kind: 'CART_BLOCKER',
      focus,
      scope: 'CART_VALIDATION',
      message: transitionView.detail,
      retrievalSource: 'CART_VALIDATION',
      matchStrategy: 'CART_BLOCKER',
      cartItemCount: rawItems.length,
      purchasableItemCount: cartSnapshot.items.length,
      checkoutStatus: transitionView.status,
      deliveryType: draft.deliveryType,
      paymentMethod: draft.paymentMethod,
      enabledPaymentMethods,
      missingFields,
      blockerReason: rawItems.length === 0 ? 'empty_cart' : 'inventory_conflict',
      canProceedToCheckout: transitionView.canProceedToCheckout,
      canSubmitCheckout: transitionView.canSubmitCheckout,
      coupon: couponSignal,
      shippingQuoteAvailable: null,
    });
  }

  if (draft.paymentMethod === 'mercadopago' && !input.customerId) {
    return buildResolution({
      kind: 'AUTH_REQUIRED',
      focus,
      scope: 'CHECKOUT_DRAFT',
      message: 'Tu carrito puede pasar, pero para cerrar con tarjeta por Mercado Pago desde este storefront necesitas entrar a tu cuenta. No te voy a prometer ese paso sin sesion autenticada.',
      retrievalSource: 'CHECKOUT_DRAFT',
      matchStrategy: 'AUTH_REQUIRED',
      cartItemCount: rawItems.length,
      purchasableItemCount: cartSnapshot.items.length,
      checkoutStatus: transitionView.status,
      deliveryType: draft.deliveryType,
      paymentMethod: draft.paymentMethod,
      enabledPaymentMethods,
      missingFields,
      blockerReason: 'mercadopago_auth_required',
      canProceedToCheckout: transitionView.canProceedToCheckout,
      canSubmitCheckout: false,
      coupon: couponSignal,
      shippingQuoteAvailable: null,
    });
  }

  if (missingFields.length > 0) {
    return buildResolution({
      kind: 'MISSING_REQUIRED_INFO',
      focus,
      scope: 'CHECKOUT_DRAFT',
      message: `Tu carrito si tiene base para checkout, pero todavia te falta ${buildMissingFieldsLine(missingFields, shippingAddressCount)} antes de cerrar.${buildCouponLine(couponSignal)}`.trim(),
      retrievalSource: 'CHECKOUT_DRAFT',
      matchStrategy: 'MISSING_REQUIRED_INFO',
      cartItemCount: rawItems.length,
      purchasableItemCount: cartSnapshot.items.length,
      checkoutStatus: transitionView.status,
      deliveryType: draft.deliveryType,
      paymentMethod: draft.paymentMethod,
      enabledPaymentMethods,
      missingFields,
      blockerReason: 'none',
      canProceedToCheckout: transitionView.canProceedToCheckout,
      canSubmitCheckout: false,
      coupon: couponSignal,
      shippingQuoteAvailable: null,
    });
  }

  const readinessLine = transitionView.status === 'review'
    ? 'Tu carrito ya puede pasar a checkout, pero conviene revisar los ajustes o advertencias vigentes antes de confirmar.'
    : 'Si, con lo que veo ahorita tu carrito esta listo para pasar a checkout.';

  return buildResolution({
    kind: 'READY_TO_CHECKOUT',
    focus,
    scope: 'CART_VALIDATION',
    message: `${readinessLine} ${transitionView.detail}${buildCouponLine(couponSignal)}`.trim(),
    retrievalSource: 'CART_VALIDATION',
    matchStrategy: 'READY_TO_CHECKOUT',
    cartItemCount: rawItems.length,
    purchasableItemCount: cartSnapshot.items.length,
    checkoutStatus: transitionView.status,
    deliveryType: draft.deliveryType,
    paymentMethod: draft.paymentMethod,
    enabledPaymentMethods,
    missingFields,
    blockerReason: 'none',
    canProceedToCheckout: transitionView.canProceedToCheckout,
    canSubmitCheckout: transitionView.canSubmitCheckout,
    coupon: couponSignal,
    shippingQuoteAvailable: null,
  });
}
