import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Banknote, ArrowLeft, Lock } from 'lucide-react';
import { initialCartItems } from '../data/dummyData';

export default function Checkout() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: 'Ali Khan',
        phone: '03001234567',
        address: 'House #45, Street 12, F-8/3',
        city: 'Islamabad',
        notes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('COD');

    const subtotal = initialCartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const shippingFee = subtotal >= 3000 ? 0 : 250;
    const grandTotal = subtotal + shippingFee;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = (e) => {
        e.preventDefault();
        navigate('/order-confirmation');
    };

    return (
        <div className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold font-heading text-[#3A2E1F]">Checkout</h1>
                    <p className="text-xs text-[#3A2E1F]/70">Enter your shipping details to complete your order</p>
                </div>
                <Link to="/cart" className="text-xs font-bold text-[#3A2E1F] hover:text-[#D97706] flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Cart</span>
                </Link>
            </div>

            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: SHIPPING FORM & PAYMENT METHOD */}
                <div className="lg:col-span-7 space-y-8">

                    {/* 1. Customer Information Form */}
                    <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                        <h2 className="font-heading font-bold text-xl text-[#3A2E1F] flex items-center gap-2 border-b border-[#E8DEC8] pb-3">
                            <Truck className="w-5 h-5 text-[#D97706]" />
                            <span>1. Shipping Information</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="e.g. Ali Khan"
                                    className="w-full px-4 py-3 bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-2xl text-xs sm:text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="03XX-XXXXXXX"
                                    className="w-full px-4 py-3 bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-2xl text-xs sm:text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="e.g. Islamabad, Lahore, Karachi"
                                    className="w-full px-4 py-3 bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-2xl text-xs sm:text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                    Full Delivery Address *
                                </label>
                                <textarea
                                    rows="3"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="House/Apartment #, Street, Sector, Area"
                                    className="w-full px-4 py-3 bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-2xl text-xs sm:text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Payment Method Selector */}
                    <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                        <h2 className="font-heading font-bold text-xl text-[#3A2E1F] flex items-center gap-2 border-b border-[#E8DEC8] pb-3">
                            <CreditCard className="w-5 h-5 text-[#D97706]" />
                            <span>2. Select Payment Method</span>
                        </h2>

                        <div className="space-y-3">
                            {/* Option A: Cash on Delivery */}
                            <label
                                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD'
                                        ? 'bg-[#F5A623]/20 border-[#D97706] ring-2 ring-[#F5A623]/40'
                                        : 'bg-white border-[#E8DEC8]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => setPaymentMethod('COD')}
                                        className="accent-[#D97706]"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Banknote className="w-5 h-5 text-[#D97706]" />
                                        <div>
                                            <div className="font-bold text-sm text-[#3A2E1F]">Cash on Delivery (COD)</div>
                                            <div className="text-xs text-[#3A2E1F]/70">Pay in cash when your parcel arrives</div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                    Available
                                </span>
                            </label>

                            {/* Option B: Online Payment (Disabled with Coming Soon tag) */}
                            <div className="p-4 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl flex items-center justify-between opacity-60 cursor-not-allowed">
                                <div className="flex items-center gap-3">
                                    <input type="radio" disabled name="paymentMethod" className="accent-gray-400" />
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <div className="font-bold text-sm text-[#3A2E1F]/80">Debit / Credit Card / EasyPaisa / JazzCash</div>
                                            <div className="text-xs text-[#3A2E1F]/60">Secure online card & wallet payment</div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">
                                    Coming Soon
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: STICKY ORDER RECAP & PLACE ORDER */}
                <aside className="lg:col-span-5 space-y-6">
                    <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm sticky top-28">
                        <h2 className="font-heading font-bold text-xl text-[#3A2E1F] border-b border-[#E8DEC8] pb-3">
                            Order Summary
                        </h2>

                        {/* Line Items List (Compact) */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 border-b border-[#E8DEC8] pb-4">
                            {initialCartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#E8DEC8]" />
                                        <div>
                                            <div className="font-bold text-[#3A2E1F]">{item.name}</div>
                                            <div className="text-[11px] text-[#3A2E1F]/60">
                                                {item.selectedWeight} x {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-[#3A2E1F]">
                                        Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cost Breakdown */}
                        <div className="space-y-2.5 text-xs text-[#3A2E1F]/80">
                            <div className="flex justify-between">
                                <span>Items Subtotal</span>
                                <span className="font-bold text-[#3A2E1F]">Rs. {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Charges</span>
                                <span className="font-bold text-[#3A2E1F]">
                                    {shippingFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `Rs. ${shippingFee}`}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-[#E8DEC8] flex justify-between items-baseline">
                                <span className="font-heading font-bold text-base text-[#3A2E1F]">Total Payable</span>
                                <span className="font-heading font-extrabold text-2xl text-[#3A2E1F]">
                                    Rs. {grandTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Place Order CTA Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-extrabold text-base rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            <span>Place Order (Rs. {grandTotal.toLocaleString()})</span>
                        </button>

                        <div className="text-center text-[11px] text-[#3A2E1F]/60 flex items-center justify-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>100% Satisfaction & Money Back Guarantee</span>
                        </div>
                    </div>
                </aside>

            </form>
        </div>
    );
}
