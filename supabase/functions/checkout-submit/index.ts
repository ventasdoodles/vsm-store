import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type CheckoutForm = {
    customerName: string;
    customerPhone: string;
    deliveryType: 'pickup' | 'delivery';
    address?: string;
    paymentMethod: 'transfer' | 'mercadopago' | 'cash';
};

type CheckoutItemInput = {
    product_id: string;
    quantity: number;
    variant_id?: string | null;
    variant_name?: string | null;
};

type CheckoutRequest = {
    form: CheckoutForm;
    items: CheckoutItemInput[];
    shippingAddressId?: string | null;
    shippingAddressText?: string | null;
    couponCode?: string | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

function isValidPhone(value: string) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10;
}

function validateForm(form: CheckoutForm) {
    if (!form.customerName || form.customerName.trim().length < 3) {
        return 'El nombre debe tener al menos 3 caracteres';
    }
    if (!form.customerPhone || !isValidPhone(form.customerPhone)) {
        return 'El telefono debe tener al menos 10 digitos';
    }
    if (form.deliveryType !== 'pickup' && form.deliveryType !== 'delivery') {
        return 'Tipo de entrega invalido';
    }
    if (!['transfer', 'mercadopago', 'cash'].includes(form.paymentMethod)) {
        return 'Metodo de pago invalido';
    }
    if (form.deliveryType === 'delivery' && (!form.address || form.address.trim().length < 5)) {
        return 'La direccion es requerida para envios a domicilio';
    }
    return null;
}

