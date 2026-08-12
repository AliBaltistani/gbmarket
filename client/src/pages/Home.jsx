import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Award, Sparkles, ArrowRight, Flame, Truck, Percent, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton, CategorySkeleton } from '../components/Skeletons';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { blogPosts } from '../data/dummyData';
import { useSettings } from '../context/SettingsContext';

export default function Home() {
    const { settings } = useSettings();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [loadingProds, setLoadingProds] = useState(true);

    // New Arrivals Carousel State
    const [currentArrivalIndex, setCurrentArrivalIndex] = useState(0);
    const [isArrivalPaused, setIsArrivalPaused] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchData = async () => {
            try {
                const [catsRes, featuredRes, allRes] = await Promise.all([
                    getCategories(),
                    getProducts({ featured: 'true' }),
                    getProducts()
                ]);

                setCategories(catsRes);
                setFeaturedProducts(featuredRes.slice(0, 6)); // Top 6 featured
                setNewArrivals(allRes.slice(0, 8)); // First 8 for carousel
            } catch (error) {
                console.error("Error fetching home data", error);
            } finally {
                setLoadingCats(false);
                setLoadingProds(false);
            }
        };

        fetchData();
    }, []);

    // Auto-scroll logic for New Arrivals Carousel
    useEffect(() => {
        if (newArrivals.length === 0 || isArrivalPaused) return;

        const interval = setInterval(() => {
            setCurrentArrivalIndex((prevIndex) => (prevIndex + 1) % Math.ceil(newArrivals.length / 2));
        }, 3500);

        return () => clearInterval(interval);
    }, [newArrivals.length, isArrivalPaused]);

    const handlePrevArrival = () => {
        setCurrentArrivalIndex((prev) => (prev === 0 ? Math.ceil(newArrivals.length / 2) - 1 : prev - 1));
    };

    const handleNextArrival = () => {
        setCurrentArrivalIndex((prev) => (prev + 1) % Math.ceil(newArrivals.length / 2));
    };

    // Prepare doubled categories for seamless infinite marquee loop
    const marqueeCategories = [...categories, ...categories];

    return (
        <div className="space-y-12 sm:space-y-20 pb-16">

            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#F5A623]/20 via-[#F5EFE0] to-[#D97706]/10 rounded-3xl p-6 sm:p-12 lg:p-16 border border-[#E8DEC8] shadow-xs max-w-7xl mx-auto mt-4">
                <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#F5A623]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/3 top-0 w-64 h-64 bg-[#D97706]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="space-y-5 sm:space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5A623]/20 text-[#3A2E1F] border border-[#F5A623]/40 text-xs sm:text-sm font-semibold">
                            <Sparkles className="w-4 h-4 text-[#D97706]" />
                            <span>100% Organic & Sun-Dried Harvest</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[#3A2E1F] tracking-tight leading-[1.15]">
                            {settings.hero_heading || 'Pure Mountain Dry Fruits & Nuts'}
                        </h1>
                        <p className="text-sm sm:text-lg text-[#3A2E1F]/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-body">
                            {settings.hero_subheading || 'Handpicked from the high-altitude orchards of Gilgit-Baltistan.'}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                            <Link to="/shop" className="w-full sm:w-auto px-8 py-3.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm sm:text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2 min-h-[44px]">
                                <span>Explore Shop</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/about" className="w-full sm:w-auto px-8 py-3.5 bg-[#FFFDF9] hover:bg-[#F5EFE0] text-[#3A2E1F] font-semibold text-sm sm:text-base rounded-full border border-[#E8DEC8] transition-all duration-200 text-center min-h-[44px] flex items-center justify-center">
                                Our Sourcing Story
                            </Link>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <div className="w-full max-w-md aspect-square bg-[#FFFDF9] rounded-3xl p-3 sm:p-4 shadow-xl border border-[#E8DEC8] relative transform hover:scale-[1.02] transition-transform duration-500">
                            <img src={settings.hero_image_url || '/placeholder.png'} alt="Hero" className="w-full h-full object-cover rounded-2xl" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                            <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-[#3A2E1F] text-[#F5EFE0] p-3 sm:p-4 rounded-2xl shadow-lg border border-[#F5A623]/30 flex items-center gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5A623] text-[#3A2E1F] flex items-center justify-center font-bold shrink-0">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-[10px] sm:text-xs text-[#F5A623] font-bold uppercase tracking-wider">Premium Grade</div>
                                    <div className="text-xs sm:text-sm font-semibold">Paper-Shell Almonds & Nuts</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW ARRIVALS STRIP — AUTO-SLIDING CAROUSEL WITH DISTINCT EFFECTS */}
            {(!loadingProds && newArrivals.length > 0) && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        onMouseEnter={() => setIsArrivalPaused(true)}
                        onMouseLeave={() => setIsArrivalPaused(false)}
                        onTouchStart={() => setIsArrivalPaused(true)}
                        onTouchEnd={() => setIsArrivalPaused(false)}
                        className="bg-gradient-to-r from-[#FFFDF9] via-[#F5EFE0]/40 to-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-5 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden"
                    >
                        <div className="lg:max-w-xs space-y-2 sm:space-y-3 text-center lg:text-left shrink-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D97706]/10 text-[#D97706] rounded-full text-xs font-bold uppercase tracking-wider border border-[#D97706]/20 shadow-xs">
                                <Flame className="w-4 h-4 fill-current animate-pulse" />
                                <span>Fresh Batch Harvest</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#3A2E1F]">New Arrivals Strip</h2>
                            <p className="text-xs text-[#3A2E1F]/70 leading-relaxed">
                                Handpicked items from this season's first harvest. Auto-sliding preview!
                            </p>
                            <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
                                <Link to="/shop" className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#D97706] hover:underline">
                                    <span>View all new items</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                {/* Navigation Arrows */}
                                <div className="flex items-center gap-1.5 ml-2">
                                    <button
                                        type="button"
                                        onClick={handlePrevArrival}
                                        aria-label="Previous Arrivals"
                                        className="w-7 h-7 rounded-full bg-white border border-[#E8DEC8] hover:bg-[#F5A623] hover:border-[#F5A623] text-[#3A2E1F] flex items-center justify-center transition-all shadow-xs"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextArrival}
                                        aria-label="Next Arrivals"
                                        className="w-7 h-7 rounded-full bg-white border border-[#E8DEC8] hover:bg-[#F5A623] hover:border-[#F5A623] text-[#3A2E1F] flex items-center justify-center transition-all shadow-xs"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sliding Container */}
                        <div className="w-full overflow-hidden relative">
                            <div
                                className="flex transition-transform duration-500 ease-out gap-3 sm:gap-4"
                                style={{ transform: `translateX(-${currentArrivalIndex * 100}%)` }}
                            >
                                {Array.from({ length: Math.ceil(newArrivals.length / 2) }).map((_, groupIdx) => {
                                    const groupItems = newArrivals.slice(groupIdx * 2, groupIdx * 2 + 2);
                                    return (
                                        <div key={groupIdx} className="w-full shrink-0 grid grid-cols-2 gap-3 sm:gap-4">
                                            {groupItems.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    to={`/product/${item.slug}`}
                                                    className="group bg-[#FFFDF9] p-3 rounded-2xl border border-[#E8DEC8] hover:border-[#F5A623] hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center min-h-[135px] relative"
                                                >
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 bg-[#F5EFE0]/60 relative">
                                                        <img
                                                            src={item.image_url || '/placeholder.png'}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-[#3A2E1F] line-clamp-1 group-hover:text-[#D97706] transition-colors">{item.name}</span>
                                                    <span className="text-xs font-extrabold text-[#D97706] mt-0.5">Starting from Rs. {item.base_price}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Dots */}
                            <div className="flex items-center justify-center gap-1.5 mt-3">
                                {Array.from({ length: Math.ceil(newArrivals.length / 2) }).map((_, dotIdx) => (
                                    <button
                                        key={dotIdx}
                                        type="button"
                                        onClick={() => setCurrentArrivalIndex(dotIdx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${currentArrivalIndex === dotIdx ? 'w-6 bg-[#D97706]' : 'w-2 bg-[#E8DEC8] hover:bg-[#F5A623]'}`}
                                        aria-label={`Go to slide ${dotIdx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* BROWSE CATEGORIES — CONTINUOUS INFINITE AUTO-MARQUEE WITH GLOW & LIFT EFFECTS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
                <div className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F]">Browse Categories</h2>
                        <p className="text-xs sm:text-sm text-[#3A2E1F]/70">Auto-scrolling organic mountain dry fruit varieties (hover to pause)</p>
                    </div>
                    <Link to="/shop" className="text-xs sm:text-sm font-bold text-[#D97706] hover:underline flex items-center gap-1 shrink-0">
                        <span>View All</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loadingCats ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {[...Array(5)].map((_, i) => <CategorySkeleton key={i} />)}
                    </div>
                ) : (
                    /* Infinite Continuous Auto Marquee Track with Pause on Hover */
                    <div className="relative overflow-hidden py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {/* Gradient Fade Edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#F5EFE0] via-[#F5EFE0]/80 to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#F5EFE0] via-[#F5EFE0]/80 to-transparent z-10 pointer-events-none" />

                        <div className="animate-marquee gap-3 sm:gap-4 flex items-center">
                            {marqueeCategories.map((cat, idx) => (
                                <Link
                                    key={`${cat.id}-${idx}`}
                                    to={`/shop?category=${cat.slug}`}
                                    className="shrink-0 w-32 sm:w-40 group bg-[#FFFDF9] border border-[#E8DEC8] hover:border-[#F5A623] rounded-2xl p-4 text-center shadow-xs hover:shadow-lg hover:shadow-[#F5A623]/25 hover:-translate-y-1.5 hover:rotate-1 transition-all duration-300 flex flex-col items-center justify-center gap-2.5 cursor-pointer"
                                >
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F5EFE0] group-hover:bg-[#F5A623] text-[#3A2E1F] flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-110 group-hover:rotate-12">
                                        <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-[#D97706] group-hover:text-[#3A2E1F] transition-colors" />
                                    </div>
                                    <h3 className="font-heading font-extrabold text-xs sm:text-sm text-[#3A2E1F] group-hover:text-[#D97706] line-clamp-1 transition-colors">{cat.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* FEATURED PRODUCTS GRID - 2 COLUMNS ON MOBILE */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/20 text-[#D97706] text-xs font-bold uppercase tracking-wider">
                        <Award className="w-4 h-4" />
                        <span>Best Seller Collection</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F]">Featured Dry Fruits</h2>
                </div>

                {loadingProds ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                        {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                        {featuredProducts.map((prod) => (
                            <ProductCard key={prod.id} product={{
                                ...prod,
                                category: prod.category_name || prod.category_slug,
                                images: [prod.image_url],
                                weightOptions: prod.weight_options
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-[#3A2E1F]/60">No featured products found.</div>
                )}
            </section>

            {/* ABOUT STRIP / STORY SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-[#F5EFE0] to-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center shadow-xs">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-56 h-56 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-[#F5A623] shadow-xl">
                                <img src="https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=800" alt="Gilgit Baltistan Organic Sourcing" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#3A2E1F] text-[#F5A623] p-3 sm:p-4 rounded-2xl shadow-lg border border-[#F5A623]/30 text-center">
                                <Leaf className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 text-[#F5A623]" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block text-white">Gilgit Sourced</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 sm:space-y-5 text-center lg:text-left">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[#D97706]">Our Story & Promise</span>
                        <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F] leading-tight">
                            Sourced Directly From Mountain Farmers
                        </h2>
                        <p className="text-xs sm:text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            At GBMarket, we cut out middlemen to bring you purest walnuts, almonds, and dried apricots harvested straight from high-altitude Gilgit-Baltistan valleys. Every nut is sun-dried naturally, guaranteeing unpasteurized freshness and maximum nutrients.
                        </p>
                        <div className="pt-2">
                            <Link to="/about" className="px-6 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs sm:text-sm rounded-full transition-colors inline-flex items-center justify-center min-h-[44px]">
                                Read Full Story
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROMO BANNERS SECTION - RENDERS BETWEEN STORY AND JOURNAL */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Promo Banner 1: Seasonal Special Harvest Sale */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3A2E1F] via-[#4A3B28] to-[#281F14] text-[#F5EFE0] p-6 sm:p-8 border border-[#F5A623]/30 shadow-lg flex flex-col justify-between group hover:border-[#F5A623] transition-all duration-300">
                        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-[#F5A623]/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="space-y-4 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5A623] text-[#3A2E1F] rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                                <Percent className="w-3.5 h-3.5" />
                                <span>Save Up to 20% OFF</span>
                            </div>
                            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                                Organic Mountain Dry Fruit Bundles
                            </h3>
                            <p className="text-xs sm:text-sm text-[#F5EFE0]/80 leading-relaxed font-body">
                                Get our curated 5-Nut Power Mix paired with authentic Hunza Sun-Dried Apricots at special discounted rates this season.
                            </p>
                        </div>
                        <div className="pt-6 relative z-10">
                            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-extrabold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 min-h-[44px]">
                                <ShoppingBag className="w-4 h-4" />
                                <span>Shop Deal Bundles</span>
                            </Link>
                        </div>
                    </div>

                    {/* Promo Banner 2: Free Express Shipping */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5EFE0] via-[#FFFDF9] to-[#F5A623]/20 text-[#3A2E1F] p-6 sm:p-8 border border-[#E8DEC8] shadow-md flex flex-col justify-between group hover:border-[#D97706] transition-all duration-300">
                        <div className="space-y-4 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D97706]/15 text-[#D97706] rounded-full text-xs font-bold uppercase tracking-wider border border-[#D97706]/30">
                                <Truck className="w-3.5 h-3.5" />
                                <span>Free Express Delivery</span>
                            </div>
                            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#3A2E1F] leading-tight">
                                Fast Shipping Across Pakistan
                            </h3>
                            <p className="text-xs sm:text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                                Enjoy free insured doorstep shipping on all orders over Rs. 3,000. Freshly sealed packs delivered right to your home.
                            </p>
                        </div>
                        <div className="pt-6 relative z-10">
                            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#3A2E1F] hover:bg-[#D97706] text-[#F5EFE0] font-extrabold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 min-h-[44px]">
                                <span>Explore Fresh Nuts</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOG / LATEST ARTICLES */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
                <div className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F]">Latest From Our Journal</h2>
                        <p className="text-xs sm:text-sm text-[#3A2E1F]/70">Health benefits & mountain harvesting insights</p>
                    </div>
                    <Link to="/about" className="text-xs sm:text-sm font-bold text-[#D97706] hover:underline flex items-center gap-1 shrink-0">
                        <span>Read All</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {blogPosts.map((post) => (
                        <article key={post.id} className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group">
                            <div className="aspect-16/9 overflow-hidden bg-[#F5EFE0]">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                                <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#3A2E1F] leading-snug group-hover:text-[#D97706] transition-colors">{post.title}</h3>
                                <p className="text-xs text-[#3A2E1F]/70 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

        </div>
    );
}
