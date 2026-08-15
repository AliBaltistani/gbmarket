import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight } from 'lucide-react';
import { CategorySkeleton } from '../Skeletons';
import { getCategories } from '../../api/categories';

export default function CategoryShowcase({ config }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const heading = config?.heading || 'Browse Categories';
    const description = config?.description || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCategories();
                setCategories(res);
            } catch (err) {
                console.error('CategoryShowcase fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const marqueeCategories = [...categories, ...categories];

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
            <div className="flex flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#3A2E1F]">{heading}</h2>
                    {description && <p className="text-xs sm:text-sm text-[#3A2E1F]/70">{description}</p>}
                </div>
                <Link to="/shop" className="text-xs sm:text-sm font-bold text-[#D97706] hover:underline flex items-center gap-1 shrink-0">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {[...Array(5)].map((_, i) => <CategorySkeleton key={i} />)}
                </div>
            ) : (
                <div className="relative overflow-hidden py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#F5EFE0] via-[#F5EFE0]/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#F5EFE0] via-[#F5EFE0]/80 to-transparent z-10 pointer-events-none" />

                    <div className="animate-marquee gap-3 sm:gap-4 flex items-center">
                        {marqueeCategories.map((cat, idx) => (
                            <Link
                                key={`${cat.id}-${idx}`}
                                to={`/shop?category=${cat.slug}`}
                                className="shrink-0 w-32 sm:w-40 group bg-[#FFFDF9] border border-[#E8DEC8] hover:border-[#F5A623] rounded-2xl p-4 text-center shadow-xs hover:shadow-lg hover:shadow-[#F5A623]/25 hover:-translate-y-1.5 hover:rotate-1 transition-all duration-300 flex flex-col items-center justify-center gap-2.5 cursor-pointer"
                            >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F5EFE0] group-hover:bg-[#F5A623] text-[#3A2E1F] flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-110 group-hover:rotate-12">
                                    <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-[#D97706] group-hover:text-[#3A2E1F] transition-colors" />
                                </div>
                                <h3 className="font-heading font-extrabold text-xs sm:text-sm text-[#3A2E1F] group-hover:text-[#D97706] line-clamp-1 transition-colors">{cat.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
