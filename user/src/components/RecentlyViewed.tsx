'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getApiUrl } from '@/lib/api';

type Product = {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewsCount?: number;
  isNewArrival?: boolean;
  isCustomerFavorite?: boolean;
};

const DEFAULT_RECOMMENDED: Product[] = [
  {
    id: 'rec-1',
    name: 'JudesCart Utility Wool Overshirt',
    description: 'Fine spun merino wool overshirt with chest pockets and tailored seams.',
    category: 'Apparel',
    brand: 'JudesCart',
    price: 4299,
    originalPrice: 5249,
    image: '/prod_overshirt_1778670536589.png',
    rating: 4.9,
    reviewsCount: 142,
    isCustomerFavorite: true,
  },
  {
    id: 'rec-2',
    name: 'Bespoke Double-Breasted Wool Suit',
    description: 'Handcrafted master cut wool suit with Italian peak lapels.',
    category: 'Tailoring',
    brand: 'JudesCart',
    price: 18999,
    originalPrice: 22499,
    image: '/cat_apparel_1778670103427.png',
    rating: 4.9,
    reviewsCount: 96,
    isNewArrival: true,
  },
  {
    id: 'rec-3',
    name: 'Heritage Full-Grain Leather Briefcase',
    description: 'Artisan vegetable-tanned leather briefcase with brass lock hardware.',
    category: 'Leather Goods',
    brand: 'JudesCart',
    price: 8499,
    originalPrice: 10499,
    image: '/cat_leather_1778670351299.png',
    rating: 4.8,
    reviewsCount: 84,
    isCustomerFavorite: true,
  },
  {
    id: 'rec-4',
    name: 'Handcrafted Minimalist Bifold Wallet',
    description: 'Top grain burnished leather bifold with RFID blocking lining.',
    category: 'Accessories',
    brand: 'JudesCart',
    price: 1999,
    originalPrice: 2499,
    image: '/cat_accessories_1778670517925.png',
    rating: 4.9,
    reviewsCount: 215,
    isNewArrival: true,
  },
];

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_RECOMMENDED);
  const [hasRecent, setHasRecent] = useState(false);

  useEffect(() => {
    // 1. Try to load recently viewed from localStorage
    try {
      const stored = localStorage.getItem('judescart_recently_viewed') || localStorage.getItem('stevejon_recently_viewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHasRecent(true);
          // Deduplicate and pad with recommended defaults if less than 4
          const combined = [...parsed];
          DEFAULT_RECOMMENDED.forEach((def) => {
            if (!combined.some((p) => String(p.id) === String(def.id))) {
              combined.push(def);
            }
          });
          setProducts(combined.slice(0, 4));
          return;
        }
      }
    } catch {
      // ignore localStorage errors
    }

    // 2. Fetch live products from API as fallback
    fetch(`${getApiUrl()}/products?limit=8`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted: Product[] = res.data.slice(0, 4).map((p: any, idx: number) => {
            const firstVariant = p.variants?.[0];
            const priceVal = Number(firstVariant?.offerPrice || firstVariant?.price || p.price || 2999);
            const origPriceVal = Number(firstVariant?.price || p.originalPrice || Math.round(priceVal * 1.2));
            return {
              id: p.id,
              name: p.name,
              description: p.description,
              category: p.category?.name || 'Apparel',
              brand: p.brand?.name || 'JudesCart',
              price: priceVal,
              originalPrice: origPriceVal,
              image: p.image || p.images?.[0] || DEFAULT_RECOMMENDED[idx % DEFAULT_RECOMMENDED.length].image,
              rating: 4.8 + (idx % 3) * 0.1,
              reviewsCount: 50 + idx * 25,
              isCustomerFavorite: idx % 2 === 0,
              isNewArrival: idx % 2 === 1,
            };
          });
          setProducts(formatted);
        }
      })
      .catch(() => {
        // Fallback to default recommended products
      });
  }, []);

  return (
    <section className="sj-container">
      <div className="space-y-3 sm:space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#FEF8EE] text-[#DF9F28] border border-[#DF9F28]/30">
              <History className="w-3.5 h-3.5 text-[#DF9F28]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-[#111111] tracking-tight">
                  Recently Viewed &amp; Recommended
                </h3>
                {hasRecent && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#FEF8EE] text-[#DF9F28] border border-[#DF9F28]/30">
                    <Sparkles className="w-3 h-3 text-[#DF9F28]" />
                    Personalized
                  </span>
                )}
              </div>
              <p className="text-xs text-[#555555] mt-0.5 font-normal">
                Curated suggestions based on your taste and catalog bestsellers
              </p>
            </div>
          </div>

          <Link
            href="/product"
            className="text-xs font-medium text-[#DF9F28] hover:text-[#C6891E] inline-flex items-center gap-1 transition-colors self-start sm:self-auto focus-visible:outline-none"
          >
            <span>Browse entire catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              name={prod.name}
              description={prod.description}
              category={prod.category}
              brand={prod.brand || 'JudesCart'}
              price={prod.price}
              originalPrice={prod.originalPrice}
              image={prod.image}
              rating={prod.rating}
              reviewsCount={prod.reviewsCount}
              isNewArrival={prod.isNewArrival}
              isCustomerFavorite={prod.isCustomerFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
