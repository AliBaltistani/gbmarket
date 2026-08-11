import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    RefreshCw,
    User,
    Phone,
    MapPin,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle
} from 'lucide-react';
import {
    StatusBadge,
    SlideOver,
    AdminEmptyState,
    AdminSkeletonTable
} from '../../components/admin/AdminComponents';

export default function AdminOrders() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    // SlideOver / Selected Order Detail State
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Dummy Orders List
    const [orders, setOrders] = useState([
        {
            id: 'GB-1048',
            customer_name: 'Ali Khan',
            phone: '0300 1234567',
            address: 'House 12, Street 4, Phase 5, DHA, Lahore',
            total: 4900,
            status: 'Pending',
            date: '2026-08-11 14:30',
            items: [
                { product_name: 'Premium Hunza Dried Apricots', weight_option: '500g', quantity: 2, price: 1950 },
                { product_name: 'Gilgit Green Raisins (Kishmish)', weight_option: '250g', quantity: 1, price: 1000 }
            ]
        },
        {
            id: 'GB-1047',
            customer_name: 'Sara Ahmed',
            phone: '0321 9876543',
            address: 'Flat 4B, Al-Latif Tower, F-7, Islamabad',
            total: 2450,
            status: 'Processing',
            date: '2026-08-11 11:15',
            items: [
                { product_name: 'Gilgit Organic Walnuts (In Shell)', weight_option: '1kg', quantity: 1, price: 2450 }
            ]
        },
        {
            id: 'GB-1046',
            customer_name: 'Usman Tariq',
            phone: '0333 5554433',
            address: 'Plot 88, Civil Lines, Rawalpindi',
            total: 12500,
            status: 'Shipped',
            date: '2026-08-10 16:45',
            items: [
                { product_name: 'Skardu Salted Roasted Cashews', weight_option: '1kg', quantity: 3, price: 3500 },
                { product_name: 'Mountain Mix Dry Fruit Box', weight_option: '1kg', quantity: 1, price: 2000 }
            ]
        },
        {
            id: 'GB-1045',
            customer_name: 'Fatima Bilal',
            phone: '0312 4443322',
            address: 'Bungalow 14, Block 3, PECHS, Karachi',
            total: 3800,
            status: 'Delivered',
            date: '2026-08-10 09:20',
            items: [
                { product_name: 'Premium Saudi Ajwa Dates', weight_option: '500g', quantity: 2, price: 1900 }
            ]
        },
        {
            id: 'GB-1044',
            customer_name: 'Hamza Malik',
            phone: '0301 7778899',
            address: 'House 55, Sector G-9/2, Islamabad',
            total: 1800,
            status: 'Delivered',
            date: '2026-08-09 18:00',
            items: [
                { product_name: 'Sun-Dried Organic Fig (Anjeer)', weight_option: '500g', quantity: 1, price: 1800 }
            ]
        },
        {
            id: 'GB-1043',
            customer_name: 'Amina Zain',
            phone: '0345 6667788',
            address: 'Street 9, Jutial, Gilgit',
            total: 5400,
            status: 'Pending',
            date: '2026-08-09 10:10',
            items: [
                { product_name: 'Kaghan Raw Almond Kernels', weight_option: '1kg', quantity: 2, price: 2700 }
            ]
        }
    ]);

    const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];

    // Filter orders by active tab
    const filteredOrders = orders.filter(o => activeTab === 'All' || o.status === activeTab);

    const handleStatusChange = (orderId, newStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DEC8] pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F]">
                        Order Fulfillment
                    </h1>
                    <p className="text-xs text-[#3A2E1F]/70">
                        Track, inspect, and update customer order status across Pakistan
                    </p>
                </div>

                {/* Skeleton Preview Toggle */}
                <button
                    type="button"
                    onClick={() => setIsLoading(!isLoading)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#FFFDF9] border border-[#E8DEC8] hover:bg-[#F5EFE0] text-[#3A2E1F] transition-all"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F5A623]' : 'text-[#D97706]'}`} />
                    <span>Skeleton State</span>
                </button>
            </div>

            {/* STATUS TABS BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E8DEC8]">
                {tabs.map((tab) => {
                    const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`
                px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0
                ${isActive
                                    ? 'bg-[#F5A623] text-[#3A2E1F] shadow-sm'
                                    : 'bg-[#FFFDF9] text-[#3A2E1F]/70 border border-[#E8DEC8] hover:bg-[#F5EFE0]'
                                }
              `}
                        >
                            <span>{tab}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-[#3A2E1F] text-white' : 'bg-[#F5EFE0] text-[#D97706]'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* DATA TABLE */}
            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

                {isLoading ? (
                    <AdminSkeletonTable rows={6} />
                ) : filteredOrders.length === 0 ? (
                    <AdminEmptyState
                        title={`No ${activeTab} Orders`}
                        description={`There are currently no orders under "${activeTab}" status.`}
                        actionLabel="View All Orders"
                        onAction={() => setActiveTab('All')}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#E8DEC8] text-[11px] font-bold uppercase tracking-wider text-[#3A2E1F]/60">
                                    <th className="py-3 px-4">Order ID</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Phone</th>
                                    <th className="py-3 px-4">Total Amount</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8DEC8]/60 text-xs font-semibold text-[#3A2E1F]">
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="hover:bg-[#F5EFE0]/40 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-4 font-mono font-bold text-[#D97706]">
                                            {order.id}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-[#3A2E1F]">
                                            {order.customer_name}
                                        </td>
                                        <td className="py-4 px-4 text-[#3A2E1F]/70 font-mono">
                                            {order.phone}
                                        </td>
                                        <td className="py-4 px-4 font-extrabold text-sm text-[#3A2E1F]">
                                            Rs. {order.total.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="py-4 px-4 text-[#3A2E1F]/60 text-[11px]">
                                            {order.date}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                type="button"
                                                className="px-3 py-1.5 bg-[#F5EFE0] hover:bg-[#F5A623] text-[#3A2E1F] font-bold text-[11px] rounded-full transition-colors inline-flex items-center gap-1"
                                            >
                                                <span>Inspect</span>
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ORDER INSPECTION SLIDE-OVER */}
            <SlideOver
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={`Order Details: ${selectedOrder?.id}`}
            >
                {selectedOrder && (
                    <div className="space-y-8">

                        {/* Quick Status Control Header */}
                        <div className="p-4 bg-[#F5EFE0] rounded-2xl border border-[#E8DEC8] flex items-center justify-between gap-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/60 block">Update Order Status</span>
                                <span className="text-xs font-bold text-[#3A2E1F]">Current: <StatusBadge status={selectedOrder.status} /></span>
                            </div>
                            <select
                                value={selectedOrder.status}
                                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                className="bg-white border border-[#E8DEC8] rounded-xl px-3 py-2 text-xs font-bold text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623] cursor-pointer"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        {/* Customer Details Box */}
                        <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-5 space-y-3">
                            <h4 className="font-heading font-bold text-sm text-[#3A2E1F] border-b border-[#E8DEC8] pb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#D97706]" /> Customer Delivery Address
                            </h4>
                            <div className="space-y-1.5 text-xs text-[#3A2E1F]/80">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-[#3A2E1F]">Name:</span>
                                    <span className="font-bold">{selectedOrder.customer_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-[#3A2E1F]">Phone:</span>
                                    <span className="font-mono">{selectedOrder.phone}</span>
                                </div>
                                <div className="flex flex-col pt-1">
                                    <span className="font-semibold text-[#3A2E1F]">Address:</span>
                                    <span className="text-[#3A2E1F]/70 leading-relaxed mt-0.5">{selectedOrder.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Ordered Items Breakdown */}
                        <div className="space-y-3">
                            <h4 className="font-heading font-bold text-sm text-[#3A2E1F] flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#D97706]" /> Ordered Line Items ({selectedOrder.items.length})
                            </h4>

                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl divide-y divide-[#E8DEC8]/60 overflow-hidden">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between text-xs">
                                        <div>
                                            <h5 className="font-bold text-[#3A2E1F]">{item.product_name}</h5>
                                            <span className="text-[11px] text-[#D97706] font-semibold">{item.weight_option} × {item.quantity} units</span>
                                        </div>
                                        <div className="text-right font-extrabold text-[#3A2E1F]">
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Total Summary */}
                        <div className="p-4 bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl space-y-2 text-xs">
                            <div className="flex justify-between text-[#3A2E1F]/70">
                                <span>Subtotal</span>
                                <span>Rs. {selectedOrder.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[#3A2E1F]/70">
                                <span>Shipping Fee (COD)</span>
                                <span className="text-emerald-700 font-bold">FREE</span>
                            </div>
                            <div className="pt-2 border-t border-[#E8DEC8] flex justify-between items-baseline">
                                <span className="font-heading font-bold text-sm text-[#3A2E1F]">Grand Total</span>
                                <span className="font-heading font-extrabold text-xl text-[#3A2E1F]">Rs. {selectedOrder.total.toLocaleString()}</span>
                            </div>
                        </div>

                    </div>
                )}
            </SlideOver>

        </div>
    );
}
