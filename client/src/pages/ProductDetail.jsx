import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Truck, ShieldCheck, RefreshCw, Plus, Minus, ArrowLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeletons';
import { getProductBySlug, getProducts } from '../api/products';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

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

    useEffect(() => {
        window.scrollTo(0, 0);
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

    const isOutOfStock = product.stock <= 0;
    const images = [product.image_url]; // Fallback if no array

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addItem(product, selectedWeight, quantity);
    };

    const handleBuyNow = () => {
        if (isOutOfStock) return;
        addItem(product, selectedWeight, quantity);
        navigate('/checkout');
    };

    return (
        <div className="space-y-12 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#3A2E1F]/70">
                <Link to="/" className="hover:text-[#D97706] transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40" />
                <Link to="/shop" className="hover:text-[#D97706] transition-colors">Shop</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40" />
                <Link to={`/shop?category=${product.category_slug}`} className="hover:text-[#D97706] transition-colors">{product.category_name}</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40" />
                <span className="text-[#3A2E1F] font-bold truncate max-w-xs">{product.name}</span>
            </nav>

            {/* MAIN PRODUCT SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Left: Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-4/3 sm:aspect-square bg-[#F5EFE0] border border-[#E8DEC8] rounded-3xl overflow-hidden shadow-sm relative">
                        <img src={selectedImage} alt={product.name} className="w-full h-full object-cover transition-all duration-300" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                        <span className="absolute top-4 left-4 px-3 py-1 bg-[#F5A623] text-[#3A2E1F] font-bold text-xs rounded-full shadow-sm">
                            100% Organic
                        </span>
                        {isOutOfStock && (
                            <span className="absolute top-4 right-4 px-3 py-1 bg-rose-500 text-white font-bold text-xs rounded-full shadow-sm">
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Product Info & Actions */}
                <div className="space-y-6 bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div>
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider bg-[#F5EFE0] px-3 py-1 rounded-full border border-[#E8DEC8]">
                                {product.category_name}
                            </span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOutOfStock ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F] leading-tight">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#3A2E1F]/80">
                            <div className="flex text-[#F5A623]">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                            <span className="font-bold text-[#3A2E1F]">4.9</span>
                        </div>
                    </div>

                    {/* Price Display */}
                    {selectedWeight && (
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
                    )}

                    <p className="text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                        {product.description}
                    </p>

                    {/* Weight Option Selector */}
                    {product.weight_options && (
                        <div className="space-y-2.5 pt-2">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                Select Pack Size (Weight):
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {product.weight_options.map((option) => (
                                    <button
                                        key={option.label} type="button" onClick={() => setSelectedWeight(option)}
                                        className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${selectedWeight?.label === option.label ? 'bg-[#F5A623] border-[#D97706] text-[#3A2E1F] shadow-sm ring-2 ring-[#F5A623]/40' : 'bg-white border-[#E8DEC8] text-[#3A2E1F]/80 hover:bg-[#F5EFE0]'
                                            }`}
                                    >
                                        <span className="text-sm font-extrabold">{option.label}</span>
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
                            <div className="flex items-center bg-white border border-[#E8DEC8] rounded-full p-1 shadow-sm opacity-100">
                                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock} className="w-9 h-9 rounded-full bg-[#F5EFE0] hover:bg-[#F5A623] disabled:opacity-50 text-[#3A2E1F] flex items-center justify-center transition-colors">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-sm text-[#3A2E1F]">{quantity}</span>
                                <button type="button" onClick={() => setQuantity(quantity + 1)} disabled={isOutOfStock} className="w-9 h-9 rounded-full bg-[#F5EFE0] hover:bg-[#F5A623] disabled:opacity-50 text-[#3A2E1F] flex items-center justify-center transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#E8DEC8]">
                        <button
                            type="button" onClick={handleAddToCart} disabled={isOutOfStock}
                            className="flex-1 py-3.5 px-6 bg-[#F5A623] hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" /><span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                        </button>
                        <button
                            type="button" onClick={handleBuyNow} disabled={isOutOfStock}
                            className="flex-1 py-3.5 px-6 bg-[#3A2E1F] hover:bg-[#D97706] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-full shadow-md transition-all text-center flex items-center justify-center"
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
            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 border-b border-[#E8DEC8] overflow-x-auto pb-2">
                    {['description', 'shipping'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#3A2E1F] text-white shadow-sm' : 'bg-[#F5EFE0]/60 text-[#3A2E1F]/80 hover:bg-[#F5EFE0]'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="pt-2">
                    {activeTab === 'description' && (
                        <div className="space-y-3 text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">About {product.name}</h3>
                            <p>{product.description}</p>
                        </div>
                    )}
                    {activeTab === 'shipping' && (
                        <div className="space-y-3 text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">Nationwide Delivery</h3>
                            <ul className="list-disc list-inside space-y-1.5 text-xs">
                                <li>Orders dispatched within 24 hours.</li>
                                <li>Delivery time: 2-3 business days.</li>
                                <li>Free shipping on all orders above Rs. 3,000.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-extrabold font-heading text-[#3A2E1F]">You Might Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
    );
}
