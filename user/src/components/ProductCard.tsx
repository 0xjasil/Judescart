'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Check, Star, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export interface ProductCardProps {
  id: string | number;
  variantId?: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  subimage?: string[];
  rating?: number;
  reviewsCount?: number;
  isNewArrival?: boolean;
  isCustomerFavorite?: boolean;
  onQuickView?: () => void;
}

export default function ProductCard({
  id,
  variantId,
  name,
  description,
  category = 'APPAREL',
  brand = 'JudesCart',
  price,
  originalPrice,
  image,
  subimage = [],
  rating = 4.9,
  reviewsCount = 128,
  isNewArrival = false,
  isCustomerFavorite = false,
  onQuickView,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isFavorited = isInWishlist ? isInWishlist(id) : false;

  // Calculate discount percentage if original price is higher
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Secondary hover image
  const secondaryImage = subimage && subimage.length > 0 ? subimage[0] : null;
  const displayImage = isHovered && secondaryImage ? secondaryImage : (image || '/prod_overshirt_1778670536589.png');

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id: String(id),
        productId: id,
        variantId: variantId,
        title: name,
        category: category,
        price: price,
        image: image,
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView();
    } else {
      router.push(`/product?id=${encodeURIComponent(String(id))}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: id,
      variantId: variantId,
      title: name,
      category: category,
      price: price,
      image: image,
      size: 'M',
      color: 'Classic',
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const [cardImg, setCardImg] = useState(displayImage);

  React.useEffect(() => {
    setCardImg(displayImage);
  }, [displayImage]);

  return (
    <div
      className="group relative flex flex-col rounded-lg bg-white border border-[#E2E8F0] overflow-hidden hover:shadow-md hover:border-[#DF9F28] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with 3:4 Aspect Ratio & Subtle Rounding */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <Link href={`/product?id=${encodeURIComponent(String(id))}`} className="relative block w-full h-full focus-visible:outline-none">
          <Image
            src={cardImg || '/prod_overshirt_1778670536589.png'}
            alt={name}
            fill
            unoptimized
            onError={() => setCardImg('/prod_overshirt_1778670536589.png')}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-300 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none flex flex-col gap-1">
          {hasDiscount ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[13px] font-medium bg-[#0A192F] text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          ) : isCustomerFavorite ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[13px] font-medium bg-[#DF9F28] text-[#111111] shadow-xs">
              Bestseller
            </span>
          ) : isNewArrival ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[13px] font-medium bg-[#0A192F] text-white shadow-xs">
              New
            </span>
          ) : null}
        </div>

        {/* Wishlist Button - 44px mobile touch target */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 z-10 min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg bg-white/95 backdrop-blur-xs border border-[#E2E8F0] flex items-center justify-center text-[#374151] hover:text-rose-600 hover:bg-white transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Desktop Quick Action Floating Bar */}
        <div className="absolute inset-x-2 bottom-2 z-20 transition-all duration-200 transform translate-y-2 opacity-0 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto hidden sm:block">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleQuickView}
              aria-label="Quick View"
              title="Quick View"
              className="w-9 h-9 rounded-lg bg-white text-[#374151] hover:text-[#111111] border border-[#E2E8F0] shadow-xs flex items-center justify-center cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex-1 h-10 px-3 rounded-lg text-[13px] font-medium tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0A192F] hover:bg-[#DF9F28] hover:text-[#111111] text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Information Body - Compact & Clean */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-1.5">
        <div className="space-y-1">
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[13px] uppercase tracking-wider font-medium text-[#946000]">
              {category}
            </span>
            <div className="flex items-center gap-1 text-[#374151]">
              <Star className="w-3.5 h-3.5 fill-[#DF9F28] text-[#DF9F28]" />
              <span className="text-[13px] font-medium text-[#111111]">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Title (WCAG 2.1 AA minimum 15px) */}
          <Link href={`/product?id=${encodeURIComponent(String(id))}`} className="block group-hover:text-[#946000] transition-colors focus-visible:outline-none">
            <h3 className="text-[15px] sm:text-base font-medium text-[#111111] leading-snug line-clamp-2">
              {name}
            </h3>
          </Link>
        </div>

        {/* Price & Mobile Actions (WCAG 2.1 AA minimum 16px for price) */}
        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-[17px] font-semibold text-[#111111]">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-[13px] text-[#4B5563] font-normal line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Mobile Quick Add - 44px tap target */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              aria-label="Add to bag"
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0A192F] text-white active:bg-[#DF9F28] active:text-[#111111]'
              }`}
            >
              {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
