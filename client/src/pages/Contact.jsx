import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setTimeout(() => {
            setFormSubmitted(false);
            setContactForm({ name: '', email: '', subject: '', message: '' });
        }, 4000);
    };

    return (
        <div className="space-y-12 pb-16">

            {/* 1. HERO BANNER */}
            <section className="bg-gradient-to-r from-[#F5EFE0] via-[#F5A623]/20 to-[#F5EFE0] border-b border-[#E8DEC8] py-12 px-4 sm:px-6 lg:px-8 text-center rounded-3xl max-w-7xl mx-auto mt-4">
                <div className="max-w-2xl mx-auto space-y-3">
                    <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-[#E8DEC8]">
                        Get In Touch
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#3A2E1F]">
                        Contact GBMarket Team
                    </h1>
                    <p className="text-sm text-[#3A2E1F]/70 font-body">
                        Have a question about our dry fruit harvests, bulk corporate orders, or order status? We are here to assist!
                    </p>
                </div>
            </section>

            {/* 2. TWO COLUMN LAYOUT */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: CONTACT FORM */}
                    <div className="lg:col-span-7 bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
                        <div className="space-y-2 border-b border-[#E8DEC8] pb-4">
                            <h2 className="font-heading font-bold text-2xl text-[#3A2E1F] flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#D97706]" />
                                <span>Send Us a Message</span>
                            </h2>
                            <p className="text-xs text-[#3A2E1F]/70">
                                Fill out the form below and our customer support team will get back to you within 24 hours.
                            </p>
                        </div>

                        {formSubmitted && (
                            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                                <span>Thank you! Your message has been sent successfully. We will reply shortly.</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        placeholder="e.g. Ayesha Malik"
                                        className="w-full px-4 py-3 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl text-xs sm:text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        placeholder="ayesha@example.com"
                                        className="w-full px-4 py-3 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl text-xs sm:text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.subject}
                                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                    placeholder="Order inquiry, Bulk order, Feedback..."
                                    className="w-full px-4 py-3 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl text-xs sm:text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                    Your Message *
                                </label>
                                <textarea
                                    rows="5"
                                    required
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    placeholder="Write your message details here..."
                                    className="w-full px-4 py-3 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl text-xs sm:text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <span>Send Message</span>
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: BUSINESS INFO & MAP PLACEHOLDER */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            <h2 className="font-heading font-bold text-xl text-[#3A2E1F] border-b border-[#E8DEC8] pb-3">
                                Business Information
                            </h2>

                            <div className="space-y-4 text-xs sm:text-sm text-[#3A2E1F]/80">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-[#F5A623]/20 text-[#D97706] rounded-xl shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <strong className="block text-[#3A2E1F] font-bold">Store Location & Warehouse</strong>
                                        <span>Main Airport Road, Gilgit City, Gilgit-Baltistan, Pakistan</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-[#F5A623]/20 text-[#D97706] rounded-xl shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <strong className="block text-[#3A2E1F] font-bold">Phone & WhatsApp Support</strong>
                                        <span>+92 345 9876543 / +92 5811 456789</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-[#F5A623]/20 text-[#D97706] rounded-xl shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <strong className="block text-[#3A2E1F] font-bold">Email Addresses</strong>
                                        <span>support@gbmarket.pk / sales@gbmarket.pk</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-[#F5A623]/20 text-[#D97706] rounded-xl shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <strong className="block text-[#3A2E1F] font-bold">Working Hours</strong>
                                        <span>Mon - Sat: 9:00 AM - 8:00 PM (PKT)</span>
                                    </div>
                                </div>
                            </div>

                            {/* MAP PLACEHOLDER */}
                            <div className="space-y-2 pt-2 border-t border-[#E8DEC8]">
                                <span className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                    Find Us On Google Maps
                                </span>
                                <div className="w-full h-48 bg-[#F5EFE0] rounded-2xl border border-[#E8DEC8] flex flex-col items-center justify-center text-center p-4 space-y-2">
                                    <MapPin className="w-8 h-8 text-[#D97706]" />
                                    <span className="font-heading font-bold text-sm text-[#3A2E1F]">Gilgit-Baltistan Hub</span>
                                    <span className="text-[11px] text-[#3A2E1F]/60">35.9208° N, 74.3144° E</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
}
