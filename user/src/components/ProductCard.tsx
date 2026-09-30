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
      className="group relative flex flex-col rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden hover:shadow-md hover:border-[#DF9F28] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Portrait Aspect Ratio & Rounded Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 rounded-t-2xl">
        <Link href={`/product?id=${encodeURIComponent(String(id))}`} className="relative block w-full h-full focus-visible:outline-none">
          <Image
            src={cardImg || '/prod_overshirt_1778670536589.png'}
            alt={name}
            fill
            unoptimized
            onError={() => setCardImg('/prod_overshirt_1778670536589.png')}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Wishlist Button - Perfectly proportioned circular button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-[#E2E8F0] flex items-center justify-center text-[#374151] hover:text-rose-600 hover:bg-white transition-all active:scale-90 cursor-pointer shadow-xs"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Desktop Quick Action Floating Bar */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-20 transition-all duration-200 transform translate-y-2 opacity-0 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto hidden sm:block">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleQuickView}
              aria-label="Quick View"
              title="Quick View"
              className="w-9 h-9 rounded-xl bg-white text-[#374151] hover:text-[#111111] border border-[#E2E8F0] shadow-xs flex items-center justify-center cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex-1 h-9 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0A192F] hover:bg-[#DF9F28] hover:text-[#111111] text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Information Body - Clean & Simple (Taneira Style) */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-1 bg-white">
        {/* Product Title */}
        <Link href={`/product?id=${encodeURIComponent(String(id))}`} className="block group-hover:text-[#946000] transition-colors focus-visible:outline-none">
          <h3 className="text-xs sm:text-sm font-normal text-[#111111] leading-snug line-clamp-1 group-hover:text-[#946000]">
            {name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="pt-0.5 flex items-baseline gap-1.5">
          <span className="text-sm sm:text-[15px] font-bold text-[#111111]">
            ₹ {price.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[#64748B] font-normal line-through">
              ₹ {originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
