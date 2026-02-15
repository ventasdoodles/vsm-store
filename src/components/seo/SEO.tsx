import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
}

export function SEO({
    title,
    description,
    image,
    url,
    type = 'website',
}: SEOProps) {
    const siteTitle = SITE_CONFIG.name;
    const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || SITE_CONFIG.description;
    const metaImage = image || SITE_CONFIG.logo;
    const metaUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
}
