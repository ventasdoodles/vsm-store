import type { Product } from '@/types/product';

/**
 * Google Analytics 4 Integration
 * Tracks events: view_item, add_to_cart, begin_checkout, purchase
 */

declare global {
    interface Window {
        gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void;
        dataLayer: Record<string, unknown>[];
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
    params?: Record<string, unknown>;
}

export const trackEvent = ({ action, params }: AnalyticsEvent) => {
    if (window.gtag) {
        window.gtag('event', action, params);
    }
};

// E-commerce events helpers
export const trackViewItem = (product: Product) => {
    trackEvent({
        action: 'view_item',
        params: {
            currency: 'MXN',
            value: product.price,
            items: [{
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_category: product.category_id || product.section,
            }]
        }
    });
};

export const trackAddToCart = (product: Product, quantity: number = 1) => {
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

export const trackAIInteraction = (action: string, params?: Record<string, any>) => {
    trackEvent({
        action: `ai_${action}`,
        params
    });
};
