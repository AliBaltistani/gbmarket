import { Helmet } from 'react-helmet-async';
import { useSettings } from '../context/SettingsContext';

export default function SEO({
    title,
    description,
    canonical,
    ogImage,
    type = 'website',
    noindex = false,
}) {
    const { settings } = useSettings();
    const storeName = settings.store_name || 'GBMarket';
    const fullTitle = title ? `${title} | ${storeName}` : `${storeName} - Premium Dry Fruits & Nuts`;
    const metaDescription = description || settings.store_tagline || 'Premium organic dry fruits and nuts from Gilgit-Baltistan. Handpicked almonds, walnuts, pine nuts, and dried apricots delivered across Pakistan.';
    const metaImage = ogImage || settings.hero_image_url || '';

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:type" content={type} />
            {metaImage && <meta property="og:image" content={metaImage} />}
            {canonical && <meta property="og:url" content={canonical} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            {metaImage && <meta name="twitter:image" content={metaImage} />}
        </Helmet>
    );
}
