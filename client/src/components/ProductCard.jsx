import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
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

    // Parse default weight option for Quick Add
    let defaultWeight = { label: '500g', price: price };
    if (product.weight_options) {
        try {
            const opts = typeof product.weight_options === 'string' ? JSON.parse(product.weight_options) : product.weight_options;
            if (Array.isArray(opts) && opts.length > 0) {
                defaultWeight = opts[0];
            }
        } catch (e) {
            // fallback
        }
    } else if (product.weightOptions && Array.isArray(product.weightOptions) && product.weightOptions.length > 0) {
        defaultWeight = product.weightOptions[0];
    }

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock || isAdded) return;

        addItem(product, defaultWeight, 1);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 1200);
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
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                    <div className="flex items-center justify-between text-xs text-[#D97706] font-semibold mb-1">
                        <span className="truncate max-w-[130px]">{catName}</span>
                        <div className="flex items-center gap-1 shrink-0 bg-[#F5EFE0]/60 px-1.5 py-0.5 rounded-md border border-[#E8DEC8]/50">
                            <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                            <span className="font-extrabold text-[11px] text-[#3A2E1F]">{displayRating}</span>
                            <span className="text-[10px] text-[#3A2E1F]/50 font-normal">({displayReviews})</span>
                        </div>
                    </div>

                    <Link to={`/product/${slug}`} className="block group-hover:text-[#D97706] transition-colors">
                        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#3A2E1F] line-clamp-1 leading-snug">
                            {name}
                        </h3>
                    </Link>
                </div>

                {/* Footer Price & Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#E8DEC8]/70 gap-2">
                    <div>
                        <span className="text-[10px] sm:text-xs text-[#3A2E1F]/60 block leading-tight">Starting from</span>
                        <span className="text-base sm:text-lg font-black font-heading text-[#3A2E1F]">
                            Rs. {price.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Quick Add to Cart Icon Button */}
                        <button
                            type="button"
                            onClick={handleQuickAdd}
                            disabled={isOutOfStock}
                            title={isOutOfStock ? "Out of Stock" : "Quick Add to Cart"}
                            aria-label="Quick Add to Cart"
                            className={`
                                min-w-[42px] min-h-[42px] sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95
                                ${isOutOfStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                    : isAdded
                                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                                        : 'bg-[#F5EFE0] hover:bg-[#F5A623] text-[#3A2E1F] border border-[#E8DEC8] hover:border-[#F5A623]'
                                }
                            `}
                        >
                            {isAdded ? (
                                <Check className="w-4 h-4 text-white stroke-[3]" />
                            ) : (
                                <ShoppingBag className="w-4 h-4" />
                            )}
                        </button>

                        {/* View Product Details Link */}
                        <Link
                            to={`/product/${slug}`}
                            className="px-3.5 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-extrabold text-xs rounded-full shadow-xs transition-all duration-200 flex items-center justify-center min-h-[42px]"
                        >
                            <span>View</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
