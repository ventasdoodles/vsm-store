// JSON-LD Structured Data para productos — mejora SEO y Google Shopping
import { Helmet } from 'react-helmet-async';
import type { Product } from '@/types/product';
import { SITE_CONFIG } from '@/config/site';

interface ProductJsonLdProps {
    product: Product;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
    const url = `${window.location.origin}/${product.section}/${product.slug}`;
    const image = product.cover_image || product.images?.[0] || SITE_CONFIG.logo;

    const availability = !product.is_active || product.status === 'discontinued'
        ? 'https://schema.org/Discontinued'
        : product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || product.short_description || `${product.name} - ${SITE_CONFIG.name}`,
        image: image.startsWith('http') ? image : `${window.location.origin}${image}`,
        url,
        sku: product.sku || product.id,
        brand: {
            '@type': 'Brand',
            name: SITE_CONFIG.name,
        },
        offers: {
            '@type': 'Offer',
            url,
            priceCurrency: SITE_CONFIG.store.currency,
            price: product.price.toFixed(2),
            availability,
            seller: {
                '@type': 'Organization',
                name: SITE_CONFIG.name,
            },
            ...(product.compare_at_price && product.compare_at_price > product.price
                ? {
                    priceValidUntil: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toISOString().split('T')[0],
                }
                : {}),
        },
        ...(product.category_id ? { category: product.section } : {}),
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
    );
}
