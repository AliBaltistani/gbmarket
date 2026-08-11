import React, { useState, useRef } from 'react';
import {
    Store,
    Mail,
    Phone,
    MapPin,
    Image as ImageIcon,
    UploadCloud,
    Share2,
    Sliders,
    Globe,
    Check,
    Save,
    RefreshCw,
    Sparkles,
    DollarSign,
    Truck,
    Info,
    LayoutTemplate
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    // Form state pre-filled with realistic store settings
    const [formData, setFormData] = useState({
        // General
        storeName: 'GBMarket',
        storeTagline: 'Premium Dry Fruits & Nuts from the Mountains of Gilgit-Baltistan',
        logoPreview: '/placeholder.png',

        // Contact Info
        contactEmail: 'info@gbmarket.pk',
        contactPhone: '+92 300 1234567',
        contactAddress: 'Main Bazaar, Gilgit, Gilgit-Baltistan, Pakistan',

        // Homepage Hero
        heroHeading: '100% Organic & Sun-Dried Mountain Produce',
        heroSubheading: 'Handpicked from the orchards of Hunza, Skardu, and Gilgit Valley, brought fresh to your doorstep across Pakistan.',
        heroImagePreview: 'https://images.unsplash.com/photo-1594951468249-f79a953eacc2?auto=format&fit=crop&q=80&w=1200',

        // Social Links
        facebookUrl: 'https://facebook.com/gbmarket.pk',
        instagramUrl: 'https://instagram.com/gbmarket.pk',
        whatsappNumber: '+92 300 1234567',

        // Footer
        footerAboutText: 'GBMarket brings authentic, handpicked, sun-dried organic fruits and nuts directly from local mountain farmers of Gilgit-Baltistan to your doorstep with guaranteed purity.',

        // Store Settings
        currencySymbol: 'Rs. ',
        freeShippingThreshold: '5000'
    });

    const logoInputRef = useRef(null);
    const heroImageInputRef = useRef(null);

    // Tab items configuration
    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'contact', label: 'Contact Info', icon: Mail },
        { id: 'hero', label: 'Homepage Hero', icon: LayoutTemplate },
        { id: 'social', label: 'Social Links', icon: Share2 },
        { id: 'footer', label: 'Footer', icon: Info },
        { id: 'store', label: 'Store Settings', icon: Sliders },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, logoPreview: previewUrl }));
            toast.success('Logo preview updated!');
        }
    };

    const handleHeroImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, heroImagePreview: previewUrl }));
            toast.success('Hero image preview updated!');
        }
    };

    const handleSaveSettings = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Settings saved successfully!');
        }, 600);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-24">

            {/* STICKY TOP ACTION BAR */}
            <div className="sticky top-[65px] md:top-[73px] z-20 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#E8DEC8] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs transition-all">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-[#3A2E1F] flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#D97706]" />
                        <span>Site Settings</span>
                    </h1>
                    <p className="text-[11px] text-[#3A2E1F]/70 hidden sm:block">
                        Configure store metadata, contact details, hero banner, and operational defaults
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-extrabold text-xs rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            {/* MAIN SETTINGS CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT TAB NAVIGATION */}
                <div className="lg:col-span-3 bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-3 sm:p-4 shadow-sm sticky top-36 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/50 px-3 py-1.5 block">
                        Settings Sections
                    </span>
                    <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 text-left w-full
                                        ${isActive
                                            ? 'bg-[#F5A623] text-[#3A2E1F] shadow-xs'
                                            : 'text-[#3A2E1F]/70 hover:bg-[#F5EFE0]/60 hover:text-[#3A2E1F]'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3A2E1F]' : 'text-[#D97706]'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* RIGHT CONTENT FORMS */}
                <div className="lg:col-span-9 space-y-8">
                    <form onSubmit={handleSaveSettings}>

                        {/* GENERAL SETTINGS */}
                        {activeTab === 'general' && (
                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="border-b border-[#E8DEC8] pb-4">
                                    <h2 className="font-heading font-extrabold text-xl text-[#3A2E1F] flex items-center gap-2">
                                        <Store className="w-5 h-5 text-[#D97706]" /> General Store Details
                                    </h2>
                                    <p className="text-xs text-[#3A2E1F]/70 mt-1">
                                        Basic store identity, brand tagline, and logo branding
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    {/* Store Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Store Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.storeName}
                                            onChange={(e) => handleInputChange('storeName', e.target.value)}
                                            placeholder="e.g. GBMarket"
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] font-bold focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>

                                    {/* Store Tagline */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Store Tagline
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.storeTagline}
                                            onChange={(e) => handleInputChange('storeTagline', e.target.value)}
                                            placeholder="Enter brand tagline..."
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>

                                    {/* Logo Upload Area */}
                                    <div className="space-y-2 pt-2">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Store Branding Logo
                                        </label>
                                        <input
                                            type="file"
                                            ref={logoInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl">
                                            <div className="w-24 h-24 rounded-2xl bg-white border border-[#E8DEC8] p-2 flex items-center justify-center shrink-0 shadow-xs">
                                                <img
                                                    src={formData.logoPreview}
                                                    alt="Store Logo Preview"
                                                    className="max-h-full max-w-full object-contain rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2 text-center sm:text-left flex-1">
                                                <h4 className="text-xs font-bold text-[#3A2E1F]">Current Brand Mark</h4>
                                                <p className="text-[11px] text-[#3A2E1F]/60">
                                                    PNG, WEBP, or SVG recommended with transparent background.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => logoInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full shadow-xs transition-all"
                                                >
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                    <span>Replace Logo</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONTACT INFO */}
                        {activeTab === 'contact' && (
                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="border-b border-[#E8DEC8] pb-4">
                                    <h2 className="font-heading font-extrabold text-xl text-[#3A2E1F] flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-[#D97706]" /> Contact & Physical Location
                                    </h2>
                                    <p className="text-xs text-[#3A2E1F]/70 mt-1">
                                        Customer support channels and business address shown on storefront
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                                Contact Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.contactEmail}
                                                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                                Contact Phone / Helpline
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.contactPhone}
                                                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Physical Store Address
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.contactAddress}
                                            onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HOMEPAGE HERO */}
                        {activeTab === 'hero' && (
                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="border-b border-[#E8DEC8] pb-4">
                                    <h2 className="font-heading font-extrabold text-xl text-[#3A2E1F] flex items-center gap-2">
                                        <LayoutTemplate className="w-5 h-5 text-[#D97706]" /> Homepage Hero Section
                                    </h2>
                                    <p className="text-xs text-[#3A2E1F]/70 mt-1">
                                        Customize the main banner text and imagery featured on the home page
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Hero Heading Text
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.heroHeading}
                                            onChange={(e) => handleInputChange('heroHeading', e.target.value)}
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] font-bold focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Hero Subheading Paragraph
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.heroSubheading}
                                            onChange={(e) => handleInputChange('heroSubheading', e.target.value)}
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>

                                    {/* Hero Image Upload Area */}
                                    <div className="space-y-2 pt-2">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Hero Banner Photo
                                        </label>
                                        <input
                                            type="file"
                                            ref={heroImageInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleHeroImageChange}
                                        />
                                        <div className="space-y-3">
                                            <div className="aspect-16/7 w-full bg-[#F5EFE0] border border-[#E8DEC8] rounded-2xl overflow-hidden relative shadow-xs">
                                                <img
                                                    src={formData.heroImagePreview}
                                                    alt="Hero Banner Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => heroImageInputRef.current?.click()}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full shadow-xs transition-all"
                                            >
                                                <UploadCloud className="w-3.5 h-3.5" />
                                                <span>Replace Hero Image</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SOCIAL LINKS */}
                        {activeTab === 'social' && (
                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="border-b border-[#E8DEC8] pb-4">
                                    <h2 className="font-heading font-extrabold text-xl text-[#3A2E1F] flex items-center gap-2">
                                        <Share2 className="w-5 h-5 text-[#D97706]" /> Social Profiles & Messaging
                                    </h2>
                                    <p className="text-xs text-[#3A2E1F]/70 mt-1">
                                        Connect storefront icons to your social media channels
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Facebook Page URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.facebookUrl}
                                            onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                                            placeholder="https://facebook.com/yourpage"
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Instagram Handle / URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.instagramUrl}
                                            onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                                            placeholder="https://instagram.com/yourhandle"
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            WhatsApp Contact / Order Hotline
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.whatsappNumber}
                                            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                                            placeholder="+92 300 1234567"
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FOOTER */}
                        {activeTab === 'footer' && (
                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="border-b border-[#E8DEC8] pb-4">
                                    <h2 className="font-heading font-extrabold text-xl text-[#3A2E1F] flex items-center gap-2">
                                        <Info className="w-5 h-5 text-[#D97706]" /> Storefront Footer Content
                                    </h2>
                                    <p className="text-xs text-[#3A2E1F]/70 mt-1">
                                        Short blurb rendered in the bottom footer column
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            About Text (Short Paragraph)
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={formData.footerAboutText}
                                            onChange={(e) => handleInputChange('footerAboutText', e.target.value)}
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STORE SETTINGS */}
                        {activeTab === 'store' && (
                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                                <div className="border-b border-[#E8DEC8] pb-4">
                                    <h2 className="font-heading font-extrabold text-xl text-[#3A2E1F] flex items-center gap-2">
                                        <Sliders className="w-5 h-5 text-[#D97706]" /> Operational Store Defaults
                                    </h2>
                                    <p className="text-xs text-[#3A2E1F]/70 mt-1">
                                        Currency displays and shipping thresholds for cart calculations
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                                Currency Symbol
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.currencySymbol}
                                                onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                                                placeholder="e.g. Rs. "
                                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] font-bold focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                                Free Shipping Threshold (PKR)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.freeShippingThreshold}
                                                onChange={(e) => handleInputChange('freeShippingThreshold', e.target.value)}
                                                placeholder="e.g. 5000"
                                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] font-bold focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>

            {/* FLOATING ACTION BAR FOR MOBILE/REDUNDANCY */}
            <div className="fixed bottom-6 right-6 z-30 sm:hidden">
                <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3.5 bg-[#F5A623] text-[#3A2E1F] font-extrabold text-xs rounded-full shadow-2xl border border-[#3A2E1F]/20 active:scale-95 transition-all"
                >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Settings</span>
                </button>
            </div>

        </div>
    );
}
