import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    RefreshCw,
    Tags,
    Package,
    Layers,
    Edit3,
    Check
} from 'lucide-react';
import {
    Modal,
    ConfirmDialog,
    AdminEmptyState,
    AdminSkeletonTable
} from '../../components/admin/AdminComponents';

export default function AdminCategories() {
    const [isLoading, setIsLoading] = useState(false);

    // Dummy Categories List
    const [categories, setCategories] = useState([
        { id: 1, name: 'Almonds', slug: 'almonds', productCount: 8, icon: '🥜' },
        { id: 2, name: 'Walnuts', slug: 'walnuts', productCount: 6, icon: '🌰' },
        { id: 3, name: 'Cashews', slug: 'cashews', productCount: 5, icon: '🥜' },
        { id: 4, name: 'Dried Apricots', slug: 'dried-apricots', productCount: 9, icon: '🍑' },
        { id: 5, name: 'Dates', slug: 'dates', productCount: 7, icon: '🌴' },
        { id: 6, name: 'Figs', slug: 'figs', productCount: 4, icon: '🫐' },
        { id: 7, name: 'Mixed Nuts', slug: 'mixed-nuts', productCount: 3, icon: '📦' },
        { id: 8, name: 'Raisins', slug: 'raisins', productCount: 2, icon: '🍇' },
    ]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');

    // Delete Dialog State
    const [deleteCat, setDeleteCat] = useState(null);

    // Auto-generate Slug helper
    const autoSlug = categoryName ? categoryName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') : '';

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!categoryName) return;
        const newCategory = {
            id: Date.now(),
            name: categoryName,
            slug: autoSlug || 'new-category',
            productCount: 0,
            icon: '🏷️'
        };
        setCategories([...categories, newCategory]);
        setCategoryName('');
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (deleteCat) {
            setCategories(categories.filter(c => c.id !== deleteCat.id));
            setDeleteCat(null);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DEC8] pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F]">
                        Category Management
                    </h1>
                    <p className="text-xs text-[#3A2E1F]/70">
                        Organize storefront taxonomy and product classifications
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

                    {/* Add Category Button */}
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-extrabold text-xs rounded-full shadow-md transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* CATEGORY GRID / LIST */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 bg-[#F5EFE0] rounded-3xl" />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <AdminEmptyState
                    title="No Categories Available"
                    description="Click 'Add Category' above to create your first product category."
                    actionLabel="Create Category"
                    onAction={() => setIsModalOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative"
                        >
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-[#F5EFE0] flex items-center justify-center text-2xl border border-[#E8DEC8]">
                                    {cat.icon}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDeleteCat(cat)}
                                    className="p-2 text-[#3A2E1F]/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors opacity-80 group-hover:opacity-100"
                                    title="Delete Category"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <h3 className="font-heading font-bold text-lg text-[#3A2E1F]">
                                    {cat.name}
                                </h3>
                                <span className="text-[11px] font-mono text-[#D97706] block mt-0.5">
                                    slug: /{cat.slug}
                                </span>
                            </div>

                            <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-between text-xs font-semibold text-[#3A2E1F]/70">
                                <span className="flex items-center gap-1.5">
                                    <Package className="w-3.5 h-3.5 text-[#D97706]" />
                                    <span>{cat.productCount} Linked Products</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD CATEGORY MODAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Category"
            >
                <form onSubmit={handleAddCategory} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3A2E1F] uppercase tracking-wider block">
                            Category Name
                        </label>
                        <input
                            required
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="e.g. Skardu Walnuts"
                            className="w-full bg-[#F5EFE0]/50 border border-[#E8DEC8] rounded-xl px-4 py-2.5 text-xs text-[#3A2E1F] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        />
                    </div>

                    {/* Auto-generated Slug Preview */}
                    <div className="p-3 bg-[#F5EFE0] rounded-2xl border border-[#E8DEC8] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A2E1F]/60 block">
                            URL Slug Auto-Preview:
                        </span>
                        <code className="text-xs font-mono font-bold text-[#D97706] block">
                            /category/{autoSlug || 'your-category-slug'}
                        </code>
                    </div>

                    <div className="pt-4 border-t border-[#E8DEC8] flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="w-1/2 py-2.5 bg-[#F5EFE0] hover:bg-[#E8DEC8] text-[#3A2E1F] font-bold text-xs rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-1/2 py-2.5 bg-[#F5A623] hover:bg-[#D97706] text-[#3A2E1F] hover:text-white font-bold text-xs rounded-full transition-colors shadow-md"
                        >
                            Save Category
                        </button>
                    </div>
                </form>
            </Modal>

            {/* DELETE CONFIRMATION WITH WARNING */}
            <ConfirmDialog
                isOpen={!!deleteCat}
                onClose={() => setDeleteCat(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteCat?.name}"?`}
                warningNote={
                    deleteCat?.productCount > 0
                        ? `Warning: This category has ${deleteCat.productCount} linked products. Deleting it will not delete those products, but they will become uncategorized.`
                        : null
                }
            />

        </div>
    );
}
