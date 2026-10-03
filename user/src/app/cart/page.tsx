'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  X,
  CreditCard,
  Check,
  AlertCircle,
  Ticket,
  Lock,
  Tag,
  Loader2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { authClient } from '@/lib/auth-client';
import { getApiUrl } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentMethod = 'COD' | 'RAZORPAY';

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayPaymentDetails = {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { data: session } = authClient.useSession();
  const apiUrl = getApiUrl();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [shippingForm, setShippingForm] = useState({
    name: 'Customer',
    phone: '+91 98765 43210',
    street: '12, Atelier Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const finalTotal = Math.max(totalPrice - (appliedCoupon?.discountAmount || 0), 0);

  // Auto-fill user information when session is available
  useEffect(() => {
    if (session?.user) {
      setShippingForm((prev) => ({
        ...prev,
        name: session.user.name || prev.name,
      }));
    }
  }, [session]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsCheckingCoupon(true);
    setCouponError(null);
    try {
      const response = await fetch(`${apiUrl}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), cartTotal: totalPrice }),
        credentials: 'include',
      });
      const res = await response.json();
      if (response.ok && res.success) {
        setAppliedCoupon(res);
        setCouponInput('');
        showToast(`Coupon "${res.code}" applied!`);
      } else {
        setCouponError(res.error || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Error validating coupon code');
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput('');
    showToast('Coupon removed');
  };

  // Fetch saved addresses of the user when checkout is opened
  useEffect(() => {
    if (isCheckoutOpen && session?.user) {
      const fetchSavedAddresses = async () => {
        try {
          const res = await fetch(`${apiUrl}/profile/addresses`, { credentials: 'include' });
          if (res.ok) {
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
              setSavedAddresses(result.data);
              const defaultAddr = result.data.find((a: any) => a.isDefault);
              if (defaultAddr) {
                setShippingForm({
                  name: defaultAddr.name,
                  phone: defaultAddr.phone,
                  street: defaultAddr.street,
                  city: defaultAddr.city,
                  state: defaultAddr.state,
                  pincode: defaultAddr.pincode,
                });
              } else if (result.data.length > 0) {
                setShippingForm({
                  name: result.data[0].name,
                  phone: result.data[0].phone,
                  street: result.data[0].street,
                  city: result.data[0].city,
                  state: result.data[0].state,
                  pincode: result.data[0].pincode,
                });
              }
            }
          }
        } catch (err) {
          console.error('Failed to load checkout addresses:', err);
        }
      };
      fetchSavedAddresses();
    }
  }, [isCheckoutOpen, session, apiUrl]);

  const getOrderItems = () =>
    items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      category: item.category,
      price: item.price,
      image: item.image,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));

  const createFinalOrder = async (
    selectedPaymentMethod: PaymentMethod,
    paymentDetails?: RazorpayPaymentDetails
  ) => {
    const response = await fetch(`${apiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        items: getOrderItems(),
        shippingDetails: shippingForm,
        paymentMethod: selectedPaymentMethod,
        couponCode: appliedCoupon?.code,
        ...paymentDetails,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to place order. Please try again.');
    }

    return result.data;
  };

  const placeCodOrder = async () => {
    const newOrder = await createFinalOrder('COD');
    setPlacedOrder(newOrder);
    setIsCheckoutOpen(false);
    clearCart();
  };

  const placeRazorpayOrder = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    const orderItems = getOrderItems();
    const createOrderResponse = await fetch(`${apiUrl}/payments/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        amount: finalTotal,
        couponCode: appliedCoupon?.code,
        items: orderItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }),
    });

    const orderData = await createOrderResponse.json();
    if (!createOrderResponse.ok || !orderData.success) {
      throw new Error(orderData.error || 'Failed to initialize payment gateway.');
    }

    const { orderId, amount, currency, keyId } = orderData.data;

    return new Promise<void>((resolve, reject) => {
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'JUDESCART',
        description: 'Order Payment',
        order_id: orderId,
        prefill: {
          name: shippingForm.name,
          contact: shippingForm.phone,
          email: session?.user?.email || '',
        },
        theme: {
          color: '#DF9F28',
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verifyResponse = await fetch(`${apiUrl}/payments/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            const newOrder = await createFinalOrder('RAZORPAY', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setPlacedOrder(newOrder);
            setIsCheckoutOpen(false);
            clearCart();
            resolve();
          } catch (verifyError: any) {
            console.error('Verification Error:', verifyError);
            setCheckoutError(verifyError.message || 'Payment verification failed.');
            reject(verifyError);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!shippingForm.name.trim()) return setCheckoutError('Please enter your full name.');
    if (!shippingForm.phone.trim()) return setCheckoutError('Please enter a valid contact phone number.');
    if (!shippingForm.street.trim()) return setCheckoutError('Please enter a street address.');
    if (!shippingForm.city.trim()) return setCheckoutError('Please enter your city.');
    if (!shippingForm.state.trim()) return setCheckoutError('Please enter your state.');
    if (!shippingForm.pincode.trim()) return setCheckoutError('Please enter your postal/ZIP code.');

    setIsSubmitting(true);
    try {
      if (paymentMethod === 'COD') {
        await placeCodOrder();
      } else {
        await placeRazorpayOrder();
      }
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setCheckoutError(err.message || 'Failed to complete order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveToWishlist = (item: any) => {
    addToWishlist({
      id: String(item.productId),
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      category: item.category,
      price: item.price,
      image: item.image,
    });
    removeFromCart(item.id);
    showToast(`Moved ${item.title} to wishlist`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111111] font-sans flex flex-col justify-between">
      <Navbar />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-[#061B3A] animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#DF9F28]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 py-10 md:py-16">
        <div className="sj-container">
          
          {/* ========================================================================= */}
          {/* 1. ORDER SUCCESS CONFIRMATION MODAL / SCREEN */}
          {/* ========================================================================= */}
          {placedOrder ? (
            <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold tracking-[0.2em] text-[#DF9F28] uppercase">
                  ORDER CONFIRMED
                </span>
                <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-[#111111] tracking-tight">
                  Thank You For Your Order!
                </h1>
                <p className="text-xs sm:text-sm text-[#555555]">
                  Your order has been placed successfully and is being prepared with bespoke care.
                </p>
              </div>

              {/* Order Details Pill */}
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#555555] font-medium">Order Number:</span>
                  <span className="font-bold font-mono text-[#111111]">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555555] font-medium">Payment Mode:</span>
                  <span className="font-bold text-[#111111] uppercase">{placedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#555555] font-medium">Total Amount:</span>
                  <span className="font-bold text-[#111111]">₹{placedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Lucky Draw Generated Tickets Notice */}
              <div className="p-4 bg-[#FEF8EE] rounded-2xl border border-[#DF9F28]/30 text-[#111111] text-xs flex items-center gap-3 text-left">
                <Ticket className="w-5 h-5 text-[#DF9F28] shrink-0" />
                <div>
                  <p className="font-bold">Lucky Draw Tickets Generated!</p>
                  <p className="text-[#555555] text-[11px]">
                    Your tickets have been registered for this week&apos;s live draw. View them in your profile.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link
                  href={`/orders?id=${encodeURIComponent(placedOrder.id)}`}
                  className="flex-1 py-3.5 px-6 bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center"
                >
                  Track Order
                </Link>
                <Link
                  href="/product"
                  className="flex-1 py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-[#111111] rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center border border-slate-200"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* ========================================================================= */
            /* 2. EMPTY CART VIEW */
            /* ========================================================================= */
            <div className="max-w-xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-10 sm:p-16 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#FEF8EE] text-[#DF9F28] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-sans font-extrabold text-[#111111] tracking-tight">Your Shopping Cart is Empty</h2>
                <p className="text-xs sm:text-sm text-[#555555] max-w-sm mx-auto">
                  Explore our tailored collections and add bespoke apparel, leather goods, and lifestyle essentials to your bag.
                </p>
              </div>
              <Link
                href="/product"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] rounded-full text-xs font-black tracking-wider uppercase transition-all shadow-md"
              >
                <span>Discover Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* ========================================================================= */
            /* 3. ACTIVE SHOPPING CART & CHECKOUT */
            /* ========================================================================= */
            <div className="space-y-8">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
                <div>
                  <span className="text-xs font-bold tracking-[0.2em] text-[#DF9F28] uppercase">
                    REVIEW YOUR SELECTION
                  </span>
                  <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-[#111111] tracking-tight">
                    Shopping Bag ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </h1>
                </div>
                <Link
                  href="/product"
                  className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase text-[#555555] hover:text-[#DF9F28] tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Two Column Layout: Cart Items on Left, Summary on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                {/* Left Column: Item Cards List */}
                <div className="lg:col-span-7 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex gap-4 sm:gap-6 shadow-xs"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                        <Image
                          src={item.image || '/prod_overshirt_1778670536589.png'}
                          alt={item.title}
                          fill
                          className="object-cover object-center"
                        />
                      </div>

                      {/* Product Info & Controls */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-[#111111] line-clamp-1">
                              {item.title}
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-xs text-[#DF9F28] font-bold uppercase tracking-wider">
                            {item.category}
                          </p>

                          {/* Variant Attributes */}
                          <div className="flex items-center gap-3 pt-1 text-xs text-[#555555]">
                            {item.size && (
                              <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-slate-200 text-[#111111] font-semibold text-[11px]">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-slate-200 text-[#111111] font-semibold text-[11px]">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Quantity Actions Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                          <div className="flex items-center bg-[#F8FAFC] border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 flex items-center justify-center text-[#555555] hover:bg-[#FEF8EE] hover:text-[#DF9F28] font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-[#111111] font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#555555] hover:bg-[#FEF8EE] hover:text-[#DF9F28] font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-sm sm:text-base font-bold text-[#111111]">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="block text-[10px] text-[#888888]">
                                (₹{item.price.toLocaleString('en-IN')} each)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Order Summary & Checkout Accordion */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
                    <h2 className="text-lg font-sans font-extrabold text-[#111111] tracking-tight">
                      Order Summary
                    </h2>

                    {/* Coupon Input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]">
                        Promotional Coupon
                      </label>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-[#FEF8EE] border border-[#DF9F28]/30 rounded-xl text-xs text-[#111111]">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#DF9F28]" />
                            <span className="font-bold font-mono uppercase">{appliedCoupon.code}</span>
                            <span className="text-[#DF9F28] font-bold">(-₹{appliedCoupon.discountAmount})</span>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-xs text-[#DF9F28] hover:text-[#C6891E] hover:underline font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="PROMO CODE"
                            className="flex-1 px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-mono uppercase text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#DF9F28]"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={isCheckingCoupon || !couponInput.trim()}
                            className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#061B3A] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            {isCheckingCoupon ? 'Checking...' : 'Apply'}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="text-xs text-rose-500 font-medium">{couponError}</p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 pt-4 border-t border-slate-100 text-xs sm:text-sm">
                      <div className="flex justify-between text-[#555555]">
                        <span>Bag Subtotal</span>
                        <span className="font-semibold text-[#111111]">₹{totalPrice.toLocaleString('en-IN')}</span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-[#DF9F28] font-bold">
                          <span>Coupon Discount ({appliedCoupon.code})</span>
                          <span>-₹{appliedCoupon.discountAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[#555555]">
                        <span>Estimated Shipping</span>
                        <span className="font-semibold text-emerald-600 uppercase">FREE</span>
                      </div>

                      <div className="flex justify-between text-[#555555]">
                        <span>Tax & Duties</span>
                        <span className="font-semibold text-[#111111]">Included</span>
                      </div>

                      <div className="flex justify-between text-base sm:text-lg font-bold text-[#111111] pt-3 border-t border-slate-200">
                        <span>Total Due</span>
                        <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Toggle Checkout Button */}
                    {!isCheckoutOpen ? (
                      <button
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full py-4 bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Proceed To Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      /* Checkout Form Inside Drawer/Panel */
                      <form onSubmit={handleCheckoutSubmit} className="space-y-6 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold tracking-wider uppercase text-[#111111]">
                            Shipping & Payment Details
                          </h3>
                          <button
                            type="button"
                            onClick={() => setIsCheckoutOpen(false)}
                            className="text-xs text-[#888888] hover:text-[#111111] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Shipping Inputs */}
                        <div className="space-y-3">
                          <input
                            type="text"
                            required
                            placeholder="Full Name *"
                            value={shippingForm.name}
                            onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#DF9F28]"
                          />

                          <input
                            type="tel"
                            required
                            placeholder="Phone Number (e.g. +91 98765 43210) *"
                            value={shippingForm.phone}
                            onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#DF9F28]"
                          />

                          <input
                            type="text"
                            required
                            placeholder="Street Address, House/Apt No *"
                            value={shippingForm.street}
                            onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#DF9F28]"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder="City *"
                              value={shippingForm.city}
                              onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#DF9F28]"
                            />
                            <input
                              type="text"
                              required
                              placeholder="State *"
                              value={shippingForm.state}
                              onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#DF9F28]"
                            />
                          </div>

                          <input
                            type="text"
                            required
                            placeholder="PIN / Postal Code *"
                            value={shippingForm.pincode}
                            onChange={(e) => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#DF9F28]"
                          />
                        </div>

                        {/* Payment Method Selector */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]">
                            Select Payment Method
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('RAZORPAY')}
                              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                paymentMethod === 'RAZORPAY'
                                  ? 'border-2 border-[#DF9F28] bg-[#FEF8EE] text-[#111111] shadow-xs'
                                  : 'border-slate-200 bg-[#F8FAFC] text-[#555555] hover:bg-white'
                              }`}
                            >
                              <CreditCard className="w-4 h-4 text-[#DF9F28]" />
                              <span>Online (Razorpay)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMethod('COD')}
                              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                paymentMethod === 'COD'
                                  ? 'border-2 border-[#DF9F28] bg-[#FEF8EE] text-[#111111] shadow-xs'
                                  : 'border-slate-200 bg-[#F8FAFC] text-[#555555] hover:bg-white'
                              }`}
                            >
                              <Truck className="w-4 h-4 text-[#DF9F28]" />
                              <span>Cash on Delivery</span>
                            </button>
                          </div>
                        </div>

                        {checkoutError && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                            {checkoutError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-[#DF9F28] hover:bg-[#C6891E] disabled:opacity-50 text-[#111111] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing Order...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {paymentMethod === 'COD'
                                  ? `Confirm Order (₹${finalTotal.toLocaleString('en-IN')})`
                                  : `Pay Online (₹${finalTotal.toLocaleString('en-IN')})`}
                              </span>
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Security Guarantees */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-[#888888]">
                      <Lock className="w-3.5 h-3.5 text-[#DF9F28]" />
                      <span>100% Encrypted & Safe Transaction</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
