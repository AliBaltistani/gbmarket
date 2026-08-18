import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const GRADIENTS = [
    'from-[#F5A623]/25 via-[#F5EFE0] to-[#D97706]/15',
    'from-[#D97706]/25 via-[#F5EFE0] to-[#F5A623]/20',
    'from-[#3A2E1F]/15 via-[#F5EFE0] to-[#F5A623]/25',
    'from-[#F5EFE0] via-[#F5A623]/15 to-[#D97706]/20',
    'from-[#D97706]/20 via-[#FFFDF9] to-[#3A2E1F]/10',
];

export default function HeroBanner({ config }) {
    const slides = config?.slides || [];
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused || slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, slides.length]);

    if (slides.length === 0) return null;

    const slide = slides[currentSlide];
    const gradient = GRADIENTS[currentSlide % GRADIENTS.length];

    return (
        <section
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-3xl p-5 sm:p-7 lg:p-8 border border-[#E8DEC8] shadow-xs max-w-7xl mx-auto mt-3 transition-colors duration-700`}
        >
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 top-0 w-48 h-48 bg-[#D97706]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3.5 text-center lg:text-left">
                    {slide.badge && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9]/80 backdrop-blur-md text-[#3A2E1F] border border-[#F5A623]/40 text-xs font-bold shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>{slide.badge}</span>
                        </div>
                    )}
                    <h1 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold font-heading text-[#3A2E1F] tracking-tight leading-tight transition-all duration-500">
                        {slide.title}
                    </h1>
                    {slide.subtitle && (
                        <p className="text-xs sm:text-sm text-[#3A2E1F]/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-body">
                            {slide.subtitle}
                        </p>
                    )}
                    <div className="flex flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                        {slide.ctaLink && (
                            <Link to={slide.ctaLink} className="px-6 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-extrabold text-xs sm:text-sm rounded-full shadow-xs hover:shadow-md transition-all duration-200 text-center flex items-center gap-2 min-h-[40px]">
                                <span>{slide.ctaText || 'Shop Now'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                        <Link to="/about" className="px-5 py-2.5 bg-[#FFFDF9]/90 hover:bg-[#F5EFE0] text-[#3A2E1F] font-bold text-xs sm:text-sm rounded-full border border-[#E8DEC8] transition-all duration-200 text-center min-h-[40px] flex items-center justify-center">
                            Story
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-5 relative flex items-center justify-center">
                    <div className="w-full max-w-xs sm:max-w-sm aspect-16/10 sm:aspect-16/9 bg-[#FFFDF9] rounded-2xl p-2.5 shadow-lg border border-[#E8DEC8] relative transform hover:scale-[1.02] transition-transform duration-500 overflow-hidden">
                        <img
                            key={currentSlide}
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover rounded-xl transition-all duration-500 animate-fadeIn"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                        />
                        {slide.highlight && (
                            <div className="absolute bottom-3 left-3 right-3 bg-[#3A2E1F]/90 backdrop-blur-md text-[#F5EFE0] p-2.5 rounded-xl shadow-md border border-[#F5A623]/30 flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#F5A623] text-[#3A2E1F] flex items-center justify-center font-bold shrink-0">
                                    <Award className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[9px] text-[#F5A623] font-black uppercase tracking-wider">Verified Sourced</div>
                                    <div className="text-xs font-bold truncate">{slide.highlight}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {slides.length > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E8DEC8]/50">
                    <div className="flex items-center gap-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-[#D97706]' : 'w-2 bg-[#E8DEC8] hover:bg-[#F5A623]'}`}
                                aria-label={`Go to hero slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#3A2E1F]/60">0{currentSlide + 1} / 0{slides.length}</span>
                        <button type="button" onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))} aria-label="Previous Slide" className="w-7 h-7 rounded-full bg-white/80 hover:bg-[#F5A623] text-[#3A2E1F] border border-[#E8DEC8] flex items-center justify-center transition-all shadow-2xs">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} aria-label="Next Slide" className="w-7 h-7 rounded-full bg-white/80 hover:bg-[#F5A623] text-[#3A2E1F] border border-[#E8DEC8] flex items-center justify-center transition-all shadow-2xs">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
