import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function ReviewsSection({ config }) {
    const heading = config?.heading || 'Customer Reviews';
    const reviews = config?.reviews || [];

    if (reviews.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/20 text-[#D97706] text-xs font-bold uppercase tracking-wider">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Testimonials</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F]">{heading}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((review, idx) => (
                    <div key={idx} className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col relative">
                        <Quote className="w-8 h-8 text-[#F5A623]/30 absolute top-5 right-5" />

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < (review.rating || 5) ? 'text-[#F5A623] fill-current' : 'text-[#E8DEC8]'}`}
                                />
                            ))}
                        </div>

                        <p className="text-sm text-[#3A2E1F]/80 leading-relaxed flex-1 font-body mb-4">
                            "{review.text}"
                        </p>

                        <div className="flex items-center gap-3 pt-3 border-t border-[#E8DEC8]/50">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5A623] to-[#D97706] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {review.name ? review.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <div className="font-bold text-sm text-[#3A2E1F]">{review.name}</div>
                                {review.location && (
                                    <div className="text-[11px] text-[#3A2E1F]/60">{review.location}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
