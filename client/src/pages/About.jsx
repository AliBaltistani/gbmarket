import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Award, ShieldCheck, Heart, Truck, Sparkles, ArrowRight, CheckCircle2, Users, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import { useSettings } from '../context/SettingsContext';
import { useCurrency } from '../hooks/useCurrency';

export default function About() {
    const { settings } = useSettings();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        // window.scrollTo(0, 0); // Handled by RouteTransition
    }, []);

    // Feature cards: either from settings JSON or generic defaults
    const defaultFeatures = [
        { icon: 'Leaf', title: 'Premium Quality', description: 'Carefully sourced and quality-checked products for your satisfaction.' },
        { icon: 'Users', title: 'Direct Sourcing', description: 'We partner directly with suppliers, ensuring fair trade and authentic quality.' },
        { icon: 'ShieldCheck', title: 'Quality Guaranteed', description: 'Every product undergoes quality checks before reaching you.' },
        { icon: 'Truck', title: 'Fast Delivery', description: 'Carefully packaged and delivered to your doorstep quickly and safely.' }
    ];
    const iconMap = { Leaf, Users, ShieldCheck, Truck, Award, Heart, Sparkles, MapPin };
    let features = defaultFeatures;
    try {
        if (settings.about_features) {
            const parsed = typeof settings.about_features === 'string' ? JSON.parse(settings.about_features) : settings.about_features;
            if (Array.isArray(parsed) && parsed.length > 0) features = parsed;
        }
    } catch { /* use defaults */ }

    return (
        <div className="space-y-16 pb-16">
            <SEO
                title={`About Us - ${settings.store_name || 'Store'}`}
                description={settings.store_tagline || "Learn about our mission and journey."}
                canonical={`${window.location.origin}/about`}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": window.location.origin
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "About Us",
                            "item": `${window.location.origin}/about`
                        }
                    ]
                }}
            />

            {/* 1. HERO BANNER */}
            <section className="bg-gradient-to-r from-[#F5EFE0] via-[#F5A623]/20 to-[#F5EFE0] border-b border-[#E8DEC8] py-16 px-4 sm:px-6 lg:px-8 text-center rounded-3xl max-w-7xl mx-auto mt-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 text-[#D97706] rounded-full text-xs font-bold uppercase tracking-wider border border-[#E8DEC8]">
                        <Sparkles className="w-4 h-4" />
                        <span>{settings.about_badge_text || 'Our Journey & Heritage'}</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#3A2E1F]">
                        {settings.about_hero_heading || 'Welcome to Our Store'}
                    </h1>
                    <p className="text-base text-[#3A2E1F]/80 leading-relaxed font-body whitespace-pre-line">
                        {settings.about_hero_subheading || 'We are dedicated to bringing you the finest quality products, sourced with care and delivered to your doorstep.'}
                    </p>
                </div>
            </section>

            {/* 2. BRAND STORY SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-8 sm:p-12 shadow-sm">
                    <div className="space-y-6">
                        <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block">
                            The {settings.store_name || 'Store'} Story
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F] leading-tight">
                            {settings.about_story_heading || 'Sourced From High Altitude Orchards'}
                        </h2>
                        <div className="text-sm text-[#3A2E1F]/80 leading-relaxed font-body whitespace-pre-line space-y-4">
                            {settings.about_story_text || 'We are passionate about delivering the highest quality products to our customers. Every item in our collection is carefully sourced and quality-checked to ensure you receive nothing but the best.\n\nOur commitment to excellence means we work directly with trusted suppliers, ensuring authenticity and freshness in every order.'}
                        </div>
                        <div className="pt-2 space-y-2">
                            <div className="flex items-center gap-3 text-xs font-bold text-[#3A2E1F]">
                                <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                                <span>{settings.about_bullet_1 || 'Premium Quality & Authentic Products'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-[#3A2E1F]">
                                <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                                <span>{settings.about_bullet_2 || 'Carefully Sourced & Verified'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex justify-center">
                        <div className="w-full max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-lg border-4 border-[#F5A623]">
                            <img
                                src={settings.about_story_image || "https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=800"}
                                alt={settings.about_story_image_alt || 'Our sourcing and quality process'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. WHY CHOOSE US FEATURE BLOCKS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="text-3xl font-extrabold font-heading text-[#3A2E1F]">Why Choose {settings.store_name || 'Us'}?</h2>
                    <p className="text-sm text-[#3A2E1F]/70">We prioritize quality, authenticity, and customer satisfaction above all.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((item, idx) => {
                        const IconComponent = typeof item.icon === 'string' ? (iconMap[item.icon] || Leaf) : item.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-6 space-y-3 text-center sm:text-left hover:border-[#F5A623] hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/20 text-[#D97706] flex items-center justify-center mx-auto sm:mx-0">
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">{item.title}</h3>
                                <p className="text-xs text-[#3A2E1F]/70 leading-relaxed font-body">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 4. SOURCING PHOTO GALLERY */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-2">
                    <h2 className="text-2xl font-extrabold font-heading text-[#3A2E1F]">Orchard Sourcing Highlights</h2>
                    <p className="text-xs text-[#3A2E1F]/70">A glimpse into our harvesting and packaging processes</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[settings.about_gallery_image_1 || 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600',
                    settings.about_gallery_image_2 || 'https://images.unsplash.com/photo-1599879207869-7c87c2fb2402?auto=format&fit=crop&q=80&w=600',
                    settings.about_gallery_image_3 || 'https://images.unsplash.com/photo-1594951468249-f79a953eacc2?auto=format&fit=crop&q=80&w=600'
                    ].map((src, idx) => (
                        <div key={idx} className="aspect-4/3 rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-sm">
                            <img src={src} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. CTA BANNER AT BOTTOM */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-[#3A2E1F] via-[#2A2116] to-[#3A2E1F] text-white rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-xl border border-[#F5A623]/20">
                    <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                        {settings.about_cta_heading || 'Ready to Experience Quality?'}
                    </h2>
                    <p className="text-sm text-[#F5EFE0]/80 max-w-xl mx-auto">
                        Order today and get free express shipping nationwide on orders over {formatPrice(settings.free_shipping_threshold || 3000)}.
                    </p>
                    <div>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full transition-all shadow-md"
                        >
                            <span>Explore Our Products</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
