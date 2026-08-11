import React from 'react';
import { Leaf, Mail, Send, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <footer className="bg-[#3A2E1F] text-[#F5EFE0] mt-auto border-t border-[#D97706]/20">
            {/* Features Bar */}
            <div className="border-b border-[#F5EFE0]/10 bg-[#3A2E1F]/90 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="p-3 bg-[#F5A623]/10 text-[#F5A623] rounded-2xl">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold font-heading text-lg text-white">Free Express Shipping</h4>
                            <p className="text-xs text-[#F5EFE0]/70">On all orders over $50</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="p-3 bg-[#F5A623]/10 text-[#F5A623] rounded-2xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold font-heading text-lg text-white">100% Organic & Fresh</h4>
                            <p className="text-xs text-[#F5EFE0]/70">Direct from premium orchards</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="p-3 bg-[#F5A623]/10 text-[#F5A623] rounded-2xl">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold font-heading text-lg text-white">Easy Returns</h4>
                            <p className="text-xs text-[#F5EFE0]/70">Hassle-free 7-day policy</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <a href="#" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-[#F5A623] flex items-center justify-center text-[#3A2E1F]">
                                <Leaf className="w-6 h-6 fill-current" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold font-heading text-white">
                                    GB<span className="text-[#F5A623]">Market</span>
                                </span>
                                <span className="text-[10px] font-semibold text-[#F5A623] uppercase tracking-widest">
                                    Dry Fruits & Nuts
                                </span>
                            </div>
                        </a>
                        <p className="text-sm text-[#F5EFE0]/80 leading-relaxed">
                            Your trusted destination for handpicked organic almonds, walnuts, pistachios, pine nuts, and exotic dried fruits directly from Gilgit-Baltistan.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold font-heading text-white mb-4 text-[#F5A623]">Shop Categories</h3>
                        <ul className="space-y-2.5 text-sm text-[#F5EFE0]/80">
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Almonds & Walnuts</a></li>
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Pistachios & Cashews</a></li>
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Pine Nuts (Chilgoza)</a></li>
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Dried Apricots & Figs</a></li>
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Gift Boxes & Hampers</a></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-lg font-bold font-heading text-white mb-4 text-[#F5A623]">Customer Care</h3>
                        <ul className="space-y-2.5 text-sm text-[#F5EFE0]/80">
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Track Your Order</a></li>
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Shipping & Delivery</a></li>
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Refund & Return Policy</a></li>
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Frequently Asked Questions</a></li>
                            <li><a href="#" className="hover:text-[#F5A623] transition-colors">Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Newsletter Signup Form */}
                    <div>
                        <h3 className="text-lg font-bold font-heading text-white mb-2 text-[#F5A623]">Stay Connected</h3>
                        <p className="text-sm text-[#F5EFE0]/80 mb-4">
                            Subscribe to get exclusive discounts, recipe ideas, and seasonal fresh harvest updates.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F5EFE0]/10 border border-[#F5EFE0]/20 rounded-full text-white placeholder-[#F5EFE0]/50 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                />
                                <Mail className="w-4 h-4 text-[#F5EFE0]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] font-semibold text-sm rounded-full shadow-sm transition-all duration-200"
                            >
                                <span>Subscribe</span>
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#F5EFE0]/10 bg-[#2A2116] py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5EFE0]/60">
                    <p>© {new Date().getFullYear()} GBMarket. All rights reserved.</p>
                    <div className="flex items-center gap-1">
                        <span>Crafted with</span>
                        <Heart className="w-3.5 h-3.5 text-[#F5A623] fill-current" />
                        <span>for healthy living</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
