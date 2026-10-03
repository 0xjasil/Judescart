'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Truck,
  RotateCcw,
  Award,
  ShieldCheck,
  Lock,
  Mail,
  CheckCircle2,
  Sparkles,
  Smartphone,
} from 'lucide-react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#0A192F] text-slate-200 pt-8 sm:pt-14 pb-8 sm:pb-12 border-t border-[#061B3A]">
      {/* Top 5-Item Feature Trust Strip */}
      <div className="sj-container pb-6 sm:pb-12 border-b border-[#061B3A]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-5">

          {/* Card 1 */}
          <div className="flex items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-[#061B3A] border border-white/5">
            <div className="p-1.5 sm:p-2.5 rounded-lg bg-[#0A192F] text-[#DF9F28] shrink-0 border border-white/5">
              <Truck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-[10px] sm:text-sm font-semibold uppercase tracking-wide text-[#F8FAFC] leading-tight">
                Express Delivery
              </h4>
              <p className="hidden sm:block text-[13px] text-slate-300 mt-1 leading-relaxed">
                Insured express dispatch across 26,000+ pin codes.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-[#061B3A] border border-white/5">
            <div className="p-1.5 sm:p-2.5 rounded-lg bg-[#0A192F] text-[#DF9F28] shrink-0 border border-white/5">
              <RotateCcw className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-[10px] sm:text-sm font-semibold uppercase tracking-wide text-[#F8FAFC] leading-tight">
                30-Day Returns
              </h4>
              <p className="hidden sm:block text-[13px] text-slate-300 mt-1 leading-relaxed">
                Doorstep pickup with instant refunds or size exchanges.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-[#061B3A] border border-white/5">
            <div className="p-1.5 sm:p-2.5 rounded-lg bg-[#0A192F] text-[#DF9F28] shrink-0 border border-white/5">
              <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-[10px] sm:text-sm font-semibold uppercase tracking-wide text-[#F8FAFC] leading-tight">
                Brand Warranty
              </h4>
              <p className="hidden sm:block text-[13px] text-slate-300 mt-1 leading-relaxed">
                100% authentic products with standard manufacturer warranty.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-[#061B3A] border border-white/5">
            <div className="p-1.5 sm:p-2.5 rounded-lg bg-[#0A192F] text-[#DF9F28] shrink-0 border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-[10px] sm:text-sm font-semibold uppercase tracking-wide text-[#F8FAFC] leading-tight">
                Secure Checkout
              </h4>
              <p className="hidden sm:block text-[13px] text-slate-300 mt-1 leading-relaxed">
                256-bit encrypted Razorpay, UPI &amp; card processing.
              </p>
            </div>
          </div>

          {/* Card 5 — spans 2 cols on mobile so it's not orphaned alone */}
          <div className="col-span-2 sm:col-span-1 flex items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl bg-[#061B3A] border border-white/5">
            <div className="p-1.5 sm:p-2.5 rounded-lg bg-[#0A192F] text-[#DF9F28] shrink-0 border border-white/5">
              <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-[10px] sm:text-sm font-semibold uppercase tracking-wide text-[#F8FAFC] leading-tight">
                Weekly Lucky Draw
              </h4>
              <p className="hidden sm:block text-[13px] text-slate-300 mt-1 leading-relaxed">
                Every verified purchase earns entry tickets to prize draws.
              </p>
            </div>
          </div>

        </div>
      </div>


      {/* Main Footer Links */}
      <div className="sj-container pt-6 sm:pt-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          
          {/* Brand Info & Newsletter — full width on mobile */}
          <div className="col-span-2 lg:col-span-4 space-y-3 sm:space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group focus-visible:outline-none">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                <Image
                  src="/logo-icon.webp"
                  alt="JudesCart Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                  Judes<span className="text-[#DF9F28]">Cart</span>
                </span>
                <span className="text-[11px] sm:text-[13px] tracking-[0.15em] font-semibold text-slate-300 uppercase mt-0.5">
                  Shop More. Live Better.
                </span>
              </div>
            </Link>
            
            <p className="text-[11px] sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              Discover top-rated electronics, tech gear, premium apparel, footwear, leather goods, smart home essentials, and beauty items with transparent weekly lucky draw rewards.
            </p>

            {/* Newsletter Subscription */}
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] mb-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DF9F28]" />
                <span>Insider VIP Newsletter</span>
              </p>
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-[11px] sm:text-[13px] text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                  <span>Welcome to the Insider Club! Check your inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-label="Email for newsletter"
                    className="flex-1 min-h-[40px] sm:min-h-[44px] bg-[#061B3A] border border-white/15 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#DF9F28]"
                  />
                  <button
                    type="submit"
                    className="min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-5 py-2 bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-xs sm:text-sm font-bold rounded-xl transition-colors shrink-0 cursor-pointer active:scale-95"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] sm:text-[13px] text-slate-300">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DF9F28]" />
              <span>PCI-DSS Compliant • 256-Bit SSL Protection</span>
            </div>
          </div>

          {/* Column 1: All Departments */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] sm:text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider mb-3 sm:mb-4">
              All Departments
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li><Link href="/product" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">All Products Catalog</Link></li>
              <li><Link href="/product?category=electronics" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Electronics &amp; Tech Gear</Link></li>
              <li><Link href="/product?category=apparel" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Fashion &amp; Apparel</Link></li>
              <li><Link href="/product?category=footwear" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Footwear &amp; Sneakers</Link></li>
              <li><Link href="/product?category=leather" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Leather Goods &amp; Bags</Link></li>
              <li><Link href="/product?category=home" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Home &amp; Living</Link></li>
              <li><Link href="/product?category=beauty" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Beauty &amp; Personal Care</Link></li>
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] sm:text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider mb-3 sm:mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li><Link href="/track-order" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Track Order</Link></li>
              <li><Link href="/shipping" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Shipping &amp; Delivery</Link></li>
              <li><Link href="/returns" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Returns &amp; Refunds</Link></li>
              <li><Link href="/faq" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Help / FAQ</Link></li>
              <li><Link href="/contact" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Customer Support Concierge</Link></li>
              <li><Link href="/orders" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">My Orders History</Link></li>
              <li><Link href="/profile" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Account Settings</Link></li>
            </ul>
          </div>

          {/* Column 3: Rewards & Apps */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] sm:text-sm font-semibold text-[#F8FAFC] uppercase tracking-wider mb-3 sm:mb-4">
              Rewards &amp; App
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li><Link href="/lucky-draw" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Weekly Live Draw</Link></li>
              <li><Link href="/lucky-draw#bumper-draw" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Bumper Jackpot</Link></li>
              <li><Link href="/lucky-draw#winners" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Verified Winners</Link></li>
              <li><Link href="/lucky-draw#rules" className="inline-block py-0.5 sm:py-1 hover:text-[#DF9F28] transition-colors">Draw Rules</Link></li>
              <li className="pt-1">
                <Link href="/install-app" className="text-[#DF9F28] hover:underline font-semibold flex items-center gap-1.5 py-0.5 sm:py-1">
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Install App</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Legal Links & Payment Badges */}
        <div className="mt-6 sm:mt-12 pt-4 sm:pt-6 border-t border-[#061B3A] flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 text-[11px] sm:text-[13px] text-slate-300">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p>© {new Date().getFullYear()} JudesCart. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-500">•</span>
            <Link href="/privacy" className="hover:text-[#DF9F28] transition-colors min-h-[36px] sm:min-h-[44px] inline-flex items-center">Privacy Policy</Link>
            <span className="text-slate-500">•</span>
            <Link href="/terms" className="hover:text-[#DF9F28] transition-colors min-h-[36px] sm:min-h-[44px] inline-flex items-center">Terms of Service</Link>
            <span className="text-slate-500">•</span>
            <Link href="/accessibility" className="hover:text-[#DF9F28] transition-colors min-h-[36px] sm:min-h-[44px] inline-flex items-center">Accessibility</Link>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="hover:text-white transition-colors">Razorpay</span>
            <span className="text-slate-500">•</span>
            <span className="hover:text-white transition-colors">UPI</span>
            <span className="text-slate-500">•</span>
            <span className="hover:text-white transition-colors">Visa</span>
            <span className="text-slate-500">•</span>
            <span className="hover:text-white transition-colors">Mastercard</span>
            <span className="text-slate-500">•</span>
            <span className="hover:text-white transition-colors">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
