'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/categories`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setCategories(data);
          }
        }
      } catch (error) {
        console.error('Error fetching collections categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const displayCategories = categories.length > 0 ? categories : [
    { id: '1', name: 'Tops & Shirts', image: '/cat_apparel_1778670103427.png' },
    { id: '2', name: 'Leather Goods', image: '/cat_leather_1778670351299.png' },
    { id: '3', name: 'Signature Accessories', image: '/cat_accessories_1778670517925.png' },
    { id: '4', name: 'Tailored Bottoms', image: '/cat_apparel_1778670103427.png' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111111] font-sans flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-12 md:py-20">
        <div className="sj-container space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center text-xs font-bold tracking-[0.2em] text-[#DF9F28] uppercase">
              <span>THE COMPLETE WARDROBE</span>
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-sans font-extrabold text-[#111111] tracking-tight">
              Our Collections
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
              Explore bespoke categories crafted with master artisan techniques, organic fibres, and timeless silhouettes.
            </p>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/5] bg-white rounded-2xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/product?category=${encodeURIComponent(cat.name)}`}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#0A192F] border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#DF9F28]/50 transition-all duration-300 block"
                >
                  {/* Category Image */}
                  <Image
                    src={cat.image || '/cat_apparel_1778670103427.png'}
                    alt={cat.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F]/95 via-[#061B3A]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Card Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end text-white z-10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#DF9F28] mb-1">
                      Department
                    </span>
                    <h3 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-wide uppercase group-hover:text-amber-200 transition-colors">
                      {cat.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-300 mt-3 group-hover:text-[#DF9F28] transition-colors">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
