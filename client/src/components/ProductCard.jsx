import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart } from 'lucide-react';

export default function ProductCard({ product }) {
    const {
        name,
        slug,
        category,
        basePrice,
        rating = 4.8,
        reviewsCount = 42,
        images,
        isNew,
        stockStatus = 'In Stock'
    } = product;

    const imageSrc = images && images[0] ? images[0] : 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=800';

    return (
        <div className="group bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
            {/* Top Image Container */}
            <div className="relative aspect-4/3 bg-[#F5EFE0] overflow-hidden">
                <Link to={`/product/${slug}`}>
                    <img
                        src={imageSrc}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {isNew && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F5A623] text-[#3A2E1F] rounded-full shadow-sm">
                            New
                        </span>
                    )}
                    {stockStatus === 'Low Stock' && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                            Low Stock
                        </span>
                    )}
                </div>

                {/* Wishlist Icon */}
                <button
                    type="button"
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-[#3A2E1F] hover:text-[#D97706] hover:bg-white transition-colors shadow-sm"
                    aria-label="Add to wishlist"
                >
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            {/* Card Body Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                    <div className="flex items-center justify-between text-xs text-[#D97706] font-semibold mb-1">
                        <span>{category}</span>
                        <div className="flex items-center gap-1 text-[#3A2E1F]/70">
                            <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                            <span className="font-bold text-[#3A2E1F] text-xs">{rating}</span>
                            <span>({reviewsCount})</span>
                        </div>
                    </div>

                    <Link to={`/product/${slug}`} className="block group-hover:text-[#D97706] transition-colors">
                        <h3 className="font-heading font-bold text-lg text-[#3A2E1F] line-clamp-1 leading-snug">
                            {name}
                        </h3>
                    </Link>
                </div>

                {/* Footer Price & Add to Cart */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E8DEC8]">
                    <div>
                        <span className="text-xs text-[#3A2E1F]/60 block leading-tight">Starting from</span>
                        <span className="text-xl font-extrabold font-heading text-[#3A2E1F]">
                            Rs. {basePrice.toLocaleString()}
                        </span>
                    </div>

                    <Link
                        to={`/product/${slug}`}
                        className="px-4 py-2 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-semibold text-xs rounded-full shadow-sm transition-all duration-200 flex items-center gap-1.5"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
