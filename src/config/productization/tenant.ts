import type { TenantConfig } from './types';

export const vsmStoreTenantConfig = {
    id: 'vsm-store',
    displayName: 'VSM Store',
    description: 'Tu tienda de vape y productos 420',
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
        whatsappNumber: '5212281234567',
        whatsappDefaultMessage: 'Hola, vengo de VSM Store y quiero hacer un pedido',
        emailLabel: 'ayuda@vsmstore.com',
        email: 'ayuda@vsmstore.com',
        phoneLabel: 'Telefono de soporte VSM Store',
        phone: '2281234567',
    },
    location: {
        address: 'Av. Principal #123, Col. Centro',
        city: 'Acapulco',
        state: 'Guerrero',
        zipCode: '91000',
        country: 'México',
        googleMapsUrl: 'https://maps.google.com/',
    },
    social: {
        facebook: 'https://www.facebook.com/vsmstore',
        instagram: 'https://www.instagram.com/vsmstore',
        youtube: 'https://www.youtube.com/@vsmstore',
        tiktok: 'https://www.tiktok.com/@vsmstore',
        whatsapp: 'https://wa.me/5212281234567',
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
