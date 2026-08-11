import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, RotateCcw, PackageX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/dummyData';

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const initialSearch = searchParams.get('search') || '';

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState(15000);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
        const q = searchParams.get('search');
        if (q !== null) setSearchQuery(q);
    }, [searchParams]);

    // Filter & Sort Logic
    const filteredProducts = useMemo(() => {
        return products
            .filter((product) => {
                const matchesCategory =
                    selectedCategory === 'all' || product.categorySlug === selectedCategory;
                const matchesSearch =
                    !searchQuery.trim() ||
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesPrice = product.basePrice <= priceRange;
                return matchesCategory && matchesSearch && matchesPrice;
            })
            .sort((a, b) => {
                if (sortBy === 'low-high') return a.basePrice - b.basePrice;
                if (sortBy === 'high-low') return b.basePrice - a.basePrice;
                return b.id - a.id; // newest
            });
    }, [selectedCategory, searchQuery, priceRange, sortBy]);

    const handleCategoryChange = (slug) => {
        setSelectedCategory(slug);
        if (slug === 'all') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', slug);
        }
        setSearchParams(searchParams);
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
            {/* 1. SHOP HERO BANNER */}
            <section className="bg-gradient-to-r from-[#F5EFE0] via-[#F5A623]/20 to-[#F5EFE0] border-b border-[#E8DEC8] py-12 px-4 sm:px-6 lg:px-8 text-center rounded-3xl max-w-7xl mx-auto mt-4">
                <div className="max-w-2xl mx-auto space-y-3">
                    <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-[#E8DEC8]">
                        Complete Store Catalog
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-[#3A2E1F]">
                        Shop All Organic Products
                    </h1>
                    <p className="text-sm text-[#3A2E1F]/70 font-body">
                        100% natural, unpasteurized dry fruits & nuts directly shipped from mountain orchards in Gilgit-Baltistan.
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
                            <button
                                onClick={handleResetFilters}
                                className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-3">
                            <h3 className="font-heading font-bold text-sm text-[#3A2E1F]">Categories</h3>
                            <div className="space-y-2 text-sm">
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange('all')}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${selectedCategory === 'all'
                                            ? 'bg-[#F5A623] text-[#3A2E1F] font-bold'
                                            : 'hover:bg-[#F5EFE0] text-[#3A2E1F]/80'
                                        }`}
                                >
                                    <span>All Categories</span>
                                    <span>({products.length})</span>
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCategoryChange(cat.slug)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${selectedCategory === cat.slug
                                                ? 'bg-[#F5A623] text-[#3A2E1F] font-bold'
                                                : 'hover:bg-[#F5EFE0] text-[#3A2E1F]/80'
                                            }`}
                                    >
                                        <span>{cat.name}</span>
                                        <span className="opacity-60">({cat.count})</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Slider */}
                        <div className="space-y-3 pt-4 border-t border-[#E8DEC8]">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-bold text-sm text-[#3A2E1F]">Max Price</h3>
                                <span className="text-xs font-bold text-[#D97706]">Rs. {priceRange.toLocaleString()}</span>
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
                            <div className="flex justify-between text-[11px] text-[#3A2E1F]/60">
                                <span>Rs. 500</span>
                                <span>Rs. 15,000</span>
                            </div>
                        </div>

                        {/* Stock Availability */}
                        <div className="space-y-3 pt-4 border-t border-[#E8DEC8]">
                            <h3 className="font-heading font-bold text-sm text-[#3A2E1F]">Availability</h3>
                            <label className="flex items-center gap-2.5 text-xs text-[#3A2E1F]/80 cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded border-[#E8DEC8] text-[#D97706] focus:ring-[#F5A623]" />
                                <span>In Stock Only</span>
                            </label>
                        </div>
                    </aside>

                    {/* MAIN CATALOG AREA */}
                    <main className="lg:col-span-3 space-y-6">

                        {/* Top Toolbar: Search + Sort + Mobile Filter Toggle */}
                        <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            {/* Search Bar */}
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-full text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                />
                                <Search className="w-4 h-4 text-[#3A2E1F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                {/* Mobile Filter Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                                    className="lg:hidden px-4 py-2 bg-[#F5EFE0] text-[#3A2E1F] font-semibold text-xs rounded-full border border-[#E8DEC8] flex items-center gap-2"
                                >
                                    <SlidersHorizontal className="w-4 h-4 text-[#D97706]" />
                                    <span>Filters</span>
                                </button>

                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#3A2E1F]/70 hidden sm:inline">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-full text-xs font-semibold text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                    >
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="low-high">Price: Low to High</option>
                                        <option value="high-low">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Filter Drawer */}
                        {isMobileFilterOpen && (
                            <div className="lg:hidden bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-4 space-y-4 mb-4">
                                <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-2">
                                    <span className="font-heading font-bold text-sm">Category Filters</span>
                                    <button onClick={handleResetFilters} className="text-xs text-[#D97706] font-bold">Reset</button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleCategoryChange('all')}
                                        className={`px-3 py-1.5 rounded-xl text-xs text-left ${selectedCategory === 'all' ? 'bg-[#F5A623] font-bold' : 'bg-[#F5EFE0]'}`}
                                    >
                                        All Items
                                    </button>
                                    {categories.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleCategoryChange(c.slug)}
                                            className={`px-3 py-1.5 rounded-xl text-xs text-left truncate ${selectedCategory === c.slug ? 'bg-[#F5A623] font-bold' : 'bg-[#F5EFE0]'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Result count indicator */}
                        <div className="flex items-center justify-between text-xs text-[#3A2E1F]/70 px-1">
                            <span>Showing <strong>{filteredProducts.length}</strong> products</span>
                            {selectedCategory !== 'all' && (
                                <span className="bg-[#F5A623]/20 px-2.5 py-0.5 rounded-full text-[#D97706] font-bold">
                                    Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                                </span>
                            )}
                        </div>

                        {/* PRODUCT GRID OR EMPTY STATE */}
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            /* EMPTY STATE DESIGN */
                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-12 text-center space-y-4 my-8">
                                <div className="w-16 h-16 bg-[#F5EFE0] text-[#D97706] rounded-full flex items-center justify-center mx-auto">
                                    <PackageX className="w-8 h-8" />
                                </div>
                                <h3 className="font-heading font-bold text-2xl text-[#3A2E1F]">No Products Found</h3>
                                <p className="text-sm text-[#3A2E1F]/70 max-w-md mx-auto">
                                    We couldn't find any products matching your search query or selected filters. Try broadening your criteria or reset filters.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="px-6 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full transition-colors shadow-sm"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination / Load More */}
                        {filteredProducts.length > 0 && (
                            <div className="pt-8 text-center border-t border-[#E8DEC8]">
                                <button
                                    type="button"
                                    className="px-8 py-3 bg-[#F5EFE0] hover:bg-[#F5A623] text-[#3A2E1F] font-bold text-xs rounded-full border border-[#E8DEC8] transition-colors shadow-sm"
                                >
                                    Load More Products
                                </button>
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
}
