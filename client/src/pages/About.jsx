import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Award, ShieldCheck, Heart, Truck, Sparkles, ArrowRight, CheckCircle2, Users, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
    useEffect(() => {
        // window.scrollTo(0, 0); // Handled by RouteTransition
    }, []);

    const features = [
        {
            icon: Leaf,
            title: '100% Organic & Chemical-Free',
            description: 'Grown naturally in high-altitude Gilgit valleys without synthetic pesticides or preservatives.'
        },
        {
            icon: Users,
            title: 'Direct From Mountain Farmers',
            description: 'We partner directly with local farming families, ensuring fair trade and unadulterated quality.'
        },
        {
            icon: ShieldCheck,
            title: 'Hygienically Lab Tested',
            description: 'Every batch undergoes moisture and purity checks before being vacuum sealed.'
        },
        {
            icon: Truck,
            title: 'Fast Nationwide Delivery',
            description: 'Carefully packaged and delivered to your doorstep anywhere across Pakistan in 2-3 days.'
        }
    ];

    return (
        <div className="space-y-16 pb-16">
            <SEO
                title="About Us"
                description="Learn about GBMarket's mission to bring 100% organic, sun-dried dry fruits from the mountains of Gilgit-Baltistan directly to your doorstep."
                canonical="https://gbmarket.pk/about"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": "https://gbmarket.pk/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "About Us",
                            "item": "https://gbmarket.pk/about"
                        }
                    ]
                }}
            />

            {/* 1. HERO BANNER */}
            <section className="bg-gradient-to-r from-[#F5EFE0] via-[#F5A623]/20 to-[#F5EFE0] border-b border-[#E8DEC8] py-16 px-4 sm:px-6 lg:px-8 text-center rounded-3xl max-w-7xl mx-auto mt-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 text-[#D97706] rounded-full text-xs font-bold uppercase tracking-wider border border-[#E8DEC8]">
                        <Sparkles className="w-4 h-4" />
                        <span>Our Journey & Heritage</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#3A2E1F]">
                        Pure Mountain Goodness Direct From Gilgit-Baltistan
                    </h1>
                    <p className="text-base text-[#3A2E1F]/80 leading-relaxed font-body">
                        GBMarket was founded with a single mission: bringing the untouched, nutrient-dense organic dry fruits of Northern Pakistan straight to your family's table.
                    </p>
                </div>
            </section>

            {/* 2. BRAND STORY SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-8 sm:p-12 shadow-sm">
                    <div className="space-y-6">
                        <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest block">
                            The GBMarket Story
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F] leading-tight">
                            Sourced From High Altitude Orchards
                        </h2>
                        <p className="text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            Nestled between the Karakoram and Himalayan mountain ranges, Gilgit-Baltistan produces some of the world's finest walnuts, paper-shell almonds, Chilgoza pine nuts, and sun-dried apricots.
                        </p>
                        <p className="text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            Fed by pure glacier meltwater and ripened in intense high-altitude sunlight, our dry fruits are richer in natural oils, antioxidants, and crunch compared to commercial store-bought alternatives.
                        </p>
                        <div className="pt-2 space-y-2">
                            <div className="flex items-center gap-3 text-xs font-bold text-[#3A2E1F]">
                                <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                                <span>Zero Sugar Coating or Artificial Preservatives</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-[#3A2E1F]">
                                <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                                <span>Traditional Sun-Drying Techniques</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex justify-center">
                        <div className="w-full max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-lg border-4 border-[#F5A623]">
                            <img
                                src="https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=800"
                                alt="Gilgit Baltistan Organic Orchards"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. WHY CHOOSE US FEATURE BLOCKS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <h2 className="text-3xl font-extrabold font-heading text-[#3A2E1F]">Why Choose GBMarket?</h2>
                    <p className="text-sm text-[#3A2E1F]/70">We prioritize quality, authenticity, and customer satisfaction above all.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((item, idx) => {
                        const IconComponent = item.icon;
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
                    <div className="aspect-4/3 rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-sm">
                        <img src="https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600" alt="Almonds Harvest" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="aspect-4/3 rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-sm">
                        <img src="https://images.unsplash.com/photo-1599879207869-7c87c2fb2402?auto=format&fit=crop&q=80&w=600" alt="Apricot Drying" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="aspect-4/3 rounded-2xl overflow-hidden border border-[#E8DEC8] shadow-sm">
                        <img src="https://images.unsplash.com/photo-1594951468249-f79a953eacc2?auto=format&fit=crop&q=80&w=600" alt="Nuts Assortment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                </div>
            </section>

            {/* 5. CTA BANNER AT BOTTOM */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-[#3A2E1F] via-[#2A2116] to-[#3A2E1F] text-white rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-xl border border-[#F5A623]/20">
                    <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                        Ready to Taste Pure Mountain Freshness?
                    </h2>
                    <p className="text-sm text-[#F5EFE0]/80 max-w-xl mx-auto">
                        Order today and get free express shipping nationwide on orders over Rs. 3,000.
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
