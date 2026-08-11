import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Sparkles, ArrowRight, Sun, Award, ShieldCheck } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-[#F5EFE0] text-[#3A2E1F]">
            {/* Navigation Header */}
            <Header />

            {/* Main Content / Placeholder Hero Shell */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
                {/* Hero Card Container (using rounded-2xl as default card radius) */}
                <div className="relative bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-8 sm:p-12 md:p-16 shadow-sm overflow-hidden text-center sm:text-left">

                    {/* Background Decorative Gradient Blobs */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#F5A623]/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-3xl space-y-6">

                        {/* Organic Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#D97706] text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" />
                            <span>GBMarket Phase 1 Shell Ready</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-[#3A2E1F] leading-tight">
                            Hero coming soon
                        </h1>

                        {/* Subheading / Description */}
                        <p className="text-lg sm:text-xl text-[#3A2E1F]/80 leading-relaxed font-normal">
                            Welcome to <span className="font-semibold text-[#D97706]">GBMarket</span> — your natural dry fruits & organic nuts online store shell. The brand theme, custom colors, typography, header, and footer are successfully configured!
                        </p>

                        {/* Quick Stats / Highlights Badges */}
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3.5 bg-[#F5EFE0]/60 rounded-xl border border-[#E8DEC8]">
                                <Sun className="w-5 h-5 text-[#F5A623]" />
                                <span className="text-xs font-medium text-[#3A2E1F]">100% Sun-Dried</span>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 bg-[#F5EFE0]/60 rounded-xl border border-[#E8DEC8]">
                                <Award className="w-5 h-5 text-[#D97706]" />
                                <span className="text-xs font-medium text-[#3A2E1F]">Gilgit Mountain Fresh</span>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 bg-[#F5EFE0]/60 rounded-xl border border-[#E8DEC8]">
                                <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
                                <span className="text-xs font-medium text-[#3A2E1F]">Lab Certified Premium</span>
                            </div>
                        </div>

                        {/* Call to action buttons */}
                        <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <button
                                type="button"
                                className="px-8 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-semibold text-base rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
                            >
                                <span>Explore Store Shell</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
