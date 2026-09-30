'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface StoryItem {
  id: string;
  title: string;
  href: string;
  image?: string;
  badge?: string;
  isSpecialOffer?: boolean;
}

const STORY_ITEMS: StoryItem[] = [
  {
    id: 'special-offers',
    title: 'Special Offers',
    href: '/product?category=Apparel',
    isSpecialOffer: true,
  },
  {
    id: 'new-in',
    title: 'New In',
    href: '/product',
    image: '/cat_apparel_1778670103427.png',
    badge: 'NEW IN!',
  },
  {
    id: 'apparel',
    title: 'Apparel',
    href: '/product?category=Apparel',
    image: '/cat_apparel_1778670103427.png',
  },
  {
    id: 'leather-goods',
    title: 'Leather',
    href: '/product?category=Leather+Goods',
    image: '/cat_leather_1778670351299.png',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    href: '/product?category=Accessories',
    image: '/cat_accessories_1778670517925.png',
  },
  {
    id: 'atelier-suits',
    title: 'Suits & Coats',
    href: '/product?category=Apparel',
    image: '/about_atelier.png',
  },
  {
    id: 'footwear',
    title: 'Footwear',
    href: '/product?category=footwear',
    image: '/prod_overshirt_1778670536589.png',
  },
  {
    id: 'home-living',
    title: 'Home Living',
    href: '/product?category=home-living',
    image: '/about_craftsmanship.png',
  },
];

export default function CategoryStories() {
  return (
    <section aria-label="Featured Category Stories" className="w-full bg-white border-b border-[#F1E8DF]/80 py-2.5 sm:py-3 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1">
          {STORY_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus-visible:outline-none snap-start"
            >
              {/* Thumbnail Container */}
              <div className="relative w-[70px] h-[70px] xs:w-[76px] xs:h-[76px] sm:w-[84px] sm:h-[84px] rounded-2xl overflow-hidden shadow-2xs border border-[#EBE3D5] group-hover:border-[#881337] transition-all duration-300 group-hover:scale-105 group-active:scale-95">
                {item.isSpecialOffer ? (
                  /* Taneira-style Special Offers gradient block with sparkle effects */
                  <div className="w-full h-full bg-gradient-to-br from-[#881337] via-[#A21CAF] to-[#4C0519] flex flex-col items-center justify-center p-1.5 text-center relative overflow-hidden">
                    <Sparkles className="w-3.5 h-3.5 text-[#FDE68A] absolute top-1.5 left-1.5 animate-pulse" />
                    <Sparkles className="w-2.5 h-2.5 text-[#FDE68A] absolute bottom-1.5 right-1.5 animate-pulse delay-150" />
                    <span className="text-[10px] xs:text-[11px] font-extrabold text-[#FEF3C7] uppercase leading-tight tracking-wider drop-shadow-xs">
                      SPECIAL<br />OFFERS!
                    </span>
                  </div>
                ) : (
                  /* Category Image with optional top-notch badge */
                  <>
                    <Image
                      src={item.image || '/cat_apparel_1778670103427.png'}
                      alt={item.title}
                      fill
                      sizes="84px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.badge && (
                      <div className="absolute top-0 inset-x-0 bg-[#E11D48] text-white text-[8px] xs:text-[9px] font-black uppercase tracking-wider py-0.5 text-center shadow-xs">
                        {item.badge}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Title Underneath */}
              <span className="text-[11px] xs:text-xs font-semibold text-[#2D241E] group-hover:text-[#881337] transition-colors whitespace-nowrap text-center max-w-[76px] xs:max-w-[84px] truncate">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
