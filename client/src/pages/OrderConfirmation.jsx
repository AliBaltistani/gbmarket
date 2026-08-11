import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Calendar, MapPin, Sparkles } from 'lucide-react';
import { initialCartItems } from '../data/dummyData';

export default function OrderConfirmation() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const orderNumber = 'GB-2026-8941';
    const subtotal = initialCartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const shippingFee = subtotal >= 3000 ? 0 : 250;
    const grandTotal = subtotal + shippingFee;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-10">

            {/* SUCCESS ANIMATED BADGE */}
            <div className="space-y-4">
                <div className="w-24 h-24 bg-[#F5A623]/20 border-2 border-[#D97706] rounded-full flex items-center justify-center mx-auto text-[#D97706] shadow-lg animate-bounce">
                    <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Order Confirmed & Received</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#3A2E1F]">
                    Thank You! Your Order Has Been Placed.
                </h1>
                <p className="text-sm sm:text-base text-[#3A2E1F]/70 max-w-xl mx-auto font-body">
                    We have received your request and our team is hand-packing your fresh Gilgit dry fruits. A confirmation SMS has been dispatched.
                </p>
            </div>

            {/* ORDER SUMMARY DETAILS CARD */}
            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DEC8] pb-4">
                    <div>
                        <span className="text-xs text-[#3A2E1F]/60 uppercase tracking-wider font-bold">Order Number</span>
                        <div className="font-heading font-extrabold text-xl text-[#D97706]">{orderNumber}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#3A2E1F] bg-[#F5EFE0] px-4 py-2 rounded-full border border-[#E8DEC8]">
                        <Calendar className="w-4 h-4 text-[#D97706]" />
                        <span>Est. Delivery: 2 - 3 Business Days</span>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5EFE0]/40 p-4 rounded-2xl border border-[#E8DEC8] text-xs">
                    <div className="space-y-1">
                        <span className="font-bold text-[#3A2E1F] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Shipping Address</span>
                        </span>
                        <p className="text-[#3A2E1F]/80">Ali Khan, House #45, Street 12, F-8/3, Islamabad</p>
                        <p className="text-[#3A2E1F]/60">Ph: 03001234567</p>
                    </div>
                    <div className="space-y-1">
                        <span className="font-bold text-[#3A2E1F] flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>Payment Mode</span>
                        </span>
                        <p className="text-[#3A2E1F]/80">Cash on Delivery (COD)</p>
                        <p className="text-emerald-700 font-bold">Pay Rs. {grandTotal.toLocaleString()} on delivery</p>
                    </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-3 pt-2">
                    <h3 className="font-heading font-bold text-base text-[#3A2E1F]">Order Recap</h3>
                    <div className="divide-y divide-[#E8DEC8]/60">
                        {initialCartItems.map((item) => (
                            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#E8DEC8]" />
                                    <div>
                                        <div className="font-bold text-[#3A2E1F]">{item.name}</div>
                                        <div className="text-[11px] text-[#3A2E1F]/60">{item.selectedWeight} x {item.quantity}</div>
                                    </div>
                                </div>
                                <div className="font-bold text-[#3A2E1F]">
                                    Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Cost */}
                <div className="border-t border-[#E8DEC8] pt-4 flex justify-between items-baseline text-sm">
                    <span className="font-heading font-bold text-[#3A2E1F]">Grand Total Paid (COD)</span>
                    <span className="font-heading font-extrabold text-2xl text-[#3A2E1F]">
                        Rs. {grandTotal.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* CTA BUTTON */}
            <div>
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full shadow-md transition-all"
                >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

        </div>
    );
}
