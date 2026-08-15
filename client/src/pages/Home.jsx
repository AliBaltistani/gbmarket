import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { getHomepageSections } from '../api/homepage';

// Dynamic Section Components
import HeroBanner from '../components/homepage/HeroBanner';
import ProductCarousel from '../components/homepage/ProductCarousel';
import ProductGrid from '../components/homepage/ProductGrid';
import CategoryShowcase from '../components/homepage/CategoryShowcase';
import BannerImage from '../components/homepage/BannerImage';
import PromoCards from '../components/homepage/PromoCards';
import ReviewsSection from '../components/homepage/ReviewsSection';

const SECTION_COMPONENTS = {
    hero_banner: HeroBanner,
    product_carousel: ProductCarousel,
    product_grid: ProductGrid,
    category_showcase: CategoryShowcase,
    banner_image: BannerImage,
    promo_cards: PromoCards,
    reviews: ReviewsSection,
};

export default function Home() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const data = await getHomepageSections();
                setSections(data);
            } catch (error) {
                console.error('Error fetching homepage sections:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSections();
    }, []);

    if (loading) {
        return (
            <div className="space-y-10 sm:space-y-16 pb-16">
                <SEO
                    title="Home"
                    description="Shop premium organic dry fruits and nuts from Gilgit-Baltistan."
                />
                <div className="max-w-7xl mx-auto mt-3">
                    <div className="rounded-3xl bg-[#F5EFE0]/40 border border-[#E8DEC8] animate-pulse h-72 mx-4" />
                </div>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 rounded-2xl bg-[#F5EFE0]/40 border border-[#E8DEC8] animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 sm:space-y-16 pb-16">
            <SEO
                title="Home"
                description="Shop premium organic dry fruits and nuts from Gilgit-Baltistan. Handpicked almonds, walnuts, pine nuts, and sun-dried apricots delivered across Pakistan."
            />

            {sections.map(section => {
                const Component = SECTION_COMPONENTS[section.section_type];
                if (!Component) return null;
                return <Component key={section.id} config={section.config} />;
            })}

            {sections.length === 0 && !loading && (
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <p className="text-[#3A2E1F]/60 text-sm">Homepage content is being configured. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
