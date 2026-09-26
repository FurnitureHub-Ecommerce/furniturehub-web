import React from 'react';

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className="bg-white rounded-xl border border-stone-200 overflow-hidden animate-pulse flex flex-col h-[380px]"
        >
          <div className="w-full h-[220px] bg-stone-200" />
          <div className="p-4 flex flex-col justify-between flex-1 gap-3">
            <div className="space-y-2">
              <div className="h-3 w-1/3 bg-stone-200 rounded" />
              <div className="h-5 w-3/4 bg-stone-200 rounded" />
              <div className="h-4 w-1/4 bg-stone-200 rounded" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-100">
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full bg-stone-200" />
                <div className="w-4 h-4 rounded-full bg-stone-200" />
                <div className="w-4 h-4 rounded-full bg-stone-200" />
              </div>
              <div className="h-3 w-12 bg-stone-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Gallery skeleton */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full aspect-[4/3] bg-stone-200 rounded-xl" />
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-stone-200 rounded-lg" />
            <div className="w-20 h-20 bg-stone-200 rounded-lg" />
            <div className="w-20 h-20 bg-stone-200 rounded-lg" />
          </div>
        </div>
        {/* Info skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="h-4 w-28 bg-stone-200 rounded" />
          <div className="h-8 w-3/4 bg-stone-200 rounded" />
          <div className="h-6 w-32 bg-stone-200 rounded" />
          <div className="h-20 w-full bg-stone-200 rounded" />
          <div className="space-y-3">
            <div className="h-4 w-20 bg-stone-200 rounded" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-stone-200" />
              <div className="w-8 h-8 rounded-full bg-stone-200" />
              <div className="w-8 h-8 rounded-full bg-stone-200" />
            </div>
          </div>
          <div className="h-12 w-full bg-stone-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default ProductGridSkeleton;
