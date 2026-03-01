import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
    name: string;
    item: string; // URL
}

interface BreadcrumbJsonLdProps {
    items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    if (!items || items.length === 0) return null;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vsmstore.com';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item.startsWith('http') ? item.item : `${baseUrl}${item.item}`
        }))
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
    );
}
