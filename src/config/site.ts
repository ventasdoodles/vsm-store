/**
 * // ─── CONFIGURACIÓN: Site Config ───
 * // Arquitectura: Config Provider (Lego Master)
 * // Proposito principal: Fuente única de verdad para identidad, contacto y lógica de WhatsApp.
 * // Regla / Notas: Constante inmutable. Sincronizada con VSM_STORE_FULL_CONTEXT.md.
 */
import { vsmStoreTenantConfig } from '@/config/productization';
import type { Order, CartItem } from '@/types/cart';

export const SITE_CONFIG = {
    // Identidad
    name: vsmStoreTenantConfig.displayName,
    description: vsmStoreTenantConfig.description,
    logo: vsmStoreTenantConfig.brand.logoPath,
    canonicalUrl: vsmStoreTenantConfig.canonicalUrl,

    // WhatsApp
    whatsapp: {
        number: vsmStoreTenantConfig.support.whatsappNumber, // Formato internacional sin +
        defaultMessage: vsmStoreTenantConfig.support.whatsappDefaultMessage,
    },

    // Contacto
    contact: {
        email: vsmStoreTenantConfig.support.email,
        phone: vsmStoreTenantConfig.support.phone,
    },

    // Ubicación física
    location: {
        address: vsmStoreTenantConfig.location.address,
        city: vsmStoreTenantConfig.location.city,
        state: vsmStoreTenantConfig.location.state,
        zipCode: vsmStoreTenantConfig.location.zipCode,
        country: vsmStoreTenantConfig.location.country,
        googleMapsUrl: vsmStoreTenantConfig.location.googleMapsUrl,
    },

    // Datos Bancarios Default
    bankAccount: `Banco: BBVA
Cuenta: 0123456789
CLABE: 012000001234567890
Beneficiario: VSM Store`,

    // Redes sociales
    social: {
        facebook: vsmStoreTenantConfig.social.facebook,
        instagram: vsmStoreTenantConfig.social.instagram,
        youtube: vsmStoreTenantConfig.social.youtube,
        tiktok: vsmStoreTenantConfig.social.tiktok,
        whatsapp: vsmStoreTenantConfig.social.whatsapp,
    },

    // Configuración de tienda
    store: {
        currency: vsmStoreTenantConfig.currency.code,
        currencySymbol: vsmStoreTenantConfig.currency.symbol,
        locale: vsmStoreTenantConfig.locale,
        timezone: vsmStoreTenantConfig.timezone,
    },

    // Template de mensaje WhatsApp para pedidos
    orderWhatsApp: {
        enabled: true,
        generateMessage: (order: Order): string => {
            const itemsText = order.items
                .map(
                    (item) => {
                        const variantText = (item as CartItem).variant_name ? ` (${(item as CartItem).variant_name})` : '';
                        return `• ${item.product.name}${variantText} x${item.quantity} — $${(item.product.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
                    }
                )
                .join('\n');

            const deliveryText =
                order.deliveryType === 'pickup'
                    ? '🏪 Recoger en tienda'
                    : `🚚 Envío a domicilio\n📍 ${order.address}`;

            const paymentText =
                order.paymentMethod === 'cash' ? '💵 Contra Entrega' :
                    order.paymentMethod === 'card' ? '💳 Tarjeta' :
                        '🏦 Transferencia / Depósito';

            return `
🛒 *NUEVO PEDIDO — VSM Store*

📋 Orden #${order.id}
👤 ${order.customerName}
📱 ${order.customerPhone}

*PRODUCTOS:*
${itemsText}

💰 *TOTAL: $${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN*

📦 ${deliveryText}
💳 ${paymentText}

⏰ ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}
      `.trim();
        },
    },
} as const;
