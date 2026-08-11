import React, { useState } from 'react';
import { Search, ShoppingBag, Menu, X, Leaf } from 'lucide-react';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const navLinks = [
        { name: 'Home', href: '#' },
        { name: 'Shop', href: '#' },
        { name: 'Categories', href: '#' },
        { name: 'Special Deals', href: '#' },
        { name: 'About Us', href: '#' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-[#F5EFE0]/90 backdrop-blur-md border-b border-[#E8DEC8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo Left */}
                    <div className="flex items-center gap-3">
                        <a href="#" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-2xl bg-[#F5A623] flex items-center justify-center text-[#3A2E1F] shadow-sm group-hover:bg-[#D97706] transition-colors">
                                <Leaf className="w-6 h-6 fill-current" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold font-heading tracking-tight text-[#3A2E1F] leading-none">
                                    GB<span className="text-[#D97706]">Market</span>
                                </span>
                                <span className="text-[10px] font-semibold text-[#D97706] uppercase tracking-widest leading-tight">
                                    Organic Dry Fruits
                                </span>
                            </div>
                        </a>
                    </div>

                    {/* Nav Links Center (Desktop) */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-base font-medium text-[#3A2E1F]/80 hover:text-[#D97706] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D97706] hover:after:w-full after:transition-all"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Search + Cart + CTA Pill Button Right */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search almonds, walnuts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 lg:w-64 pl-10 pr-4 py-2 text-sm bg-[#FFFDF9] border border-[#E8DEC8] rounded-full text-[#3A2E1F] placeholder-[#3A2E1F]/50 focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all"
                            />
                            <Search className="w-4 h-4 text-[#3A2E1F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Cart Button */}
                        <button
                            type="button"
                            className="relative p-2.5 bg-[#FFFDF9] hover:bg-[#F5A623]/20 border border-[#E8DEC8] rounded-full text-[#3A2E1F] transition-colors"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D97706] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                0
                            </span>
                        </button>

                        {/* Rounded Pill CTA Button */}
                        <a
                            href="#shop"
                            className="px-6 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-semibold text-sm rounded-full shadow-sm hover:shadow transition-all duration-200"
                        >
                            Shop Now
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            type="button"
                            className="p-2 text-[#3A2E1F] hover:text-[#D97706]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle Navigation"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#FFFDF9] border-b border-[#E8DEC8] px-4 pt-3 pb-6 space-y-3">
                    <div className="relative mb-3">
                        <input
                            type="text"
                            placeholder="Search dry fruits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-[#F5EFE0] border border-[#E8DEC8] rounded-full text-[#3A2E1F] placeholder-[#3A2E1F]/50 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        />
                        <Search className="w-4 h-4 text-[#3A2E1F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="px-3 py-2 text-base font-medium text-[#3A2E1F] hover:bg-[#F5EFE0] rounded-xl transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>
                    <div className="pt-2 flex items-center justify-between border-t border-[#E8DEC8]">
                        <a
                            href="#shop"
                            className="w-full text-center px-6 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] font-semibold text-sm rounded-full shadow-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Shop Now
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
