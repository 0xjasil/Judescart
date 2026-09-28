'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingBag,
  Heart,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  Scale,
  Trophy,
  Crown,
  Ruler,
  AlertCircle,
  Tag,
  Sparkles,
  Plus,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getApiUrl } from '@/lib/api';

interface ProductSummary {
  id: string | number;
  variantId?: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  subimage?: string[];
  description?: string;
  rating?: number;
  reviewsCount?: number;
  isNewArrival?: boolean;
  isCustomerFavorite?: boolean;
}

const PRICE_RANGES = [
  { label: 'Under ₹2,000', value: '0-2000' },
  { label: '₹2,000 - ₹5,000', value: '2000-5000' },
  { label: '₹5,000 - ₹10,000', value: '5000-10000' },
  { label: 'Above ₹10,000', value: '10000-999999' },
];

const DEFAULT_FALLBACK_PRODUCTS: ProductSummary[] = [
  {
    id: 'prod-1',
    name: 'The Oversized Double-Breasted Cocoon Coat',
    category: 'Apparel',
    brand: 'JudesCart',
    image: '/prod_overshirt_1778670536589.png',
    subimage: [
      '/prod_overshirt_1778670536589.png',
      '/cat_apparel_1778670103427.png',
      '/about_craftsmanship.png',
    ],
    description: 'An architectural winter staple with dropped shoulders, sharp peak lapels, and deep welt pockets. Engineered to provide warmth down to -10°C with an effortless silhouette.',
    isNewArrival: true,
    isCustomerFavorite: true,
    price: 58820,
    originalPrice: 68335,
    rating: 4.9,
    reviewsCount: 19,
  },
  {
    id: 'prod-2',
    name: 'The Mongolian Cashmere Cardigan',
    category: 'Apparel',
    brand: 'JudesCart',
    image: '/cat_apparel_1778670103427.png',
    subimage: [
      '/cat_apparel_1778670103427.png',
      '/prod_overshirt_1778670536589.png',
    ],
    description: 'Pure 2-ply grade-A cashmere cardigan with custom horn buttons and ribbed trim.',
    isCustomerFavorite: true,
    price: 29410,
    originalPrice: 36330,
    rating: 4.9,
    reviewsCount: 48,
  },
  {
    id: 'prod-3',
    name: 'The Meridian Merino Wool Utility Overshirt',
    category: 'Apparel',
    brand: 'JudesCart',
    image: '/prod_overshirt_1778670536589.png',
    subimage: [
      '/prod_overshirt_1778670536589.png',
      '/cat_leather_1778670351299.png',
    ],
    description: 'Fine spun merino wool overshirt with reinforced twin chest pockets and tailored seams.',
    isNewArrival: true,
    price: 24220,
    originalPrice: 28500,
    rating: 4.8,
    reviewsCount: 36,
  },
  {
    id: 'prod-4',
    name: 'Heritage Full-Grain Leather Briefcase',
    category: 'Leather Goods',
    brand: 'JudesCart',
    image: '/cat_leather_1778670351299.png',
    subimage: [
      '/cat_leather_1778670351299.png',
      '/about_craftsmanship.png',
    ],
    description: 'Artisan vegetable-tanned leather briefcase with solid brass lock hardware and padded laptop sleeve.',
    isCustomerFavorite: true,
    price: 8499,
    originalPrice: 10499,
    rating: 4.9,
    reviewsCount: 84,
  },
  {
    id: 'prod-5',
    name: 'Minimalist Burnished Leather Bifold Wallet',
    category: 'Accessories',
    brand: 'JudesCart',
    image: '/cat_accessories_1778670517925.png',
    subimage: [
      '/cat_accessories_1778670517925.png',
      '/cat_leather_1778670351299.png',
    ],
    description: 'Top grain burnished leather bifold featuring RFID blocking protective weave and 8 card slots.',
    isNewArrival: true,
    price: 1999,
    originalPrice: 2499,
    rating: 4.9,
    reviewsCount: 215,
  },
  {
    id: 'prod-6',
    name: 'The Voyager Full-Grain Leather Weekender Duffel',
    category: 'Leather Goods',
    brand: 'JudesCart',
    image: '/about_craftsmanship.png',
    subimage: [
      '/about_craftsmanship.png',
      '/cat_leather_1778670351299.png',
    ],
    description: 'Spacious handcrafted weekend duffel crafted from full-grain pull-up leather with detachable shoulder strap.',
    isCustomerFavorite: true,
    price: 14999,
    originalPrice: 17999,
    rating: 4.9,
    reviewsCount: 62,
  },
];

