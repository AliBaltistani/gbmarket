import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Check,
    X,
    UploadCloud,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    AlertCircle,
    Loader2
} from 'lucide-react';
import {
    SlideOver,
    ConfirmDialog,
    AdminEmptyState,
    AdminSkeletonTable
} from '../../components/admin/AdminComponents';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '../../api/products';
import { getCategories } from '../../api/categories';
import toast from 'react-hot-toast';

export default function AdminProducts() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // Modal / SlideOver Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Product Form Input Values
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        basePrice: '',
        stock: '',
        rating: '4.8',
        reviewCount: '25',
        description: '',
        isFeatured: false,
        weightOptions: [{ label: '500g', price: '' }]
    });

    // Delete Confirm Dialog State
    const [deleteProductItem, setDeleteProductItem] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
            setProducts(prods);
            setCategories(cats);
        } catch (err) {
            toast.error('Failed to load products or categories');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter products by search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    // Handle Form Open (Add vs Edit)
    const handleOpenForm = (prod = null) => {
        setImageFile(null);
        if (prod) {
            setEditingProduct(prod);
            setFormData({
                name: prod.name,
                category_id: prod.category_id || (categories.length > 0 ? categories[0].id : ''),
                basePrice: prod.base_price,
                stock: prod.stock,
                rating: prod.rating || 4.8,
                reviewCount: prod.review_count || 25,
                description: prod.description || '',
                isFeatured: prod.is_featured === 1,
                weightOptions: prod.weight_options && prod.weight_options.length > 0
                    ? prod.weight_options
                    : [{ label: '500g', price: '' }]
            });
            setImagePreview(prod.image_url);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category_id: categories.length > 0 ? categories[0].id : '',
                basePrice: '',
                stock: '',
                rating: '4.8',
                reviewCount: '25',
                description: '',
                isFeatured: false,
                weightOptions: [{ label: '1kg', price: '' }, { label: '500g', price: '' }]
            });
            setImagePreview(null);
        }
        setIsFormOpen(true);
    };

    const handleAddWeightOption = () => {
        setFormData({
            ...formData,
            weightOptions: [...formData.weightOptions, { label: '250g', price: '' }]
        });
    };

    const handleRemoveWeightOption = (idx) => {
        setFormData({
            ...formData,
            weightOptions: formData.weightOptions.filter((_, i) => i !== idx)
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // C8: Revoke old object URL to prevent memory leak
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let imageUrl = editingProduct ? editingProduct.image_url : null;
            if (imageFile) {
                const uploadRes = await uploadImage(imageFile);
                imageUrl = uploadRes.url;
            }

            const payload = {
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                category_id: Number(formData.category_id),
                base_price: Number(formData.basePrice),
                stock: Number(formData.stock),
                rating: Number(formData.rating),
                review_count: Number(formData.reviewCount),
                description: formData.description,
                image_url: imageUrl,
                is_featured: formData.isFeatured ? 1 : 0,
                weight_options: formData.weightOptions.map(opt => ({ label: opt.label, price: Number(opt.price) }))
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
                toast.success('Product updated successfully');
            } else {
                await createProduct(payload);
                toast.success('Product created successfully');
            }

            setIsFormOpen(false);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteProductItem) {
            try {
                await deleteProduct(deleteProductItem.id);
                toast.success('Product deleted');
                loadData();
            } catch (err) {
                toast.error('Failed to delete product');
            } finally {
                setDeleteProductItem(null);
            }
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DEC8] pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F]">
                        Product Management
                    </h1>
                    <p className="text-xs text-[#3A2E1F]/70">
                        View, add, edit, and organize catalog items and inventory
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#FFFDF9] border border-[#E8DEC8] hover:bg-[#F5EFE0] text-[#3A2E1F] transition-all"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F5A623]' : 'text-[#D97706]'}`} />
                        <span>Refresh</span>
                    </button>

                    {/* Add Product Button */}
                    <button
                        type="button"
                        onClick={() => handleOpenForm(null)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-extrabold text-xs rounded-full shadow-md transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* CONTROLS: SEARCH BAR */}
            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products by name or category..."
                        className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                    />
                    <Search className="w-4 h-4 text-[#3A2E1F]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-xs font-bold text-[#3A2E1F]/70 flex items-center gap-2">
                    <span>Total Catalog Items:</span>
                    <span className="bg-[#F5EFE0] px-2.5 py-1 rounded-full text-[#D97706]">{products.length}</span>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

                {isLoading ? (
                    <AdminSkeletonTable rows={6} />
                ) : filteredProducts.length === 0 ? (
                    <AdminEmptyState
                        title="No Products Match"
                        description={`No results found for "${searchTerm}". Try resetting your search.`}
                        actionLabel="Reset Search"
                        onAction={() => setSearchTerm('')}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#E8DEC8] text-[11px] font-bold uppercase tracking-wider text-[#3A2E1F]/60">
                                        <th className="py-3 px-4">Item</th>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Base Price</th>
                                        <th className="py-3 px-4">Stock</th>
                                        <th className="py-3 px-4">Featured</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8DEC8]/60 text-xs font-semibold text-[#3A2E1F]">
                                    {paginatedProducts.map((p) => {
                                        const isLowStock = p.stock < 5;
                                        return (
                                            <tr key={p.id} className="hover:bg-[#F5EFE0]/40 transition-colors">
                                                {/* Image + Name */}
                                                <td className="py-3.5 px-4 flex items-center gap-3">
                                                    <img
                                                        src={p.image_url || '/placeholder.png'}
                                                        alt={p.name}
                                                        className="w-11 h-11 rounded-xl object-cover border border-[#E8DEC8] bg-[#F5EFE0] shrink-0"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                                                    />
                                                    <div>
                                                        <span className="font-bold text-sm text-[#3A2E1F] block line-clamp-1">{p.name}</span>
                                                        <span className="text-[10px] text-[#3A2E1F]/50 font-mono">slug: /{p.slug}</span>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2.5 py-1 bg-[#F5EFE0] text-[#D97706] rounded-full text-[11px] font-bold border border-[#E8DEC8]">
                                                        {p.category_name}
                                                    </span>
                                                </td>

                                                {/* Price */}
                                                <td className="py-3.5 px-4 font-extrabold text-sm text-[#3A2E1F]">
                                                    Rs. {p.base_price.toLocaleString()}
                                                </td>

                                                {/* Stock (Red highlight if < 5) */}
                                                <td className="py-3.5 px-4">
                                                    {isLowStock ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[11px] font-extrabold border border-rose-300">
                                                            <AlertCircle className="w-3 h-3 text-rose-600" />
                                                            {p.stock} (Low Stock)
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-[#3A2E1F]">
                                                            {p.stock} units
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Featured Toggle */}
                                                <td className="py-3.5 px-4">
                                                    {p.is_featured ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200">
                                                            <Check className="w-3 h-3" /> Featured
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#3A2E1F]/40 text-[11px] font-normal">Standard</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenForm(p)}
                                                            className="p-2 bg-[#F5EFE0] hover:bg-[#F5A623] text-[#3A2E1F] rounded-xl transition-colors"
                                                            title="Edit Product"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteProductItem(p)}
                                                            className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl transition-colors"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-[#E8DEC8] gap-4 text-xs font-semibold text-[#3A2E1F]/70">
                            <span>Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products</span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="p-2 rounded-lg border border-[#E8DEC8] hover:bg-[#F5EFE0] disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button type="button" className="px-3 py-1 rounded-lg bg-[#F5A623] text-[#3A2E1F] font-bold">{currentPage}</button>
                                <button
                                    type="button"
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="p-2 rounded-lg border border-[#E8DEC8] hover:bg-[#F5EFE0] disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}

            </div>

            {/* ADD / EDIT SLIDE-OVER FORM */}
            <SlideOver
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
            >
                <form onSubmit={handleSaveProduct} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Product Title</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Premium Hunza Dried Apricots"
                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Category</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Stock Quantity</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                placeholder="e.g. 50"
                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Base Price (PKR)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                placeholder="e.g. 1500"
                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Rating (1.0 - 5.0)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="1.0"
                                max="5.0"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                placeholder="4.8"
                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Review Count</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.reviewCount}
                                onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value })}
                                placeholder="42"
                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            />
                        </div>
                    </div>

                    {/* Form Controls */}
                    <div className="space-y-3 p-4 bg-[#F5EFE0]/40 rounded-2xl border border-[#E8DEC8]">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Weight / Packaging Sizes</label>
                            <button
                                type="button"
                                onClick={handleAddWeightOption}
                                className="text-[11px] font-bold text-[#D97706] hover:underline"
                            >
                                + Add another size
                            </button>
                        </div>

                        {formData.weightOptions.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    required
                                    value={opt.label}
                                    onChange={(e) => {
                                        const newOpts = [...formData.weightOptions];
                                        newOpts[i].label = e.target.value;
                                        setFormData({ ...formData, weightOptions: newOpts });
                                    }}
                                    placeholder="Size (e.g. 250g)"
                                    className="w-1/2 bg-white border border-[#E8DEC8] rounded-xl px-3 py-2 text-xs"
                                />
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={opt.price}
                                    onChange={(e) => {
                                        const newOpts = [...formData.weightOptions];
                                        newOpts[i].price = e.target.value;
                                        setFormData({ ...formData, weightOptions: newOpts });
                                    }}
                                    placeholder="Price (Rs)"
                                    className="w-1/2 bg-white border border-[#E8DEC8] rounded-xl px-3 py-2 text-xs"
                                />
                                {formData.weightOptions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveWeightOption(i)}
                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Image Dropzone */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Product Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-[#E8DEC8] rounded-2xl p-6 text-center bg-[#F5EFE0]/20 hover:bg-[#F5EFE0]/40 transition-colors cursor-pointer space-y-2 relative overflow-hidden"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-32 object-contain mx-auto rounded-lg" />
                            ) : (
                                <>
                                    <UploadCloud className="w-8 h-8 text-[#D97706] mx-auto" />
                                    <p className="text-xs font-bold text-[#3A2E1F]">Click to upload image</p>
                                    <p className="text-[10px] text-[#3A2E1F]/60">Supports PNG, JPG, WEBP up to 5MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter organic product details..."
                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#F5EFE0] rounded-2xl border border-[#E8DEC8]">
                        <span className="text-xs font-bold text-[#3A2E1F] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#D97706]" /> Mark as Featured Product
                        </span>
                        <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                        />
                    </div>

                    <div className="pt-4 border-t border-[#E8DEC8] flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            disabled={isSubmitting}
                            className="w-1/2 py-3 bg-[#F5EFE0] hover:bg-[#E8DEC8] text-[#3A2E1F] font-bold text-xs rounded-full transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-1/2 flex items-center justify-center gap-2 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full transition-colors shadow-md disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {editingProduct ? 'Update Product' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </SlideOver>

            {/* DELETE CONFIRM DIALOG */}
            <ConfirmDialog
                isOpen={!!deleteProductItem}
                onClose={() => setDeleteProductItem(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteProductItem?.name}"?`}
                warningNote="This action cannot be undone and will permanently remove the item from the storefront catalog."
            />

        </div>
    );
}
