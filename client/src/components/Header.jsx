import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function Header() {
    const { settings } = useSettings();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop All', path: '/shop' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header role="banner" className="fixed top-0 left-0 right-0 z-50 bg-[#F5EFE0]/95 backdrop-blur-md border-b border-[#E8DEC8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo Left */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2 group">
                            {settings.logo_url && !settings.logo_url.includes('placeholder') ? (
                                <img src={settings.logo_url} alt={settings.store_name} className="h-10 object-contain" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-2xl bg-[#F5A623] flex items-center justify-center text-[#3A2E1F] shadow-sm group-hover:bg-[#D97706] transition-colors">
                                        <Leaf className="w-6 h-6 fill-current" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold font-heading tracking-tight text-[#3A2E1F] leading-none">
                                            {settings.store_name || 'GBMarket'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </Link>
                    </div>

                    {/* Nav Links Center (Desktop) */}
                    <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `text-base font-medium transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#D97706] after:transition-all ${isActive
                                        ? 'text-[#D97706] font-semibold after:w-full'
                                        : 'text-[#3A2E1F]/80 hover:text-[#D97706] after:w-0 hover:after:w-full'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Search + Cart + CTA Pill Button Right */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Search Input Form */}
                        <form onSubmit={handleSearchSubmit} className="relative" role="search">
                            <input
                                type="text"
                                placeholder="Search almonds, walnuts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search products"
                                className="w-44 lg:w-60 pl-10 pr-4 py-2 text-sm bg-[#FFFDF9] border border-[#E8DEC8] rounded-full text-[#3A2E1F] placeholder-[#3A2E1F]/50 focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all"
                            />
                            <Search className="w-4 h-4 text-[#3A2E1F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </form>

                        {/* Cart Icon Link */}
                        <Link
                            to="/cart"
                            className="relative p-2.5 bg-[#FFFDF9] hover:bg-[#F5A623]/20 border border-[#E8DEC8] rounded-full text-[#3A2E1F] transition-colors"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D97706] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        </Link>

                        {/* Rounded Pill CTA Button */}
                        <Link
                            to="/shop"
                            className="px-6 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-semibold text-sm rounded-full shadow-sm hover:shadow transition-all duration-200"
                        >
                            Shop Now
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-3">
                        <Link
                            to="/cart"
                            className="relative p-2 text-[#3A2E1F]"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingBag className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D97706] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        </Link>
                        <button
                            type="button"
                            className="p-2 text-[#3A2E1F] hover:text-[#D97706]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#FFFDF9] border-b border-[#E8DEC8] px-4 pt-3 pb-6 space-y-3">
                    <form onSubmit={handleSearchSubmit} className="relative mb-3" role="search">
                        <input
                            type="text"
                            placeholder="Search dry fruits..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search products"
                            className="w-full pl-10 pr-4 py-2 text-sm bg-[#F5EFE0] border border-[#E8DEC8] rounded-full text-[#3A2E1F] placeholder-[#3A2E1F]/50 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        />
                        <Search className="w-4 h-4 text-[#3A2E1F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </form>
                    <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `px-3 py-2 text-base font-medium rounded-xl transition-colors ${isActive ? 'bg-[#F5A623]/20 text-[#D97706] font-semibold' : 'text-[#3A2E1F] hover:bg-[#F5EFE0]'
                                    }`
                                }
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="pt-2 flex items-center justify-between border-t border-[#E8DEC8]">
                        <Link
                            to="/shop"
                            className="w-full text-center px-6 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] font-semibold text-sm rounded-full shadow-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
