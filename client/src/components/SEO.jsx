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
    const storeName = settings.store_name || 'GBMarket';

    // ----------------------------------------------------
    // Dynamic Site URL & Replacements
    // ----------------------------------------------------
    const siteUrl = (settings.site_url || 'https://gbmarket.pk').replace(/\/$/, "");

    // Replace hardcoded domains safely if they exist in props
    const canonicalUrl = canonical ? canonical.replace(/https:\/\/gbmarket\.pk/g, siteUrl) : null;

    let processedStructuredData = structuredData;
    if (processedStructuredData) {
        const dataString = typeof processedStructuredData === 'string' ? processedStructuredData : JSON.stringify(processedStructuredData);
        processedStructuredData = dataString.replace(/https:\/\/gbmarket\.pk/g, siteUrl);
    }
    // ----------------------------------------------------

    const fullTitle = title ? `${title} | ${storeName}` : `${storeName} - Premium Dry Fruits & Nuts`;
    const metaDescription = description || settings.store_tagline || 'Premium organic dry fruits and nuts from Gilgit-Baltistan. Handpicked almonds, walnuts, pine nuts, and dried apricots delivered across Pakistan.';

    // Ensure we have an absolute URL for fallback image
    const fallbackImage = `${siteUrl}/placeholder.png`;
    let metaImage = ogImage || settings.hero_image_url || fallbackImage;
    if (metaImage) {
        metaImage = typeof metaImage === 'string' ? metaImage.replace(/https:\/\/gbmarket\.pk/g, siteUrl) : metaImage;
    }

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph */}
            <meta property="og:site_name" content={storeName} />
            <meta property="og:locale" content={settings.locale || "en_PK"} />
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
