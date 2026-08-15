import React from 'react';
import { Link } from 'react-router-dom';

export default function BannerImage({ config }) {
    const image = config?.image || '';
    const link = config?.link || '';
    const alt = config?.alt || 'Promotional Banner';

    if (!image) return null;

    const content = (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-[#E8DEC8] shadow-md group">
                <img
                    src={image}
                    alt={alt}
                    className="w-full h-auto object-cover max-h-[400px] group-hover:scale-[1.02] transition-transform duration-500"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3A2E1F]/20 to-transparent pointer-events-none" />
            </div>
        </div>
    );

    if (link) {
        return (
            <section>
                <Link to={link}>{content}</Link>
            </section>
        );
    }

    return <section>{content}</section>;
}
