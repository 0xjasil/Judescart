'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
  subcategories?: SubCategory[];
  _count?: {
    products?: number;
  };
}

const DEFAULT_FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Apparel & Tailoring', image: '/cat_apparel_1778670103427.png', _count: { products: 38 } },
  { id: '2', name: 'Signature Leather Goods', image: '/cat_leather_1778670351299.png', _count: { products: 19 } },
  { id: '3', name: 'Fine Accessories', image: '/cat_accessories_1778670517925.png', _count: { products: 24 } },
  { id: '4', name: 'Atelier Suits & Blazers', image: '/about_atelier.png', _count: { products: 16 } },
  { id: '5', name: 'Outerwear & Jackets', image: '/prod_overshirt_1778670536589.png', _count: { products: 12 } },
  { id: '6', name: 'Travel & Craftsmanship', image: '/about_craftsmanship.png', _count: { products: 28 } },
];

function CategoriesSkeleton() {
  return (
    <section aria-label="Loading departments" className="sj-container space-y-4 sm:space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 bg-amber-500/20 rounded animate-pulse" />
          <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-[16/11] rounded-xl overflow-hidden bg-slate-200/80 border border-slate-200 animate-pulse flex flex-col justify-end p-4 sm:p-6 space-y-2"
          >
            <div className="h-3 w-16 bg-slate-300 rounded" />
            <div className="h-5 w-32 bg-slate-300 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/categories`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
            setCategories(data);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Categories API fetch error, falling back to defaults:', err.message || err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return <CategoriesSkeleton />;
  }

  const displayCategories = categories.length > 0 ? categories : DEFAULT_FALLBACK_CATEGORIES;

  return (
    <section className="sj-container space-y-3 sm:space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-medium text-[#DF9F28]">
            All Departments
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-[#111111] tracking-tight mt-0.5">
            Shop by Department
          </h2>
        </div>

        <Link
          href="/product"
          className="text-xs font-medium uppercase tracking-wider text-[#DF9F28] hover:text-[#C6891E] flex items-center gap-1 transition-colors focus-visible:outline-none"
        >
          <span>View All Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Categories Grid (2 cols mobile, 3 cols tablet, 4 cols desktop - refined compact footprint) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayCategories.map((cat, idx) => {
          const count = cat._count?.products;
          const countLabel = typeof count === 'number'
            ? `${count} ${count === 1 ? 'Product' : 'Products'}`
            : `${idx * 6 + 12} Styles`;

          const fallbackSrc = DEFAULT_FALLBACK_CATEGORIES[idx % DEFAULT_FALLBACK_CATEGORIES.length].image;
          const imageSrc = (failedImages[cat.id] || !cat.image) ? fallbackSrc : cat.image;

          return (
            <Link
              key={cat.id}
              href={`/product?category=${encodeURIComponent(cat.name)}`}
              className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-[#E2E8F0] shadow-2xs flex flex-col justify-end p-3 sm:p-4 transition-all duration-300 hover:shadow-sm hover:border-[#DF9F28] focus-visible:ring-2 focus-visible:ring-[#DF9F28]"
            >
              {/* Category Background Image */}
              <Image
                src={imageSrc}
                alt={cat.name}
                fill
                unoptimized
                onError={() => handleImageError(cat.id)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
              />

              {/* Midnight Navy Gradient Dark Overlay (#061B3A) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061B3A]/90 via-[#061B3A]/40 to-transparent pointer-events-none" />

              {/* Bottom Card Information */}
              <div className="relative z-10 text-white space-y-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#DF9F28] font-medium block">
                  {countLabel}
                </span>
                
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white leading-tight line-clamp-1">
                  {cat.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
