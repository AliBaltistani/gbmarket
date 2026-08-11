import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Truck, Phone, ChevronRight } from 'lucide-react';

export default function OrderConfirmation() {
    const location = useLocation();
    const { orderId, total, count } = location.state || {};

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-10">

            <div className="space-y-6">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto absolute -inset-1 blur opacity-50 animate-pulse"></div>
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto relative border-4 border-emerald-200">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F] tracking-tight">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-sm text-[#3A2E1F]/70 max-w-md mx-auto font-body leading-relaxed">
                        Thank you for choosing GBMarket. Your fresh organic naturally sun-dried items are being prepared for dispatch.
                    </p>
                </div>
            </div>

            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
                <h2 className="font-heading font-bold text-lg text-[#3A2E1F] border-b border-[#E8DEC8] pb-3">
                    Order Summary
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
                    <div className="space-y-1.5 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <Package className="w-6 h-6 text-[#D97706] mb-1" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A2E1F]/60 block">Order Reference</span>
                        <span className="font-mono font-bold text-sm text-[#3A2E1F]">#{orderId ? `GB-${2026}-${orderId}` : 'GB-2026-X'}</span>
                    </div>

                    <div className="space-y-1.5 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <Truck className="w-6 h-6 text-[#D97706] mb-1" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A2E1F]/60 block">Status & Est. Delivery</span>
                        <span className="text-sm font-bold text-[#3A2E1F]">Processing (2-3 Days)</span>
                    </div>

                    <div className="space-y-1.5 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <svg className="w-6 h-6 text-[#D97706] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A2E1F]/60 block">Payment Method</span>
                        <span className="text-sm font-bold text-[#3A2E1F]">Cash on Delivery (COD)</span>
                    </div>
                </div>

                {total && (
                    <div className="bg-[#F5EFE0]/60 rounded-2xl p-4 flex items-center justify-between border border-[#E8DEC8]/50 mt-4">
                        <span className="text-xs font-semibold text-[#3A2E1F]/80">Total amount to pay on delivery:</span>
                        <span className="font-heading font-extrabold text-lg text-[#3A2E1F]">Rs. {total.toLocaleString()}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link to="/shop" className="px-8 py-3.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full shadow-md transition-colors flex items-center justify-center gap-2">
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="px-8 py-3.5 bg-white border border-[#E8DEC8] text-[#3A2E1F]/70 font-semibold text-sm rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                    <Phone className="w-4 h-4" />
                    <span>Questions? Call us</span>
                </div>
            </div>

        </div>
    );
}
