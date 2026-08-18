import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CheckCircle2, ChevronRight, Loader2, AlertCircle, ShieldCheck, Upload, X, CreditCard, Banknote, Smartphone, Building2, Camera, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { createOrder } from '../api/orders';
import { getPaymentAccounts, getPaymentMethods } from '../api/payments';
import { useCurrency } from '../hooks/useCurrency';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

// Icon mapping for payment methods (UI-only, labels/descriptions come from API)
const METHOD_ICONS = {
    'COD': Banknote,
    'easypaisa': Smartphone,
    'jazzcash': Smartphone,
    'bank_transfer': Building2,
};

export default function Checkout() {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { settings } = useSettings();
    const { formatPrice } = useCurrency();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    const freeShippingThreshold = Number(settings?.free_shipping_threshold) || 5000;
    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : (Number(settings?.default_shipping_fee) || 350);
    const grandTotal = subtotal + shippingFee;

    const isOnlinePayment = paymentMethod !== 'COD';
    const selectedAccount = paymentAccounts.find(a => a.method === paymentMethod);

    // Fetch payment methods and accounts on mount
    useEffect(() => {
        const fetchPaymentData = async () => {
            setLoadingAccounts(true);
            try {
                const [accounts, methods] = await Promise.all([
                    getPaymentAccounts(),
                    getPaymentMethods()
                ]);
                setPaymentAccounts(accounts);
                setPaymentMethods(methods);
            } catch (err) {
                console.log('Could not load payment data:', err.message);
            } finally {
                setLoadingAccounts(false);
            }
        };
        fetchPaymentData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Receipt image must be under 5MB');
                return;
            }
            setReceiptFile(file);
            setReceiptPreview(URL.createObjectURL(file));
        }
    };

    const removeReceipt = () => {
        setReceiptFile(null);
        if (receiptPreview) URL.revokeObjectURL(receiptPreview);
        setReceiptPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            toast.error("Your cart is empty.");
            return;
        }

        if (isOnlinePayment && !receiptFile) {
            toast.error("Please upload your payment receipt/screenshot.");
            return;
        }

        setLoading(true);
        try {
            let paymentProofPath = null;

            // If online payment, upload receipt first
            if (isOnlinePayment && receiptFile) {
                const uploadData = new FormData();
                uploadData.append('image', receiptFile);
                const api = (await import('../api/api')).default;
                const uploadRes = await api.post('/payments/receipt-upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                paymentProofPath = uploadRes.data.url;
            }

            const orderData = {
                customer_name: formData.name,
                customer_email: formData.email || undefined,
                phone: formData.phone,
                address: `${formData.address}, ${formData.city}`,
                total: grandTotal,
                payment_method: paymentMethod,
                payment_proof: paymentProofPath,
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
            navigate('/order-confirmation', {
                state: {
                    orderId: res.id || res.order_id || Date.now(),
                    total: grandTotal,
                    count: cartItems.length,
                    paymentMethod: paymentMethod,
                    isOnlinePayment: isOnlinePayment
                }
            });

        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || 'Failed to place order. Please try again.';
            toast.error(errorMsg);
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
            <SEO title={`Checkout - ${settings?.store_name || 'Store'}`} description={settings?.store_tagline || "Complete your secure checkout process."} noindex={true} />

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
                                    title="Please enter a valid phone number"
                                    className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all placeholder:text-[#3A2E1F]/40"
                                    value={formData.phone} onChange={handleChange} placeholder={settings?.phone_placeholder || "Phone Number"} />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Email <span className="text-[#3A2E1F]/40 font-normal normal-case">(optional — for order updates)</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-sm text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623] transition-all placeholder:text-[#3A2E1F]/40" placeholder="your@email.com" />
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
                            <CreditCard className="w-5 h-5 text-[#D97706]" /> Payment Method
                        </h2>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => {
                                const Icon = METHOD_ICONS[method.id] || Wallet;
                                const isSelected = paymentMethod === method.id;

                                return (
                                    <label
                                        key={method.id}
                                        className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected
                                            ? 'border-[#F5A623] bg-[#F5A623]/5 shadow-sm'
                                            : 'border-[#E8DEC8] bg-[#F5EFE0]/30 hover:border-[#F5A623]/50'
                                            }`}
                                        onClick={() => setPaymentMethod(method.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-4 flex items-center justify-center bg-white ${isSelected ? 'border-[#3A2E1F]' : 'border-[#E8DEC8]'}`}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-[#3A2E1F] rounded-full" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#3A2E1F] text-sm flex items-center gap-2">
                                                    {method.label}
                                                    <Icon className="w-4 h-4" style={{ color: method.color || '#D97706' }} />
                                                </div>
                                                <div className="text-[11px] text-[#3A2E1F]/60 mt-0.5">{method.description}</div>
                                            </div>
                                        </div>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={method.id}
                                            checked={isSelected}
                                            onChange={() => setPaymentMethod(method.id)}
                                            className="sr-only"
                                        />
                                    </label>
                                );
                            })}
                        </div>

                        {/* Online Payment Details */}
                        {isOnlinePayment && selectedAccount && (
                            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                {/* Account Details Card */}
                                <div className="bg-gradient-to-br from-[#3A2E1F] to-[#5a4a3a] text-white rounded-2xl p-5 space-y-3 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Send Payment To</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">{selectedAccount.title}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-[10px] text-white/50 block">Account Number</span>
                                            <span className="font-mono font-bold text-lg tracking-wider">{selectedAccount.account_number}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-white/50 block">Account Name</span>
                                            <span className="font-bold text-sm">{selectedAccount.account_name}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-white/10">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[10px] text-white/50">Amount to Send</span>
                                            <span className="font-heading font-extrabold text-xl text-[#F5A623]">{formatPrice(grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedAccount.instructions && (
                                    <p className="text-xs text-[#3A2E1F]/70 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        {selectedAccount.instructions}
                                    </p>
                                )}

                                {/* Receipt Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                                        Upload Payment Receipt <span className="text-rose-500">*</span>
                                    </label>
                                    {!receiptPreview ? (
                                        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#E8DEC8] hover:border-[#F5A623] rounded-2xl p-8 cursor-pointer transition-all hover:bg-[#F5A623]/5 group">
                                            <div className="w-14 h-14 rounded-2xl bg-[#F5EFE0] group-hover:bg-[#F5A623]/20 flex items-center justify-center transition-colors">
                                                <Camera className="w-7 h-7 text-[#D97706]" />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-bold text-[#3A2E1F] block">Click to upload receipt</span>
                                                <span className="text-[11px] text-[#3A2E1F]/50">PNG, JPG, or WebP (max 5MB)</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handleReceiptChange}
                                                className="sr-only"
                                            />
                                        </label>
                                    ) : (
                                        <div className="relative group">
                                            <img
                                                src={receiptPreview}
                                                alt="Payment receipt"
                                                className="w-full max-h-48 object-contain rounded-2xl border border-[#E8DEC8] bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeReceipt}
                                                className="absolute top-2 right-2 w-8 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-700 font-bold">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Receipt uploaded — {receiptFile?.name}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[#E8DEC8] text-sm text-[#3A2E1F]/80">
                        <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-[#3A2E1F]">{formatPrice(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Shipping Fee</span><span className="font-bold text-[#3A2E1F]">{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span></div>

                        <div className="pt-4 border-t border-[#E8DEC8] flex flex-col gap-1">
                            <div className="flex justify-between items-baseline">
                                <span className="font-heading font-bold text-base text-[#3A2E1F]">Total to Pay</span>
                                <span className="font-heading font-extrabold text-2xl text-[#3A2E1F]">{formatPrice(grandTotal)}</span>
                            </div>
                            <span className="text-right text-[10px] text-[#3A2E1F]/60">
                                {isOnlinePayment ? `Pay via ${paymentMethods.find(m => m.id === paymentMethod)?.label || paymentMethod}` : 'Payment on delivery'}
                            </span>
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
