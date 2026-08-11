import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Plus, Minus, Check, ArrowLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/dummyData';

export default function ProductDetail() {
    const { slug } = useParams();

    // Find product by slug or default to first product
    const product = products.find((p) => p.slug === slug) || products[0];

    const [selectedImage, setSelectedImage] = useState(product.images[0]);
    const [selectedWeight, setSelectedWeight] = useState(product.weightOptions[0]);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [addedToCartToast, setAddedToCartToast] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setSelectedImage(product.images[0]);
        setSelectedWeight(product.weightOptions[0]);
        setQuantity(1);
    }, [slug, product]);

    const handleAddToCart = () => {
        setAddedToCartToast(true);
        setTimeout(() => setAddedToCartToast(false), 3000);
    };

    const relatedProducts = products
        .filter((p) => p.id !== product.id && (p.categorySlug === product.categorySlug || p.isFeatured))
        .slice(0, 4);

    return (
        <div className="space-y-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

            {/* 1. BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#3A2E1F]/70">
                <Link to="/" className="hover:text-[#D97706] transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40" />
                <Link to="/shop" className="hover:text-[#D97706] transition-colors">Shop</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40" />
                <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-[#D97706] transition-colors">{product.category}</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40" />
                <span className="text-[#3A2E1F] font-bold truncate max-w-xs">{product.name}</span>
            </nav>

            {/* 2. MAIN PRODUCT SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left: Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-4/3 sm:aspect-square bg-[#F5EFE0] border border-[#E8DEC8] rounded-3xl overflow-hidden shadow-sm relative">
                        <img
                            src={selectedImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-300"
                        />
                        <span className="absolute top-4 left-4 px-3 py-1 bg-[#F5A623] text-[#3A2E1F] font-bold text-xs rounded-full shadow-sm">
                            100% Organic
                        </span>
                    </div>

                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                        <div className="flex items-center gap-3">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedImage(img)}
                                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img
                                            ? 'border-[#D97706] ring-2 ring-[#F5A623]/30 scale-105'
                                            : 'border-[#E8DEC8] opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Info & Actions */}
                <div className="space-y-6 bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div>
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider bg-[#F5EFE0] px-3 py-1 rounded-full border border-[#E8DEC8]">
                                {product.category}
                            </span>
                            <span
                                className={`text-xs font-bold px-3 py-1 rounded-full ${product.stockStatus === 'In Stock'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                                    }`}
                            >
                                {product.stockStatus}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F] leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#3A2E1F]/80">
                            <div className="flex text-[#F5A623]">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <span className="font-bold text-[#3A2E1F]">{product.rating}</span>
                            <span>({product.reviewsCount} customer reviews)</span>
                        </div>
                    </div>

                    {/* Price Display */}
                    <div className="p-4 bg-[#F5EFE0]/60 border border-[#E8DEC8] rounded-2xl flex items-baseline justify-between">
                        <div>
                            <span className="text-xs text-[#3A2E1F]/70 block">Selected Pack Price</span>
                            <span className="text-3xl font-extrabold font-heading text-[#3A2E1F]">
                                Rs. {(selectedWeight.price * quantity).toLocaleString()}
                            </span>
                        </div>
                        <span className="text-xs text-[#D97706] font-bold">
                            (Rs. {selectedWeight.price} / {selectedWeight.label})
                        </span>
                    </div>

                    <p className="text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                        {product.description}
                    </p>

                    {/* Weight Option Selector */}
                    <div className="space-y-2.5 pt-2">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                            Select Pack Size (Weight):
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {product.weightOptions.map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => setSelectedWeight(option)}
                                    className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${selectedWeight.label === option.label
                                            ? 'bg-[#F5A623] border-[#D97706] text-[#3A2E1F] shadow-sm ring-2 ring-[#F5A623]/40'
                                            : 'bg-white border-[#E8DEC8] text-[#3A2E1F]/80 hover:bg-[#F5EFE0]'
                                        }`}
                                >
                                    <span className="text-sm font-extrabold">{option.label}</span>
                                    <span className="text-[11px] text-[#3A2E1F]/70">Rs. {option.price}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="space-y-2.5 pt-2">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                            Quantity:
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-white border border-[#E8DEC8] rounded-full p-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-9 h-9 rounded-full bg-[#F5EFE0] hover:bg-[#F5A623] text-[#3A2E1F] flex items-center justify-center transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-sm text-[#3A2E1F]">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-9 h-9 rounded-full bg-[#F5EFE0] hover:bg-[#F5A623] text-[#3A2E1F] flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <span className="text-xs text-[#3A2E1F]/70">
                                Total Weight: <strong className="text-[#3A2E1F]">{quantity} x {selectedWeight.label}</strong>
                            </span>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#E8DEC8]">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="flex-1 py-3.5 px-6 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add to Cart</span>
                        </button>
                        <Link
                            to="/checkout"
                            className="flex-1 py-3.5 px-6 bg-[#3A2E1F] hover:bg-[#D97706] text-white font-bold text-sm rounded-full shadow-md transition-all text-center flex items-center justify-center"
                        >
                            Buy Now
                        </Link>
                    </div>

                    {/* Toast feedback */}
                    {addedToCartToast && (
                        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-700" />
                            <span>Added {quantity} x {product.name} ({selectedWeight.label}) to cart!</span>
                        </div>
                    )}

                    {/* Micro Trust Icons */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E8DEC8] text-center text-[11px] text-[#3A2E1F]/70">
                        <div className="flex flex-col items-center gap-1">
                            <Truck className="w-4 h-4 text-[#D97706]" />
                            <span>Fast Shipping</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                            <span>100% Organic</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <RefreshCw className="w-4 h-4 text-[#D97706]" />
                            <span>Easy Return</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. TABS / ACCORDION */}
            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 border-b border-[#E8DEC8] overflow-x-auto pb-2">
                    {['description', 'nutrition', 'shipping'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[#3A2E1F] text-white shadow-sm'
                                    : 'bg-[#F5EFE0]/60 text-[#3A2E1F]/80 hover:bg-[#F5EFE0]'
                                }`}
                        >
                            {tab === 'description' && 'Description'}
                            {tab === 'nutrition' && 'Nutrition Information'}
                            {tab === 'shipping' && 'Shipping & Returns'}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                <div className="pt-2">
                    {activeTab === 'description' && (
                        <div className="space-y-3 text-sm text-[#3A2E1F]/80 leading-relaxed">
                            <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">About {product.name}</h3>
                            <p>{product.description}</p>
                            <p>
                                Harvested directly from high-altitude organic orchards without synthetic fertilizers or post-harvest chemicals. Hand-graded to select only plump, unbroken nuts.
                            </p>
                        </div>
                    )}

                    {activeTab === 'nutrition' && (
                        <div className="space-y-4">
                            <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">Nutrition Facts (Per 100g)</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div className="bg-[#F5EFE0]/60 p-3 rounded-2xl text-center border border-[#E8DEC8]">
                                    <div className="text-xs text-[#3A2E1F]/60">Calories</div>
                                    <div className="font-heading font-bold text-sm text-[#3A2E1F] mt-1">{product.nutritionInfo?.calories || '579 kcal'}</div>
                                </div>
                                <div className="bg-[#F5EFE0]/60 p-3 rounded-2xl text-center border border-[#E8DEC8]">
                                    <div className="text-xs text-[#3A2E1F]/60">Protein</div>
                                    <div className="font-heading font-bold text-sm text-[#3A2E1F] mt-1">{product.nutritionInfo?.protein || '21.2g'}</div>
                                </div>
                                <div className="bg-[#F5EFE0]/60 p-3 rounded-2xl text-center border border-[#E8DEC8]">
                                    <div className="text-xs text-[#3A2E1F]/60">Carbs</div>
                                    <div className="font-heading font-bold text-sm text-[#3A2E1F] mt-1">{product.nutritionInfo?.carbs || '21.6g'}</div>
                                </div>
                                <div className="bg-[#F5EFE0]/60 p-3 rounded-2xl text-center border border-[#E8DEC8]">
                                    <div className="text-xs text-[#3A2E1F]/60">Healthy Fat</div>
                                    <div className="font-heading font-bold text-sm text-[#3A2E1F] mt-1">{product.nutritionInfo?.fat || '49.9g'}</div>
                                </div>
                                <div className="bg-[#F5EFE0]/60 p-3 rounded-2xl text-center border border-[#E8DEC8]">
                                    <div className="text-xs text-[#3A2E1F]/60">Dietary Fiber</div>
                                    <div className="font-heading font-bold text-sm text-[#3A2E1F] mt-1">{product.nutritionInfo?.fiber || '12.5g'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-3 text-sm text-[#3A2E1F]/80 leading-relaxed">
                            <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">Nationwide Delivery & Return Guarantee</h3>
                            <ul className="list-disc list-inside space-y-1.5 text-xs">
                                <li>Orders dispatched within 24 hours from our central warehouse.</li>
                                <li>Delivery time: 2-3 business days for major cities (Lahore, Karachi, Islamabad, Rawalpindi).</li>
                                <li>Free shipping on all orders above Rs. 3,000.</li>
                                <li>7-Day full replacement or money-back refund if product quality fails to meet expectations.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. RELATED PRODUCTS ROW */}
            <div className="space-y-6">
                <h2 className="text-2xl font-extrabold font-heading text-[#3A2E1F]">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>

        </div>
    );
}
