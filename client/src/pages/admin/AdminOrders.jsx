import React, { useState, useEffect } from 'react';
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
import { getOrders, updateOrderStatus } from '../../api/orders';
import toast from 'react-hot-toast';

export default function AdminOrders() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [orders, setOrders] = useState([]);

    // SlideOver / Selected Order Detail State
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];

    // Filter orders by active tab
    const filteredOrders = orders.filter(o => activeTab === 'All' || o.status === activeTab);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            toast.success(`Order ${orderId} marked as ${newStatus}`);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update order status");
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

                {/* Refresh Data Toggle */}
                <button
                    type="button"
                    onClick={loadOrders}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#FFFDF9] border border-[#E8DEC8] hover:bg-[#F5EFE0] text-[#3A2E1F] transition-all"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F5A623]' : 'text-[#D97706]'}`} />
                    <span>Refresh Data</span>
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
                                            GB-{order.id}
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
                                            {new Date(order.created_at).toLocaleDateString()}
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
                title={`Order Details: GB-${selectedOrder?.id}`}
            >
                {selectedOrder && (
                    <div className="space-y-8">

                        {/* Quick Status Control Header */}
                        <div className="p-4 bg-[#F5EFE0] rounded-2xl border border-[#E8DEC8] flex items-center justify-between gap-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/60 block">Update Order Status</span>
                                <span className="text-xs font-bold text-[#3A2E1F] flex items-center gap-2 mt-1">Current: <StatusBadge status={selectedOrder.status} /></span>
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
                                <option value="Cancelled">Cancelled</option>
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
                                <Package className="w-4 h-4 text-[#D97706]" /> Ordered Line Items ({selectedOrder.items?.length || 0})
                            </h4>

                            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl divide-y divide-[#E8DEC8]/60 overflow-hidden">
                                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="p-4 flex flex-col gap-1 text-xs">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-[#3A2E1F] line-clamp-1">{item.product_name}</h5>
                                            <div className="text-right font-extrabold text-[#3A2E1F] whitespace-nowrap ml-4">
                                                Rs. {(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-[#D97706] font-semibold">
                                            {item.weight_option} × {item.quantity} units (Rs. {item.price.toLocaleString()} each)
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
                                <span>Shipping Fee ({selectedOrder.payment_method || 'COD'})</span>
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
