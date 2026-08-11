import React, { useState } from 'react';
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
    AlertCircle
} from 'lucide-react';
import {
    SlideOver,
    ConfirmDialog,
    AdminEmptyState,
    AdminSkeletonTable
} from '../../components/admin/AdminComponents';

export default function AdminProducts() {
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy Products List
    const [products, setProducts] = useState([
        { id: 1, name: 'Premium Hunza Dried Apricots', slug: 'hunza-dried-apricots', category: 'Dried Apricots', basePrice: 1200, stock: 45, isFeatured: true, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300' },
        { id: 2, name: 'Gilgit Organic Walnuts (In Shell)', slug: 'gilgit-organic-walnuts', category: 'Walnuts', basePrice: 1800, stock: 3, isFeatured: true, image: 'https://images.unsplash.com/photo-1543208541-0961a29a8c3d?auto=format&fit=crop&q=80&w=300' },
        { id: 3, name: 'Kaghan Raw Almond Kernels', slug: 'raw-almond-kernels', category: 'Almonds', basePrice: 2200, stock: 28, isFeatured: false, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300' },
        { id: 4, name: 'Skardu Salted Roasted Cashews', slug: 'salted-roasted-cashews', category: 'Cashews', basePrice: 2600, stock: 2, isFeatured: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300' },
        { id: 5, name: 'Sun-Dried Organic Fig (Anjeer)', slug: 'sun-dried-organic-fig', category: 'Figs', basePrice: 1950, stock: 15, isFeatured: false, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300' },
        { id: 6, name: 'Premium Saudi Ajwa Dates', slug: 'saudi-ajwa-dates', category: 'Dates', basePrice: 3200, stock: 60, isFeatured: true, image: 'https://images.unsplash.com/photo-1543208541-0961a29a8c3d?auto=format&fit=crop&q=80&w=300' },
        { id: 7, name: 'Mountain Mix Dry Fruit Box', slug: 'mountain-mix-dry-fruit-box', category: 'Mixed Nuts', basePrice: 2990, stock: 12, isFeatured: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300' },
        { id: 8, name: 'Gilgit Green Raisins (Kishmish)', slug: 'green-raisins', category: 'Raisins', basePrice: 950, stock: 4, isFeatured: false, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300' },
    ]);

    // Modal / SlideOver Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Product Form Input Values
    const [formData, setFormData] = useState({
        name: '',
        category: 'Almonds',
        basePrice: '',
        stock: '',
        description: '',
        isFeatured: false,
        weightOptions: [{ label: '250g', price: '' }, { label: '500g', price: '' }]
    });

    // Delete Confirm Dialog State
    const [deleteProduct, setDeleteProduct] = useState(null);

    // Filter products by search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Form Open (Add vs Edit)
    const handleOpenForm = (prod = null) => {
        if (prod) {
            setEditingProduct(prod);
            setFormData({
                name: prod.name,
                category: prod.category,
                basePrice: prod.basePrice,
                stock: prod.stock,
                description: 'Authentic organic sun-dried product sourced directly from Gilgit-Baltistan farms.',
                isFeatured: prod.isFeatured,
                weightOptions: [
                    { label: '250g', price: prod.basePrice },
                    { label: '500g', price: Math.round(prod.basePrice * 1.9) },
                    { label: '1kg', price: Math.round(prod.basePrice * 3.6) }
                ]
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: 'Almonds',
                basePrice: '',
                stock: '',
                description: '',
                isFeatured: false,
                weightOptions: [{ label: '250g', price: '' }, { label: '500g', price: '' }]
            });
        }
        setIsFormOpen(true);
    };

    const handleAddWeightOption = () => {
        setFormData({
            ...formData,
            weightOptions: [...formData.weightOptions, { label: '1kg', price: '' }]
        });
    };

    const handleRemoveWeightOption = (idx) => {
        setFormData({
            ...formData,
            weightOptions: formData.weightOptions.filter((_, i) => i !== idx)
        });
    };

    const handleSaveProduct = (e) => {
        e.preventDefault();
        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData, basePrice: Number(formData.basePrice), stock: Number(formData.stock) } : p));
        } else {
            const newProd = {
                id: Date.now(),
                name: formData.name,
                slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
                category: formData.category,
                basePrice: Number(formData.basePrice),
                stock: Number(formData.stock),
                isFeatured: formData.isFeatured,
                image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300'
            };
            setProducts([newProd, ...products]);
        }
        setIsFormOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (deleteProduct) {
            setProducts(products.filter(p => p.id !== deleteProduct.id));
            setDeleteProduct(null);
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
                    {/* Skeleton Preview Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsLoading(!isLoading)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#FFFDF9] border border-[#E8DEC8] hover:bg-[#F5EFE0] text-[#3A2E1F] transition-all"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F5A623]' : 'text-[#D97706]'}`} />
                        <span>Skeleton State</span>
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
                                    {filteredProducts.map((p) => {
                                        const isLowStock = p.stock < 5;
                                        return (
                                            <tr key={p.id} className="hover:bg-[#F5EFE0]/40 transition-colors">
                                                {/* Image + Name */}
                                                <td className="py-3.5 px-4 flex items-center gap-3">
                                                    <img
                                                        src={p.image}
                                                        alt={p.name}
                                                        className="w-11 h-11 rounded-xl object-cover border border-[#E8DEC8] bg-[#F5EFE0] shrink-0"
                                                    />
                                                    <div>
                                                        <span className="font-bold text-sm text-[#3A2E1F] block line-clamp-1">{p.name}</span>
                                                        <span className="text-[10px] text-[#3A2E1F]/50 font-mono">slug: /{p.slug}</span>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2.5 py-1 bg-[#F5EFE0] text-[#D97706] rounded-full text-[11px] font-bold border border-[#E8DEC8]">
                                                        {p.category}
                                                    </span>
                                                </td>

                                                {/* Price */}
                                                <td className="py-3.5 px-4 font-extrabold text-sm text-[#3A2E1F]">
                                                    Rs. {p.basePrice.toLocaleString()}
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
                                                    {p.isFeatured ? (
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
                                                            onClick={() => setDeleteProduct(p)}
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
                            <span>Showing 1 - {filteredProducts.length} of {filteredProducts.length} products</span>
                            <div className="flex items-center gap-1">
                                <button type="button" disabled className="p-2 rounded-lg border border-[#E8DEC8] opacity-50 cursor-not-allowed">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button type="button" className="px-3 py-1 rounded-lg bg-[#F5A623] text-[#3A2E1F] font-bold">1</button>
                                <button type="button" className="p-2 rounded-lg border border-[#E8DEC8] hover:bg-[#F5EFE0]">
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
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            >
                                <option value="Almonds">Almonds</option>
                                <option value="Walnuts">Walnuts</option>
                                <option value="Cashews">Cashews</option>
                                <option value="Dried Apricots">Dried Apricots</option>
                                <option value="Dates">Dates</option>
                                <option value="Figs">Figs</option>
                                <option value="Mixed Nuts">Mixed Nuts</option>
                                <option value="Raisins">Raisins</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Stock Quantity</label>
                            <input
                                required
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                placeholder="e.g. 50"
                                className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Base Price (PKR)</label>
                        <input
                            required
                            type="number"
                            value={formData.basePrice}
                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                            placeholder="e.g. 1500"
                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        />
                    </div>

                    {/* Repeatable Weight Options */}
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

                    {/* Image Dropzone Placeholder */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">Product Photo</label>
                        <div className="border-2 border-dashed border-[#E8DEC8] rounded-2xl p-6 text-center bg-[#F5EFE0]/20 hover:bg-[#F5EFE0]/40 transition-colors cursor-pointer space-y-2">
                            <UploadCloud className="w-8 h-8 text-[#D97706] mx-auto" />
                            <p className="text-xs font-bold text-[#3A2E1F]">Drag and drop product image here</p>
                            <p className="text-[10px] text-[#3A2E1F]/60">Supports PNG, JPG, WEBP up to 5MB</p>
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
                            className="w-1/2 py-3 bg-[#F5EFE0] hover:bg-[#E8DEC8] text-[#3A2E1F] font-bold text-xs rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-3 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full transition-colors shadow-md"
                        >
                            {editingProduct ? 'Update Product' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </SlideOver>

            {/* DELETE CONFIRM DIALOG */}
            <ConfirmDialog
                isOpen={!!deleteProduct}
                onClose={() => setDeleteProduct(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Product"
                message={`Are you sure you want to delete "${deleteProduct?.name}"?`}
                warningNote="This action cannot be undone and will permanently remove the item from the storefront catalog."
            />

        </div>
    );
}
