import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ProductSkeleton } from '../Skeletons';
import { getProducts } from '../../api/products';

export default function ProductGrid({ config }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const heading = config?.heading || 'Products';
    const badge = config?.badge || '';
    const filter = config?.filter || 'all';
    const maxItems = config?.maxItems || 6;
    const categorySlug = config?.categorySlug || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                let params = {};
                if (filter === 'featured') params.featured = 'true';
                if (filter === 'category' && categorySlug) params.category = categorySlug;

                const res = await getProducts(params);
                setProducts(res.slice(0, maxItems));
            } catch (err) {
                console.error('ProductGrid fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filter, maxItems, categorySlug]);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
                {badge && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/20 text-[#D97706] text-xs font-bold uppercase tracking-wider">
                        <Award className="w-4 h-4" />
                        <span>{badge}</span>
                    </div>
                )}
                <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F]">{heading}</h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                    {[...Array(maxItems > 6 ? 6 : maxItems)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
                    {products.map(prod => (
                        <ProductCard key={prod.id} product={{
                            ...prod,
                            category: prod.category_name || prod.category_slug,
                            images: [prod.image_url],
                            weightOptions: prod.weight_options
                        }} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-[#3A2E1F]/60">No products found.</div>
            )}
        </section>
    );
}
