'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiUrl } from '@/lib/api';

export interface BannerSlide {
  id: string;
  
  tag: string;
  title: string;
  offerPrice?: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  badge?: string;
}

// Authentic high-resolution Steve Jon landscape e-commerce banners
const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'banner-1',
    tag: 'AUTUMN / WINTER COLLECTION',
    title: 'Signature Tailoring & Outerwear',
    offerPrice: 'Starting from ₹4,299*',
    description: 'Precision-tailored wool overshirts, blazers, and luxury knitwear engineered for effortless modern distinction.',
    buttonText: 'Shop Collection',
    buttonLink: '/product',
    image: '/banners/Banner.jpg',
    badge: 'NEW SEASON',
  },
  {
    id: 'banner-2',
    tag: 'HANDCRAFTED ATELIER',
    title: 'Artisan Bags & Leather Goods',
    offerPrice: 'Up to 40% OFF',
    description: 'Hand-burnished full-grain leather briefcases, wallets, and accessories crafted to age with authentic character.',
    buttonText: 'Explore Leather',
    buttonLink: '/product?category=Signature%20Leather%20Goods',
    image: '/banners/banner5.jpg',
    badge: 'LIMITED EDITION',
  },
  {
    id: 'banner-3',
    tag: 'CONTEMPORARY FOOTWEAR',
    title: 'Signature Footwear & Sneakers',
    offerPrice: 'Up to 50% OFF',
    description: 'Clean silhouette sneakers, boots, and everyday essentials crafted for durability and timeless appeal.',
    buttonText: 'Explore Deals',
    buttonLink: '/product',
    image: '/banners/banner2.jpg',
    badge: 'SALE EVENT',
  },
];

