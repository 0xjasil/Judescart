'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Gift,
  Coins,
  Ticket,
  Sparkles,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface DailyGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyGiftModal({ isOpen, onClose }: DailyGiftModalProps) {
  const [claimed, setClaimed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [streakDays, setStreakDays] = useState(3);

  // Check if claimed today from localStorage
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const lastClaimed = localStorage.getItem('judescart_last_daily_claim');
      if (lastClaimed === today) {
        setClaimed(true);
      }
    } catch {}
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClaim = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpening(false);
      setClaimed(true);
      try {
        localStorage.setItem('judescart_last_daily_claim', new Date().toDateString());
        setStreakDays((s) => s + 1);
      } catch {}
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Dialog Window */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#111111] via-[#161616] to-[#0D0D0D] text-white border border-[#DF9F28]/40 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Close daily gift dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#DF9F28]/15 border border-[#DF9F28]/40 text-[#DF9F28] text-[13px] font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4 animate-pulse" />
            <span>Daily Mystery Vault</span>
          </div>

          <h3 className="font-sans text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Claim Your Daily Reward
          </h3>
          <p className="text-sm text-stone-200 max-w-xs mx-auto leading-relaxed">
            Log in every 24 hours to collect free JudesCoins and automatic weekly lucky draw sweepstakes entries.
          </p>
        </div>

        {/* 7-Day Streak Tracker */}
        <div className="p-4 rounded-xl bg-black/50 border border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-stone-200">Daily Login Streak</span>
            <span className="text-[#DF9F28] font-extrabold">{streakDays} / 7 Days</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const isPast = day <= streakDays;
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[13px] font-bold ${
                    isPast
                      ? 'bg-[#DF9F28]/20 border-[#DF9F28] text-[#DF9F28]'
                      : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  <span>D{day}</span>
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#DF9F28] mt-1" />
                  ) : (
                    <span className="text-[13px] text-stone-400 mt-1 font-semibold">+50</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Vault Graphic & Rewards Card */}
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-[#DF9F28]/15 via-black/40 to-transparent border border-[#DF9F28]/30 flex flex-col items-center text-center space-y-3">
          
          <div className={`relative w-20 h-20 rounded-xl bg-[#DF9F28]/20 border border-[#DF9F28]/50 flex items-center justify-center shadow-lg shadow-amber-500/10 ${isOpening ? 'animate-bounce' : ''}`}>
            {claimed ? (
              <Sparkles className="w-10 h-10 text-[#DF9F28] animate-spin" style={{ animationDuration: '8s' }} />
            ) : (
              <Gift className="w-10 h-10 text-[#DF9F28]" />
            )}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          </div>

          {claimed ? (
            <div className="space-y-1.5">
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest block">
                🎉 Reward Successfully Claimed!
              </span>
              <div className="flex items-center justify-center gap-3 pt-1">
                <div className="inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-400/30">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>+100 Coins</span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-400/30">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>+1 Ticket</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="text-base font-bold text-white block">
                Today&apos;s Mystery Loot
              </span>
              <p className="text-sm text-stone-200">
                Unlock 100 JudesCoins + 1 Official Weekly Sweepstakes Entry Ticket
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-2.5 pt-1">
          {claimed ? (
            <div className="space-y-2">
              <Link
                href="/lucky-draw"
                onClick={onClose}
                className="w-full min-h-[44px] py-3.5 px-6 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-bold text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                <Trophy className="w-4 h-4" />
                <span>View My Lucky Draw Tickets</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-center gap-2 text-[13px] text-stone-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Next mystery vault unlocks in 18h 42m</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={isOpening}
              className="w-full min-h-[44px] py-3.5 px-6 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isOpening ? 'Unlocking Vault...' : 'Unlock Daily Gift Now'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
