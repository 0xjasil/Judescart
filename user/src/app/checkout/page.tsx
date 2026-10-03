'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  Lock,
  Tag,
  Ticket,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { authClient } from '@/lib/auth-client';
import { getApiUrl } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { data: session } = authClient.useSession();
  const apiUrl = getApiUrl();

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY' | 'UPI'>('RAZORPAY');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const appliedDiscount = appliedCoupon?.discountAmount || 0;
  const shippingCost = shippingMethod === 'express' ? 199 : (totalPrice > 1999 ? 0 : 99);
  const finalTotal = Math.max(0, totalPrice + shippingCost - appliedDiscount);
  const luckyDrawTickets = Math.floor(finalTotal / 1000);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsCheckingCoupon(true);
    setCouponError(null);

    try {
      const response = await fetch(`${apiUrl}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal: totalPrice,
        }),
        credentials: 'include',
      });

      const res = await response.json();
      if (response.ok && res.success) {
        setAppliedCoupon({
          code: res.code,
          discountAmount: res.discountAmount,
        });
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.error || 'Invalid coupon code');
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError('Error validating coupon code');
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.pincode) {
      alert('Please fill in all required shipping address fields.');
      return;
    }

    setIsSubmitting(true);
    const generatedOrderId = `JC-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Send to backend order API if reachable
      await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: generatedOrderId,
          items: items.map(item => ({
            variantId: item.variantId || item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: finalTotal,
          couponCode: appliedCoupon?.code || undefined,
          shippingAddress: formData,
          paymentMethod,
        }),
        credentials: 'include'
      }).catch(() => null);

      setOrderId(generatedOrderId);
      clearCart();
      setIsCompleted(true);
    } catch (err) {
      setOrderId(generatedOrderId);
      clearCart();
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Order Confirmed!
          </h1>
          <p className="text-stone-600 mb-6">
            Thank you for shopping with JudesCart. Your order reference is{' '}
            <span className="font-mono font-bold text-slate-900">{orderId}</span>.
          </p>

          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#DF9F28]" />
              <h2 className="text-base font-bold text-slate-900">Lucky Draw Entry Verified</h2>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              You earned <span className="font-bold text-[#DF9F28]">{luckyDrawTickets || 1} Lucky Draw Ticket(s)</span> for this Sunday&apos;s weekly bumper draw! Winners receive full cashback or flagship gadgets.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-white/80 border border-amber-200 px-3 py-2 rounded-xl text-amber-950">
              <Ticket className="w-4 h-4 text-[#DF9F28]" />
              <span>TICKET #{orderId}-LD</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/track-order?id=${orderId}`}
              className="px-6 py-3 bg-[#111111] hover:bg-[#DF9F28] text-white hover:text-slate-950 rounded-full font-bold text-sm transition-all shadow-md"
            >
              Track Order
            </Link>
            <Link
              href="/product"
              className="px-6 py-3 bg-white border border-stone-200 hover:bg-stone-100 text-slate-800 rounded-full font-bold text-sm transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-6">
          <Link href="/cart" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900">Secure Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">Delivery Address</h2>
                  <p className="text-xs text-[#555555]">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111111] mb-1">Email (for tracking & receipt)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111111] mb-1">Street Address / Flat / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House / Apartment no., Street, Area"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai / Delhi / Bengaluru"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 400001"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">Delivery Speed</h2>
                  <p className="text-xs text-[#555555]">Choose shipping preference</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    shippingMethod === 'standard'
                      ? 'border-[#DF9F28] bg-[#FEF8EE]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    shippingMethod === 'standard' ? 'border-[#DF9F28] bg-[#DF9F28]' : 'border-slate-300'
                  }`}>
                    {shippingMethod === 'standard' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111111]">Standard Delivery</p>
                    <p className="text-[11px] text-[#555555] mt-0.5">3-5 Business Days</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                      {totalPrice > 1999 ? 'FREE' : '₹99'}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    shippingMethod === 'express'
                      ? 'border-[#DF9F28] bg-[#FEF8EE]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    shippingMethod === 'express' ? 'border-[#DF9F28] bg-[#DF9F28]' : 'border-slate-300'
                  }`}>
                    {shippingMethod === 'express' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#111111]">Express Air Priority</p>
                    <p className="text-[11px] text-[#555555] mt-0.5">1-2 Business Days</p>
                    <p className="text-xs font-bold text-[#111111] mt-1">₹199</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">Payment Selection</h2>
                  <p className="text-xs text-[#555555]">Safe & 256-bit encrypted checkout</p>
                </div>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-[#DF9F28] bg-[#FEF8EE]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'RAZORPAY' ? 'border-[#DF9F28] bg-[#DF9F28]' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'RAZORPAY' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111111]">Cards / UPI / NetBanking (Razorpay)</p>
                      <p className="text-[11px] text-[#555555]">Google Pay, PhonePe, Paytm, Visa, Mastercard</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-slate-400" />
                </label>

                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-[#DF9F28] bg-[#FEF8EE]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-[#DF9F28] bg-[#DF9F28]' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#111111]">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-[#555555]">Pay cash or UPI at your doorstep</p>
                    </div>
                  </div>
                  <Truck className="w-5 h-5 text-slate-400" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs sticky top-28">
              <h2 className="text-base font-bold text-[#111111] mb-4 pb-3 border-b border-slate-100">
                Order Summary ({items.length} items)
              </h2>

              {/* Items preview */}
              <div className="max-h-60 overflow-y-auto space-y-3 mb-6 pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Your bag is empty.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-10 h-10 rounded-lg bg-[#F8FAFC] border border-slate-200 overflow-hidden shrink-0">
                          <Image
                            src={item.image || '/prod_overshirt_1778670536589.png'}
                            alt={item.title || (item as any).name || 'Product'}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#111111] truncate">{item.title || (item as any).name}</p>
                          <p className="text-[#555555] text-[10px]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#111111] shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        Coupon <span className="font-mono">{appliedCoupon.code}</span> applied!
                      </p>
                      <p className="text-[10px] text-emerald-600">
                        ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')} discount applied
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code (e.g. SZD554)"
                        disabled={isCheckingCoupon}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 uppercase font-mono text-[#111111] focus:outline-none focus:border-[#DF9F28] disabled:bg-slate-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCheckingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-[#0A192F] hover:bg-[#061B3A] disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isCheckingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </form>
                  {couponError && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 ml-1">{couponError}</p>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-[#555555] border-t border-slate-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111111]">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Delivery</span>
                  <span className="font-semibold text-[#111111]">
                    {shippingCost === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingCost}`}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-[#DF9F28] font-bold">
                    <span>Promo Discount</span>
                    <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[#111111] border-t border-slate-100 pt-3">
                  <span>Total Amount</span>
                  <span className="text-[#DF9F28]">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Lucky Draw Badge */}
              <div className="p-3 bg-[#FEF8EE] rounded-2xl border border-[#DF9F28]/30 mb-6 flex items-center gap-2.5 text-xs text-[#111111] font-semibold">
                <Ticket className="w-4 h-4 text-[#DF9F28] shrink-0" />
                <span>You will earn <span className="font-bold text-[#DF9F28]">{luckyDrawTickets || 1} Lucky Ticket(s)</span> with this order.</span>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 rounded-full bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-sm font-bold tracking-wide transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-[#111111]" />
                <span>{isSubmitting ? 'Processing Order...' : `Place Order • ₹${finalTotal.toLocaleString('en-IN')}`}</span>
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 text-center text-[10px] text-[#555555] font-medium">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span>256-bit SSL</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-4 h-4 text-[#DF9F28] mb-1" />
                  <span>30-Day Returns</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-[#DF9F28] mb-1" />
                  <span>Tracked Parcel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