function validateItems(items: CheckoutItemInput[]) {
    if (!Array.isArray(items) || items.length === 0) return 'El carrito esta vacio';
    for (const item of items) {
        if (!item?.product_id || typeof item.product_id !== 'string') return 'Producto invalido';
        if (!item?.quantity || item.quantity <= 0) return 'Cantidad invalida';
    }
    return null;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return jsonResponse({ ok: false, message: 'Metodo no permitido' }, 405);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return jsonResponse({ ok: false, message: 'Servidor mal configurado' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!bearerToken) {
        return jsonResponse({ ok: false, message: 'Sesion requerida' }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
    const user = authData?.user;
    if (authError || !user) {
        return jsonResponse({ ok: false, message: 'Sesion requerida' }, 401);
    }

    let payload: CheckoutRequest;
    try {
        payload = (await req.json()) as CheckoutRequest;
    } catch {
        return jsonResponse({ ok: false, message: 'Payload invalido' }, 400);
    }

    const formError = validateForm(payload.form);
    if (formError) return jsonResponse({ ok: false, message: formError }, 400);

    const itemsError = validateItems(payload.items);
    if (itemsError) return jsonResponse({ ok: false, message: itemsError }, 400);

    const productIds = Array.from(new Set(payload.items.map((i) => i.product_id)));
    const variantIds = Array.from(
        new Set(
            payload.items
                .map((i) => i.variant_id)
                .filter((id): id is string => typeof id === 'string' && id.length > 0)
        )
    );

    const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, name, price, stock, status, is_active, images, section')
        .in('id', productIds);

    if (productError || !products) {
        return jsonResponse({ ok: false, message: 'No se pudieron cargar productos' }, 500);
    }

    const { data: variants, error: variantError } = variantIds.length
        ? await supabase
              .from('product_variants')
              .select('id, product_id, price, stock, is_active, images')
              .in('id', variantIds)
        : { data: [], error: null };

    if (variantError) {
        return jsonResponse({ ok: false, message: 'No se pudieron cargar variantes' }, 500);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map((variants || []).map((v) => [v.id, v]));

    const orderItems = [];
    let subtotal = 0;

    for (const item of payload.items) {
        const product = productMap.get(item.product_id);
        if (!product || !product.is_active || product.status !== 'active') {
            return jsonResponse({ ok: false, message: 'Producto no disponible' }, 400);
        }

        let unitPrice = Number(product.price);
        let availableStock = Number(product.stock);
        let image = Array.isArray(product.images) ? product.images[0] : null;

        if (item.variant_id) {
            const variant = variantMap.get(item.variant_id);
            if (!variant || variant.product_id !== product.id || !variant.is_active) {
                return jsonResponse({ ok: false, message: 'Variante no disponible' }, 400);
            }
            if (variant.price !== null && variant.price !== undefined) {
                unitPrice = Number(variant.price);
            }
            availableStock = Number(variant.stock);
            if (Array.isArray(variant.images) && variant.images.length > 0) {
                image = variant.images[0];
            }
        }

        if (!Number.isFinite(unitPrice)) {
            return jsonResponse({ ok: false, message: 'Precio invalido' }, 400);
        }

        if (availableStock <= 0 || item.quantity > availableStock) {
            return jsonResponse({ ok: false, message: 'Inventario insuficiente' }, 400);
        }

        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
            product_id: product.id,
            variant_id: item.variant_id ?? null,
            variant_name: item.variant_name ?? null,
            name: product.name,
            price: unitPrice,
            quantity: item.quantity,
            image: image || null,
            section: product.section,
        });
    }

    let discount = 0;
    let appliedCoupon: { code: string } | null = null;

    if (payload.couponCode && payload.couponCode.trim().length > 0) {
        const code = payload.couponCode.trim().toUpperCase();
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('code, discount_type, discount_value, min_purchase, max_uses, used_count, is_active, valid_from, valid_until')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (couponError || !coupon) {
            return jsonResponse({ ok: false, message: 'Cupon no valido' }, 400);
        }

        const now = new Date();
        if (coupon.valid_from && new Date(coupon.valid_from) > now) {
            return jsonResponse({ ok: false, message: 'Cupon no vigente' }, 400);
        }
        if (coupon.valid_until && new Date(coupon.valid_until) < now) {
            return jsonResponse({ ok: false, message: 'Cupon expirado' }, 400);
        }
        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return jsonResponse({ ok: false, message: 'Cupon agotado' }, 400);
        }
        if (subtotal < Number(coupon.min_purchase)) {
            return jsonResponse({ ok: false, message: 'Compra minima no alcanzada' }, 400);
        }

        const { data: used } = await supabase
            .from('customer_coupons')
            .select('id')
            .eq('customer_id', user.id)
            .eq('coupon_code', coupon.code)
            .limit(1);

        if (used && used.length > 0) {
            return jsonResponse({ ok: false, message: 'Cupon ya utilizado' }, 400);
        }

        if (coupon.discount_type === 'percentage') {
            discount = Math.round((subtotal * Number(coupon.discount_value)) / 100 * 100) / 100;
        } else {
            discount = Math.min(Number(coupon.discount_value), subtotal);
        }

        appliedCoupon = { code: coupon.code };
    }

    let shippingAddressId: string | null = payload.shippingAddressId || null;
    let shippingAddressSnapshot: Record<string, unknown> | null = null;

    if (payload.form.deliveryType === 'delivery') {
        if (shippingAddressId) {
            const { data: address, error: addressError } = await supabase
                .from('addresses')
                .select('id, label, full_name, street, number, colony, city, state, zip_code, phone, notes')
                .eq('id', shippingAddressId)
                .eq('customer_id', user.id)
                .single();

            if (addressError || !address) {
                return jsonResponse({ ok: false, message: 'Direccion no valida' }, 400);
            }

            shippingAddressSnapshot = {
                id: address.id,
                label: address.label,
                full_name: address.full_name,
                street: address.street,
                number: address.number,
                colony: address.colony,
                city: address.city,
                state: address.state,
                zip_code: address.zip_code,
                phone: address.phone,
                notes: address.notes,
            };
        } else if (payload.shippingAddressText && payload.shippingAddressText.trim().length >= 5) {
            shippingAddressSnapshot = { raw: payload.shippingAddressText.trim() };
        } else if (payload.form.address && payload.form.address.trim().length >= 5) {
            shippingAddressSnapshot = { raw: payload.form.address.trim() };
        } else {
            return jsonResponse({ ok: false, message: 'Direccion requerida' }, 400);
        }
    } else {
        shippingAddressId = null;
    }

    const total = Math.max(subtotal - discount, 0);

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_id: user.id,
            customer_name: payload.form.customerName,
            customer_phone: payload.form.customerPhone,
            delivery_type: payload.form.deliveryType,
            items: orderItems,
            subtotal,
            shipping_cost: 0,
            discount,
            total,
            status: 'pending',
            payment_method: payload.form.paymentMethod,
            payment_status: 'pending',
            shipping_address_id: shippingAddressId,
            shipping_address_snapshot: shippingAddressSnapshot,
        })
        .select('id')
        .single();

    if (orderError || !order) {
        return jsonResponse({ ok: false, message: 'No se pudo crear el pedido' }, 500);
    }

    const orderItemsRows = orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        variant_name: item.variant_name,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        section: item.section,
    }));

    const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemsRows);
    if (orderItemsError) {
        await supabase.from('orders').delete().eq('id', order.id);
        return jsonResponse({ ok: false, message: 'No se pudo crear el pedido' }, 500);
    }

    if (appliedCoupon) {
        try {
            await supabase.from('customer_coupons').insert({
                customer_id: user.id,
                coupon_code: appliedCoupon.code,
                order_id: order.id,
            });
            await supabase.rpc('increment_coupon_uses', { target_coupon_code: appliedCoupon.code });
        } catch {
            // Coupon application failure should not invalidate the order
        }
    }

    return jsonResponse({ ok: true, orderId: order.id });
});
