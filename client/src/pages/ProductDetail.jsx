import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Truck, ShieldCheck, RefreshCw, Plus, Minus, ArrowLeft, ChevronRight, AlertTriangle, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProductBySlug, getProducts } from '../api/products';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';

export default function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [selectedImage, setSelectedImage] = useState('');
    const [selectedWeight, setSelectedWeight] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        // window.scrollTo(0, 0); // Handled by RouteTransition
        const fetchProduct = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const data = await getProductBySlug(slug);
                setProduct(data);

                // Map backend parsing
                const images = data.image_url ? [data.image_url] : [];
                if (images.length > 0) setSelectedImage(images[0]);
                if (data.weight_options && data.weight_options.length > 0) {
                    setSelectedWeight(data.weight_options[0]);
                }
                setQuantity(1);

                // Fetch related products
                const related = await getProducts({ category: data.category_slug });
                setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));
            } catch (error) {
                console.error("Error fetching product", error);
                if (error.response && error.response.status === 404) {
                    setNotFound(true);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-square bg-[#F5EFE0] rounded-3xl animate-pulse"></div>
                <div className="space-y-6">
                    <div className="h-10 bg-[#F5EFE0] rounded w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-[#F5EFE0] rounded w-1/4 animate-pulse"></div>
                    <div className="h-40 bg-[#F5EFE0] rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
                <AlertTriangle className="w-16 h-16 text-[#D97706] mx-auto opacity-50" />
                <h1 className="text-4xl font-heading font-bold text-[#3A2E1F]">Product Not Found</h1>
                <p className="text-[#3A2E1F]/70">The product you are looking for does not exist or has been removed.</p>
                <Link to="/shop" className="inline-block px-8 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] font-bold rounded-full">
                    Return to Shop
                </Link>
            </div>
        );
    }

    const itemStock = product.stock !== undefined ? Number(product.stock) : 20;
    const isOutOfStock = itemStock <= 0;
    const isLowStock = !isOutOfStock && itemStock > 0 && itemStock < 5;

    const displayRating = product.rating !== undefined && product.rating !== null ? Number(product.rating).toFixed(1) : '4.8';
    const displayReviews = product.review_count || product.reviewsCount || 42;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addItem(product, selectedWeight, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1200);
    };

    const handleBuyNow = () => {
        if (isOutOfStock) return;
        addItem(product, selectedWeight, quantity);
        navigate('/checkout');
    };

    const currentPrice = selectedWeight ? selectedWeight.price * quantity : (product.base_price || 0) * quantity;

    return (
        <div className="space-y-8 sm:space-y-12 pb-28 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <SEO
                title={product.name}
                description={product.description ? product.description.substring(0, 160) : `Buy ${product.name} - premium organic dry fruit from Gilgit-Baltistan.`}
                ogImage={product.image_url}
                type="product"
            />

            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#3A2E1F]/70 overflow-x-auto scrollbar-none pb-1">
                <Link to="/" className="hover:text-[#D97706] transition-colors shrink-0">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40 shrink-0" />
                <Link to="/shop" className="hover:text-[#D97706] transition-colors shrink-0">Shop</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40 shrink-0" />
                <Link to={`/shop?category=${product.category_slug}`} className="hover:text-[#D97706] transition-colors shrink-0">{product.category_name}</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40 shrink-0" />
                <span className="text-[#3A2E1F] font-bold truncate max-w-xs shrink-0">{product.name}</span>
            </nav>

            {/* MAIN PRODUCT SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                {/* Left: Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-4/3 sm:aspect-square bg-[#F5EFE0] border border-[#E8DEC8] rounded-3xl overflow-hidden shadow-xs relative">
                        <img src={selectedImage} alt={product.name} className="w-full h-full object-cover transition-all duration-300" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                        <span className="absolute top-4 left-4 px-3 py-1 bg-[#F5A623] text-[#3A2E1F] font-extrabold text-xs rounded-full shadow-xs">
                            100% Organic
                        </span>
                        {isLowStock && (
                            <span className="absolute top-4 right-4 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-full shadow-xs">
                                Only {itemStock} left
                            </span>
                        )}
                        {isOutOfStock && (
                            <span className="absolute top-4 right-4 px-3 py-1 bg-rose-500 text-white font-bold text-xs rounded-full shadow-xs">
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Product Info & Actions */}
                <div className="space-y-5 bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-5 sm:p-8 shadow-xs">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                            <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider bg-[#F5EFE0] px-3 py-1 rounded-full border border-[#E8DEC8]">
                                {product.category_name}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-[#F5EFE0] px-2.5 py-1 rounded-full border border-[#E8DEC8]">
                                    <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                                    <span className="font-black text-xs text-[#3A2E1F]">{displayRating}</span>
                                    <span className="text-xs text-[#3A2E1F]/60">({displayReviews} reviews)</span>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOutOfStock ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                </span>
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F] leading-tight">
                            {product.name}
                        </h1>
                    </div>

                    {/* Price Display */}
                    {selectedWeight && (
                        <div className="p-4 bg-[#F5EFE0]/60 border border-[#E8DEC8] rounded-2xl flex items-baseline justify-between">
                            <div>
                                <span className="text-xs text-[#3A2E1F]/70 block">Selected Pack Price</span>
                                <span className="text-2xl sm:text-3xl font-black font-heading text-[#3A2E1F]">
                                    Rs. {currentPrice.toLocaleString()}
                                </span>
                            </div>
                            <span className="text-xs text-[#D97706] font-bold">
                                (Rs. {selectedWeight.price} / {selectedWeight.label})
                            </span>
                        </div>
                    )}

                    <p className="text-xs sm:text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                        {product.description}
                    </p>

                    {/* Weight Option Selector */}
                    {product.weight_options && (
                        <div className="space-y-2.5 pt-2">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                Select Pack Size (Weight):
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                {product.weight_options.map((option) => (
                                    <button
                                        key={option.label} type="button" onClick={() => setSelectedWeight(option)}
                                        className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${selectedWeight?.label === option.label ? 'bg-[#F5A623] border-[#D97706] text-[#3A2E1F] shadow-xs ring-2 ring-[#F5A623]/40' : 'bg-white border-[#E8DEC8] text-[#3A2E1F]/80 hover:bg-[#F5EFE0]'
                                            }`}
                                    >
                                        <span className="text-sm font-black">{option.label}</span>
                                        <span className="text-[11px] text-[#3A2E1F]/70">Rs. {option.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity Stepper */}
                    <div className="space-y-2.5 pt-2">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Quantity:</label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-white border border-[#E8DEC8] rounded-full p-1 shadow-xs">
                                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock} className="w-9 h-9 rounded-full bg-[#F5EFE0] hover:bg-[#F5A623] disabled:opacity-50 text-[#3A2E1F] flex items-center justify-center transition-colors min-h-[36px]">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-extrabold text-sm text-[#3A2E1F]">{quantity}</span>
                                <button type="button" onClick={() => setQuantity(Math.min(itemStock, quantity + 1))} disabled={isOutOfStock || quantity >= itemStock} className="w-9 h-9 rounded-full bg-[#F5EFE0] hover:bg-[#F5A623] disabled:opacity-50 text-[#3A2E1F] flex items-center justify-center transition-colors min-h-[36px]">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E8DEC8]">
                        <button
                            type="button" onClick={handleAddToCart} disabled={isOutOfStock}
                            className="flex-1 py-3.5 px-6 bg-[#F5A623] hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed text-[#3A2E1F] hover:text-white font-extrabold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
                        >
                            {isAdded ? (
                                <>
                                    <Check className="w-4 h-4 text-emerald-900 stroke-[3]" />
                                    <span>Added to Cart!</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button" onClick={handleBuyNow} disabled={isOutOfStock}
                            className="flex-1 py-3.5 px-6 bg-[#3A2E1F] hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-full shadow-md transition-all text-center flex items-center justify-center min-h-[44px] cursor-pointer"
                        >
                            Buy Now
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E8DEC8] text-center text-[11px] text-[#3A2E1F]/70">
                        <div className="flex flex-col items-center gap-1"><Truck className="w-4 h-4 text-[#D97706]" /><span>Fast Shipping</span></div>
                        <div className="flex flex-col items-center gap-1"><ShieldCheck className="w-4 h-4 text-[#D97706]" /><span>100% Organic</span></div>
                        <div className="flex flex-col items-center gap-1"><RefreshCw className="w-4 h-4 text-[#D97706]" /><span>Easy Return</span></div>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-5 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-3 border-b border-[#E8DEC8] overflow-x-auto pb-2 scrollbar-none">
                    {['description', 'shipping'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#3A2E1F] text-white shadow-xs' : 'bg-[#F5EFE0]/60 text-[#3A2E1F]/80 hover:bg-[#F5EFE0]'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="pt-1">
                    {activeTab === 'description' && (
                        <div className="space-y-3 text-xs sm:text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            <h3 className="font-heading font-bold text-base sm:text-lg text-[#3A2E1F]">About {product.name}</h3>
                            <p>{product.description}</p>
                        </div>
                    )}
                    {activeTab === 'shipping' && (
                        <div className="space-y-3 text-xs sm:text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            <h3 className="font-heading font-bold text-base sm:text-lg text-[#3A2E1F]">Nationwide Delivery</h3>
                            <ul className="list-disc list-inside space-y-1.5 text-xs">
                                <li>Orders dispatched within 24 hours.</li>
                                <li>Delivery time: 2-3 business days.</li>
                                <li>Free shipping on all orders above Rs. 3,000.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* RELATED PRODUCTS - 2 COLUMNS ON MOBILE */}
            {relatedProducts.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-[#3A2E1F]">You Might Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={{
                                ...p,
                                category: p.category_name || p.category_slug,
                                images: [p.image_url],
                                weightOptions: p.weight_options
                            }} />
                        ))}
                    </div>
                </div>
            )}

            {/* STICKY BOTTOM BAR FOR MOBILE VIEWPORTS ONLY */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#E8DEC8] p-3.5 shadow-2xl flex items-center justify-between gap-3 md:hidden">
                <div>
                    <span className="text-[10px] text-[#3A2E1F]/60 block leading-tight font-bold uppercase tracking-wider">Total ({selectedWeight?.label || '500g'})</span>
                    <span className="text-lg font-black font-heading text-[#3A2E1F]">
                        Rs. {currentPrice.toLocaleString()}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`
                            px-5 py-3 rounded-full font-extrabold text-xs shadow-md transition-all flex items-center gap-2 min-h-[44px] cursor-pointer
                            ${isOutOfStock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F]'
                            }
                        `}
                    >
                        {isAdded ? (
                            <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Added!</span>
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="w-4 h-4" />
                                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
}
