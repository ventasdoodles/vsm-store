/**
 * Google Analytics 4 Integration
 * Tracks events: view_item, add_to_cart, begin_checkout, purchase
 */

declare global {
    interface Window {
        gtag: (command: string, targetId: string, config?: any) => void;
        dataLayer: any[];
    }
}

export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with actual ID

export const pageView = (url: string) => {
    if (window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }
};

interface AnalyticsEvent {
    action: string;
    params?: Record<string, any>;
}

export const trackEvent = ({ action, params }: AnalyticsEvent) => {
    if (window.gtag) {
        window.gtag('event', action, params);
    } else {
        console.log('[Analytics] Event:', action, params);
    }
};

// E-commerce events helpers
export const trackViewItem = (product: any) => {
    trackEvent({
        action: 'view_item',
        params: {
            currency: 'MXN',
            value: product.price,
            items: [{
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_category: product.category?.name || product.section,
            }]
        }
    });
};

export const trackAddToCart = (product: any, quantity: number = 1) => {
    trackEvent({
        action: 'add_to_cart',
        params: {
            currency: 'MXN',
            value: product.price * quantity,
            items: [{
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                quantity: quantity
            }]
        }
    });
};
