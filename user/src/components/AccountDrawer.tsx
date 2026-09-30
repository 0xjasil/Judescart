'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  User,
  Coins,
  Gift,
  Package,
  Heart,
  MapPin,
  Settings,
  Sparkles,
  Ticket,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronRight,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onOpenDailyGift: () => void;
}

export default function AccountDrawer({
  isOpen,
  onClose,
  onOpenAuth,
  onOpenDailyGift,
}: AccountDrawerProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<'orders' | 'perks' | 'addresses' | 'preferences'>('orders');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      onClose();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A192F]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F8FAFC] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#061B3A] bg-[#0A192F] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#DF9F28]/20 border border-[#DF9F28]/40 text-[#DF9F28] flex items-center justify-center font-bold text-base shrink-0">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white truncate">
                    {session?.user?.name || 'Guest Customer'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[13px] font-bold bg-[#DF9F28] text-[#111111] shrink-0">
                    🏆 Gold VIP
                  </span>
                </div>
                <p className="text-[13px] text-slate-300 truncate mt-0.5">
                  {session?.user?.email || 'Browsing as visitor'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Close account drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Guest Sign In Callout */}
            {!session?.user && (
              <div className="p-4 rounded-2xl bg-[#FEF8EE] border border-[#946000]/30">
                <h4 className="text-sm font-bold text-[#111111]">Sign in to JudesCart</h4>
                <p className="text-[13px] text-[#334155] mt-1">
                  View your order history, delivery radar, & unlock 200 free coins.
                </p>
                <div className="flex gap-2 mt-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('signin');
                    }}
                    className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-bold text-sm transition-colors cursor-pointer text-center"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('signup');
                    }}
                    className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#111111] border border-slate-200 font-bold text-sm transition-colors cursor-pointer text-center"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}

            {/* JudesCoins & Lucky Rewards Card */}
            <div className="p-5 rounded-2xl bg-[#0A192F] text-white relative overflow-hidden shadow-md border border-[#061B3A]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#DF9F28]" />
                  <span className="text-lg font-bold tracking-tight text-white">0 JudesCoins</span>
                </div>
                <span className="text-[13px] uppercase font-bold text-[#DF9F28] bg-[#DF9F28]/20 px-2.5 py-0.5 rounded-full border border-[#DF9F28]/30">
                  Tier 1
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDailyGift();
                  }}
                  className="p-3 min-h-[44px] rounded-xl bg-[#061B3A] hover:bg-[#061B3A]/80 border border-slate-700/60 text-left transition-colors flex items-center gap-2.5"
                >
                  <Gift className="w-4 h-4 text-[#DF9F28] shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-white leading-none">🎁 Day 1</p>
                    <p className="text-[13px] text-slate-300 mt-1">Claim Reward</p>
                  </div>
                </button>

                <Link
                  href="/lucky-draw"
                  onClick={onClose}
                  className="p-3 min-h-[44px] rounded-xl bg-[#061B3A] hover:bg-[#061B3A]/80 border border-slate-700/60 text-left transition-colors flex items-center gap-2.5"
                >
                  <Ticket className="w-4 h-4 text-[#DF9F28] shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-white leading-none">Lucky Draws</p>
                    <p className="text-[13px] text-slate-300 mt-1">Live Sunday 8PM</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Tabbed Navigation Filter */}
            <div>
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`flex-1 min-h-[44px] pb-2 text-sm font-bold transition-all ${
                    activeTab === 'orders'
                      ? 'text-[#946000] border-b-2 border-[#946000]'
                      : 'text-[#475569] hover:text-[#111111]'
                  }`}
                >
                  Orders (0)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('perks')}
                  className={`flex-1 min-h-[44px] pb-2 text-sm font-bold transition-all ${
                    activeTab === 'perks'
                      ? 'text-[#946000] border-b-2 border-[#946000]'
                      : 'text-[#475569] hover:text-[#111111]'
                  }`}
                >
                  Coins &amp; Perks
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('addresses')}
                  className={`flex-1 min-h-[44px] pb-2 text-sm font-bold transition-all ${
                    activeTab === 'addresses'
                      ? 'text-[#946000] border-b-2 border-[#946000]'
                      : 'text-[#475569] hover:text-[#111111]'
                  }`}
                >
                  Addresses
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preferences')}
                  className={`flex-1 min-h-[44px] pb-2 text-sm font-bold transition-all ${
                    activeTab === 'preferences'
                      ? 'text-[#946000] border-b-2 border-[#946000]'
                      : 'text-[#475569] hover:text-[#111111]'
                  }`}
                >
                  Preferences
                </button>
              </div>

              {/* Tab Content */}
              <div className="py-4">
                {activeTab === 'orders' && (
                  <div className="text-center py-8 space-y-3 bg-white rounded-2xl border border-slate-200/80 p-4">
                    <Package className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-[#111111]">No orders placed yet</p>
                    <p className="text-[13px] text-[#334155] max-w-xs mx-auto">
                      Your fulfilled orders and live dispatch milestones will appear here.
                    </p>
                    <Link
                      href="/product"
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2.5 rounded-full bg-[#0A192F] hover:bg-[#DF9F28] hover:text-[#111111] text-sm font-bold text-white transition-colors"
                    >
                      <span>Start Shopping</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {activeTab === 'perks' && (
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-[#FEF8EE] rounded-xl border border-[#946000]/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#946000]" />
                        <span className="font-bold text-[#111111]">Weekly Bumper Entry</span>
                      </div>
                      <span className="font-bold text-[#946000]">Active</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[#946000]" />
                        <span className="font-bold text-[#111111]">Signup Bonus</span>
                      </div>
                      <span className="font-bold text-emerald-700">+200 Coins</span>
                    </div>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="text-center py-8 space-y-2 bg-white rounded-2xl border border-slate-200/80 p-4">
                    <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-[#111111]">No saved addresses</p>
                    <p className="text-[13px] text-[#334155]">
                      Addresses will be saved automatically during checkout.
                    </p>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-3 text-sm">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-[#334155] font-medium">Default Currency</span>
                      <span className="font-bold text-[#111111]">INR (₹)</span>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-[#334155] font-medium">Order Alerts</span>
                      <span className="font-bold text-emerald-700">Enabled (SMS + WA)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between min-h-[44px] p-3 rounded-xl hover:bg-white text-sm font-bold text-[#111111] transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-[#946000]" />
                  <span>Saved Wishlist</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/track-order"
                onClick={onClose}
                className="flex items-center justify-between min-h-[44px] p-3 rounded-xl hover:bg-white text-sm font-bold text-[#111111] transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#0A192F]" />
                  <span>Track Consignment</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href="/faq"
                onClick={onClose}
                className="flex items-center justify-between min-h-[44px] p-3 rounded-xl hover:bg-white text-sm font-bold text-[#111111] transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Help &amp; FAQ</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-slate-200 bg-white">
            {session?.user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of JudesCart</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth('signin');
                }}
                className="w-full min-h-[44px] py-3.5 px-4 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-sm font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
