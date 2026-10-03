'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface BrandBenefitCMS {
  id?: string;
  tag?: string;
  title?: string;
  description?: string;
  benefit1Title?: string;
  benefit1Desc?: string;
  benefit2Title?: string;
  benefit2Desc?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  isActive?: boolean;
}

const DEFAULT_BENEFITS: BrandBenefitCMS = {
  tag: 'The JudesCart Standard',
  title: 'Bespoke Quality. Master Craftsmanship. Timeless Style.',
  description:
    'At JudesCart, every garment, fine leather good, and bespoke accessory is created with unyielding dedication to material excellence, tailored comfort, and verifiable authenticity.',
  benefit1Title: 'Atelier Guarantee',
  benefit1Desc: 'Comprehensive 1-year warranty on all apparel, leathers, and accessories.',
  benefit2Title: 'Carbon-Neutral Dispatch',
  benefit2Desc: 'Every order is packaged sustainably and shipped with 100% carbon-neutral delivery.',
  buttonText: 'Explore the complete catalog',
  buttonLink: '/product',
  image: '/about_atelier.png',
};

export default function BenefitsSection() {
  const [data, setData] = useState<BrandBenefitCMS>(DEFAULT_BENEFITS);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBenefits = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/benefits`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setData(json.data);
          }
        }
      } catch (err) {
        console.warn('Benefits CMS fetch fallback:', err);
      }
    };

    fetchBenefits();
    return () => {
      isMounted = false;
    };
  }, []);

  const tag = data.tag || DEFAULT_BENEFITS.tag;
  const title = data.title || DEFAULT_BENEFITS.title;
  const description = data.description || DEFAULT_BENEFITS.description;
  const benefit1Title = data.benefit1Title || DEFAULT_BENEFITS.benefit1Title;
  const benefit1Desc = data.benefit1Desc || DEFAULT_BENEFITS.benefit1Desc;
  const benefit2Title = data.benefit2Title || DEFAULT_BENEFITS.benefit2Title;
  const benefit2Desc = data.benefit2Desc || DEFAULT_BENEFITS.benefit2Desc;
  const buttonText = data.buttonText || DEFAULT_BENEFITS.buttonText;
  const buttonLink = data.buttonLink || DEFAULT_BENEFITS.buttonLink;
  const imageSrc = (!imgError && data.image) ? data.image : '/about_atelier.png';

  return (
    <section className="sj-container">
      <div className="relative rounded-2xl overflow-hidden bg-white text-[#111111] shadow-xs border border-[#E2E8F0]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Text & Value Props */}
          <div className="lg:col-span-7 p-3.5 sm:p-8 lg:p-12 flex flex-col justify-center space-y-2.5 sm:space-y-5">
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-[13px] uppercase tracking-wider font-bold text-[#946000]">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#946000]" />
              <span>{tag}</span>
            </div>

            <h2 className="text-base sm:text-2xl lg:text-3xl font-bold leading-snug text-[#111111] tracking-tight">
              {title}
            </h2>

            <p className="text-[11px] sm:text-base text-[#334155] leading-relaxed font-normal max-w-xl line-clamp-3 sm:line-clamp-none">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-4 border-t border-[#F1F5F9] text-[#334155]">
              <div className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[10px] sm:text-[15px] flex items-center gap-1 sm:gap-2">
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-[#946000] shrink-0" />
                  <span className="leading-tight">{benefit1Title}</span>
                </h4>
                <p className="text-[10px] sm:text-sm text-[#334155] mt-1 leading-relaxed">
                  {benefit1Desc}
                </p>
              </div>

              <div className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <h4 className="font-bold text-[#111111] uppercase tracking-wide text-[10px] sm:text-[15px] flex items-center gap-1 sm:gap-2">
                  <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-[#946000] shrink-0" />
                  <span className="leading-tight">{benefit2Title}</span>
                </h4>
                <p className="text-[10px] sm:text-sm text-[#334155] mt-1 leading-relaxed">
                  {benefit2Desc}
                </p>
              </div>
            </div>

            <div>
              <Link
                href={buttonLink || '/product'}
                className="inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-[44px] text-[10px] sm:text-sm font-bold uppercase tracking-wider text-[#111111] hover:text-[#946000] transition-colors group focus-visible:outline-none"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform text-[#946000]" />
              </Link>
            </div>
          </div>

          {/* Right Visual Showcase Banner — hidden on mobile to save space */}
          <div className="hidden sm:block lg:col-span-5 relative lg:aspect-auto sm:min-h-[220px] lg:h-full bg-slate-100 border-t lg:border-t-0 lg:border-l border-[#E2E8F0] overflow-hidden" style={{ minHeight: 220 }}>
            <Image
              src={imageSrc}
              alt={title || 'Brand Craftsmanship Showcase'}
              fill
              unoptimized
              onError={() => setImgError(true)}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>

        </div>
      </div>
    </section>
  );
}


