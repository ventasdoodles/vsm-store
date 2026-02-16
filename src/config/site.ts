// Configuración centralizada - VSM Store
import type { Order } from '@/types/cart';

export const SITE_CONFIG = {
    // Identidad
    name: 'VSM Store',
    description: 'Tu tienda de vape y productos 420',
    logo: '/logo-vsm.png',

    // WhatsApp
    whatsapp: {
        number: '5212281234567', // Formato internacional sin +
        defaultMessage: 'Hola, vengo de VSM Store y quiero hacer un pedido',
    },

    // Contacto
    contact: {
        email: 'ayuda@vsmstore.com',
        phone: '2281234567',
    },

    // Ubicación física
    location: {
        address: 'Av. Principal #123, Col. Centro',
        city: 'Xalapa',
        state: 'Veracruz',
        zipCode: '91000',
        country: 'México',
        googleMapsUrl: 'https://maps.google.com/',
    },

    // Redes sociales
    social: {
        facebook: 'https://www.facebook.com/vsmstore',
        instagram: 'https://www.instagram.com/vsmstore',
        youtube: 'https://www.youtube.com/@vsmstore',
        whatsapp: 'https://wa.me/5212281234567',
    },

    // Configuración de tienda
    store: {
        currency: 'MXN',
        currencySymbol: '$',
        locale: 'es-MX',
        timezone: 'America/Mexico_City',
    },

    // Template de mensaje WhatsApp para pedidos
    orderWhatsApp: {
        enabled: true,
        generateMessage: (order: Order): string => {
            const itemsText = order.items
                .map(
                    (item) =>
                        `• ${item.product.name} x${item.quantity} — $${(item.product.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                )
                .join('\n');

            const deliveryText =
                order.deliveryType === 'pickup'
                    ? '🏪 Recoger en tienda'
                    : `🚚 Envío a domicilio\n📍 ${order.address}`;

            const paymentText =
                order.paymentMethod === 'cash' ? '💵 Efectivo' : '🏦 Transferencia bancaria';

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
