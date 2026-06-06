import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '@/config/site';

export function OrganizationJsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: typeof window !== 'undefined' ? window.location.origin : SITE_CONFIG.canonicalUrl,
        logo: typeof window !== 'undefined' ? `${window.location.origin}${SITE_CONFIG.logo}` : `${SITE_CONFIG.canonicalUrl}${SITE_CONFIG.logo}`,
        sameAs: [
            SITE_CONFIG.social.instagram,
            SITE_CONFIG.social.whatsapp,
            SITE_CONFIG.social.facebook,
            SITE_CONFIG.social.tiktok,
            SITE_CONFIG.social.youtube,
        ].filter(Boolean),
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: SITE_CONFIG.contact.phone,
            contactType: 'customer service',
            availableLanguage: 'es'
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
    );
}
