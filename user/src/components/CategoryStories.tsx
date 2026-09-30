'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SlidersHorizontal } from 'lucide-react';

interface StoryItem {
  id: string;
  title: string;
  href: string;
  image?: string;
  isAll?: boolean;
}

const STORY_ITEMS: StoryItem[] = [
  {
    id: 'all',
    title: 'All Products',
    href: '/product',
    isAll: true,
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
    title: 'Tailored Suits',
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
    <section aria-label="Quick Category Access" className="md:hidden w-full bg-white border-b border-[#F1F5F9] py-2.5 sm:py-3 select-none">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-0.5">
          {STORY_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus-visible:outline-none snap-start"
            >
              {/* Thumbnail Container */}
              <div className="relative w-[68px] h-[68px] xs:w-[72px] xs:h-[72px] sm:w-[80px] sm:h-[80px] rounded-2xl overflow-hidden shadow-2xs border border-[#E2E8F0] group-hover:border-[#DF9F28] transition-all duration-200 group-active:scale-95 bg-[#F8FAFC]">
                {item.isAll ? (
                  <div className="w-full h-full bg-[#0A192F] flex flex-col items-center justify-center p-2 text-center text-white group-hover:bg-[#061B3A] transition-colors">
                    <SlidersHorizontal className="w-5 h-5 text-[#DF9F28] mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                      Catalog
                    </span>
                  </div>
                ) : (
                  <Image
                    src={item.image || '/cat_apparel_1778670103427.png'}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] xs:text-xs font-semibold text-[#374151] group-hover:text-[#946000] transition-colors whitespace-nowrap text-center max-w-[72px] xs:max-w-[80px] truncate">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
