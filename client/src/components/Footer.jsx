import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Send, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getCategories } from '../api/categories';

export default function Footer() {
    const { settings } = useSettings();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getCategories().then(cats => setCategories(cats.slice(0, 6))).catch(() => { });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <footer role="contentinfo" className="bg-[#3A2E1F] text-[#F5EFE0] mt-auto border-t border-[#D97706]/20">
            {/* Features Bar */}
            <div className="border-b border-[#F5EFE0]/10 bg-[#3A2E1F]/90 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="p-3 bg-[#F5A623]/10 text-[#F5A623] rounded-2xl">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold font-heading text-lg text-white">{settings.footer_feature_1_title || 'Free Express Shipping'}</h4>
                            <p className="text-xs text-[#F5EFE0]/70">{settings.footer_feature_1_text || 'On all orders over the threshold'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="p-3 bg-[#F5A623]/10 text-[#F5A623] rounded-2xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold font-heading text-lg text-white">{settings.footer_feature_2_title || '100% Quality Guaranteed'}</h4>
                            <p className="text-xs text-[#F5EFE0]/70">{settings.footer_feature_2_text || 'Direct from trusted sources'}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="p-3 bg-[#F5A623]/10 text-[#F5A623] rounded-2xl">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold font-heading text-lg text-white">{settings.footer_feature_3_title || '7-Day Fresh Guarantee'}</h4>
                            <p className="text-xs text-[#F5EFE0]/70">{settings.footer_feature_3_text || '100% money back or replacement'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            {settings.footer_logo_url && !settings.footer_logo_url.includes('placeholder') ? (
                                <img src={settings.footer_logo_url} alt={settings.store_name} className="h-12 object-contain" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-2xl bg-[#F5A623] flex items-center justify-center text-[#3A2E1F]">
                                        <Leaf className="w-6 h-6 fill-current" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold font-heading text-white">
                                            {settings.store_name || 'Store'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </Link>
                        <p className="text-sm text-[#F5EFE0]/80 leading-relaxed">
                            {settings.footer_about_text || 'Your trusted destination for premium quality products, carefully sourced and delivered to your doorstep.'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold font-heading text-white mb-4 text-[#F5A623]">Shop Categories</h3>
                        <ul className="space-y-2.5 text-sm text-[#F5EFE0]/80">
                            {categories.length > 0 ? categories.map(cat => (
                                <li key={cat.id || cat.slug}><Link to={`/shop?category=${cat.slug}`} className="hover:text-[#F5A623] transition-colors">{cat.name}</Link></li>
                            )) : (
                                <li><Link to="/shop" className="hover:text-[#F5A623] transition-colors">Browse All Products</Link></li>
                            )}
                        </ul>
                    </div>

                    {/* Navigation & Info */}
                    <div>
                        <h3 className="text-lg font-bold font-heading text-white mb-4 text-[#F5A623]">Company & Support</h3>
                        <ul className="space-y-2.5 text-sm text-[#F5EFE0]/80">
                            <li><Link to="/about" className="hover:text-[#F5A623] transition-colors">About {settings.store_name || 'Store'}</Link></li>
                            <li><Link to="/contact" className="hover:text-[#F5A623] transition-colors">Contact Us</Link></li>
                            <li><Link to="/track-order" className="hover:text-[#F5A623] transition-colors">Track Order</Link></li>
                            <li><Link to="/cart" className="hover:text-[#F5A623] transition-colors">View Cart</Link></li>
                            <li><Link to="/shop" className="hover:text-[#F5A623] transition-colors">Browse All Products</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Signup Form */}
                    <div>
                        <h3 className="text-lg font-bold font-heading text-white mb-2 text-[#F5A623]">Stay Connected</h3>
                        <p className="text-sm text-[#F5EFE0]/80 mb-4">
                            Subscribe to get exclusive discounts, recipe ideas, and seasonal fresh harvest updates.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-3" aria-label="Newsletter signup">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    aria-label="Email address for newsletter"
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#F5EFE0]/60">
                    <p>© {new Date().getFullYear()} {settings.store_name || 'Store'}. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="hover:text-[#F5A623] transition-colors duration-200">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-[#F5A623] transition-colors duration-200">
                            Terms & Conditions
                        </Link>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>{settings.footer_tagline || 'Crafted with ❤ for healthy living'}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
