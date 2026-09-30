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

export interface OfferSlideItem {
  id: string;
  image: string;
  route: string;
  order: number;
  isActive: boolean;
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

function NewArrivalsSkeleton() {
  return (
    <section aria-label="Loading customer favourites" className="sj-container space-y-3 sm:space-y-4 select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="space-y-2">
          <div className="h-3.5 w-36 bg-amber-500/20 rounded animate-pulse" />
          <div className="h-7 w-56 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse shrink-0" />
          ))}
        </div>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2.5 sm:gap-3.5 lg:gap-4 pb-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-[calc(48%-5px)] sm:w-[calc(32%-8px)] md:w-[calc(24%-10px)] lg:w-[calc(19.5%-12px)] shrink-0 rounded-lg bg-white border border-[#E2E8F0] p-3 space-y-2.5 animate-pulse"
          >
            <div className="aspect-[3/4] w-full bg-slate-200 rounded-md" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-1/3 bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-200 rounded" />
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
              <div className="h-5 w-20 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-200 rounded-lg sm:hidden" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function NewArrivals() {
  const [products, setProducts] = useState<RawProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL PRODUCTS');
  const [offerSlides, setOfferSlides] = useState<OfferSlideItem[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch all products from live API / Database
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/products?limit=100`);
        if (res.ok) {
          const json = await res.json();
          const items: RawProduct[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
          if (items.length > 0 && isMounted) {
            setProducts(items);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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

    // Fetch live CMS offer slides
    const fetchOfferSlides = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/offer-slides?activeOnly=true`);
        if (res.ok) {
          const json = await res.json();
          const list: OfferSlideItem[] = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
          if (list.length > 0 && isMounted) {
            setOfferSlides(list);
          }
        }
      } catch (err) {
        console.error('Error fetching offer slides:', err);
      }
    };

    fetchCatalog();
    fetchCategories();
    fetchOfferSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance offer slides if multiple are configured in CMS
  useEffect(() => {
    if (offerSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % offerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [offerSlides.length]);

  const categoryTabs = useMemo(() => {
    if (categories.length > 0) {
      const dbCatNames = Array.from(new Set(categories.map((c) => c.name.toUpperCase())));
      return ['ALL PRODUCTS', ...dbCatNames];
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
      return products;
    }

    const target = activeCategory.toUpperCase().trim();
    return products.filter((p) => {
      const catName = p.category?.name?.toUpperCase().trim() || '';
      const prodName = p.name?.toUpperCase().trim() || '';

      if (catName === target || catName.includes(target) || target.includes(catName)) return true;

      // Dynamic category matching aliases
      if (target.includes('TOP') && (catName.includes('TOP') || prodName.includes('SHIRT') || prodName.includes('SWEATER') || prodName.includes('TEE') || prodName.includes('HOODIE') || prodName.includes('T-SHIRT'))) return true;
      if (target.includes('BOTTOM') && (catName.includes('BOTTOM') || prodName.includes('PANT') || prodName.includes('SKIRT') || prodName.includes('SHORT') || prodName.includes('JEAN') || prodName.includes('TROUSER'))) return true;
      if (target.includes('DRESS') && (catName.includes('DRESS') || prodName.includes('DRESS') || prodName.includes('GOWN') || prodName.includes('KURTA') || prodName.includes('PARTY'))) return true;
      if (target.includes('OUTER') && (catName.includes('OUTER') || prodName.includes('COAT') || prodName.includes('JACKET') || prodName.includes('RAIN') || prodName.includes('BLAZER') || prodName.includes('PUFFER'))) return true;
      if (target.includes('ACCESS') && (catName.includes('ELECTR') || catName.includes('TECH') || catName.includes('ACCESS') || prodName.includes('HEADPHONE') || prodName.includes('WATCH') || prodName.includes('AUDIO') || prodName.includes('WALLET'))) return true;
      if (target.includes('APPAR') && (catName.includes('APPAR') || catName.includes('CLOTH') || catName.includes('TAILOR') || catName.includes('FASHION') || catName.includes('TOP') || catName.includes('BOTTOM') || catName.includes('DRESS') || prodName.includes('JACKET') || prodName.includes('OVERSHIRT') || prodName.includes('BLAZER') || prodName.includes('TROUSER'))) return true;
      if (target.includes('LEATHER') && (catName.includes('LEATHER') || catName.includes('BAG') || prodName.includes('LEATHER') || prodName.includes('BRIEFCASE') || prodName.includes('WEEKENDER') || prodName.includes('WALLET') || prodName.includes('DUFFLE'))) return true;
      if (target.includes('FOOT') && (catName.includes('FOOT') || catName.includes('SHOE') || prodName.includes('OXFORD') || prodName.includes('BOOT') || prodName.includes('SNEAKER') || prodName.includes('LOAFER'))) return true;
      if (target.includes('HOME') && (catName.includes('HOME') || catName.includes('LIVING') || prodName.includes('BLANKET') || prodName.includes('DIFFUSER') || prodName.includes('CASHMERE') || prodName.includes('DECOR'))) return true;

      return false;
    });
  }, [products, activeCategory]);

  if (loading) {
    return <NewArrivalsSkeleton />;
  }

  return (
    <section className="sj-container space-y-3 sm:space-y-4">
      {/* =========================================================================
          TANEIRA-INSPIRED SECTION HEADER: CUSTOMER FAVOURITES
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[13px] uppercase tracking-widest font-medium text-[#946000] mb-0.5">
            <span>FEATURED AT JUDESCART</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#111111] tracking-tight">
            Customer Favourites
          </h2>
          <p className="text-sm sm:text-base text-[#475569] mt-0.5 font-normal leading-relaxed">
            Discover our highest-rated sartorial pieces, master leathers, and signature craftsmanship.
          </p>
        </div>

        {/* Category Pill Filters (Taneira Style Clean Rounded Navigation) & Nav Arrows */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCategory(tab)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-lg text-[13px] sm:text-sm font-medium tracking-wide transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#DF9F28] ${
                    isActive
                      ? 'bg-[#0A192F] text-white shadow-xs border border-[#0A192F]'
                      : 'bg-white text-[#374151] border border-[#E2E8F0] hover:border-[#DF9F28] hover:text-[#111111]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Desktop Top Navigation Arrow Controls - 44px tap targets */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 pl-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white border border-[#E2E8F0] text-[#374151] hover:text-[#111111] hover:border-[#0A192F] hover:bg-slate-100 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
              aria-label="Previous customer favourites"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white border border-[#E2E8F0] text-[#374151] hover:text-[#111111] hover:border-[#0A192F] hover:bg-slate-100 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
              aria-label="Next customer favourites"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TANEIRA-STYLE CUSTOMER FAVOURITES CAROUSEL WITH FLOATING ARROWS
         ========================================================================= */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Compass className="w-5 h-5 text-[#DF9F28]" />
          </div>
          <p className="text-sm font-semibold text-[#111111]">No products available in this department</p>
          <p className="text-xs text-[#555555]">Explore all curated styles or select a different category above.</p>
          <button
            type="button"
            onClick={() => setActiveCategory('ALL PRODUCTS')}
            className="px-4 py-2 rounded-lg bg-[#0A192F] hover:bg-[#061B3A] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            View All Products
          </button>
        </div>
      ) : (
        <div className="relative group/carousel">
          {/* Floating Left Navigation Button - 44px tap target */}
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/95 backdrop-blur-xs text-[#111111] shadow-md hover:shadow-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#0A192F] hover:text-white transition-all active:scale-90 cursor-pointer opacity-90 group-hover/carousel:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Floating Right Navigation Button - 44px tap target */}
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/95 backdrop-blur-xs text-[#111111] shadow-md hover:shadow-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#0A192F] hover:text-white transition-all active:scale-90 cursor-pointer opacity-90 group-hover/carousel:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Carousel Track - 60-70% footprint with 5 cards desktop */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory gap-2.5 sm:gap-3.5 lg:gap-4 pb-1.5"
          >
            {filteredProducts.map((prod) => {
              const mainVariant = prod.variants?.[0];
              const sellingPrice = mainVariant?.offerPrice ? mainVariant.offerPrice : (mainVariant?.price || 4299);
              const strikePrice = mainVariant?.offerPrice && mainVariant.price > mainVariant.offerPrice ? mainVariant.price : undefined;

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
                    price={sellingPrice}
                    originalPrice={strikePrice}
                    image={prod.image || '/prod_overshirt_1778670536589.png'}
                    subimage={prod.subimage || []}
                    description={prod.description}
                    rating={prod.rating || 4.9}
                    reviewsCount={prod.reviewsCount || 128}
                    isNewArrival={prod.isNewArrival}
                    isCustomerFavorite={prod.isCustomerFavorite ?? true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          DYNAMIC CMS OFFER SLIDES & LUCKY DRAW BANNER
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch pt-1">
        {offerSlides.length > 0 ? (
          <div className="lg:col-span-8 relative rounded-lg overflow-hidden bg-[#0A192F] text-white p-5 sm:p-6 flex flex-col justify-between min-h-[190px] sm:min-h-[220px] border border-[#E2E8F0] shadow-xs group">
            <Image
              src={offerSlides[currentSlideIdx % offerSlides.length].image}
              alt="Exclusive Offer"
              fill
              unoptimized
              className="object-cover object-center opacity-85 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#061B3A]/90 via-[#061B3A]/60 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-2 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 rounded text-[13px] font-bold uppercase tracking-wider bg-[#DF9F28]/20 text-[#DF9F28] border border-[#DF9F28]/40">
                  Featured Promotion
                </span>
                {offerSlides.length > 1 && (
                  <span className="text-xs font-semibold text-slate-300 bg-black/40 px-2 py-0.5 rounded">
                    {((currentSlideIdx % offerSlides.length) + 1)} / {offerSlides.length}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                Exclusive Seasonal Curation &amp; Limited Offers
              </h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-md hidden sm:block font-normal">
                Discover curated luxury arrivals with complimentary lucky draw entries on every qualified purchase.
              </p>
            </div>

            <div className="relative z-10 pt-3 flex items-center justify-between">
              <Link
                href={offerSlides[currentSlideIdx % offerSlides.length].route || "/product"}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-bold text-sm tracking-wide transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Claim Offer Now</span>
                <ArrowRight className="w-4 h-4 text-[#111111]" />
              </Link>

              {offerSlides.length > 1 && (
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
                  {offerSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIdx(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === (currentSlideIdx % offerSlides.length)
                          ? "w-6 bg-[#DF9F28]"
                          : "w-2 bg-white/40 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 relative rounded-lg overflow-hidden bg-[#0A192F] text-white p-5 sm:p-6 flex flex-col justify-between min-h-[190px] sm:min-h-[220px] border border-[#E2E8F0] shadow-xs">
            <Image
              src="/about_atelier.png"
              alt="The Artisan Curation"
              fill
              className="object-cover object-center opacity-30 mix-blend-luminosity hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#061B3A] via-[#061B3A]/85 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-2 max-w-lg">
              <span className="inline-block px-3 py-1 rounded text-[13px] font-bold uppercase tracking-wider bg-[#DF9F28]/20 text-[#DF9F28] border border-[#DF9F28]/40">
                The Artisan Curation
              </span>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                Masterpiece Weaves &amp; Hand-Finished Silhouettes
              </h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-md hidden sm:block font-normal">
                Engineered with ethical Italian wool, vegetable-tanned full-grain leathers, and timeless architectural tailoring.
              </p>
            </div>

            <div className="relative z-10 pt-3 flex items-center justify-between">
              <Link
                href="/product"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-bold text-sm tracking-wide transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Explore Curated Edit</span>
                <ArrowRight className="w-4 h-4 text-[#111111]" />
              </Link>
              <span className="text-[13px] text-slate-200 font-medium hidden md:inline">
                Complimentary Lucky Draw ticket included with every purchase
              </span>
            </div>
          </div>
        )}

        <div className="lg:col-span-4 rounded-lg bg-gradient-to-br from-[#FEF8EE] to-[#F1F5F9] border border-[#DF9F28]/30 p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold uppercase tracking-widest text-[#946000]">
                LUCKY DRAW PERK
              </span>
              <Compass className="w-4 h-4 text-[#946000]" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-[#111111] leading-snug">
              Weekly Luxury Sweepstakes
            </h4>
            <p className="text-base text-[#334155] leading-relaxed font-normal">
              Every curated order automatically enters you into the verified weekly lucky draw for bespoke coats, leather duffles, and studio accessories.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0]">
            <Link
              href="/lucky-draw"
              className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold uppercase tracking-wider text-[#111111] hover:text-[#946000] transition-colors"
            >
              <span>View Active Prize Pool</span>
              <ArrowUpRight className="w-4 h-4 text-[#946000]" />
            </Link>
          </div>
        </div>
      </div>

      {/* View All CTA Footer */}
      <div className="pt-2 text-center">
        <Link
          href="/product"
          className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 rounded-lg bg-white hover:bg-[#0A192F] hover:text-white text-[#111111] border border-[#E2E8F0] hover:border-[#0A192F] font-bold text-sm uppercase tracking-wider transition-all shadow-xs active:scale-95"
        >
          <span>Browse All Featured Styles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

