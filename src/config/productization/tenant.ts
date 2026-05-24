import type { TenantConfig } from './types';

export const vsmStoreTenantConfig = {
    id: 'vsm-store',
    displayName: 'VSM Store',
    description: 'Tienda especializada en vape y productos 420',
    locale: 'es-MX',
    currency: {
        code: 'MXN',
        symbol: '$',
    },
    timezone: 'America/Mexico_City',
    brand: {
        logoPath: '/logo-vsm.png',
        primaryColorToken: 'vsm',
    },
    support: {
        whatsappLabel: 'WhatsApp VSM Store',
        emailLabel: 'ayuda@vsmstore.com',
        phoneLabel: 'Telefono de soporte VSM Store',
    },
    location: {
        city: 'Acapulco',
        state: 'Guerrero',
        country: 'Mexico',
    },
    policyLabels: {
        fulfillment: [
            'Envios nacionales por paqueteria',
            'Entrega personal no prometida',
            'Costo y alcance de envio confirmados antes de cerrar pedido',
        ],
        payment: [
            'Pago manual confirmado antes de avanzar pedido',
            'Transferencia o deposito como politica operativa actual',
        ],
        legal: [
            'Politicas de privacidad y terminos por tenant',
            'Caveats legales dependientes de vertical',
        ],
    },
    featureFlags: {
        catalog: true,
        cart: true,
        checkout: true,
        customerAccounts: true,
        wishlist: true,
        loyalty: true,
        admin: true,
        aiConcierge: true,
    },
} satisfies TenantConfig;