// Hero Skeleton Component for initial loading
function HeroSkeleton() {
  return (
    <section aria-label="Loading promotional banners" className="sj-container pt-3 sm:pt-5 md:pt-12 pb-0 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch">
        {/* Main Banner Skeleton */}
        <div className="w-full lg:col-span-8 xl:col-span-8 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#061B3A] via-[#0A192F] to-[#061B3A] border border-slate-800/80 p-6 sm:p-9 md:p-11 flex flex-col justify-between h-[340px] xs:h-[370px] sm:h-[400px] md:h-[420px] lg:h-[440px] xl:h-[460px] relative animate-pulse shadow-sm">
          <div className="space-y-3 sm:space-y-4 max-w-lg">
            {/* Tag badge */}
            <div className="h-5 w-32 bg-amber-500/20 border border-amber-500/30 rounded-md" />
            {/* Title lines */}
            <div className="space-y-2 pt-1">
              <div className="h-7 sm:h-9 w-4/5 bg-slate-700/70 rounded-lg" />
              <div className="h-7 sm:h-9 w-3/5 bg-slate-700/50 rounded-lg" />
            </div>
            {/* Price / Subtitle */}
            <div className="h-4 sm:h-5 w-44 bg-amber-500/30 rounded-md" />
            {/* Description */}
            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full bg-slate-700/40 rounded" />
              <div className="h-3.5 w-4/5 bg-slate-700/30 rounded" />
            </div>
          </div>

          {/* CTA Button Skeleton */}
          <div className="pt-2 flex flex-col items-start gap-2">
            <div className="h-11 w-40 sm:w-48 bg-amber-500/40 rounded-lg" />
            <div className="h-3 w-56 bg-slate-700/40 rounded" />
          </div>
        </div>

        {/* Secondary Banner Skeleton (Desktop) */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#061B3A] via-[#0A192F] to-[#061B3A] border border-slate-800/80 p-6 sm:p-7 flex-col justify-between lg:h-[440px] xl:h-[460px] relative animate-pulse shadow-sm">
          {/* Top badge */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-white/10 rounded-md" />
            <div className="h-4 w-16 bg-white/10 rounded-md" />
          </div>

          {/* Bottom details */}
          <div className="space-y-3 pt-6 border-t border-slate-800/80">
            <div className="h-4 w-28 bg-amber-500/30 rounded" />
            <div className="h-6 w-4/5 bg-slate-700/60 rounded-lg" />
            <div className="h-10 w-full bg-slate-800/80 rounded-lg flex items-center justify-between px-3">
              <div className="h-3 w-20 bg-slate-700/60 rounded" />
              <div className="h-7 w-7 rounded-full bg-amber-500/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
        <div className="h-2 w-6 bg-slate-700 rounded-full animate-pulse" />
        <div className="h-2 w-2 bg-slate-800 rounded-full animate-pulse" />
        <div className="h-2 w-2 bg-slate-800 rounded-full animate-pulse" />
      </div>
    </section>
  );
}

export default function Hero() {
  const [banners, setBanners] = useState<BannerSlide[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);

  // Fetch admin banners from backend with fallback error handling
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchBanners = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/banners`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            const activeBanners = data.filter((b: any) => b.isActive !== false);
            if (activeBanners.length > 0) {
              const mapped: BannerSlide[] = activeBanners.map((b: any, idx: number) => ({
                id: b.id || `banner-${idx}`,
                tag: b.tag || '',
                title: b.title || '',
                offerPrice: b.offerPrice || undefined,
                description: b.description || '',
                buttonText: b.buttonText || '',
                buttonLink: b.buttonLink || '/product',
                image: b.image || '/banners/Banner.jpg',
                badge: b.badge || '',
              }));
              setBanners(mapped);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Hero banner fetch failed, using fallback banners:', err.message || err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBanners();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const total = banners.length;

  // Next / Previous rotation
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // When clicking Card 2 (Secondary Banner on right):
  const handleSecondaryClick = () => {
    nextSlide();
  };

  // Autoplay (6.5s) with pause on hover & timer reset on slide change
  useEffect(() => {
    if (isLoading || isHovered || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [isLoading, isHovered, nextSlide, total, currentIndex]);

  // Touch gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  // Fallback image handler for broken URLs
  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Show skeleton during initial load
  if (isLoading) {
    return <HeroSkeleton />;
  }

  // Pair logic: Spot 1 shows banners[currentIndex], Spot 2 shows banners[(currentIndex + 1) % total]
  const spot1Banner = banners[currentIndex] || DEFAULT_BANNERS[0];
  const spot2Index = (currentIndex + 1) % total;
  const spot2Banner = banners[spot2Index] || DEFAULT_BANNERS[1];
  const hasMultiple = total > 1;

  const spot1ImageSrc = failedImages[spot1Banner.id] ? '/banners/Banner.jpg' : spot1Banner.image;
  const spot2ImageSrc = failedImages[spot2Banner.id] ? '/banners/banner5.jpg' : spot2Banner.image;

  const hasSpot1Text = Boolean(spot1Banner.title || spot1Banner.tag || spot1Banner.offerPrice || spot1Banner.description || spot1Banner.buttonText);
  const hasSpot2Text = Boolean(spot2Banner.title || spot2Banner.offerPrice || spot2Banner.badge || spot2Banner.buttonText);

  return (
    <section className="sj-container pt-3 sm:pt-5 md:pt-12 pb-0 select-none">
      {/* 2-Column Banner Grid: Full Width on Mobile/Tablet, Split 8:4 on Desktop (or 12 if single) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch">
        
        {/* =========================================================================
            SPOT 1: LARGE MAIN CAMPAIGN BANNER
           ========================================================================= */}
        <div
          className={`w-full ${hasMultiple ? 'lg:col-span-8 xl:col-span-8' : 'lg:col-span-12 xl:col-span-12'} relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#0A192F] border border-[#E2E8F0] shadow-sm transition-all duration-300 group flex flex-col justify-between aspect-[1920/800] min-h-[260px] max-h-[460px]`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows (Visible on Tablet & Desktop) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Previous slide"
                className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#061B3A]/60 hover:bg-[#061B3A]/90 backdrop-blur-md text-white items-center justify-center border border-white/20 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer active:scale-90"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Next slide"
                className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#061B3A]/60 hover:bg-[#061B3A]/90 backdrop-blur-md text-white items-center justify-center border border-white/20 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer active:scale-90"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={spot1Banner.id}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col justify-between"
            >
              {/* Wide Landscape Banner Image */}
              <Image
                src={spot1ImageSrc}
                alt={spot1Banner.title || 'Promotional Banner'}
                fill
                priority
                unoptimized
                onError={() => handleImageError(spot1Banner.id)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 75vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />

              {/* Clickable link area if image-only and link provided */}
              {!hasSpot1Text && spot1Banner.buttonLink && (
                <Link
                  href={spot1Banner.buttonLink}
                  className="absolute inset-0 z-10"
                  aria-label="View promotional banner"
                />
              )}

              {/* Midnight Navy Overlay Gradient (#061B3A) - Only when text is present */}
              {hasSpot1Text && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#061B3A]/95 via-[#061B3A]/70 to-[#061B3A]/30 sm:bg-gradient-to-r sm:from-[#061B3A]/90 sm:via-[#061B3A]/60 sm:to-transparent pointer-events-none" />
              )}

              {/* Banner Text Content & CTA (Left-Aligned) */}
              {hasSpot1Text && (
                <div className="relative z-10 p-5 sm:p-7 md:p-9 lg:p-11 flex flex-col justify-between h-full max-w-xl space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    {spot1Banner.tag && (
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#DF9F28] inline-block px-2.5 py-0.5 rounded-md bg-[#061B3A]/80 backdrop-blur-md border border-[#DF9F28]/30">
                        {spot1Banner.tag}
                      </span>
                    )}

                    {spot1Banner.title && (
                      <h1 className="text-lg xs:text-xl sm:text-2xl md:text-[26px] lg:text-[28px] font-bold text-white tracking-tight leading-snug line-clamp-2">
                        {spot1Banner.title}
                      </h1>
                    )}

                    {spot1Banner.offerPrice && (
                      <p className="text-xs sm:text-sm md:text-base font-bold text-[#DF9F28] tracking-tight pt-0.5">
                        {spot1Banner.offerPrice}
                      </p>
                    )}

                    {spot1Banner.description && (
                      <p className="text-xs sm:text-xs md:text-sm text-slate-200 font-normal leading-relaxed line-clamp-2 max-w-xs sm:max-w-md pt-0.5">
                        {spot1Banner.description}
                      </p>
                    )}
                  </div>

                  {/* Primary CTA Button (Spec: bg #DF9F28, text #111111, hover #C6891E) */}
                  {spot1Banner.buttonText && (
                    <div className="pt-1 sm:pt-2 flex flex-col items-start gap-1.5 sm:gap-2">
                      <Link
                        href={spot1Banner.buttonLink || '/product'}
                        className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-bold text-xs sm:text-sm tracking-wide rounded-lg shadow-md transition-all duration-200 inline-flex items-center gap-2 group/btn cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#DF9F28]"
                      >
                        <span>{spot1Banner.buttonText}</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1 text-[#111111]" />
                      </Link>

                      <span className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
                        Complimentary Lucky Draw ticket included with every order
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* =========================================================================
            SPOT 2: SECONDARY PROMOTIONAL BANNER (Visible on Desktop lg+ when multiple)
           ========================================================================= */}
        {hasMultiple && (
          <div
            onClick={handleSecondaryClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden lg:flex lg:col-span-4 xl:col-span-4 relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#0A192F] border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer h-full min-h-[260px] flex-col justify-between"
            title="Click to bring this banner into the main spotlight"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={spot2Banner.id}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6 lg:p-7"
              >
                {/* Secondary Landscape Banner Image */}
                <Image
                  src={spot2ImageSrc}
                  alt={spot2Banner.title || 'Next Banner'}
                  fill
                  unoptimized
                  onError={() => handleImageError(spot2Banner.id)}
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Top-to-Bottom Midnight Navy Gradient - only when text is present */}
                {hasSpot2Text && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061B3A]/90 via-[#061B3A]/50 to-[#061B3A]/30 pointer-events-none" />
                )}

                {/* Top Status Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                    {spot2Banner.badge || 'UP NEXT'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1 group-hover:text-[#DF9F28] transition-colors">
                    <span>Up Next</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Bottom Promotional Details */}
                {hasSpot2Text && (
                  <div className="relative z-10 space-y-2 pt-6">
                    {spot2Banner.offerPrice && (
                      <span className="text-sm font-bold text-[#DF9F28] uppercase tracking-wide block">
                        {spot2Banner.offerPrice}
                      </span>
                    )}

                    {spot2Banner.title && (
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug line-clamp-2">
                        {spot2Banner.title}
                      </h2>
                    )}

                    {spot2Banner.buttonText && (
                      <div className="pt-2 flex items-center justify-between border-t border-white/20">
                        <span className="text-xs font-semibold uppercase tracking-wider text-white group-hover:text-[#DF9F28] transition-colors">
                          {spot2Banner.buttonText}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#DF9F28] text-[#111111] flex items-center justify-center shadow-xs group-hover:bg-[#C6891E] transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* =========================================================================
          PAGINATION DOTS: (1, 2, 3)
         ========================================================================= */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
          {banners.map((banner, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={banner.id}
                type="button"
                aria-label={`Go to banner ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-6 bg-[#0A192F] shadow-xs'
                    : 'w-2 bg-[#E2E8F0] hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}