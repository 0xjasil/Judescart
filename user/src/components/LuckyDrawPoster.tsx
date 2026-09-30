'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, ArrowRight, Clock, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export type DrawCampaign = {
  id: string;
  name: string;
  prizeName: string;
  prizeImage: string;
  startDate: string;
  endDate: string;
  winnerCount: number;
  status: string;
};

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(endDateStr?: string): TimeLeft {
  if (!endDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const target = new Date(endDateStr).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

const DEFAULT_CAMPAIGN: DrawCampaign = {
  id: 'default-active-draw',
  name: 'Weekly JudesCart Luxury Sweepstakes',
  prizeName: 'JudesCart Tailored Cashmere Coat & Artisan Duffle',
  prizeImage: '/cat_leather_1778670351299.png',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000 * 4 + 14 * 3600000 + 22 * 60000).toISOString(),
  winnerCount: 1,
  status: 'ACTIVE',
};

export default function LuckyDrawPoster() {
  const [campaigns, setCampaigns] = useState<DrawCampaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live draw campaigns from CMS
  useEffect(() => {
    setIsMounted(true);
    let activeFetch = true;

    const fetchDraws = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/draws`);
        if (res.ok) {
          const json = await res.json();
          const items: DrawCampaign[] = Array.isArray(json?.data)
            ? json.data.filter((c: DrawCampaign) => c.status === 'ACTIVE')
            : [];
          if (items.length > 0 && activeFetch) {
            setCampaigns(items);
            return;
          }
        }
      } catch (err) {
        console.warn('Lucky draw campaigns fetch failed, using curated default:', err);
      }
    };

    fetchDraws();
    return () => {
      activeFetch = false;
    };
  }, []);

  const total = campaigns.length;
  const activeCampaign = total > 0 ? campaigns[currentIndex % total] : DEFAULT_CAMPAIGN;

  // Real-time second-by-second countdown calculation
  const updateTimer = useCallback(() => {
    setTimeLeft(getTimeLeft(activeCampaign.endDate));
  }, [activeCampaign.endDate]);

  useEffect(() => {
    updateTimer();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [updateTimer]);

  // Auto-advance if multiple active campaigns exist in CMS
  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6500);
    return () => clearInterval(interval);
  }, [total]);

  const prevCampaign = () => {
    if (total > 1) {
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    }
  };

  const nextCampaign = () => {
    if (total > 1) {
      setCurrentIndex((prev) => (prev + 1) % total);
    }
  };

  const prizeImageSrc = imageFailed[activeCampaign.id]
    ? '/cat_leather_1778670351299.png'
    : (activeCampaign.prizeImage || '/cat_leather_1778670351299.png');

  return (
    <section className="sj-container">
      <div className="relative rounded-2xl overflow-hidden bg-[#0A192F] text-white border border-[#061B3A] shadow-md group">
        
        {/* Multi-Campaign navigation arrows if > 1 active campaign */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevCampaign}
              aria-label="Previous sweepstakes"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#061B3A]/80 hover:bg-[#061B3A] text-white border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextCampaign}
              aria-label="Next sweepstakes"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#061B3A]/80 hover:bg-[#061B3A] text-white border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Text & Countdown */}
          <div className="lg:col-span-7 p-4 sm:p-8 lg:p-12 space-y-3 sm:space-y-5">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md bg-[#DF9F28]/20 border border-[#DF9F28]/40 text-[#DF9F28] text-xs sm:text-[13px] font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DF9F28]" />
                <span>Live Weekly Sweepstakes</span>
              </div>
              {total > 1 && (
                <span className="text-[11px] sm:text-xs font-semibold text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  Campaign {(currentIndex % total) + 1} / {total}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
              {activeCampaign.name}
            </h2>

            <p className="text-xs sm:text-base text-slate-200 max-w-lg leading-relaxed font-normal">
              Every verified customer order automatically generates lucky draw tickets. Discover fine tailoring and enter transparent weekly prize drawings.
            </p>

            {/* Countdown Box */}
            <div className="space-y-1.5 sm:space-y-2 pt-0.5">
              <div className="text-xs sm:text-[13px] font-bold text-[#DF9F28] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DF9F28]" />
                <span>Next Live Draw Countdown</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-xs text-center font-mono">
                <div className="bg-[#061B3A] border border-white/10 rounded-lg p-1.5 sm:p-2.5">
                  <span className="block text-base sm:text-2xl font-bold text-white leading-none">
                    {isMounted ? pad(timeLeft.days) : '03'}
                  </span>
                  <span className="text-[10px] sm:text-[13px] text-slate-200 font-sans font-semibold uppercase mt-1 sm:mt-1.5 block">Days</span>
                </div>
                <div className="bg-[#061B3A] border border-white/10 rounded-lg p-1.5 sm:p-2.5">
                  <span className="block text-base sm:text-2xl font-bold text-white leading-none">
                    {isMounted ? pad(timeLeft.hours) : '14'}
                  </span>
                  <span className="text-[10px] sm:text-[13px] text-slate-200 font-sans font-semibold uppercase mt-1 sm:mt-1.5 block">Hours</span>
                </div>
                <div className="bg-[#061B3A] border border-white/10 rounded-lg p-1.5 sm:p-2.5">
                  <span className="block text-base sm:text-2xl font-bold text-white leading-none">
                    {isMounted ? pad(timeLeft.minutes) : '22'}
                  </span>
                  <span className="text-[10px] sm:text-[13px] text-slate-200 font-sans font-semibold uppercase mt-1 sm:mt-1.5 block">Mins</span>
                </div>
                <div className="bg-[#061B3A] border border-[#DF9F28]/30 rounded-lg p-1.5 sm:p-2.5">
                  <span className="block text-base sm:text-2xl font-bold text-[#DF9F28] leading-none">
                    {isMounted ? pad(timeLeft.seconds) : '45'}
                  </span>
                  <span className="text-[10px] sm:text-[13px] text-[#DF9F28] font-sans font-semibold uppercase mt-1 sm:mt-1.5 block">Secs</span>
                </div>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                href="/lucky-draw"
                className="inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-[44px] px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-bold text-xs sm:text-base tracking-wide transition-all shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-[#DF9F28]"
              >
                <span>View Lucky Draw Details</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111111]" />
              </Link>

              {total > 1 && (
                <div className="flex items-center gap-1.5">
                  {campaigns.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Select campaign ${idx + 1}`}
                      className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                        idx === (currentIndex % total)
                          ? 'w-5 sm:w-6 bg-[#DF9F28]'
                          : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Prize Image Showcase */}
          <div className="lg:col-span-5 relative aspect-square lg:aspect-auto min-h-[200px] xs:min-h-[220px] sm:min-h-[280px] lg:h-full bg-[#061B3A] border-t lg:border-t-0 lg:border-l border-white/10 overflow-hidden">
            <Image
              src={prizeImageSrc}
              alt={activeCampaign.prizeName || 'Featured Prize'}
              fill
              unoptimized
              onError={() => setImageFailed((prev) => ({ ...prev, [activeCampaign.id]: true }))}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 p-2.5 sm:p-3.5 rounded-xl bg-[#061B3A]/90 backdrop-blur-md border border-white/10 text-white">
              <span className="text-xs sm:text-[13px] uppercase font-bold text-[#DF9F28] tracking-wider flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                <span>Featured Prize ({activeCampaign.winnerCount || 1} Winner{(activeCampaign.winnerCount || 1) > 1 ? 's' : ''})</span>
              </span>
              <p className="font-bold text-xs sm:text-base text-white line-clamp-1 mt-0.5">
                {activeCampaign.prizeName}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