const PRODUCT_COLORS = [
  { name: 'Camel Heather', hex: '#C19A6B' },
  { name: 'Deep Navy', hex: '#1C2833' },
  { name: 'Pitch Black', hex: '#111111' },
];

const PRODUCT_SIZES = [
  { label: '36 FR / 2 US', status: 'Low' },
  { label: '38 FR / 4 US', status: '' },
  { label: '40 FR / 6 US', status: 'Low' },
  { label: '42 FR / 8 US', status: 'Out', disabled: true },
];

function ProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Query Params
  const selectedId = searchParams.get('id');
  const selectedCategoryParam = searchParams.get('category');
  const searchQueryParam = searchParams.get('search') || '';

  // Single Product State
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRODUCT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState(PRODUCT_SIZES[0].label);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accordion states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    craftsmanship: true,
    shipping: false,
    reviews: false,
  });

  // Frequently Bought Together Bundle State
  const [bundleAddons, setBundleAddons] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
  });

  // Catalog Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Data fetching state
  const [allProducts, setAllProducts] = useState<ProductSummary[]>(DEFAULT_FALLBACK_PRODUCTS);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Initial category filter from URL param
  useEffect(() => {
    if (selectedCategoryParam) {
      setSelectedCategories([selectedCategoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [selectedCategoryParam]);

  // 2. Fetch categories
  useEffect(() => {
    fetch(`${getApiUrl()}/categories`)
      .then((r) => r.json())
      .then((res) => {
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        if (list.length > 0) {
          setCategoriesList(list);
        }
      })
      .catch(() => {
        setCategoriesList([
          { id: '1', name: 'Apparel' },
          { id: '2', name: 'Leather Goods' },
          { id: '3', name: 'Accessories' },
          { id: '4', name: 'Footwear' },
          { id: '5', name: 'Electronics' },
          { id: '6', name: 'Home & Living' },
        ]);
      });
  }, []);

  // 3. Fetch products list
  useEffect(() => {
    fetch(`${getApiUrl()}/products?limit=50`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ProductSummary[] = res.data.map((p: any) => {
            const firstVariant = p.variants?.[0];
            const priceVal = Number(firstVariant?.offerPrice || firstVariant?.price || p.price || 2999);
            const origPriceVal = Number(firstVariant?.price || p.originalPrice || Math.round(priceVal * 1.2));
            return {
              id: p.id,
              name: p.name,
              category: p.category?.name || 'Apparel',
              brand: p.brand?.name || 'JudesCart',
              price: priceVal,
              originalPrice: origPriceVal,
              image: p.image || p.images?.[0] || '/prod_overshirt_1778670536589.png',
              subimage: p.subimage && p.subimage.length > 0 ? p.subimage : (p.images && p.images.length > 0 ? p.images : ['/prod_overshirt_1778670536589.png', '/cat_apparel_1778670103427.png']),
              description: p.description || 'Crafted with premium natural materials and master tailoring techniques.',
              isNewArrival: p.isNewArrival || false,
              isCustomerFavorite: p.isCustomerFavorite || false,
            };
          });
          setAllProducts(mapped);
        }
      })
      .catch(() => {
        setAllProducts(DEFAULT_FALLBACK_PRODUCTS);
      });
  }, []);

  // 4. Handle ?id= selected product
  useEffect(() => {
    if (!selectedId) {
      setSelectedProduct(null);
      return;
    }

    const found = allProducts.find((p) => String(p.id) === String(selectedId));
    if (found) {
      setSelectedProduct(found);
      setActiveImageIndex(0);
    } else {
      // Fetch specifically or fallback
      fetch(`${getApiUrl()}/products/${selectedId}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) {
            const p = res.data;
            setSelectedProduct({
              id: p.id,
              name: p.name,
              category: p.category?.name || 'Apparel',
              brand: 'JudesCart',
              price: Number(p.price) || 2999,
              originalPrice: p.price ? Math.round(Number(p.price) * 1.2) : 3599,
              image: p.images?.[0] || p.image || '/prod_overshirt_1778670536589.png',
              subimage: p.images || ['/prod_overshirt_1778670536589.png', '/cat_apparel_1778670103427.png'],
              description: p.description,
              isNewArrival: p.isNewArrival,
              isCustomerFavorite: p.isCustomerFavorite,
            });
            setActiveImageIndex(0);
          } else {
            setSelectedProduct(DEFAULT_FALLBACK_PRODUCTS[0]);
          }
        })
        .catch(() => {
          setSelectedProduct(DEFAULT_FALLBACK_PRODUCTS[0]);
        });
    }
  }, [selectedId, allProducts]);

  // Gallery Images Array
  const currentImages = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.subimage && selectedProduct.subimage.length > 0) {
      return selectedProduct.subimage;
    }
    return [selectedProduct.image, '/cat_apparel_1778670103427.png', '/about_craftsmanship.png'];
  }, [selectedProduct]);

  const activeImageSrc = currentImages[activeImageIndex] || selectedProduct?.image || '/prod_overshirt_1778670536589.png';

  // Wishlist Check
  const isFavorited = selectedProduct ? isInWishlist(selectedProduct.id) : false;

  const handleWishlistToggle = () => {
    if (!selectedProduct) return;
    if (isFavorited) {
      removeFromWishlist(selectedProduct.id);
      showToast('Removed from wishlist');
    } else {
      addToWishlist({
        id: String(selectedProduct.id),
        productId: selectedProduct.id,
        title: selectedProduct.name,
        category: selectedProduct.category,
        price: selectedProduct.price,
        image: selectedProduct.image,
      });
      showToast('Added to wishlist');
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(
      {
        id: selectedProduct.id,
        name: `${selectedProduct.name} (${selectedColor.name}, ${selectedSize})`,
        price: selectedProduct.price,
        image: activeImageSrc,
        category: selectedProduct.category,
      },
      quantity
    );
    showToast(`Added ${quantity} item(s) to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedProduct?.name || 'JudesCart Product',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard');
    }
  };

  // Bundle Calculations
  const bundleAddon1 = allProducts.find((p) => String(p.id) === 'prod-2') || DEFAULT_FALLBACK_PRODUCTS[1];
  const bundleAddon2 = allProducts.find((p) => String(p.id) === 'prod-3') || DEFAULT_FALLBACK_PRODUCTS[2];

  const bundleTotalRaw = useMemo(() => {
    let total = selectedProduct?.price || 0;
    if (bundleAddons[1]) total += bundleAddon1.price;
    if (bundleAddons[2]) total += bundleAddon2.price;
    return total;
  }, [selectedProduct, bundleAddons, bundleAddon1, bundleAddon2]);

  const bundleDiscount = Math.round(bundleTotalRaw * 0.15);
  const bundleFinalPrice = bundleTotalRaw - bundleDiscount;
  const bundleCount = 1 + (bundleAddons[1] ? 1 : 0) + (bundleAddons[2] ? 1 : 0);

  const handleAddBundleToCart = () => {
    if (selectedProduct) {
      addToCart({ id: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price, image: selectedProduct.image, category: selectedProduct.category });
    }
    if (bundleAddons[1]) {
      addToCart({ id: bundleAddon1.id, name: bundleAddon1.name, price: bundleAddon1.price, image: bundleAddon1.image, category: bundleAddon1.category });
    }
    if (bundleAddons[2]) {
      addToCart({ id: bundleAddon2.id, name: bundleAddon2.name, price: bundleAddon2.price, image: bundleAddon2.image, category: bundleAddon2.category });
    }
    showToast(`Added ${bundleCount} bundle items to bag with 15% savings!`);
  };

  // Filter & Search Logic for Catalog View
  const filteredProducts = useMemo(() => {
    return allProducts.filter((prod) => {
      // Category filter
      if (selectedCategories.length > 0) {
        const matchCat = selectedCategories.some((c) =>
          prod.category.toLowerCase().includes(c.toLowerCase())
        );
        if (!matchCat) return false;
      }

      // Price Range filter
      if (selectedPriceRanges.length > 0) {
        const matchPrice = selectedPriceRanges.some((range) => {
          const [min, max] = range.split('-').map(Number);
          return prod.price >= min && prod.price <= max;
        });
        if (!matchPrice) return false;
      }

      // Search Query
      if (searchQueryParam) {
        const query = searchQueryParam.toLowerCase();
        return (
          prod.name.toLowerCase().includes(query) ||
          prod.category.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [allProducts, selectedCategories, selectedPriceRanges, searchQueryParam]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111111] font-sans flex flex-col justify-between">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border border-[#061B3A] animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#DF9F28]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SINGLE PRODUCT DETAIL VIEW (When a product is selected via ?id=...)   */}
      {/* ========================================================================= */}
      {selectedProduct ? (
        <main className="flex-1 pb-24">
          {/* Breadcrumbs Row */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-xs text-[#888888]">
              <Link href="/" className="hover:text-[#DF9F28] transition-colors">
                Home
              </Link>
              <span>/</span>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  router.push('/product');
                }}
                className="hover:text-[#DF9F28] transition-colors cursor-pointer"
              >
                All Products
              </button>
              <span>/</span>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  router.push(`/product?category=${encodeURIComponent(selectedProduct.category)}`);
                }}
                className="hover:text-[#DF9F28] transition-colors uppercase font-medium cursor-pointer"
              >
                {selectedProduct.category}
              </button>
              <span>/</span>
              <span className="text-[#111111] font-bold truncate max-w-[240px] sm:max-w-none">
                {selectedProduct.name}
              </span>
            </nav>
          </div>

          {/* Main Product Showcase Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              
              {/* LEFT COLUMN: Gallery & Thumbnails */}
              <div className="lg:col-span-7">
                <div className="flex flex-col-reverse lg:flex-row gap-4">
                  
                  {/* Thumbnails Strip */}
                  <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[580px] pb-2 lg:pb-0 scrollbar-none">
                    {currentImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-24 lg:w-20 lg:h-26 rounded-xl overflow-hidden bg-white shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-[#DF9F28] shadow-md ring-2 ring-[#FEF8EE]'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <Image
                          src={img}
                          alt={`${selectedProduct.name} thumbnail ${idx + 1}`}
                          fill
                          unoptimized
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Main Large Hero Image */}
                  <div
                    className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white group border border-slate-200 shadow-sm cursor-crosshair"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                  >
                    <Image
                      src={activeImageSrc}
                      alt={`${selectedProduct.name} full view`}
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className={`object-cover transition-transform duration-300 ${
                        isZoomed ? 'scale-125' : 'scale-100'
                      }`}
                    />

                    {/* Floating Zoom Badge */}
                    <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#555555] text-[11px] font-medium border border-slate-200 pointer-events-none flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shadow-2xs">
                      <ZoomIn className="w-3.5 h-3.5 text-[#DF9F28]" />
                      <span>Hover to Zoom</span>
                    </div>

                    {/* Mobile Carousel Arrow Controls */}
                    <div className="lg:hidden absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : currentImages.length - 1));
                        }}
                        className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-md text-[#111111] pointer-events-auto hover:bg-white transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev < currentImages.length - 1 ? prev + 1 : 0));
                        }}
                        className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-md text-[#111111] pointer-events-auto hover:bg-white transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: Purchasing & Product Specifications */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                
                {/* Header: Category, Status Badge & Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#DF9F28]">
                      {selectedProduct.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#FEF8EE] text-[#DF9F28] border border-[#DF9F28]/30">
                      Limited Edition
                    </span>
                  </div>

                  <h1 className="font-sans text-xl sm:text-2xl lg:text-[28px] font-extrabold text-[#111111] leading-tight">
                    {selectedProduct.name}
                  </h1>

                  {/* Price & Star Ratings Row */}
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-[#111111]">
                        ₹{selectedProduct.price.toLocaleString('en-IN')}
                      </span>
                      {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-sm text-[#888888] line-through">
                          ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <span className="text-slate-300">•</span>

                    <div className="inline-flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-[#DF9F28]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#DF9F28] text-[#DF9F28]" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#111111]">{selectedProduct.rating || 4.9}</span>
                      <span className="text-xs text-[#888888]">({selectedProduct.reviewsCount || 19})</span>
                    </div>
                  </div>
                </div>

                {/* Material Intro & Description */}
                <div className="space-y-2 text-xs sm:text-sm text-[#555555] leading-relaxed pt-1 border-t border-slate-200">
                  <p className="font-semibold text-[#111111]">
                    100% virgin Melton wool with cupro lining
                  </p>
                  <p>
                    {selectedProduct.description ||
                      'An architectural winter staple with dropped shoulders, sharp peak lapels, and deep welt pockets. Engineered to provide warmth down to -10°C with an effortless silhouette.'}
                  </p>
                </div>

                {/* JUDESCART LUCKY DRAW REWARDS CARD */}
                <div className="p-4 rounded-2xl bg-[#FEF8EE] border border-[#DF9F28]/30 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#111111] uppercase tracking-wider">
                      <Trophy className="w-4 h-4 text-[#DF9F28]" />
                      <span>JudesCart Lucky Draw Rewards</span>
                    </div>
                    <Link href="/lucky-draw" className="text-[11px] font-bold text-[#DF9F28] hover:text-[#C6891E] hover:underline">
                      Draw Rules &amp; Schedule →
                    </Link>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-[#DF9F28]/30 text-[#111111]">
                      <span className="text-base leading-none">🎟️</span>
                      <div>
                        <strong className="block font-bold">Qualifies for Platinum Draw</strong>
                        <span className="text-[11px] text-[#555555]">
                          This purchase automatically generates a Platinum Ticket for the monthly luxury gadget draw.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#DF9F28]/30 text-[#111111]">
                      <Crown className="w-4 h-4 text-[#DF9F28] mt-0.5 shrink-0" />
                      <div>
                        <strong className="block font-extrabold text-[#111111]">
                          Official Brand JUDES: Mega Bumper Draw Token!
                        </strong>
                        <span className="text-[11px] text-[#555555]">
                          Includes automatic entry into the 6–12 month Grand Bumper Draw for luxury vehicles &amp; ₹5,00,000 cash!
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color & Size Selectors */}
                <div className="pt-2 border-t border-slate-200 space-y-5">
                  
                  {/* Color Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold uppercase tracking-wider text-[#111111]">
                        Color: <span className="font-normal text-[#555555]">{selectedColor.name}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {PRODUCT_COLORS.map((col) => (
                        <button
                          key={col.name}
                          type="button"
                          title={col.name}
                          onClick={() => setSelectedColor(col)}
                          className={`relative w-8 h-8 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                            selectedColor.name === col.name
                              ? 'ring-2 ring-[#DF9F28] ring-offset-2 scale-105 border-transparent shadow-xs'
                              : 'border-slate-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                        >
                          {selectedColor.name === col.name && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold uppercase tracking-wider text-[#111111]">Size:</span>
                        <span className="flex items-center gap-1 text-[11px] text-[#DF9F28] font-bold">
                          <AlertCircle className="w-3 h-3 text-[#DF9F28]" />
                          Only 2 remaining
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAccordion('craftsmanship')}
                        className="flex items-center gap-1 text-[#DF9F28] hover:text-[#C6891E] transition-colors font-semibold text-[11px] underline cursor-pointer"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        <span>Size Guide</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {PRODUCT_SIZES.map((sz) => (
                        <button
                          key={sz.label}
                          type="button"
                          disabled={sz.disabled}
                          onClick={() => setSelectedSize(sz.label)}
                          className={`py-3 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                            sz.disabled
                              ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                              : selectedSize === sz.label
                              ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-sm'
                              : 'border-slate-200 text-[#111111] hover:border-[#DF9F28] hover:text-[#DF9F28] bg-white'
                          }`}
                        >
                          <span>{sz.label}</span>
                          {sz.status === 'Low' && (
                            <span className="text-[9px] text-[#DF9F28] font-bold mt-0.5">Low</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-4 pt-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-slate-200 rounded-full bg-white px-2 py-1 shadow-2xs">
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-[#555555] hover:bg-[#FEF8EE] hover:text-[#DF9F28] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-semibold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#111111] font-mono">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-[#555555] hover:bg-[#FEF8EE] hover:text-[#DF9F28] transition-colors text-sm font-semibold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>

                {/* Primary Purchasing Actions */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#DF9F28]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#111111]" />
                      <span>Add to Bag • ₹{(selectedProduct.price * quantity).toLocaleString('en-IN')}</span>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={handleWishlistToggle}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-[#DF9F28] transition-colors shadow-2xs text-[#111111] hover:bg-[#FEF8EE] cursor-pointer"
                      aria-label="Save to wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-[#DF9F28] text-[#DF9F28]' : ''}`} />
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-[#DF9F28] transition-colors shadow-2xs text-[#111111] hover:bg-[#FEF8EE] cursor-pointer"
                      aria-label="Share product"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>

                    {/* Compare Button */}
                    <button
                      type="button"
                      onClick={() => showToast('Added to product comparison list')}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-[#DF9F28] transition-colors shadow-2xs text-[#111111] hover:bg-[#FEF8EE] cursor-pointer"
                      aria-label="Compare product"
                    >
                      <Scale className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#0A192F] hover:bg-[#061B3A] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Instant Checkout — Buy Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Trust Badges Strip */}
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-[#FEF8EE] border border-[#DF9F28]/20 text-[11px] text-[#555555] text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-[#DF9F28]" />
                    <span className="font-semibold text-[#111111]">Free Express Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-4 h-4 text-[#DF9F28]" />
                    <span className="font-semibold text-[#111111]">30-Day Easy Returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#DF9F28]" />
                    <span className="font-semibold text-[#111111]">Buyer Protection</span>
                  </div>
                </div>

                {/* Collapsible Accordions */}
                <div className="pt-2">
                  <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
                    
                    {/* Accordion 1: Details & Craftsmanship */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => toggleAccordion('craftsmanship')}
                        className="flex items-center justify-between w-full py-4 text-left group cursor-pointer"
                        aria-expanded={openAccordions.craftsmanship}
                      >
                        <span className="text-sm font-semibold text-[#111111] group-hover:text-[#DF9F28] transition-colors">
                          Details &amp; Craftsmanship
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#888888] group-hover:text-[#DF9F28] transition-transform duration-200 ${
                            openAccordions.craftsmanship ? 'rotate-180 text-[#DF9F28]' : ''
                          }`}
                        />
                      </button>
                      {openAccordions.craftsmanship && (
                        <div className="pb-5 pt-1 text-xs text-[#555555] leading-relaxed space-y-2.5 animate-in fade-in-50 duration-150">
                          <p><strong className="text-[#111111]">Materials:</strong> 100% Heavy Virgin Melton Wool (650g/m²), 100% Bemberg Cupro lining</p>
                          <p><strong className="text-[#111111]">Provenance:</strong> Crafted with Master Tailoring in Lyon, France</p>
                          <p><strong className="text-[#111111]">Care Instructions:</strong> Specialist dry clean only. Steam gently.</p>
                          <p><strong className="text-[#111111]">Environmental Integrity:</strong> Responsible Wool Standard (RWS) certified ethical shearing.</p>
                        </div>
                      )}
                    </div>

                    {/* Accordion 2: Complimentary Shipping & Returns */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => toggleAccordion('shipping')}
                        className="flex items-center justify-between w-full py-4 text-left group cursor-pointer"
                        aria-expanded={openAccordions.shipping}
                      >
                        <span className="text-sm font-semibold text-[#111111] group-hover:text-[#DF9F28] transition-colors">
                          Complimentary Shipping &amp; Returns
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#888888] group-hover:text-[#DF9F28] transition-transform duration-200 ${
                            openAccordions.shipping ? 'rotate-180 text-[#DF9F28]' : ''
                          }`}
                        />
                      </button>
                      {openAccordions.shipping && (
                        <div className="pb-5 pt-1 text-xs text-[#555555] leading-relaxed space-y-2 animate-in fade-in-50 duration-150">
                          <p>Complimentary express courier shipping across India on all verified customer orders above ₹999.</p>
                          <p>Dispatch occurs within 24–48 business hours with live end-to-end SMS tracking updates.</p>
                          <p>Hassle-free 30-day exchange window for sizing and silhouette tailoring preferences.</p>
                        </div>
                      )}
                    </div>

                    {/* Accordion 3: Client Reviews */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => toggleAccordion('reviews')}
                        className="flex items-center justify-between w-full py-4 text-left group cursor-pointer"
                        aria-expanded={openAccordions.reviews}
                      >
                        <span className="text-sm font-semibold text-[#111111] group-hover:text-[#DF9F28] transition-colors">
                          Client Reviews ({selectedProduct.reviewsCount || 19})
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#888888] group-hover:text-[#DF9F28] transition-transform duration-200 ${
                            openAccordions.reviews ? 'rotate-180 text-[#DF9F28]' : ''
                          }`}
                        />
                      </button>
                      {openAccordions.reviews && (
                        <div className="pb-5 pt-1 text-xs text-[#555555] leading-relaxed space-y-3 animate-in fade-in-50 duration-150">
                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[#DF9F28]">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-[#DF9F28]" />
                              ))}
                            </div>
                            <span className="font-bold text-[#111111]">4.9 / 5.0</span>
                            <span className="text-[#888888]">100% Verified Buyer Rating</span>
                          </div>
                          <p className="italic text-[#555555]">
                            "The fabric weight, drafting, and drape exceed expectation. Fits true to size with effortless elegance." — Rajesh K.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* CURATED BUNDLE: Frequently Bought Together                               */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
            <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#DF9F28]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Curated Bundle Discount</span>
                  </div>
                  <h3 className="font-sans text-xl font-extrabold text-[#111111] mt-0.5">
                    Frequently Bought Together
                  </h3>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF8EE] text-[#DF9F28] text-xs font-bold border border-[#DF9F28]/30">
                  <Sparkles className="w-3.5 h-3.5 text-[#DF9F28]" />
                  <span>Save 15% on this combined bundle</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Bundle Items Selector */}
                <div className="lg:col-span-8 flex flex-wrap items-center gap-3 sm:gap-4">
                  
                  {/* Item 1: Main Product */}
                  <div className="relative p-3 rounded-2xl border-2 border-[#DF9F28] bg-[#FEF8EE]/50 shadow-xs flex flex-col items-center w-36 sm:w-44 text-center group">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white mb-2.5">
                      <Image
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="w-full flex items-center justify-center gap-1.5 mb-1">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="rounded border-slate-300 text-[#DF9F28] focus:ring-[#DF9F28] accent-[#DF9F28] cursor-pointer"
                      />
                      <span className="text-[10px] uppercase font-bold text-[#555555] truncate">
                        This Item
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#111111] line-clamp-1 w-full">
                      {selectedProduct.name}
                    </h4>
                    <span className="text-xs font-black text-[#DF9F28] mt-0.5">
                      ₹{selectedProduct.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-bold shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>

                  {/* Item 2: Addon 1 */}
                  <div
                    onClick={() => setBundleAddons((p) => ({ ...p, 1: !p[1] }))}
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center w-36 sm:w-44 text-center group ${
                      bundleAddons[1]
                        ? 'border-2 border-[#DF9F28] bg-[#FEF8EE]/50 shadow-xs'
                        : 'border-slate-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white mb-2.5">
                      <Image
                        src={bundleAddon1.image}
                        alt={bundleAddon1.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="w-full flex items-center justify-center gap-1.5 mb-1">
                      <input
                        type="checkbox"
                        checked={bundleAddons[1]}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#DF9F28] focus:ring-[#DF9F28] accent-[#DF9F28] cursor-pointer"
                      />
                      <span className="text-[10px] uppercase font-bold text-[#555555] truncate">
                        Add-on
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#111111] line-clamp-1 w-full">
                      {bundleAddon1.name}
                    </h4>
                    <span className="text-xs font-black text-[#DF9F28] mt-0.5">
                      ₹{bundleAddon1.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-bold shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>

                  {/* Item 3: Addon 2 */}
                  <div
                    onClick={() => setBundleAddons((p) => ({ ...p, 2: !p[2] }))}
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center w-36 sm:w-44 text-center group ${
                      bundleAddons[2]
                        ? 'border-2 border-[#DF9F28] bg-[#FEF8EE]/50 shadow-xs'
                        : 'border-slate-200 bg-white opacity-60'
                    }`}
                  >
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white mb-2.5">
                      <Image
                        src={bundleAddon2.image}
                        alt={bundleAddon2.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="w-full flex items-center justify-center gap-1.5 mb-1">
                      <input
                        type="checkbox"
                        checked={bundleAddons[2]}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#DF9F28] focus:ring-[#DF9F28] accent-[#DF9F28] cursor-pointer"
                      />
                      <span className="text-[10px] uppercase font-bold text-[#555555] truncate">
                        Add-on
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#111111] line-clamp-1 w-full">
                      {bundleAddon2.name}
                    </h4>
                    <span className="text-xs font-black text-[#DF9F28] mt-0.5">
                      ₹{bundleAddon2.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                </div>

                {/* Bundle Summary & CTA */}
                <div className="lg:col-span-4 p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4">
                  <div className="space-y-1.5 text-xs text-[#555555]">
                    <div className="flex justify-between">
                      <span>Selected ({bundleCount} items):</span>
                      <span className="font-semibold text-[#111111]">
                        ₹{bundleTotalRaw.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#DF9F28] font-bold">
                      <span>15% Bundle Savings:</span>
                      <span>-₹{bundleDiscount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="font-bold text-[#111111]">Total Price:</span>
                      <span className="text-xl font-black text-[#111111]">
                        ₹{bundleFinalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBundleToCart}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#111111]" />
                    <span>Add {bundleCount} Items To Bag</span>
                  </button>
                </div>

              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* RELATED & RECOMMENDED PRODUCTS SECTION                                    */}
          {/* ========================================================================= */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            <div className="space-y-4">
              <div className="text-center space-y-0.5">
                <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-[#DF9F28]">
                  Curated For You
                </span>
                <h2 className="font-sans text-xl sm:text-2xl font-semibold text-[#111111]">
                  Related &amp; Recommended Products
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4 pt-2">
                {allProducts
                  .filter((p) => String(p.id) !== String(selectedProduct.id))
                  .slice(0, 4)
                  .map((prod) => (
                    <ProductCard
                      key={prod.id}
                      id={prod.id}
                      name={prod.name}
                      description={prod.description}
                      category={prod.category}
                      brand={prod.brand || 'JudesCart'}
                      price={prod.price}
                      originalPrice={prod.originalPrice}
                      image={prod.image}
                      rating={prod.rating || 4.9}
                      reviewsCount={prod.reviewsCount || 112}
                      isNewArrival={prod.isNewArrival}
                      isCustomerFavorite={prod.isCustomerFavorite}
                    />
                  ))}
              </div>
            </div>
          </section>

          {/* Mobile Bottom Fixed Quick Buy Bar */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-11 h-13 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200">
                  <Image
                    src={activeImageSrc}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-sans font-bold text-[#111111] truncate">
                    {selectedProduct.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#555555]">
                    <span className="font-bold text-[#111111]">
                      ₹{selectedProduct.price.toLocaleString('en-IN')}
                    </span>
                    <span>•</span>
                    <span className="truncate">{selectedColor.name}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] shadow-[#DF9F28]/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>

        </main>
      ) : (
        /* ========================================================================= */
        /* 2. CATALOG LISTING VIEW (Default view when browsing /product)             */
        /* ========================================================================= */
        <main className="flex-1 py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Catalog Header */}
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-[0.2em] text-[#DF9F28] uppercase">
                JudesCart Catalog
              </span>
              <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-[#111111] tracking-tight">
                All Collections &amp; Apparel
              </h1>
              <p className="text-xs sm:text-sm text-[#555555]">
                Showing {filteredProducts.length} curated products
              </p>
            </div>

            {/* Filter Bar & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0A192F] text-white text-xs font-bold hover:bg-[#061B3A] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#DF9F28]" />
                  <span>Filters</span>
                </button>

                <p className="text-xs text-[#555555] hidden sm:block">
                  Filter by Category &amp; Price using the sidebar
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-[#555555] font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold text-[#111111] bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#DF9F28]"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Main Catalog Grid with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Desktop Filters Sidebar */}
              <aside className={`lg:col-span-3 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                      Filters
                    </span>
                    {(selectedCategories.length > 0 || selectedPriceRanges.length > 0) && (
                      <button
                        onClick={() => {
                          setSelectedCategories([]);
                          setSelectedPriceRanges([]);
                        }}
                        className="text-[11px] font-bold text-[#DF9F28] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Categories Filter */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                      Category
                    </span>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedCategories([])}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedCategories.length === 0
                            ? 'bg-[#FEF8EE] text-[#DF9F28] font-bold'
                            : 'text-[#555555] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        All Categories
                      </button>
                      {categoriesList.map((cat) => {
                        const isChecked = selectedCategories.includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategories((prev) =>
                                isChecked ? prev.filter((c) => c !== cat.name) : [...prev, cat.name]
                              );
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                              isChecked
                                ? 'bg-[#FEF8EE] text-[#DF9F28] font-bold'
                                : 'text-[#555555] hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <span>{cat.name}</span>
                            {isChecked && <Check className="w-3.5 h-3.5 text-[#DF9F28]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Ranges Filter */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                      Price Range
                    </span>
                    <div className="space-y-2">
                      {PRICE_RANGES.map((pr) => {
                        const isChecked = selectedPriceRanges.includes(pr.value);
                        return (
                          <label
                            key={pr.value}
                            className="flex items-center gap-2.5 text-xs text-[#555555] cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedPriceRanges((prev) =>
                                  isChecked ? prev.filter((v) => v !== pr.value) : [...prev, pr.value]
                                );
                              }}
                              className="rounded border-slate-300 text-[#DF9F28] focus:ring-[#DF9F28] accent-[#DF9F28]"
                            />
                            <span>{pr.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </aside>

              {/* Products Catalog Cards Grid */}
              <div className="lg:col-span-9">
                {filteredProducts.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-lg border border-slate-200 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FEF8EE] text-[#DF9F28] flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h3 className="font-sans text-lg font-semibold text-[#111111]">
                      No products matched your criteria
                    </h3>
                    <p className="text-xs text-[#555555] max-w-sm mx-auto font-normal">
                      Try clearing filters or search terms to discover more items in our luxury catalog.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setSelectedPriceRanges([]);
                        router.push('/product');
                      }}
                      className="px-5 py-2 rounded-md bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-xs font-semibold tracking-wider uppercase transition-all shadow-2xs cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        id={prod.id}
                        name={prod.name}
                        description={prod.description}
                        category={prod.category}
                        brand={prod.brand || 'JudesCart'}
                        price={prod.price}
                        originalPrice={prod.originalPrice}
                        image={prod.image}
                        rating={prod.rating || 4.9}
                        reviewsCount={prod.reviewsCount || 88}
                        isNewArrival={prod.isNewArrival}
                        isCustomerFavorite={prod.isCustomerFavorite}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#DF9F28] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
