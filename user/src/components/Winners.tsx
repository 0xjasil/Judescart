'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface ShowcaseWinner {
  id: string;
  winnerName: string;
  winnerPlace: string;
  winnerImage: string;
  drawCampaign: {
    name: string;
    prizeName: string;
  };
}

export default function Winners() {
  const [winners, setWinners] = useState<ShowcaseWinner[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${getApiUrl()}/draws/showcase`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setWinners(res.data);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || winners.length === 0) return null;

  return (
    <section className="sj-container space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[13px] uppercase tracking-wider font-bold text-[#946000]">
            Community Winners
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mt-1">
            Recent Lucky Draw Winners
          </h2>
        </div>

        <Link
          href="/lucky-draw"
          className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold uppercase tracking-wider text-[#946000] hover:text-[#734B00] transition-colors group focus-visible:outline-none"
        >
          <span>Learn How To Participate</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Winners Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {winners.map((winner, idx) => (
          <div
            key={winner.id || idx}
            className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 sm:p-4 flex flex-col items-center text-center shadow-xs hover:shadow-md hover:border-[#DF9F28] transition-all duration-200 group"
          >
            {/* Winner Portrait */}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-3 border border-[#E2E8F0]">
              <Image
                src={winner.winnerImage || '/winner_man.jpg'}
                alt={winner.winnerName}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 p-1.5 rounded-md bg-[#DF9F28] text-[#111111] shadow-xs">
                <Trophy className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Name & Location */}
            <h4 className="text-sm sm:text-base font-bold text-[#111111] line-clamp-1">
              {winner.winnerName}
            </h4>
            <p className="text-[13px] text-[#946000] font-bold uppercase tracking-wider mt-0.5">
              {winner.winnerPlace}
            </p>

            {/* Prize Badge */}
            <div className="mt-2.5 pt-2.5 border-t border-[#F1F5F9] w-full">
              <p className="text-[13px] text-[#334155] font-medium line-clamp-1">
                Won: {winner.drawCampaign?.prizeName || 'Luxury Prize'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
