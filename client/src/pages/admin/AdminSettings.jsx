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
    Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import api from '../../api/api';

export default function AdminSettings() {
    const { settings, updateSettings } = useSettings();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    // Form state pre-filled from global settings context
    const [formData, setFormData] = useState({
        // General
        storeName: settings.store_name || '',
        storeTagline: settings.store_tagline || '',
        siteBaseUrl: settings.site_url || 'https://gbmarket.pk',
        logoPreview: settings.logo_url || '/placeholder.png',
        faviconPreview: settings.favicon_url || '/vite.svg',

        // Footer Logo
        footerLogoPreview: settings.footer_logo_url || '/placeholder.png',

        // Contact Info
        contactEmail: settings.contact_email || '',
        contactPhone: settings.contact_phone || '',
        contactAddress: settings.contact_address || '',



        // Social Links
        facebookUrl: settings.social_facebook || '',
        instagramUrl: settings.social_instagram || '',
        whatsappNumber: settings.social_whatsapp || '',

        // Footer
        footerAboutText: settings.footer_about_text || '',

        // Store Settings
        currencySymbol: settings.currency_symbol || '',
        freeShippingThreshold: settings.free_shipping_threshold || ''
    });

    const logoInputRef = useRef(null);
    const faviconInputRef = useRef(null);

    const footerLogoInputRef = useRef(null);

    // Tab items configuration
    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'contact', label: 'Contact Info', icon: Mail },
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

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, faviconPreview: previewUrl }));
            toast.success('Favicon preview updated!');
        }
    };

    const handleFooterLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, footerLogoPreview: previewUrl }));
            toast.success('Footer logo preview updated!');
        }
    };



    const handleSaveSettings = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            let finalLogoUrl = formData.logoPreview;
            if (logoInputRef.current && logoInputRef.current.files[0]) {
                const fd = new FormData();
                fd.append('image', logoInputRef.current.files[0]);
                const { data } = await api.post('/upload', fd);
                finalLogoUrl = data.url;
            }

            let finalFooterLogoUrl = formData.footerLogoPreview;
            if (footerLogoInputRef.current && footerLogoInputRef.current.files[0]) {
                const fd = new FormData();
                fd.append('image', footerLogoInputRef.current.files[0]);
                const { data } = await api.post('/upload', fd);
                finalFooterLogoUrl = data.url;
            }

            let finalFaviconUrl = formData.faviconPreview;
            if (faviconInputRef.current && faviconInputRef.current.files[0]) {
                const fd = new FormData();
                fd.append('image', faviconInputRef.current.files[0]);
                const { data } = await api.post('/upload', fd);
                finalFaviconUrl = data.url;
            }



            const payload = {
                store_name: formData.storeName,
                store_tagline: formData.storeTagline,
                site_url: formData.siteBaseUrl,
                logo_url: finalLogoUrl,
                favicon_url: finalFaviconUrl,
                footer_logo_url: finalFooterLogoUrl,
                contact_email: formData.contactEmail,
                contact_phone: formData.contactPhone,
                contact_address: formData.contactAddress,

                social_facebook: formData.facebookUrl,
                social_instagram: formData.instagramUrl,
                social_whatsapp: formData.whatsappNumber,
                footer_about_text: formData.footerAboutText,
                currency_symbol: formData.currencySymbol,
                free_shipping_threshold: formData.freeShippingThreshold
            };

            await updateSettings(payload);
            toast.success('Settings saved successfully!');
            setFormData(prev => ({
                ...prev,
                logoPreview: finalLogoUrl,

                faviconPreview: finalFaviconUrl,
                footerLogoPreview: finalFooterLogoUrl
            }));
        } catch (error) {
            toast.error(error.response?.data?.error || error.message);
        } finally {
            setIsSaving(false);
        }
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

                                    {/* Site Base URL */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Site Base URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.siteBaseUrl}
                                            onChange={(e) => handleInputChange('siteBaseUrl', e.target.value)}
                                            placeholder="https://gbmarket.pk"
                                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] font-bold focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
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

                                    {/* Favicon Upload Area */}
                                    <div className="space-y-2 pt-2 border-t border-[#E8DEC8]">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Store Favicon
                                        </label>
                                        <input
                                            type="file"
                                            ref={faviconInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFaviconChange}
                                        />
                                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl">
                                            <div className="w-16 h-16 rounded-xl bg-white border border-[#E8DEC8] p-2 flex items-center justify-center shrink-0 shadow-xs">
                                                <img
                                                    src={formData.faviconPreview}
                                                    alt="Store Favicon Preview"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                            <div className="space-y-2 text-center sm:text-left flex-1">
                                                <h4 className="text-xs font-bold text-[#3A2E1F]">Browser Tab Icon</h4>
                                                <p className="text-[11px] text-[#3A2E1F]/60">
                                                    Ideal size: 32x32px or 64x64px. SVG, PNG or ICO.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => faviconInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full shadow-xs transition-all"
                                                >
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                    <span>Upload Favicon</span>
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

                                    {/* Footer Logo Upload Area */}
                                    <div className="space-y-2 pt-2 border-t border-[#E8DEC8]">
                                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                            Secondary Footer Logo (Optional)
                                        </label>
                                        <input
                                            type="file"
                                            ref={footerLogoInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFooterLogoChange}
                                        />
                                        <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl">
                                            <div className="w-20 h-20 rounded-2xl bg-white border border-[#E8DEC8] p-2 flex items-center justify-center shrink-0 shadow-xs">
                                                <img
                                                    src={formData.footerLogoPreview}
                                                    alt="Store Footer Logo Preview"
                                                    className="max-h-full max-w-full object-contain rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2 text-center sm:text-left flex-1">
                                                <h4 className="text-xs font-bold text-[#3A2E1F]">Alternative Footer Mark</h4>
                                                <p className="text-[11px] text-[#3A2E1F]/60">
                                                    Looks best with light or negative colored logos against the dark background.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => footerLogoInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full shadow-xs transition-all"
                                                >
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                    <span>Upload Footer Logo</span>
                                                </button>
                                            </div>
                                        </div>
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
