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
    <section aria-label="Loading departments" className="sj-container space-y-3.5 sm:space-y-4 select-none">
      <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
        <div className="h-6 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 animate-pulse flex flex-col justify-end p-3 sm:p-4"
          >
            <div className="h-4 w-20 bg-slate-300 rounded mb-1.5" />
            <div className="h-3 w-12 bg-slate-200 rounded" />
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
      <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2.5 sm:pb-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
        </div>

        <Link
          href="/product"
          className="text-xs sm:text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors py-0.5"
        >
          See all
        </Link>
      </div>

      {/* Categories Grid (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {displayCategories.map((cat, idx) => {
          const count = cat._count?.products;
          const countLabel = typeof count === 'number'
            ? `${count} ${count === 1 ? 'item' : 'items'}`
            : `${idx * 6 + 12} items`;

          const fallbackSrc = DEFAULT_FALLBACK_CATEGORIES[idx % DEFAULT_FALLBACK_CATEGORIES.length].image;
          const imageSrc = (failedImages[cat.id] || !cat.image) ? fallbackSrc : cat.image;

          return (
            <Link
              key={cat.id}
              href={`/product?category=${encodeURIComponent(cat.name)}`}
              className="group relative aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 shadow-xs flex flex-col justify-end p-3 sm:p-4 transition-all duration-300 hover:shadow-md hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {/* Category Background Image */}
              <Image
                src={imageSrc}
                alt={cat.name}
                fill
                unoptimized
                onError={() => handleImageError(cat.id)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />

              {/* Gentle, natural bottom scrim only over lower 45% */}
              <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

              {/* Bottom Card Content - Human, balanced typography */}
              <div className="relative z-10 text-white">
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-amber-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/80 font-normal mt-0.5 leading-none">
                  {countLabel}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
