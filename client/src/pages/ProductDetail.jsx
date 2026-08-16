import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Star, ShoppingBag, Truck, ShieldCheck, RefreshCw, Plus, Minus,
    ArrowLeft, ChevronRight, AlertTriangle, Check, MapPin, Clock,
    Package, ThumbsUp, MessageSquare, Loader2, ChevronLeft, ChevronRight as CRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProductBySlug, getProducts } from '../api/products';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/SEO';
import api from '../api/api';

const StarRating = ({ value, onChange, size = 'lg' }) => {
    const [hovered, setHovered] = useState(0);
    const sz = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button"
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(s)}
                    className="transition-transform hover:scale-110">
                    <Star className={`${sz} transition-colors ${s <= (hovered || value) ? 'fill-[#F5A623] text-[#F5A623]' : 'text-[#E8DEC8] hover:text-[#F5A623]'}`} />
                </button>
            ))}
        </div>
    );
};

const StarDisplay = ({ rating, size = 'sm' }) => {
    const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`${sz} ${s <= Math.round(rating) ? 'fill-[#F5A623] text-[#F5A623]' : 'text-[#E8DEC8]'}`} />
            ))}
        </div>
    );
};

export default function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { settings } = useSettings();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [selectedImage, setSelectedImage] = useState('');
    const [allImages, setAllImages] = useState([]);
    const [selectedWeight, setSelectedWeight] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isAdded, setIsAdded] = useState(false);

    // Reviews
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 0, title: '', comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setNotFound(false);
            setReviewSubmitted(false);
            try {
                const data = await getProductBySlug(slug);
                setProduct(data);

                // Build image array: primary + gallery
                const imgs = [];
                if (data.image_url) imgs.push(data.image_url);
                if (data.gallery_images?.length > 0) imgs.push(...data.gallery_images);
                setAllImages(imgs);
                if (imgs.length > 0) setSelectedImage(imgs[0]);
                if (data.weight_options?.length > 0) setSelectedWeight(data.weight_options[0]);
                setQuantity(1);

                const related = await getProducts({ category: data.category_slug });
                setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));
            } catch (error) {
                if (error.response?.status === 404) setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    // Load reviews when tab changes to reviews
    useEffect(() => {
        if (activeTab === 'reviews' && product?.id) {
            setLoadingReviews(true);
            api.get(`/reviews?product_id=${product.id}`)
                .then(res => setReviews(res.data))
                .catch(() => { })
                .finally(() => setLoadingReviews(false));
        }
    }, [activeTab, product?.id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewForm.rating) { return; }
        setSubmittingReview(true);
        try {
            await api.post('/reviews', {
                product_id: product.id,
                customer_name: reviewForm.name,
                customer_email: reviewForm.email || undefined,
                rating: reviewForm.rating,
                title: reviewForm.title || undefined,
                comment: reviewForm.comment || undefined,
            });
            setReviewSubmitted(true);
            setReviewForm({ name: '', email: '', rating: 0, title: '', comment: '' });
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-square bg-[#F5EFE0] rounded-3xl animate-pulse" />
                <div className="space-y-6">
                    <div className="h-10 bg-[#F5EFE0] rounded w-3/4 animate-pulse" />
                    <div className="h-6 bg-[#F5EFE0] rounded w-1/4 animate-pulse" />
                    <div className="h-40 bg-[#F5EFE0] rounded animate-pulse" />
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
                <Link to="/shop" className="inline-block px-8 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] font-bold rounded-full">Return to Shop</Link>
            </div>
        );
    }

    const itemStock = Number(product.stock ?? 20);
    const isOutOfStock = itemStock <= 0;
    const isLowStock = !isOutOfStock && itemStock < 5;
    const displayRating = product.rating ? Number(product.rating).toFixed(1) : '4.8';
    const displayReviews = product.review_count || 0;
    const currentPrice = selectedWeight ? selectedWeight.price * quantity : (product.base_price || 0) * quantity;

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

    return (
        <div className="space-y-8 sm:space-y-12 pb-28 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <SEO
                title={product.name}
                description={product.description?.substring(0, 160) || `Buy ${product.name} - premium organic dry fruit.`}
                canonical={`https://gbmarket.pk/product/${product.slug}`}
                ogImage={product.image_url}
                type="product"
                structuredData={{
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "Product",
                            "name": product.name,
                            "description": product.description || `Buy ${product.name} - premium organic dry fruit.`,
                            "image": product.image_url || "https://gbmarket.pk/placeholder.png",
                            "offers": {
                                "@type": "Offer",
                                "price": product.base_price,
                                "priceCurrency": settings.currency_code || "PKR",
                                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                                "url": `https://gbmarket.pk/product/${product.slug}`
                            },
                            ...(product.review_count > 0 ? {
                                "aggregateRating": {
                                    "@type": "AggregateRating",
                                    "ratingValue": product.rating,
                                    "reviewCount": product.review_count
                                }
                            } : {})
                        },
                        {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://gbmarket.pk/" },
                                { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://gbmarket.pk/shop" },
                                { "@type": "ListItem", "position": 3, "name": product.category_name, "item": `https://gbmarket.pk/shop?category=${product.category_slug}` },
                                { "@type": "ListItem", "position": 4, "name": product.name, "item": `https://gbmarket.pk/product/${product.slug}` }
                            ]
                        }
                    ]
                }}
            />

            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#3A2E1F]/70 overflow-x-auto scrollbar-none pb-1">
                <Link to="/" className="hover:text-[#D97706] shrink-0">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40 shrink-0" />
                <Link to="/shop" className="hover:text-[#D97706] shrink-0">Shop</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40 shrink-0" />
                <Link to={`/shop?category=${product.category_slug}`} className="hover:text-[#D97706] shrink-0">{product.category_name}</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40 shrink-0" />
                <span className="text-[#3A2E1F] font-bold truncate max-w-xs">{product.name}</span>
            </nav>

            {/* MAIN PRODUCT SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                {/* IMAGE GALLERY */}
                <div className="space-y-3">
                    {/* Main Image */}
                    <div className="aspect-4/3 sm:aspect-square bg-[#F5EFE0] border border-[#E8DEC8] rounded-3xl overflow-hidden shadow-xs relative">
                        <img src={selectedImage} alt={product.name}
                            className="w-full h-full object-cover transition-all duration-300"
                            onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                        <span className="absolute top-4 left-4 px-3 py-1 bg-[#F5A623] text-[#3A2E1F] font-extrabold text-xs rounded-full shadow-xs">{settings.product_badge_text || '100% Organic'}</span>
                        {product.is_new === 1 && (
                            <span className="absolute top-4 right-4 px-3 py-1 bg-blue-500 text-white font-bold text-xs rounded-full shadow-xs">New Arrival</span>
                        )}
                        {isLowStock && !product.is_new && (
                            <span className="absolute top-4 right-4 px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-full shadow-xs">Only {itemStock} left</span>
                        )}
                        {isOutOfStock && (
                            <span className="absolute top-4 right-4 px-3 py-1 bg-rose-500 text-white font-bold text-xs rounded-full shadow-xs">Out of Stock</span>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                            {allImages.map((img, idx) => (
                                <button key={idx} type="button" onClick={() => setSelectedImage(img)}
                                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-[#F5A623] shadow-md' : 'border-[#E8DEC8] hover:border-[#F5A623]/50'}`}>
                                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover"
                                        onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* PRODUCT INFO */}
                <div className="space-y-5 bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-5 sm:p-8 shadow-xs">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                            <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider bg-[#F5EFE0] px-3 py-1 rounded-full border border-[#E8DEC8]">{product.category_name}</span>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => { setActiveTab('reviews'); document.getElementById('tabs-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                                    className="flex items-center gap-1 bg-[#F5EFE0] px-2.5 py-1 rounded-full border border-[#E8DEC8] hover:bg-[#F5A623]/20 transition-colors">
                                    <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                                    <span className="font-black text-xs text-[#3A2E1F]">{displayRating}</span>
                                    <span className="text-xs text-[#3A2E1F]/60">({displayReviews})</span>
                                </button>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isOutOfStock ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                </span>
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F] leading-tight">{product.name}</h1>
                        {product.short_description && (
                            <p className="mt-1 text-sm text-[#3A2E1F]/60 font-body">{product.short_description}</p>
                        )}
                    </div>

                    {/* Price */}
                    {selectedWeight && (
                        <div className="p-4 bg-[#F5EFE0]/60 border border-[#E8DEC8] rounded-2xl flex items-baseline justify-between">
                            <div>
                                <span className="text-xs text-[#3A2E1F]/70 block">Selected Pack</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-black font-heading text-[#3A2E1F]">
                                        {settings.currency_symbol || 'Rs. '} {product.discount_percent > 0
                                            ? Math.round(currentPrice * (1 - product.discount_percent / 100)).toLocaleString()
                                            : currentPrice.toLocaleString()}
                                    </span>
                                    {product.discount_percent > 0 && (
                                        <>
                                            <span className="text-sm text-[#3A2E1F]/40 line-through">{settings.currency_symbol || 'Rs. '} {currentPrice.toLocaleString()}</span>
                                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">-{product.discount_percent}%</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-[#D97706] font-bold">({settings.currency_symbol || 'Rs. '} {selectedWeight.price} / {selectedWeight.label})</span>
                        </div>
                    )}

                    {product.description && (
                        <p className="text-xs sm:text-sm text-[#3A2E1F]/80 leading-relaxed font-body">{product.description}</p>
                    )}

                    {/* Quick product details */}
                    {(product.origin || product.shelf_life) && (
                        <div className="flex flex-wrap gap-3">
                            {product.origin && (
                                <span className="text-[11px] font-bold text-[#3A2E1F]/70 bg-[#F5EFE0] border border-[#E8DEC8] px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#D97706]" /> {product.origin}
                                </span>
                            )}
                            {product.shelf_life && (
                                <span className="text-[11px] font-bold text-[#3A2E1F]/70 bg-[#F5EFE0] border border-[#E8DEC8] px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#D97706]" /> {product.shelf_life}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Weight Options */}
                    {product.weight_options?.length > 0 && (
                        <div className="space-y-2.5 pt-2">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Select Pack Size:</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                {product.weight_options.map(option => (
                                    <button key={option.label} type="button" onClick={() => setSelectedWeight(option)}
                                        className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer active:scale-95 ${selectedWeight?.label === option.label ? 'bg-[#F5A623] border-[#D97706] text-[#3A2E1F] ring-2 ring-[#F5A623]/40' : 'bg-white border-[#E8DEC8] text-[#3A2E1F]/80 hover:bg-[#F5EFE0]'}`}>
                                        <span className="text-sm font-black">{option.label}</span>
                                        <span className="text-[11px] text-[#3A2E1F]/70">{settings.currency_symbol || 'Rs. '} {option.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-2.5 pt-2">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Quantity:</label>
                        <div className="flex items-center bg-white border border-[#E8DEC8] rounded-full p-1 shadow-xs w-fit">
                            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock}
                                className="w-9 h-9 rounded-full bg-[#F5EFE0] hover:bg-[#F5A623] disabled:opacity-50 flex items-center justify-center transition-colors">
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-extrabold text-sm text-[#3A2E1F]">{quantity}</span>
                            <button type="button" onClick={() => setQuantity(Math.min(itemStock, quantity + 1))} disabled={isOutOfStock || quantity >= itemStock}
                                className="w-9 h-9 rounded-full bg-[#F5EFE0] hover:bg-[#F5A623] disabled:opacity-50 flex items-center justify-center transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E8DEC8]">
                        <button type="button" onClick={handleAddToCart} disabled={isOutOfStock}
                            className="flex-1 py-3.5 px-6 bg-[#F5A623] hover:bg-[#D97706] disabled:opacity-50 text-[#3A2E1F] hover:text-white font-extrabold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]">
                            {isAdded ? <><Check className="w-4 h-4 stroke-[3]" /><span>Added!</span></> : <><ShoppingBag className="w-4 h-4" /><span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span></>}
                        </button>
                        <button type="button" onClick={handleBuyNow} disabled={isOutOfStock}
                            className="flex-1 py-3.5 px-6 bg-[#3A2E1F] hover:bg-[#D97706] disabled:opacity-50 text-white font-extrabold text-sm rounded-full shadow-md transition-all flex items-center justify-center min-h-[44px]">
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
            <div id="tabs-section" className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-5 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center gap-3 border-b border-[#E8DEC8] overflow-x-auto pb-2 scrollbar-none">
                    {[
                        { key: 'description', label: 'Description' },
                        { key: 'details', label: 'Product Details' },
                        { key: 'shipping', label: 'Shipping' },
                        { key: 'reviews', label: `Reviews (${displayReviews})` },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-[#3A2E1F] text-white' : 'bg-[#F5EFE0]/60 text-[#3A2E1F]/80 hover:bg-[#F5EFE0]'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="pt-1">
                    {/* Description */}
                    {activeTab === 'description' && (
                        <div className="space-y-3 text-xs sm:text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">About {product.name}</h3>
                            <p>{product.description || 'No description available.'}</p>
                        </div>
                    )}

                    {/* Product Details */}
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">Product Information</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { label: 'Origin', value: product.origin },
                                    { label: 'Shelf Life', value: product.shelf_life },
                                    { label: 'Storage', value: product.storage_instructions },
                                    { label: 'Category', value: product.category_name },
                                    { label: 'Available Pack Sizes', value: product.weight_options?.map(o => o.label).join(', ') },
                                    { label: 'SKU', value: `${settings.sku_prefix || 'GBM-'}${product.id?.toString().padStart(4, '0')}` },
                                ].filter(d => d.value).map(d => (
                                    <div key={d.label} className="bg-[#F5EFE0]/50 rounded-2xl p-4 border border-[#E8DEC8]">
                                        <dt className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/50">{d.label}</dt>
                                        <dd className="text-sm font-bold text-[#3A2E1F] mt-0.5">{d.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    {/* Shipping */}
                    {activeTab === 'shipping' && (
                        <div className="space-y-3 text-xs sm:text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                            <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">Nationwide Delivery</h3>
                            <ul className="list-disc list-inside space-y-1.5 text-xs">
                                <li>Orders dispatched within 24 hours.</li>
                                <li>Delivery time: 2–3 business days.</li>
                                {settings.shipping_info_text ? (
                                    <li>{settings.shipping_info_text}</li>
                                ) : (
                                    <li>Free shipping on all orders above Rs. 3,000.</li>
                                )}
                                <li>Tracked delivery via courier service.</li>
                            </ul>
                        </div>
                    )}

                    {/* Reviews */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-8">
                            {/* Rating Summary */}
                            <div className="flex items-center gap-6 p-5 bg-[#F5EFE0]/50 rounded-2xl border border-[#E8DEC8]">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-[#3A2E1F]">{displayRating}</div>
                                    <StarDisplay rating={Number(displayRating)} size="md" />
                                    <div className="text-[11px] text-[#3A2E1F]/60 mt-1">{displayReviews} reviews</div>
                                </div>
                                <div className="flex-1 text-xs text-[#3A2E1F]/60">
                                    Based on approved customer reviews. All reviews are verified by our team before publishing.
                                </div>
                            </div>

                            {/* Review List */}
                            {loadingReviews ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#D97706]" />
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8 text-[#3A2E1F]/50 space-y-2">
                                    <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
                                    <p className="text-sm font-bold">No reviews yet</p>
                                    <p className="text-xs">Be the first to share your experience!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(r => (
                                        <div key={r.id} className="bg-[#F5EFE0]/30 border border-[#E8DEC8] rounded-2xl p-5 space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="font-bold text-sm text-[#3A2E1F] block">{r.customer_name}</span>
                                                    <StarDisplay rating={r.rating} />
                                                </div>
                                                <span className="text-[11px] text-[#3A2E1F]/40 shrink-0">
                                                    {new Date(r.created_at).toLocaleDateString(settings.locale?.replace('_', '-') || 'en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            {r.title && <p className="text-sm font-bold text-[#3A2E1F]">"{r.title}"</p>}
                                            {r.comment && <p className="text-sm text-[#3A2E1F]/70 leading-relaxed">{r.comment}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Review Form */}
                            <div className="border-t border-[#E8DEC8] pt-6 space-y-5">
                                <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">Write a Review</h3>
                                {reviewSubmitted ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
                                        <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                                        <p className="font-bold text-emerald-800">Thank you for your review!</p>
                                        <p className="text-xs text-emerald-700">Your review has been submitted and is pending approval. It will appear here once approved.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block mb-2">Your Rating *</label>
                                            <StarRating value={reviewForm.rating} onChange={v => setReviewForm(p => ({ ...p, rating: v }))} />
                                            {reviewForm.rating === 0 && <p className="text-[11px] text-rose-500 mt-1">Please select a rating</p>}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block mb-1.5">Your Name *</label>
                                                <input required type="text" value={reviewForm.name}
                                                    onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))}
                                                    placeholder="e.g. Ahmed Khan"
                                                    className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block mb-1.5">Email (optional)</label>
                                                <input type="email" value={reviewForm.email}
                                                    onChange={e => setReviewForm(p => ({ ...p, email: e.target.value }))}
                                                    placeholder="your@email.com"
                                                    className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block mb-1.5">Review Title</label>
                                            <input type="text" value={reviewForm.title}
                                                onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))}
                                                placeholder="e.g. Best almonds I've had!"
                                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block mb-1.5">Your Review</label>
                                            <textarea rows={4} value={reviewForm.comment}
                                                onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                                                placeholder="Share your experience with this product..."
                                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                                        </div>
                                        <button type="submit" disabled={submittingReview || !reviewForm.rating}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] font-bold text-sm rounded-full shadow-md transition-all disabled:opacity-50">
                                            {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                                            Submit Review
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-[#3A2E1F]">You Might Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} product={{ ...p, category: p.category_name || p.category_slug, images: [p.image_url], weightOptions: p.weight_options }} />
                        ))}
                    </div>
                </div>
            )}

            {/* STICKY MOBILE BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#E8DEC8] p-3.5 shadow-2xl flex items-center justify-between gap-3 md:hidden">
                <div>
                    <span className="text-[10px] text-[#3A2E1F]/60 block leading-tight font-bold uppercase tracking-wider">Total ({selectedWeight?.label || '500g'})</span>
                    <span className="text-lg font-black font-heading text-[#3A2E1F]">
                        {settings.currency_symbol || 'Rs. '} {product.discount_percent > 0 ? Math.round(currentPrice * (1 - product.discount_percent / 100)).toLocaleString() : currentPrice.toLocaleString()}
                    </span>
                </div>
                <button type="button" onClick={handleAddToCart} disabled={isOutOfStock}
                    className={`px-5 py-3 rounded-full font-extrabold text-xs shadow-md transition-all flex items-center gap-2 min-h-[44px] ${isOutOfStock ? 'bg-gray-200 text-gray-400' : isAdded ? 'bg-emerald-600 text-white' : 'bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F]'}`}>
                    {isAdded ? <><Check className="w-4 h-4 stroke-[3]" /><span>Added!</span></> : <><ShoppingBag className="w-4 h-4" /><span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span></>}
                </button>
            </div>
        </div>
    );
}
