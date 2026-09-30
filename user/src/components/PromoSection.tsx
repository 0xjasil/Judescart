'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PromoSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200/80">
      <div className="sj-container">
        <div className="relative rounded-2xl overflow-hidden bg-[#0A192F] text-white p-8 md:p-14 lg:p-16 border border-[#061B3A] shadow-xl">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#DF9F28_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#DF9F28]/20 border border-[#DF9F28]/40 text-[#DF9F28] text-[13px] font-bold tracking-widest uppercase">
                <span>THE ATELIER HERITAGE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-extrabold text-white tracking-tight leading-tight">
                Curated With Intention. <br />
                <span className="text-[#DF9F28]">Crafted To Endure.</span>
              </h2>

              <p className="text-slate-200 text-base leading-relaxed">
                JudesCart was founded on a commitment to sartorial excellence, premium textiles, and meticulous construction. Each piece is designed to seamlessly integrate into your personal wardrobe for years of timeless wear.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm sm:text-base text-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Ethically sourced natural fibres and full-grain leathers</span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base text-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Precision tailored fits engineered for everyday comfort</span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base text-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Complimentary entry into weekly lucky draw campaigns</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center min-h-[44px] gap-2.5 px-6 py-3 bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-sm font-bold tracking-wider uppercase rounded-xl transition-all shadow-md group active:scale-95"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Visual Collage */}
            <div className="lg:col-span-6 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 shadow-lg">
                    <Image
                      src="/cat_apparel_1778670103427.png"
                      alt="JudesCart Tailored Apparel"
                      fill
                      className="object-cover object-center hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 shadow-lg">
                    <Image
                      src="/cat_leather_1778670351299.png"
                      alt="JudesCart Handcrafted Leather"
                      fill
                      className="object-cover object-center hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
