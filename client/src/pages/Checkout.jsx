import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CheckCircle2, ChevronRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { createOrder } from '../api/orders';
import toast from 'react-hot-toast';

export default function Checkout() {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { settings } = useSettings();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: ''
    });
    const [loading, setLoading] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    const freeShippingThreshold = settings?.free_shipping_threshold || 5000;
    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 350;
    const grandTotal = subtotal + shippingFee;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                customer_name: formData.name,
                phone: formData.phone,
                address: `${formData.address}, ${formData.city}`,
                total: grandTotal,
                payment_method: 'COD',
                items: cartItems.map(i => ({
                    product_id: i.product_id,
                    product_name: i.product_name,
                    weight_option: i.weight_option,
                    quantity: i.quantity,
                    price: i.price
                }))
            };

            const res = await createOrder(orderData);
            clearCart();
            toast.success("Order placed successfully!");
            // If the backend returns id or order_id, pass it in state
            navigate('/order-confirmation', {
                state: { orderId: res.id || res.order_id || Date.now(), total: grandTotal, count: cartItems.length }
            });

        } catch (error) {
            console.error(error);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
                <AlertCircle className="w-16 h-16 text-[#D97706] mx-auto opacity-50" />
                <h1 className="text-3xl font-heading font-bold text-[#3A2E1F]">Cannot Checkout</h1>
                <p className="text-[#3A2E1F]/70">Your cart is empty. Add some products before proceeding.</p>
                <Link to="/shop" className="inline-block px-8 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] font-bold rounded-full">
                    Return to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-[#3A2E1F]/70 pb-2">
                <Link to="/cart" className="hover:text-[#D97706] transition-colors">Cart</Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#3A2E1F]/40" />
                <span className="text-[#3A2E1F] font-bold">Secure Checkout</span>
            </nav>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#E8DEC8] pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold font-heading text-[#3A2E1F]">Checkout</h1>
                    <p className="text-xs text-[#3A2E1F]/70">Please enter your shipping details</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-4 h-4" /><span>256-bit Secure</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* LEFT: FORM */}
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* Shipping Address */}
                    <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <h2 className="font-heading font-bold text-xl text-[#3A2E1F] flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#D97706]" /> Delivery Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Full Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all placeholder:text-[#3A2E1F]/40" placeholder="Ali Raza" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Phone Number</label>
                                <input type="tel" name="phone" required
                                    pattern="^(03\d{9}|\+923\d{9})$"
                                    title="Please enter a valid Pakistani phone number (e.g. 03001234567 or +923001234567)"
                                    className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all placeholder:text-[#3A2E1F]/40"
                                    value={formData.phone} onChange={handleChange} placeholder="0300 1234567" />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Complete Address</label>
                                <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all placeholder:text-[#3A2E1F]/40" placeholder="House 123, Street 4, Phase 5..." />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">City</label>
                                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all placeholder:text-[#3A2E1F]/40" placeholder="Lahore" />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <h2 className="font-heading font-bold text-xl text-[#3A2E1F] flex items-center gap-2">
                            Payment Method
                        </h2>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-4 border-2 border-[#F5A623] bg-[#F5A623]/5 rounded-2xl cursor-pointer transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border-4 border-[#3A2E1F] flex items-center justify-center bg-white"><div className="w-2.5 h-2.5 bg-[#3A2E1F] rounded-full"></div></div>
                                    <div className="font-bold text-[#3A2E1F] text-sm flex items-center gap-2">Cash on Delivery (COD) <Truck className="w-4 h-4 text-[#D97706]" /></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 border border-[#E8DEC8] bg-[#F5EFE0]/30 rounded-2xl cursor-not-allowed opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border-2 border-[#E8DEC8] bg-white"></div>
                                    <div className="font-bold text-[#3A2E1F] text-sm">Online Payment</div>
                                </div>
                                <span className="text-[10px] font-bold text-white bg-[#3A2E1F] px-2 py-0.5 rounded-full uppercase tracking-wider">Coming Soon</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* RIGHT: ORDER SUMMARY */}
                <aside className="sticky top-28 bg-gradient-to-b from-[#FFFDF9] to-[#F5EFE0]/30 border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <h2 className="font-heading font-bold text-xl text-[#3A2E1F] border-b border-[#E8DEC8] pb-4">In Your Order</h2>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 pb-2">
                        {cartItems.map((item) => (
                            <div key={`${item.product_id}-${item.weight_option}`} className="flex items-start gap-4">
                                <div className="relative">
                                    <img src={item.image} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover border border-[#E8DEC8] bg-white" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#3A2E1F] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-xs text-[#3A2E1F] line-clamp-1">{item.product_name}</h4>
                                    <span className="text-[11px] text-[#D97706] font-semibold">{item.weight_option}</span>
                                </div>
                                <div className="text-xs font-bold text-[#3A2E1F]">
                                    Rs. {(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[#E8DEC8] text-sm text-[#3A2E1F]/80">
                        <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-[#3A2E1F]">Rs. {subtotal.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Shipping Fee</span><span className="font-bold text-[#3A2E1F]">{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee}`}</span></div>

                        <div className="pt-4 border-t border-[#E8DEC8] flex flex-col gap-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-heading font-bold text-base text-[#3A2E1F]">Total to Pay</span>
                                <span className="font-heading font-extrabold text-2xl text-[#3A2E1F]">Rs. {grandTotal.toLocaleString()}</span>
                            </div>
                            <span className="text-right text-[10px] text-[#3A2E1F]/60">Payment on delivery</span>
                        </div>
                    </div>

                    <button form="checkout-form" type="submit" disabled={loading} className="w-full py-4 bg-[#F5A623] hover:bg-[#D97706] disabled:opacity-70 disabled:cursor-not-allowed text-[#3A2E1F] hover:text-white font-extrabold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><CheckCircle2 className="w-5 h-5" /><span>Confirm & Place Order</span></>}
                    </button>
                </aside>
            </div>

        </div>
    );
}
