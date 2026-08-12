import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const navigate = useNavigate();
    const [isAdded, setIsAdded] = useState(false);

    const {
        name,
        slug,
        category,
        category_name,
        basePrice,
        base_price,
        rating,
        review_count,
        reviewsCount,
        images,
        image_url,
        isNew,
        is_featured,
        stock,
        stockStatus
    } = product || {};

    // Safely support both camelCase (dummy data) and snake_case (SQLite API)
    const price = base_price || basePrice || 0;
    const catName = category_name || category || 'Dry Fruits';
    const displayRating = rating !== undefined && rating !== null ? Number(rating).toFixed(1) : '4.8';
    const displayReviews = review_count || reviewsCount || 25;
    const itemStock = stock !== undefined ? Number(stock) : (stockStatus === 'Out of Stock' ? 0 : 20);
    const isOutOfStock = itemStock <= 0 || stockStatus === 'Out of Stock';
    const isLowStock = !isOutOfStock && itemStock > 0 && itemStock < 5;

    // Image fallback logic
    const imageSrc = (images && images[0]) ? images[0] : (image_url || 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800');

    // Parse weight options with fallbacks
    let parsedWeightOptions = [
        { label: '250g', price: price },
        { label: '500g', price: Math.round(price * 1.8) },
        { label: '1kg', price: Math.round(price * 3.4) }
    ];

    if (product?.weight_options) {
        try {
            const opts = typeof product.weight_options === 'string' ? JSON.parse(product.weight_options) : product.weight_options;
            if (Array.isArray(opts) && opts.length > 0) {
                parsedWeightOptions = opts;
            }
        } catch (e) {
            // fallback
        }
    } else if (product?.weightOptions && Array.isArray(product.weightOptions) && product.weightOptions.length > 0) {
        parsedWeightOptions = product.weightOptions;
    }

    const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
    const activeWeight = parsedWeightOptions[selectedWeightIndex] || parsedWeightOptions[0];
    const activePrice = activeWeight?.price || price;

    // Quick Add to Cart (stay on page)
    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock || isAdded) return;

        addItem(product, activeWeight, 1);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 1200);
    };

    // Buy Now Action (Add to cart & go directly to Checkout)
    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;

        addItem(product, activeWeight, 1);
        navigate('/checkout');
    };

    return (
        <div className="group bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full relative">
            {/* Top Image Container */}
            <div className="relative aspect-4/3 bg-[#F5EFE0] overflow-hidden">
                <Link to={`/product/${slug}`} className="block w-full h-full">
                    <img
                        src={imageSrc}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {(isNew || is_featured === 1) && (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#F5A623] text-[#3A2E1F] rounded-full shadow-xs">
                            Featured
                        </span>
                    )}
                    {isLowStock && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full border border-amber-300 shadow-xs">
                            Only {itemStock} left
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 rounded-full border border-rose-300 shadow-xs">
                            Out of Stock
                        </span>
                    )}
                </div>
            </div>

            {/* Card Body Details */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#D97706] font-semibold">
                        <span className="truncate max-w-[120px]">{catName}</span>
                        <div className="flex items-center gap-1 shrink-0 bg-[#F5EFE0]/60 px-1.5 py-0.5 rounded-md border border-[#E8DEC8]/50">
                            <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                            <span className="font-extrabold text-[11px] text-[#3A2E1F]">{displayRating}</span>
                            <span className="text-[10px] text-[#3A2E1F]/50 font-normal">({displayReviews})</span>
                        </div>
                    </div>

                    <Link to={`/product/${slug}`} className="block group-hover:text-[#D97706] transition-colors">
                        <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#3A2E1F] line-clamp-1 leading-snug">
                            {name}
                        </h3>
                    </Link>

                    {/* WEIGHT VARIANTS SELECTION CHIPS */}
                    {parsedWeightOptions.length > 0 && (
                        <div className="pt-0.5">
                            <span className="text-[9px] sm:text-[10px] font-bold text-[#3A2E1F]/60 block mb-1">Select Pack Weight:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                                {parsedWeightOptions.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedWeightIndex(idx);
                                        }}
                                        className={`px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-md transition-all cursor-pointer border ${selectedWeightIndex === idx
                                            ? 'bg-[#F5A623] text-[#3A2E1F] border-[#D97706] shadow-2xs scale-105'
                                            : 'bg-[#F5EFE0]/60 hover:bg-[#F5EFE0] text-[#3A2E1F]/80 border-[#E8DEC8]'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Price Display & Direct Buy Action Bar */}
                <div className="space-y-1.5 pt-2 border-t border-[#E8DEC8]/70">
                    <div className="flex items-baseline justify-between">
                        <span className="text-[9px] sm:text-[10px] text-[#3A2E1F]/60">Pack Price:</span>
                        <div className="text-sm sm:text-base lg:text-lg font-black font-heading text-[#3A2E1F]">
                            Rs. {activePrice.toLocaleString()}
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1">
                        {/* Quick Add icon button (1 col) */}
                        <button
                            type="button"
                            onClick={handleQuickAdd}
                            disabled={isOutOfStock}
                            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            aria-label="Add to Cart"
                            className={`
                                col-span-1 rounded-xl flex items-center justify-center transition-all cursor-pointer min-h-[36px] active:scale-95 border
                                ${isOutOfStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                    : isAdded
                                        ? 'bg-emerald-600 text-white border-emerald-700'
                                        : 'bg-[#F5EFE0] hover:bg-[#E8DEC8] text-[#3A2E1F] border-[#E8DEC8]'
                                }
                            `}
                        >
                            {isAdded ? (
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            ) : (
                                <ShoppingBag className="w-3.5 h-3.5" />
                            )}
                        </button>

                        {/* Direct Buy Now button (4 cols) */}
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                            className={`
                                col-span-4 px-2.5 py-1.5 rounded-xl font-extrabold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 shadow-xs min-h-[36px] cursor-pointer active:scale-95
                                ${isOutOfStock
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white shadow-xs'
                                }
                            `}
                        >
                            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
                            <span className="truncate">Buy Now</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
