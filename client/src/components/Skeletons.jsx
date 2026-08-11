import React from 'react';

export function ProductSkeleton() {
    return (
        <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-4 sm:p-5 flex flex-col justify-between h-full animate-pulse shadow-sm">
            <div className="space-y-4">
                <div className="w-full aspect-square bg-[#F5EFE0] rounded-2xl"></div>
                <div className="space-y-2">
                    <div className="h-3 bg-[#E8DEC8] rounded w-1/4"></div>
                    <div className="h-5 bg-[#E8DEC8] rounded w-3/4"></div>
                </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E8DEC8] space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-[#E8DEC8] rounded w-1/3"></div>
                </div>
                <div className="h-10 bg-[#E8DEC8] rounded-full w-full"></div>
            </div>
        </div>
    );
}

export function CategorySkeleton() {
    return (
        <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 animate-pulse h-32">
            <div className="w-12 h-12 rounded-full bg-[#F5EFE0]"></div>
            <div className="h-4 bg-[#E8DEC8] rounded w-16"></div>
        </div>
    );
}
