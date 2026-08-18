import { Helmet } from 'react-helmet-async';
import { useSettings } from '../context/SettingsContext';

export default function SEO({
    title,
    description,
    canonical,
    ogImage,
    type = 'website',
    noindex = false,
    structuredData,
}) {
    const { settings } = useSettings();
    const storeName = settings.store_name || 'Our Store';

    // ----------------------------------------------------
    // Dynamic Site URL
    // ----------------------------------------------------
    const siteUrl = (settings.site_url || '').replace(/\/$/, "");

    const canonicalUrl = canonical || null;

    let processedStructuredData = structuredData;
    if (processedStructuredData) {
        processedStructuredData = typeof processedStructuredData === 'string' ? processedStructuredData : JSON.stringify(processedStructuredData);
    }
    // ----------------------------------------------------

    const fullTitle = title ? `${title} | ${storeName}` : `${storeName} - Premium Products`;
    const metaDescription = description || settings.store_tagline || 'Premium natural products delivered straight to your door.';

    // Ensure we have an absolute URL for fallback image
    const fallbackImage = `${siteUrl}/placeholder.png`;
    let metaImage = ogImage || settings.hero_image_url || fallbackImage;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph */}
            <meta property="og:site_name" content={storeName} />
            <meta property="og:locale" content={settings.locale || "en_US"} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:type" content={type} />
            {metaImage && <meta property="og:image" content={metaImage} />}
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            {metaImage && <meta name="twitter:image" content={metaImage} />}

            {/* JSON-LD Structured Data */}
            {processedStructuredData && (
                <script type="application/ld+json">
                    {processedStructuredData}
                </script>
            )}
        </Helmet>
    );
}
