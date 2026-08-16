import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/api';
import { useSettings } from '../context/SettingsContext';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const statusConfig = {
    Pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300', label: 'Order Placed' },
    Processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300', label: 'Processing' },
    Shipped: { icon: Truck, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300', label: 'Shipped' },
    Delivered: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-300', label: 'Delivered' },
    Cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300', label: 'Cancelled' },
};

export default function TrackOrder() {
    const { settings } = useSettings();
    const [orderId, setOrderId] = useState('');
    const [phone, setPhone] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderId.trim() || !phone.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);
        setSearched(true);

        try {
            const { data } = await api.get('/orders/track', {
                params: { order_id: orderId.trim(), phone: phone.trim() }
            });
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Unable to find your order. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const isCancelled = order?.status === 'Cancelled';
    const currentIdx = isCancelled ? -1 : STATUSES.indexOf(order?.status);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10 pb-16">
            <SEO
                title="Track Your Order"
                description={`Track your ${settings.store_name || 'GBMarket'} order status in real-time. Enter your order number and phone to get instant updates.`}
                canonical="https://gbmarket.pk/track-order"
            />

            {/* HERO */}
            <section className="bg-gradient-to-r from-[#F5EFE0] via-[#F5A623]/20 to-[#F5EFE0] border-b border-[#E8DEC8] py-10 px-4 text-center rounded-3xl mt-4">
                <div className="max-w-xl mx-auto space-y-3">
                    <span className="text-xs font-bold text-[#D97706] uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-[#E8DEC8]">
                        Real-Time Updates
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F]">
                        Track Your Order
                    </h1>
                    <p className="text-sm text-[#3A2E1F]/70">
                        Enter your order number and the phone number used during checkout.
                    </p>
                </div>
            </section>

            {/* SEARCH FORM */}
            <section className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleTrack} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                Order Number *
                            </label>
                            <input
                                type="text"
                                required
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="e.g. 1, 2, 15..."
                                className="w-full px-4 py-3 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 0300 1234567"
                                className="w-full px-4 py-3 bg-[#F5EFE0]/40 border border-[#E8DEC8] rounded-2xl text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Searching...</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                <span>Track Order</span>
                            </>
                        )}
                    </button>
                </form>
            </section>

            {/* ERROR */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-sm font-semibold flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* ORDER RESULTS */}
            {order && (
                <section className="space-y-6 animate-in fade-in">

                    {/* STATUS TIMELINE */}
                    <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm">
                        <h2 className="font-heading font-bold text-lg text-[#3A2E1F] border-b border-[#E8DEC8] pb-3 mb-6">
                            Order #{order.id} — Status
                        </h2>

                        {isCancelled ? (
                            <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-red-800">Order Cancelled</p>
                                    <p className="text-xs text-red-600 mt-0.5">This order has been cancelled. Contact us for details.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Timeline */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                                    {STATUSES.map((status, idx) => {
                                        const config = statusConfig[status];
                                        const Icon = config.icon;
                                        const isCompleted = idx <= currentIdx;
                                        const isCurrent = idx === currentIdx;

                                        return (
                                            <div key={status} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative">
                                                {/* Connector line (not for first item) */}
                                                {idx > 0 && (
                                                    <div className={`hidden sm:block absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${idx <= currentIdx ? 'bg-emerald-400' : 'bg-[#E8DEC8]'}`} style={{ left: '-50%' }} />
                                                )}

                                                {/* Icon */}
                                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent
                                                    ? `${config.bg} ${config.border} ring-4 ring-offset-1 ${config.bg}/50`
                                                    : isCompleted
                                                        ? 'bg-emerald-100 border-emerald-400'
                                                        : 'bg-[#F5EFE0] border-[#E8DEC8]'
                                                    }`}>
                                                    <Icon className={`w-5 h-5 ${isCurrent ? config.color : isCompleted ? 'text-emerald-600' : 'text-[#3A2E1F]/30'
                                                        }`} />
                                                </div>

                                                {/* Label */}
                                                <span className={`text-xs font-bold sm:text-center ${isCurrent ? 'text-[#3A2E1F]' : isCompleted ? 'text-emerald-700' : 'text-[#3A2E1F]/40'
                                                    }`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ORDER DETAILS */}
                    <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm">
                        <h2 className="font-heading font-bold text-lg text-[#3A2E1F] border-b border-[#E8DEC8] pb-3 mb-4">
                            Order Details
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/50 block">Customer</span>
                                <span className="text-sm font-bold text-[#3A2E1F]">{order.customer_name}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/50 block">Order Date</span>
                                <span className="text-sm font-bold text-[#3A2E1F]">
                                    {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/50 block">Payment</span>
                                <span className="text-sm font-bold text-[#3A2E1F]">{order.payment_method}</span>
                                {order.payment_method !== 'COD' && order.payment_status && (
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${order.payment_status === 'Verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                        order.payment_status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                                            'bg-amber-100 text-amber-800 border-amber-300'
                                        }`}>{order.payment_status}</span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/50 block">Total</span>
                                <span className="text-sm font-extrabold text-[#D97706]">Rs. {order.total?.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        {order.items?.length > 0 && (
                            <div className="border border-[#E8DEC8] rounded-2xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F5EFE0]">
                                        <tr>
                                            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/70">Product</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/70 hidden sm:table-cell">Weight</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/70 text-center">Qty</th>
                                            <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/70 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, i) => (
                                            <tr key={i} className="border-t border-[#E8DEC8]/50">
                                                <td className="px-4 py-3 text-xs font-semibold text-[#3A2E1F]">
                                                    {item.product_name}
                                                    <span className="block sm:hidden text-[10px] text-[#3A2E1F]/50 mt-0.5">{item.weight_option}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-[#3A2E1F]/70 hidden sm:table-cell">{item.weight_option}</td>
                                                <td className="px-4 py-3 text-xs text-center text-[#3A2E1F]">{item.quantity}</td>
                                                <td className="px-4 py-3 text-xs text-right font-bold text-[#3A2E1F]">Rs. {item.price?.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="bg-[#F5EFE0]/60 px-4 py-3 flex justify-between items-center border-t border-[#E8DEC8]">
                                    <span className="text-xs text-[#3A2E1F]/70">
                                        Subtotal: Rs. {order.subtotal?.toLocaleString()}
                                        {order.shipping_fee > 0 && ` + Shipping: Rs. ${order.shipping_fee}`}
                                    </span>
                                    <span className="font-heading font-extrabold text-[#3A2E1F]">Rs. {order.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/shop"
                            className="px-8 py-3.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-sm rounded-full shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Continue Shopping</span>
                        </Link>
                        <Link
                            to="/contact"
                            className="px-8 py-3.5 bg-white border border-[#E8DEC8] text-[#3A2E1F]/80 font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-sm hover:bg-[#F5EFE0] transition-colors"
                        >
                            <span>Need Help?</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>
            )}

            {/* EMPTY STATE */}
            {!order && searched && !loading && !error && (
                <div className="text-center py-10 text-[#3A2E1F]/50 space-y-2">
                    <Package className="w-12 h-12 mx-auto text-[#E8DEC8]" />
                    <p className="text-sm font-semibold">No order found</p>
                </div>
            )}
        </div>
    );
}
