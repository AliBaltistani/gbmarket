import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Award, Sparkles, ArrowRight, CheckCircle, Calendar, User, Flame } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton, CategorySkeleton } from '../components/Skeletons';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { blogPosts } from '../data/dummyData'; // Still dummy for blog
import { useSettings } from '../context/SettingsContext';

export default function Home() {
    const { settings } = useSettings();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [loadingProds, setLoadingProds] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Fetch Data
        const fetchData = async () => {
            try {
                const [catsRes, featuredRes, allRes] = await Promise.all([
                    getCategories(),
                    getProducts({ featured: 'true' }),
                    getProducts()
                ]);

                setCategories(catsRes);
                setFeaturedProducts(featuredRes.slice(0, 6)); // Top 6 featured
                setNewArrivals(allRes.slice(0, 4)); // First 4 as new arrivals
            } catch (error) {
                console.error("Error fetching home data", error);
            } finally {
                setLoadingCats(false);
                setLoadingProds(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-20 pb-16">

            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#F5A623]/20 via-[#F5EFE0] to-[#D97706]/10 rounded-3xl p-8 sm:p-12 lg:p-16 border border-[#E8DEC8] shadow-sm max-w-7xl mx-auto mt-4">
                <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#F5A623]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/3 top-0 w-64 h-64 bg-[#D97706]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5A623]/20 text-[#3A2E1F] border border-[#F5A623]/40 text-xs sm:text-sm font-semibold">
                            <Sparkles className="w-4 h-4 text-[#D97706]" />
                            <span>100% Organic & Sun-Dried Harvest</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[#3A2E1F] tracking-tight leading-[1.15]">
                            {settings.hero_heading || 'Pure Mountain Dry Fruits & Nuts'}
                        </h1>
                        <p className="text-base sm:text-lg text-[#3A2E1F]/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-body">
                            {settings.hero_subheading || 'Handpicked from the high-altitude orchards of Gilgit-Baltistan.'}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                            <Link to="/shop" className="w-full sm:w-auto px-8 py-3.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2">
                                <span>Explore Shop</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/about" className="w-full sm:w-auto px-8 py-3.5 bg-[#FFFDF9] hover:bg-[#F5EFE0] text-[#3A2E1F] font-semibold text-base rounded-full border border-[#E8DEC8] transition-all duration-200 text-center">
                                Our Sourcing Story
                            </Link>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center">
                        <div className="w-full max-w-md aspect-square bg-[#FFFDF9] rounded-3xl p-4 shadow-xl border border-[#E8DEC8] relative transform hover:scale-[1.02] transition-transform duration-500">
                            <img src={settings.hero_image_url || '/placeholder.png'} alt="Hero" className="w-full h-full object-cover rounded-2xl" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                            <div className="absolute -bottom-4 -left-4 bg-[#3A2E1F] text-[#F5EFE0] p-4 rounded-2xl shadow-lg border border-[#F5A623]/30 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#F5A623] text-[#3A2E1F] flex items-center justify-center font-bold">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#F5A623] font-bold uppercase tracking-wider">Premium Grade</div>
                                    <div className="text-sm font-semibold">Paper-Shell Almonds & Nuts</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW ARRIVALS STRIP */}
            {(!loadingProds && newArrivals.length > 0) && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
                        <div className="lg:max-w-xs space-y-3 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D97706]/10 text-[#D97706] rounded-full text-xs font-bold uppercase tracking-wider">
                                <Flame className="w-4 h-4 fill-current" />
                                <span>Fresh Batch Harvest</span>
                            </div>
                            <h2 className="text-2xl font-bold font-heading text-[#3A2E1F]">New Arrivals Strip</h2>
                            <p className="text-xs text-[#3A2E1F]/70 leading-relaxed">
                                Handpicked items from this season's first harvest. Limited stock available!
                            </p>
                            <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-bold text-[#D97706] hover:underline pt-1">
                                <span>View all new items</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                            {newArrivals.map((item) => (
                                <Link key={item.id} to={`/product/${item.slug}`} className="group bg-[#F5EFE0]/50 p-3 rounded-2xl border border-[#E8DEC8] hover:bg-[#F5EFE0] transition-all text-center flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden mb-2 bg-white">
                                        <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                                    </div>
                                    <span className="text-xs font-bold text-[#3A2E1F] line-clamp-1 group-hover:text-[#D97706]">{item.name}</span>
                                    <span className="text-xs font-semibold text-[#D97706] mt-0.5">Rs. {item.base_price}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CATEGORIES HORIZONTAL STRIP */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold font-heading text-[#3A2E1F]">Browse Categories</h2>
                        <p className="text-sm text-[#3A2E1F]/70">Explore our wild & organic mountain dry fruit varieties</p>
                    </div>
                    <Link to="/shop" className="text-sm font-bold text-[#D97706] hover:underline flex items-center gap-1">
                        <span>View All</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loadingCats ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => <CategorySkeleton key={i} />)}
                    </div>
                ) : (
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                        {categories.map((cat) => (
                            <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="snap-start shrink-0 w-32 group bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-4 text-center hover:border-[#F5A623] hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-[#F5EFE0] group-hover:bg-[#F5A623] text-[#3A2E1F] flex items-center justify-center transition-colors">
                                    <Leaf className="w-6 h-6" />
                                </div>
                                <h3 className="font-heading font-bold text-sm text-[#3A2E1F] group-hover:text-[#D97706]">{cat.name}</h3>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* FEATURED PRODUCTS GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/20 text-[#D97706] text-xs font-bold uppercase tracking-wider">
                        <Award className="w-4 h-4" />
                        <span>Best Seller Collection</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F]">Featured Dry Fruits</h2>
                </div>

                {loadingProds ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {featuredProducts.map((prod) => (
                            // Map DB product structure to component expectations
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

            {/* ABOUT STRIP */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-[#F5EFE0] to-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-sm">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-[#F5A623] shadow-xl">
                                <img src="https://images.unsplash.com/photo-1596769062638-e6ed3f46f496?auto=format&fit=crop&q=80&w=800" alt="Gilgit Baltistan Organic Sourcing" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#3A2E1F] text-[#F5A623] p-4 rounded-2xl shadow-lg border border-[#F5A623]/30 text-center">
                                <Leaf className="w-8 h-8 mx-auto mb-1" />
                                <span className="text-xs font-bold uppercase tracking-wider block text-white">Gilgit Sourced</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-5 text-center lg:text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">Our Story & Promise</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F] leading-tight">
                            Sourced Directly From Mountain Farmers
                        </h2>
                        <p className="text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            At GBMarket, we cut out middlemen to bring you purest walnuts, almonds, and dried apricots harvested straight from high-altitude Gilgit-Baltistan valleys. Every nut is sun-dried naturally, guaranteeing unpasteurized freshness and maximum nutrients.
                        </p>
                        <div className="pt-4">
                            <Link to="/about" className="px-6 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full transition-colors inline-block">
                                Read Full Story
                            </Link>
                        </div>
                    </div>
                </div>
            </section>



            {/* BLOG / LATEST ARTICLES */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-3xl font-extrabold font-heading text-[#3A2E1F]">Latest From Our Journal</h2>
                    <Link to="/about" className="text-sm font-bold text-[#D97706] hover:underline flex items-center gap-1">
                        <span>Read All Articles</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {blogPosts.map((post) => (
                        <article key={post.id} className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="aspect-16/9 overflow-hidden">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                                <h3 className="font-heading font-bold text-lg text-[#3A2E1F] leading-tight">{post.title}</h3>
                                <p className="text-xs text-[#3A2E1F]/70 line-clamp-3">{post.excerpt}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

        </div>
    );
}
