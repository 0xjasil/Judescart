'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingBag,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Truck,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    totalItems,
    totalPrice,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 999;
  const progressPercent = Math.min(100, Math.round((totalPrice / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-[#0A192F]/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E2E8F0] animate-in slide-in-from-right duration-300">
          
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FEF8EE] text-[#946000] border border-[#946000]/30">
                <ShoppingBag className="w-5 h-5 text-[#946000]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#111111] leading-none">
                  Shopping Bag
                </h3>
                <span className="text-[13px] text-[#334155] font-medium mt-1 block">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </span>
              </div>
            </div>

            <button
              onClick={closeDrawer}
              className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-slate-200 text-[#334155] hover:text-[#111111] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Free Delivery Progress Bar */}
          <div className="px-4 sm:px-5 py-3 bg-[#FEF8EE] border-b border-[#946000]/20 text-[13px]">
            {amountNeeded === 0 ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>You unlocked Free Express Delivery across India!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#334155] font-medium">
                  <span>
                    Add <strong className="text-[#946000] font-bold">₹{amountNeeded.toLocaleString('en-IN')}</strong> for Free Delivery
                  </span>
                  <span className="font-bold text-[#111111]">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#DF9F28] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-[#F1F5F9]">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-bold text-[#111111]">Your bag is empty</h4>
                  <p className="text-[13px] sm:text-sm text-[#334155] max-w-xs mx-auto">
                    Explore our curated apparel, fine leather, and exclusive drops to fill your bag.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push('/product');
                  }}
                  className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-sm font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-start group">
                  <div className="relative w-18 h-22 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] shrink-0">
                    <Image
                      src={item.image || '/prod_overshirt_1778670536589.png'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product?id=${item.productId}`}
                          onClick={closeDrawer}
                          className="text-sm sm:text-[15px] font-bold text-[#111111] hover:text-[#946000] transition-colors line-clamp-1 block"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#4B5563] hover:text-rose-600 transition-colors p-1.5 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[13px] text-[#4B5563] mt-0.5">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>• {item.color}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-slate-200 rounded-l-md text-[#334155] transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-[#111111] font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-slate-200 rounded-r-md text-[#334155] transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-base font-bold text-[#111111]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. Footer & Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-3.5">
              <div className="space-y-1.5 text-[13px]">
                <div className="flex justify-between text-[#334155]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#111111] text-base">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#4B5563] text-[13px]">
                  <span>Shipping &amp; Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push('/checkout');
                  }}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-sm font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#111111]" />
                </button>

                <button
                  onClick={() => {
                    closeDrawer();
                    router.push('/cart');
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#111111] border border-[#E2E8F0] hover:border-[#DF9F28] text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>View Full Cart ({totalItems})</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[13px] text-[#334155] pt-1">
                <ShieldCheck className="w-4 h-4 text-[#946000]" />
                <span>100% Encrypted &amp; Secure Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
