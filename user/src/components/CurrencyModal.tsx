'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Globe, Sparkles } from 'lucide-react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // Conversion rate relative to INR
  isDefault?: boolean;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 1, isDefault: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 0.012 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.011 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0.0095 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 1.82 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', rate: 0.016 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rate: 0.018 },
];

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
}

export default function CurrencyModal({
  isOpen,
  onClose,
  selectedCurrency,
  onSelectCurrency,
}: CurrencyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center pt-20 sm:pt-0 px-4 bg-[#0A192F]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF8EE] text-[#946000] flex items-center justify-center border border-[#946000]/30">
              <Globe className="w-5 h-5 text-[#946000]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111111]">Select Display Currency</h3>
              <p className="text-[13px] text-[#475569] mt-0.5">Auto-calculated checkout conversion</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] rounded-lg text-[#475569] hover:text-[#111111] hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close currency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency List */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {CURRENCIES.map((c) => {
            const isSelected = selectedCurrency.code === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onSelectCurrency(c);
                  onClose();
                }}
                className={`w-full min-h-[44px] flex items-center justify-between p-3.5 rounded-xl transition-all text-left cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FEF8EE] border-[#946000] text-[#111111] shadow-xs'
                    : 'hover:bg-[#F8FAFC] border-slate-100 text-[#334155]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none" role="img" aria-label={c.name}>
                    {c.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#111111]">{c.code}</span>
                      <span className="text-sm text-[#475569]">•</span>
                      <span className="text-sm text-[#334155] font-medium">{c.name}</span>
                    </div>
                    {c.isDefault && (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-800 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Detected for your location
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-base font-bold text-[#111111] font-mono">{c.symbol}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#DF9F28] text-[#111111] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[13px] text-[#334155]">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#946000]" />
            <span>Prices convert automatically based on real-time rates.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
