'use client';

import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

const REVIEWS = [
  {
    quote: "The cashmere overshirt and tailored trousers exceeded all my expectations. The cut, drapery, and tactile feel are strictly top-tier.",
    author: "Jonathan R.",
    location: "Mumbai",
    rating: 5,
    tag: "Verified Buyer",
  },
  {
    quote: "JudesCart has completely elevated my rotation. In addition to exquisite clothing, winning a leather duffle in the weekly lucky draw was an incredible bonus!",
    author: "Marcus T.",
    location: "Bengaluru",
    rating: 5,
    tag: "Lucky Draw Winner",
  },
  {
    quote: "A seamless customer experience from browsing to delivery. The sizing recommendations were spot on and customer care was exceptionally responsive.",
    author: "Alexander H.",
    location: "Kochi",
    rating: 5,
    tag: "Verified Buyer",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-slate-200/80">
      <div className="sj-container">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
          <span className="text-[13px] font-bold tracking-[0.18em] uppercase text-[#946000]">
            CLIENT SATISFACTION
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-extrabold text-[#111111] tracking-tight">
            Voices of Refinement
          </h2>
          <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
            Real stories from our discerning community of patrons across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between hover:border-[#DF9F28]/40 hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#DF9F28]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#DF9F28]" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[13px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md border border-emerald-300/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    {review.tag}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#334155] leading-relaxed font-normal italic">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-[15px] font-bold text-[#111111] uppercase tracking-wider">
                    {review.author}
                  </h4>
                  <span className="text-[13px] text-[#475569] font-medium">
                    {review.location}
                  </span>
                </div>
                <Quote className="w-5 h-5 text-slate-400 group-hover:text-[#DF9F28] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
