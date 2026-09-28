'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Compass, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import ProductCard from './ProductCard';

interface RawProduct {
  id: string;
  name: string;
  description?: string;
  image: string;
  subimage?: string[];
  isNewArrival?: boolean;
  isCustomerFavorite?: boolean;
  rating?: number;
  reviewsCount?: number;
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  variants?: Array<{
    id: string;
    price: number;
    offerPrice?: number;
    qty?: number;
    sku?: string;
  }>;
}

const CATEGORY_TABS = [
  'ALL PRODUCTS',
  'APPAREL',
  'LEATHER GOODS',
  'FOOTWEAR',
  'ACCESSORIES',
  'HOME LIVING',
];

const FALLBACK_PRODUCTS: RawProduct[] = [
  {
    id: 'prod-1',
    name: 'JudesCart Utility Wool Overshirt',
    category: { id: 'c1', name: 'APPAREL' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/prod_overshirt_1778670536589.png',
    isNewArrival: true,
    isCustomerFavorite: true,
    rating: 4.9,
    reviewsCount: 142,
    variants: [{ id: 'v1', price: 4299, offerPrice: 5249 }],
  },
  {
    id: 'prod-2',
    name: 'Tailored Merino Blend Suit Jacket',
    category: { id: 'c1', name: 'APPAREL' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/cat_apparel_1778670103427.png',
    isCustomerFavorite: true,
    rating: 4.8,
    reviewsCount: 89,
    variants: [{ id: 'v2', price: 14999, offerPrice: 18499 }],
  },
  {
    id: 'prod-3',
    name: 'Handcrafted Executive Leather Briefcase',
    category: { id: 'c2', name: 'LEATHER GOODS' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/cat_leather_1778670351299.png',
    isNewArrival: true,
    rating: 5.0,
    reviewsCount: 67,
    variants: [{ id: 'v3', price: 8299, offerPrice: 9999 }],
  },
  {
    id: 'prod-4',
    name: 'Signature Leather Weekender & Duffle',
    category: { id: 'c2', name: 'LEATHER GOODS' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/about_craftsmanship.png',
    isCustomerFavorite: true,
    rating: 4.9,
    reviewsCount: 112,
    variants: [{ id: 'v4', price: 11499, offerPrice: 13999 }],
  },
  {
    id: 'prod-5',
    name: 'Precision Wireless ANC Studio Headphones',
    category: { id: 'c3', name: 'ACCESSORIES' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/cat_accessories_1778670517925.png',
    isNewArrival: true,
    rating: 4.9,
    reviewsCount: 204,
    variants: [{ id: 'v5', price: 6499, offerPrice: 8999 }],
  },
  {
    id: 'prod-6',
    name: 'Smart Obsidian Touchscreen Chrono Watch',
    category: { id: 'c3', name: 'ACCESSORIES' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/cat_accessories_1778670517925.png',
    isCustomerFavorite: true,
    rating: 4.8,
    reviewsCount: 95,
    variants: [{ id: 'v6', price: 7999, offerPrice: 10499 }],
  },
  {
    id: 'prod-7',
    name: 'Handcrafted Italian Calfskin Oxford Shoes',
    category: { id: 'c4', name: 'FOOTWEAR' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/cat_leather_1778670351299.png',
    isNewArrival: true,
    rating: 4.9,
    reviewsCount: 78,
    variants: [{ id: 'v7', price: 8999, offerPrice: 11999 }],
  },
  {
    id: 'prod-8',
    name: 'Minimalist Artisan Suede Chelsea Boots',
    category: { id: 'c4', name: 'FOOTWEAR' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/cat_leather_1778670351299.png',
    isCustomerFavorite: true,
    rating: 4.7,
    reviewsCount: 63,
    variants: [{ id: 'v8', price: 9499, offerPrice: 12499 }],
  },
  {
    id: 'prod-9',
    name: 'Bespoke Pure Cashmere Throw Blanket',
    category: { id: 'c5', name: 'HOME LIVING' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/about_atelier.png',
    isCustomerFavorite: true,
    rating: 5.0,
    reviewsCount: 54,
    variants: [{ id: 'v9', price: 5499, offerPrice: 6999 }],
  },
  {
    id: 'prod-10',
    name: 'Aroma Atelier Obsidian Ceramic Diffuser',
    category: { id: 'c5', name: 'HOME LIVING' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/about_atelier.png',
    isNewArrival: true,
    rating: 4.8,
    reviewsCount: 41,
    variants: [{ id: 'v10', price: 3299, offerPrice: 4199 }],
  },
  {
    id: 'prod-11',
    name: 'Pleated Tailored Wool Trousers',
    category: { id: 'c1', name: 'APPAREL' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/prod_trouser_1778670553370.png',
    rating: 4.8,
    reviewsCount: 88,
    variants: [{ id: 'v11', price: 3499, offerPrice: 4299 }],
  },
  {
    id: 'prod-12',
    name: 'Bespoke Atelier Double-Breasted Blazer',
    category: { id: 'c1', name: 'APPAREL' },
    brand: { id: 'b1', name: 'JudesCart' },
    image: '/about_atelier.png',
    isCustomerFavorite: true,
    rating: 4.9,
    reviewsCount: 136,
    variants: [{ id: 'v12', price: 16999, offerPrice: 19999 }],
  },
];

export default function NewArrivals() {
  const [products, setProducts] = useState<RawProduct[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL PRODUCTS');
  const carouselRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch live products
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/products?limit=50`);
        if (res.ok) {
          const json = await res.json();
          const items: RawProduct[] = Array.isArray(json?.data) ? json.data : [];
          if (items.length > 0 && isMounted) {
            setProducts(items);
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    // Fetch live categories for tabs
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/categories`);
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
          if (list.length > 0 && isMounted) {
            setCategories(list);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCatalog();
    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryTabs = useMemo(() => {
    if (categories.length > 0) {
      return ['ALL PRODUCTS', ...categories.map((c) => c.name.toUpperCase())];
    }
    return CATEGORY_TABS;
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.75;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'ALL PRODUCTS') {
      return products.slice(0, 12);
    }

    const target = activeCategory.toUpperCase().trim();
    const matched = products.filter((p) => {
      const catName = p.category?.name?.toUpperCase().trim() || '';
      const prodName = p.name?.toUpperCase().trim() || '';

      if (catName === target || catName.includes(target) || target.includes(catName)) return true;

      // Category match aliases
      if (target === 'ACCESSORIES' && (catName.includes('ELECTR') || catName.includes('TECH') || catName.includes('ACCESS') || prodName.includes('HEADPHONE') || prodName.includes('WATCH') || prodName.includes('AUDIO'))) return true;
      if (target === 'APPAREL' && (catName.includes('APPAR') || catName.includes('CLOTH') || catName.includes('TAILOR') || catName.includes('FASHION') || prodName.includes('JACKET') || prodName.includes('OVERSHIRT') || prodName.includes('BLAZER') || prodName.includes('TROUSER'))) return true;
      if (target === 'LEATHER GOODS' && (catName.includes('LEATHER') || catName.includes('BAG') || prodName.includes('LEATHER') || prodName.includes('BRIEFCASE') || prodName.includes('WEEKENDER') || prodName.includes('WALLET'))) return true;
      if (target === 'FOOTWEAR' && (catName.includes('FOOT') || catName.includes('SHOE') || prodName.includes('OXFORD') || prodName.includes('BOOT') || prodName.includes('SNEAKER') || prodName.includes('LOAFER'))) return true;
      if (target === 'HOME LIVING' && (catName.includes('HOME') || catName.includes('LIVING') || prodName.includes('BLANKET') || prodName.includes('DIFFUSER') || prodName.includes('CASHMERE') || prodName.includes('DECOR'))) return true;

      return false;
    });

    if (matched.length > 0) {
      return matched.slice(0, 12);
    }

    return products.slice(0, 12);
  }, [products, activeCategory]);

  return (
    <section className="sj-container space-y-3 sm:space-y-4">
      {/* =========================================================================
          TANEIRA-INSPIRED SECTION HEADER: CUSTOMER FAVOURITES
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] uppercase tracking-widest font-medium text-[#DF9F28] mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#DF9F28]" />
            <span>FEATURED AT JUDESCART</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#111111] tracking-tight">
            Customer Favourites
          </h2>
          <p className="text-xs text-[#555555] mt-0.5 font-normal">
            Discover our highest-rated sartorial pieces, master leathers, and signature craftsmanship.
          </p>
        </div>

        {/* Category Pill Filters (Taneira Style Clean Rounded Navigation) & Nav Arrows */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCategory(tab)}
                  className={`px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium tracking-wide transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#DF9F28] ${
                    isActive
                      ? 'bg-[#0A192F] text-white shadow-2xs border border-[#0A192F]'
                      : 'bg-white text-[#555555] border border-[#E2E8F0] hover:border-[#DF9F28] hover:text-[#111111]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Desktop Top Navigation Arrow Controls */}
          <div className="hidden sm:flex items-center gap-1 shrink-0 pl-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-7 h-7 rounded-full bg-white border border-[#E2E8F0] text-[#555555] hover:text-[#111111] hover:border-[#0A192F] hover:bg-slate-100 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Previous customer favourites"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-7 h-7 rounded-full bg-white border border-[#E2E8F0] text-[#555555] hover:text-[#111111] hover:border-[#0A192F] hover:bg-slate-100 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              aria-label="Next customer favourites"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TANEIRA-STYLE CUSTOMER FAVOURITES CAROUSEL WITH FLOATING ARROWS
         ========================================================================= */}
      <div className="relative group/carousel">
        {/* Floating Left Navigation Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs text-[#111111] shadow-sm hover:shadow border border-[#E2E8F0] flex items-center justify-center hover:bg-[#0A192F] hover:text-white transition-all active:scale-90 cursor-pointer opacity-90 group-hover/carousel:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Floating Right Navigation Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs text-[#111111] shadow-sm hover:shadow border border-[#E2E8F0] flex items-center justify-center hover:bg-[#0A192F] hover:text-white transition-all active:scale-90 cursor-pointer opacity-90 group-hover/carousel:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Horizontal Carousel Track - 60-70% footprint with 5 cards desktop */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory gap-2.5 sm:gap-3.5 lg:gap-4 pb-1.5"
        >
          {filteredProducts.map((prod) => {
            const mainVariant = prod.variants?.[0];
            const price = mainVariant?.price || 4299;
            const originalPrice = mainVariant?.offerPrice;

            return (
              <div
                key={prod.id}
                className="w-[calc(48%-5px)] sm:w-[calc(32%-8px)] md:w-[calc(24%-10px)] lg:w-[calc(19.5%-12px)] shrink-0 snap-start"
              >
                <ProductCard
                  id={prod.id}
                  variantId={mainVariant?.id}
                  name={prod.name}
                  category={prod.category?.name || 'APPAREL'}
                  brand={prod.brand?.name || 'JudesCart'}
                  price={price}
                  originalPrice={originalPrice}
                  image={prod.image || '/prod_overshirt_1778670536589.png'}
                  subimage={prod.subimage || []}
                  description={prod.description}
                  rating={prod.rating || 4.9}
                  reviewsCount={prod.reviewsCount || 128}
                  isNewArrival={prod.isNewArrival}
                  isCustomerFavorite={true}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TANEIRA-STYLE EDITORIAL SPOTLIGHT & LUCKY DRAW BANNER
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch pt-1">
        <div className="lg:col-span-8 relative rounded-lg overflow-hidden bg-[#0A192F] text-white p-5 sm:p-6 flex flex-col justify-between min-h-[190px] sm:min-h-[220px] border border-[#E2E8F0] shadow-2xs">
          <Image
            src="/about_atelier.png"
            alt="The Atelier Curation"
            fill
            className="object-cover object-center opacity-30 mix-blend-luminosity hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#061B3A] via-[#061B3A]/85 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-1.5 max-w-lg">
            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-[#DF9F28]/20 text-[#DF9F28] border border-[#DF9F28]/40">
              The Artisan Curation
            </span>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white tracking-tight leading-snug">
              Masterpiece Weaves &amp; Hand-Finished Silhouettes
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md hidden sm:block font-normal">
              Engineered with ethical Italian wool, vegetable-tanned full-grain leathers, and timeless architectural tailoring.
            </p>
          </div>

          <div className="relative z-10 pt-3 flex items-center justify-between">
            <Link
              href="/product"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-semibold text-xs tracking-wide transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <span>Explore Curated Edit</span>
              <ArrowRight className="w-3 h-3 text-[#111111]" />
            </Link>
            <span className="text-[10px] sm:text-[11px] text-slate-300 font-normal hidden md:inline">
              Complimentary Lucky Draw ticket included with every purchase
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-lg bg-gradient-to-br from-[#FEF8EE] to-[#F1F5F9] border border-[#DF9F28]/30 p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium uppercase tracking-widest text-[#DF9F28]">
                LUCKY DRAW PERK
              </span>
              <Compass className="w-3.5 h-3.5 text-[#DF9F28]" />
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-[#111111] leading-snug">
              Weekly Luxury Sweepstakes
            </h4>
            <p className="text-xs text-[#555555] leading-relaxed font-normal">
              Every curated order automatically enters you into the verified weekly lucky draw for bespoke coats, leather duffles, and studio accessories.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0]">
            <Link
              href="/lucky-draw"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#111111] hover:text-[#DF9F28] transition-colors"
            >
              <span>View Active Prize Pool</span>
              <ArrowUpRight className="w-3 h-3 text-[#DF9F28]" />
            </Link>
          </div>
        </div>
      </div>

      {/* View All CTA Footer */}
      <div className="pt-1 text-center">
        <Link
          href="/product"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-white hover:bg-[#0A192F] hover:text-white text-[#111111] border border-[#E2E8F0] hover:border-[#0A192F] font-semibold text-xs uppercase tracking-wider transition-all shadow-2xs active:scale-95"
        >
          <span>Browse All Featured Styles</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}

