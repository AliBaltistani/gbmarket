import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, RotateCcw, PackageX, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeletons';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/SEO';

export default function Shop() {
    const { settings } = useSettings();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const initialSearch = searchParams.get('search') || '';

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCats, setLoadingCats] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState(15000);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Prevent background scrolling when mobile filter drawer is open
    useEffect(() => {
        if (isMobileFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileFilterOpen]);

    // Debounce search query syncing to URL
    useEffect(() => {
        const handler = setTimeout(() => {
            const newParams = { ...Object.fromEntries(searchParams.entries()) };
            if (searchQuery.trim()) {
                newParams.search = searchQuery;
            } else {
                delete newParams.search;
            }
            setSearchParams(newParams, { replace: true });
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery, setSearchParams]);

    // Fetch Categories on mount
    useEffect(() => {
        getCategories().then(cats => {
            setCategories(cats);
            setLoadingCats(false);
        }).catch(console.error);
    }, []);

    // Fetch Products when URL params change
    useEffect(() => {
        const fetchProductsData = async () => {
            setLoading(true);
            try {
                const catSlug = searchParams.get('category');
                const search = searchParams.get('search');

                const params = {};
                if (catSlug && catSlug !== 'all') params.category = catSlug;
                if (search) params.search = search;

                const data = await getProducts(params);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching shop products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductsData();
    }, [searchParams]);

    // Client-side Price & Sort filtering
    const filteredProducts = products.filter(p => p.base_price <= priceRange)
        .sort((a, b) => {
            if (sortBy === 'low-high') return a.base_price - b.base_price;
            if (sortBy === 'high-low') return b.base_price - a.base_price;
            return b.id - a.id;
        });

    const handleCategoryChange = (slug) => {
        setSelectedCategory(slug);
        const newParams = { ...Object.fromEntries(searchParams.entries()) };
        if (slug === 'all') {
            delete newParams.category;
        } else {
            newParams.category = slug;
        }
        setSearchParams(newParams);
    };

    const handleResetFilters = () => {
        setSelectedCategory('all');
        setSearchQuery('');
        setPriceRange(15000);
        setSortBy('newest');
        setSearchParams({});
    };

    return (
        <div className="space-y-10 pb-16">
            <SEO
                title={`Shop All Products - ${settings.store_name || 'GBMarket'}`}
                description={settings.store_tagline || "Browse our complete collection of premium organic dry fruits and nuts from Gilgit-Baltistan."}
                canonical="https://gbmarket.pk/shop"
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
                            "name": "Shop",
                            "item": "https://gbmarket.pk/shop"
                        }
                    ]
                }}
            />
            {/* 1. SHOP HERO BANNER */}
            <section className="bg-gradient-to-r from-[#F5EFE0] via-[#F5A623]/20 to-[#F5EFE0] border-b border-[#E8DEC8] py-12 px-4 sm:px-6 lg:px-8 text-center rounded-3xl max-w-7xl mx-auto mt-4">
                <div className="max-w-2xl mx-auto space-y-3">
                    <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-[#E8DEC8]">
                        Complete Store Catalog
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-[#3A2E1F]">
                        Shop All {settings.store_name || 'Organic'} Products
                    </h1>
                    <p className="text-sm text-[#3A2E1F]/70 font-body">
                        {settings.store_tagline || '100% natural, unpasteurized dry fruits & nuts directly shipped from mountain orchards in Gilgit-Baltistan.'}
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* 2. SIDEBAR FILTER (DESKTOP) */}
                    <aside className="hidden lg:block space-y-8 bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 h-fit shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-4">
                            <h2 className="font-heading font-bold text-lg text-[#3A2E1F] flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-[#D97706]" />
                                <span>Filters</span>
                            </h2>
                            <button onClick={handleResetFilters} className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1">
                                <RotateCcw className="w-3.5 h-3.5" /><span>Reset</span>
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-3">
                            <h3 className="font-heading font-bold text-sm text-[#3A2E1F]">Categories</h3>
                            <div className="space-y-2 text-sm">
                                <button
                                    type="button" onClick={() => handleCategoryChange('all')}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${selectedCategory === 'all' ? 'bg-[#F5A623] text-[#3A2E1F] font-bold' : 'hover:bg-[#F5EFE0] text-[#3A2E1F]/80'
                                        }`}
                                >
                                    <span>All Categories</span>
                                </button>
                                {!loadingCats && categories.map((cat) => (
                                    <button
                                        key={cat.id} type="button" onClick={() => handleCategoryChange(cat.slug)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 ${selectedCategory === cat.slug ? 'bg-[#F5A623] text-[#3A2E1F] font-bold' : 'hover:bg-[#F5EFE0] text-[#3A2E1F]/80'
                                            }`}
                                    >
                                        <span className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-[#F5EFE0] border border-[#E8DEC8] flex items-center justify-center text-xs">
                                            {cat.image_url
                                                ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                                : cat.icon || '📦'}
                                        </span>
                                        <span>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Slider */}
                        <div className="space-y-3 pt-4 border-t border-[#E8DEC8]">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-bold text-sm text-[#3A2E1F]">Max Price</h3>
                                <span className="text-xs font-bold text-[#D97706]">{settings.currency_symbol || 'Rs. '}{priceRange.toLocaleString()}</span>
                            </div>
                            <input type="range" min="500" max="15000" step="500" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full accent-[#D97706] cursor-pointer" />
                            <div className="flex justify-between text-[11px] text-[#3A2E1F]/60">
                                <span>{settings.currency_symbol || 'Rs. '}500</span><span>{settings.currency_symbol || 'Rs. '}15,000</span>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CATALOG AREA */}
                    <main className="lg:col-span-3 space-y-6">
                        <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="relative w-full sm:w-72">
                                <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-full text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                                <Search className="w-4 h-4 text-[#3A2E1F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                <button type="button" onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} className="lg:hidden px-4 py-2 bg-[#F5EFE0] text-[#3A2E1F] font-semibold text-xs rounded-full border border-[#E8DEC8] flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-[#D97706]" /><span>Filters</span>
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#3A2E1F]/70 hidden sm:inline">Sort by:</span>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-full text-xs font-semibold text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]">
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="low-high">Price: Low to High</option>
                                        <option value="high-low">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* PRODUCT GRID OR EMPTY STATE */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={{
                                        ...product,
                                        category: product.category_name || product.category_slug,
                                        images: [product.image_url],
                                        weightOptions: product.weight_options
                                    }} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-12 text-center space-y-4 my-8">
                                <div className="w-16 h-16 bg-[#F5EFE0] text-[#D97706] rounded-full flex items-center justify-center mx-auto">
                                    <PackageX className="w-8 h-8" />
                                </div>
                                <h3 className="font-heading font-bold text-2xl text-[#3A2E1F]">No Products Found</h3>
                                <p className="text-sm text-[#3A2E1F]/70 max-w-md mx-auto">
                                    We couldn't find any products matching your search query or selected filters.
                                </p>
                                <button type="button" onClick={handleResetFilters} className="px-6 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full transition-colors shadow-sm">
                                    Reset All Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* 3. MOBILE FILTER DRAWER OVERLAY */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-full max-w-xs sm:max-w-sm bg-[#FFFDF9] h-full shadow-2xl flex flex-col z-10 animate-fadeIn overflow-y-auto">
                        {/* Drawer Header */}
                        <div className="p-5 border-b border-[#E8DEC8] flex items-center justify-between bg-[#FFFDF9] sticky top-0 z-10">
                            <div className="flex items-center gap-2 font-heading font-bold text-lg text-[#3A2E1F]">
                                <SlidersHorizontal className="w-5 h-5 text-[#D97706]" />
                                <span>Filter Products</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="p-2 text-[#3A2E1F]/60 hover:text-[#3A2E1F] hover:bg-[#E8DEC8]/50 rounded-full transition-colors"
                                aria-label="Close filters drawer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                            {/* Categories */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-heading font-bold text-sm text-[#3A2E1F]">Categories</h3>
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Reset All</span>
                                    </button>
                                </div>
                                <div className="space-y-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleCategoryChange('all')}
                                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${selectedCategory === 'all'
                                            ? 'bg-[#F5A623] text-[#3A2E1F] font-bold shadow-xs'
                                            : 'hover:bg-[#F5EFE0] text-[#3A2E1F]/80 bg-[#F5EFE0]/30 border border-[#E8DEC8]/40'
                                            }`}
                                    >
                                        <span>All Categories</span>
                                    </button>
                                    {!loadingCats && categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategoryChange(cat.slug)}
                                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 ${selectedCategory === cat.slug
                                                ? 'bg-[#F5A623] text-[#3A2E1F] font-bold shadow-xs'
                                                : 'hover:bg-[#F5EFE0] text-[#3A2E1F]/80 bg-[#F5EFE0]/30 border border-[#E8DEC8]/40'
                                                }`}
                                        >
                                            <span className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-[#F5EFE0] border border-[#E8DEC8] flex items-center justify-center text-sm">
                                                {cat.image_url
                                                    ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                                    : cat.icon || '📦'}
                                            </span>
                                            <span>{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Slider */}
                            <div className="space-y-3 pt-4 border-t border-[#E8DEC8]">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-heading font-bold text-sm text-[#3A2E1F]">Max Price</h3>
                                    <span className="text-xs font-extrabold text-[#D97706] bg-[#F5EFE0] px-2.5 py-1 rounded-lg border border-[#E8DEC8]">
                                        {settings.currency_symbol || 'Rs. '}{priceRange.toLocaleString()}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="500"
                                    max="15000"
                                    step="500"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full accent-[#D97706] cursor-pointer"
                                />
                                <div className="flex justify-between text-[11px] font-semibold text-[#3A2E1F]/60">
                                    <span>{settings.currency_symbol || 'Rs. '}500</span>
                                    <span>{settings.currency_symbol || 'Rs. '}15,000</span>
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="space-y-3 pt-4 border-t border-[#E8DEC8]">
                                <h3 className="font-heading font-bold text-sm text-[#3A2E1F]">Sort By</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl text-xs font-semibold text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="low-high">Price: Low to High</option>
                                    <option value="high-low">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-5 border-t border-[#E8DEC8] bg-[#F5EFE0]/40 sticky bottom-0 z-10">
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-98"
                            >
                                Show Results ({filteredProducts.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
