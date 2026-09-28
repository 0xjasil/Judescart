'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Headphones,
  Shirt,
  Footprints,
  Briefcase,
  Home,
  Sparkles,
  Gift,
  Coins,
  Package,
  LogOut,
  Ticket,
  ArrowRight,
  Camera,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { authClient } from '@/lib/auth-client';
import CartDrawer from './CartDrawer';
import DailyGiftModal from './DailyGiftModal';
import SearchModal from './SearchModal';
import CurrencyModal, { CURRENCIES, Currency } from './CurrencyModal';
import AccountDrawer from './AccountDrawer';
import AuthModal from './AuthModal';
import { getApiUrl } from '@/lib/api';

export interface NavCategory {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
  directoryTitle: string;
  directorySubtitle: string;
  items: Array<{ title: string; href: string }>;
  featured: {
    badge: string;
    title: string;
    description: string;
    price: string;
    image: string;
    href: string;
  };
}

const NAVIGATION_CATEGORIES: NavCategory[] = [
  {
    id: 'all',
    label: 'All Products',
    href: '/product',
    icon: SlidersHorizontal,
    directoryTitle: 'ALL PRODUCTS DIRECTORY',
    directorySubtitle: 'Browse Entire Store Catalog',
    items: [
      { title: 'New Seasonal Arrivals', href: '/product?category=Apparel' },
      { title: 'Executive Leather Briefcases', href: '/product?category=Leather+Goods' },
      { title: 'Bespoke Tailored Blazers', href: '/product?category=Apparel' },
      { title: 'Fine Atelier Accessories', href: '/product?category=Accessories' },
    ],
    featured: {
      badge: 'Top Recommendation',
      title: 'JudesCart Utility Wool Overshirt',
      description: 'Engineered from premium organic wool blend with clean sartorial drape.',
      price: '₹4,299',
      image: '/prod_overshirt_1778670536589.png',
      href: '/product?id=prod-1',
    },
  },
  {
    id: 'electronics',
    label: 'Electronics',
    href: '/product?category=electronics',
    icon: Headphones,
    popular: true,
    directoryTitle: 'ELECTRONICS DIRECTORY',
    directorySubtitle: 'Explore Popular Collections',
    items: [
      { title: 'ANC Wireless Headphones', href: '/product?category=electronics' },
      { title: 'Smart Desk Lighting & Qi', href: '/product?category=electronics' },
      { title: 'Studio & High-Fidelity Audio', href: '/product?category=electronics' },
      { title: 'Workspace & Ergonomic Gear', href: '/product?category=electronics' },
    ],
    featured: {
      badge: 'Top Recommendation',
      title: 'SonicPro Studio ANC Headphones',
      description: '40mm beryllium acoustic drivers with 45h active battery life.',
      price: '₹4,999',
      image: '/prod_overshirt_1778670536589.png',
      href: '/product?category=electronics',
    },
  },
  {
    id: 'fashion',
    label: 'Fashion',
    href: '/product?category=Apparel',
    icon: Shirt,
    directoryTitle: 'FASHION DIRECTORY',
    directorySubtitle: 'Tailored Apparel & Sartorial Fits',
    items: [
      { title: 'Suits & Bespoke Blazers', href: '/product?category=Apparel' },
      { title: 'Pleated Tailored Trousers', href: '/product?category=Apparel' },
      { title: 'Merino Blend Outerwear', href: '/product?category=Apparel' },
      { title: 'Luxury Silk Pocket Squares', href: '/product?category=Accessories' },
    ],
    featured: {
      badge: 'Bespoke Collection',
      title: 'Tailored Merino Blend Suit Jacket',
      description: 'Double-vented European cut crafted from Australian superfine wool.',
      price: '₹14,999',
      image: '/cat_apparel_1778670103427.png',
      href: '/product?id=prod-2',
    },
  },
  {
    id: 'footwear',
    label: 'Footwear',
    href: '/product?category=footwear',
    icon: Footprints,
    directoryTitle: 'FOOTWEAR DIRECTORY',
    directorySubtitle: 'Handcrafted Shoes & Boots',
    items: [
      { title: 'Oxford Classic Dress Shoes', href: '/product?category=footwear' },
      { title: 'Derby Full-Grain Brogues', href: '/product?category=footwear' },
      { title: 'Handmade Suede Penny Loafers', href: '/product?category=footwear' },
      { title: 'All-Weather Chelsea Boots', href: '/product?category=footwear' },
    ],
    featured: {
      badge: 'Handcrafted Heritage',
      title: 'Artisan Suede Penny Loafers',
      description: 'Goodyear welted with premium Italian suede and cushioned insoles.',
      price: '₹7,499',
      image: '/cat_leather_1778670351299.png',
      href: '/product?category=footwear',
    },
  },
  {
    id: 'leather-goods',
    label: 'Leather Goods',
    href: '/product?category=Leather+Goods',
    icon: Briefcase,
    directoryTitle: 'LEATHER GOODS DIRECTORY',
    directorySubtitle: 'Executive Bags & Handcrafted Luggage',
    items: [
      { title: 'Executive Briefcases', href: '/product?category=Leather+Goods' },
      { title: 'Signature Travel Duffles', href: '/product?category=Leather+Goods' },
      { title: 'Minimalist Bifold Wallets', href: '/product?category=Leather+Goods' },
      { title: 'Full-Grain Leather Belts', href: '/product?category=Leather+Goods' },
    ],
    featured: {
      badge: 'Master Crafted',
      title: 'Executive Leather Briefcase',
      description: 'Hand-burnished vegetable tanned leather with solid brass hardware.',
      price: '₹8,299',
      image: '/cat_leather_1778670351299.png',
      href: '/product?id=prod-3',
    },
  },
  {
    id: 'home-living',
    label: 'Home & Living',
    href: '/product?category=home-living',
    icon: Home,
    directoryTitle: 'HOME & LIVING DIRECTORY',
    directorySubtitle: 'Refined Spaces & Interior Objects',
    items: [
      { title: 'Acoustic Ambient Lighting', href: '/product?category=home-living' },
      { title: 'Artisan Desk Organizers', href: '/product?category=home-living' },
      { title: 'Ceramic Tableware & Decor', href: '/product?category=home-living' },
      { title: 'Premium Linen Textiles', href: '/product?category=home-living' },
    ],
    featured: {
      badge: 'Curated Living',
      title: 'Atelier Ceramic & Lamp Set',
      description: 'Minimalist sculptural lighting paired with handmade stoneware pieces.',
      price: '₹5,899',
      image: '/about_craftsmanship.png',
      href: '/product?category=home-living',
    },
  },
  {
    id: 'beauty',
    label: 'Beauty',
    href: '/product?category=beauty',
    icon: Sparkles,
    directoryTitle: 'BEAUTY & WELLNESS DIRECTORY',
    directorySubtitle: 'Personal Grooming & Botanical Care',
    items: [
      { title: 'Botanical Eau De Parfum', href: '/product?category=beauty' },
      { title: 'Organic Beard & Hair Oils', href: '/product?category=beauty' },
      { title: 'Revitalizing Face Elixir', href: '/product?category=beauty' },
      { title: 'Signature Atelier Grooming Kit', href: '/product?category=beauty' },
    ],
    featured: {
      badge: 'Organic Formula',
      title: 'Atelier Botanical Grooming Elixir',
      description: 'Cold-pressed botanical oils infused with cedarwood and bergamot.',
      price: '₹2,499',
      image: '/cat_accessories_1778670517925.png',
      href: '/product?category=beauty',
    },
  },
];

const SEARCH_SUGGESTIONS = [
  'Search for Bespoke Blazers...',
  'Search for Luxury Outerwear...',
  'Search for Leather Briefcases...',
  'Search for Handcrafted Shoes...',
  'Search for Fine Atelier Accessories...',
  'Search for Premium Grooming...',
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const { totalItems: totalWishlistItems } = useWishlist();
  const { data: session } = authClient.useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDailyGiftModalOpen, setIsDailyGiftModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [navCategories, setNavCategories] = useState<NavCategory[]>(NAVIGATION_CATEGORIES);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNavCategories = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/categories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            const mapped: NavCategory[] = data.map((cat: any) => ({
              id: cat.id,
              label: cat.name,
              href: `/product?category=${encodeURIComponent(cat.name)}`,
              icon: Shirt,
              popular: false,
              directoryTitle: `${cat.name.toUpperCase()} DIRECTORY`,
              directorySubtitle: `Explore ${cat.name} Collection`,
              items: (cat.subcategories || []).map((sub: any) => ({
                title: sub.name,
                href: `/product?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`,
              })),
              featured: {
                badge: 'Department',
                title: `${cat.name} Collection`,
                description: `Discover styles in our ${cat.name} catalog.`,
                price: `${cat._count?.products || 0} Products`,
                image: cat.image || '/cat_apparel_1778670103427.png',
                href: `/product?category=${encodeURIComponent(cat.name)}`,
              },
            }));
            setNavCategories([NAVIGATION_CATEGORIES[0], ...mapped]);
          }
        }
      } catch (err) {
        console.warn('Nav categories fetch failed, using fallback:', err);
      }
    };
    fetchNavCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mouseLeaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Cycle search suggestions placeholder smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsUserMenuOpen(false);
    setActiveCategoryId(null);
    setIsVisible(true);
  }, [pathname]);

  // Throttled scroll-direction detection with smooth transform animation
  useEffect(() => {
    // Keep header visible when any menu, modal, or drawer is open
    if (
      isMobileMenuOpen ||
      isMobileSearchOpen ||
      isSearchModalOpen ||
      isAccountDrawerOpen ||
      isAuthModalOpen ||
      isDailyGiftModalOpen ||
      isCurrencyModalOpen ||
      activeCategoryId !== null ||
      isUserMenuOpen
    ) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY.current;

          setIsScrolled(currentScrollY > 20);

          // Always visible when near the top of the page
          if (currentScrollY < 80) {
            setIsVisible(true);
          } else if (scrollDiff > 8) {
            // Scrolling down -> hide header
            setIsVisible(false);
          } else if (scrollDiff < -8) {
            // Scrolling up -> smoothly reveal header
            setIsVisible(true);
          }

          lastScrollY.current = Math.max(0, currentScrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [
    isMobileMenuOpen,
    isMobileSearchOpen,
    isSearchModalOpen,
    isAccountDrawerOpen,
    isAuthModalOpen,
    isDailyGiftModalOpen,
    isCurrencyModalOpen,
    activeCategoryId,
    isUserMenuOpen,
  ]);

  // Handle outside click to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveCategoryId(null);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hover management with debounce to eliminate flickering
  const handleCategoryMouseEnter = (catId: string) => {
    if (mouseLeaveTimeout.current) {
      clearTimeout(mouseLeaveTimeout.current);
      mouseLeaveTimeout.current = null;
    }
    setActiveCategoryId(catId);
  };

  const handleMouseLeave = () => {
    if (mouseLeaveTimeout.current) {
      clearTimeout(mouseLeaveTimeout.current);
    }
    mouseLeaveTimeout.current = setTimeout(() => {
      setActiveCategoryId(null);
    }, 160);
  };

  const handleMegaMenuMouseEnter = () => {
    if (mouseLeaveTimeout.current) {
      clearTimeout(mouseLeaveTimeout.current);
      mouseLeaveTimeout.current = null;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setIsUserMenuOpen(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const activeCategoryData = navCategories.find((c) => c.id === activeCategoryId);

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 w-full bg-[#F8FAFC]/98 backdrop-blur-md border-b border-[#E2E8F0] transition-transform duration-300 ease-in-out will-change-transform ${
          isVisible ? 'translate-y-0 shadow-xs' : '-translate-y-full shadow-none pointer-events-none'
        }`}
      >
        {/* ======================================================== */}
        {/* 1. MOBILE HEADER (Below md - Taneira Style)             */}
        {/* ======================================================== */}
        <div className="md:hidden">
          {/* Top Bar: Hamburger | Centered Brand | Wishlist & Cart */}
          <div className="flex items-center justify-between h-14 px-3.5 sm:px-4">
            {/* Left: Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-1 text-[#111111] hover:text-[#DF9F28] active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#DF9F28] rounded-lg"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Center: Brand Logo & Subtitle (Taneira/Tata luxury feel) */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center -mr-1 group focus-visible:outline-none"
              aria-label="JudesCart Home"
            >
              <div className="flex items-center gap-1.5">
                <div className="relative w-5 h-5 shrink-0">
                  <Image
                    src="/logo-icon.webp"
                    alt="JudesCart"
                    fill
                    sizes="20px"
                    className="object-contain group-hover:scale-105 transition-transform"
                    priority
                  />
                </div>
                <span className="text-[17px] font-extrabold tracking-tight text-[#111111] group-hover:text-[#DF9F28] transition-colors leading-none">
                  Judes<span className="text-[#DF9F28]">Cart</span>
                </span>
              </div>
              <span className="text-[8px] tracking-[0.24em] font-semibold text-[#888888] uppercase mt-0.5">
                Shop More. Live Better.
              </span>
            </Link>

            {/* Right: Symbol Actions (Currency | User | Wishlist | Cart) */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Currency Symbol */}
              <button
                type="button"
                onClick={() => setIsCurrencyModalOpen(true)}
                className="flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-bold text-[#111111] hover:border-[#DF9F28] transition-colors cursor-pointer select-none active:scale-95"
                title={`Currency: ${selectedCurrency.code}`}
                aria-label="Change Currency"
              >
                <span>{selectedCurrency.symbol}</span>
              </button>

              {/* User / Account Symbol */}
              <button
                type="button"
                onClick={() => {
                  if (session?.user) {
                    setIsAccountDrawerOpen(true);
                  } else {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }
                }}
                className="relative p-1.5 text-[#111111] hover:text-[#DF9F28] active:scale-95 transition-all rounded-lg"
                aria-label="Account"
                title={session?.user ? 'My Account' : 'Sign In'}
              >
                <User className="w-5 h-5 stroke-[1.8]" />
                {session?.user && (
                  <span className="absolute 1 top-1.5 right-1 w-2 h-2 bg-[#22C55E] rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Wishlist Symbol */}
              <Link
                href="/wishlist"
                className="relative p-1.5 text-[#111111] hover:text-[#DF9F28] active:scale-95 transition-all rounded-lg"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.8]" />
                {totalWishlistItems > 0 && (
                  <span className="absolute top-0.5 -right-0.5 min-w-[15px] h-[15px] bg-[#E53E3E] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                    {totalWishlistItems}
                  </span>
                )}
              </Link>

              {/* Shopping Bag / Cart Symbol */}
              <button
                type="button"
                onClick={() => openDrawer()}
                className="relative p-1.5 text-[#111111] hover:text-[#DF9F28] active:scale-95 transition-all cursor-pointer rounded-lg"
                aria-label="Shopping Cart"
                title="Cart"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 -right-0.5 min-w-[15px] h-[15px] bg-[#DF9F28] text-[#111111] text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Row: Full-width Curved Search Bar with Animated Placeholder & Camera Icon */}
          <div className="px-3.5 pb-2.5 pt-0.5">
            <div
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center justify-between w-full h-10 px-3.5 bg-white rounded-full border border-[#E2E8F0] shadow-2xs cursor-pointer group active:scale-[0.99] transition-all hover:border-[#DF9F28]"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                <Search className="w-4 h-4 text-[#888888] shrink-0 group-hover:text-[#DF9F28] transition-colors" />
                <span className="text-xs text-[#666666] font-normal truncate select-none transition-all duration-300">
                  {SEARCH_SUGGESTIONS[placeholderIndex]}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 pl-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSearchModalOpen(true);
                  }}
                  className="p-1 text-[#888888] hover:text-[#DF9F28] transition-colors cursor-pointer"
                  title="Visual Search / Upload Image"
                  aria-label="Visual Search"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. DESKTOP HEADER (md and up)                           */}
        {/* ======================================================== */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-3 sm:gap-6">
            
            {/* Left: Logo */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <Link href="/" className="group flex items-center shrink-0 pr-1 focus-visible:outline-none" aria-label="JudesCart Home">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
                  <Image
                    src="/logo-icon.webp"
                    alt="JudesCart Logo"
                    fill
                    sizes="40px"
                    className="object-contain group-hover:scale-105 transition-transform"
                    priority
                  />
                </div>
                <div className="flex flex-col ml-2.5">
                  <span className="text-xl sm:text-[22px] font-bold tracking-tight text-[#111111] group-hover:text-[#DF9F28] transition-colors leading-none">
                    Judes<span className="text-[#DF9F28]">Cart</span>
                  </span>
                  <span className="text-[10px] tracking-[0.22em] font-semibold text-[#888888] uppercase mt-0.5">
                    Shop More. Live Better.
                  </span>
                </div>
              </Link>

              {/* Center: Large Search Bar (Desktop) */}
              <div className="flex flex-1 max-w-lg lg:max-w-xl ml-2">
                <div 
                  onClick={() => setIsSearchModalOpen(true)} 
                  className="w-full relative cursor-pointer"
                >
                  <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs text-[#555555] bg-white hover:bg-white hover:text-[#111111] border border-[#E2E8F0] shadow-2xs transition-all duration-150 group">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <Search className="w-4 h-4 text-[#DF9F28] group-hover:scale-110 transition-transform shrink-0" />
                      <span className="text-xs text-[#555555] font-medium truncate">
                        {SEARCH_SUGGESTIONS[placeholderIndex]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Camera className="w-4 h-4 text-[#888888] hover:text-[#DF9F28] transition-colors" />
                      <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-semibold text-[#888888] bg-[#F8FAFC] rounded-md border border-[#E2E8F0] shadow-2xs select-none">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Currency, Wishlist, Sign In, Cart */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Currency Badge */}
              <button
                type="button"
                onClick={() => setIsCurrencyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#555555] hover:text-[#111111] hover:bg-slate-100 transition-all border border-[#E2E8F0] bg-white cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[#DF9F28]"
                title="Select Currency"
              >
                <span className="text-sm leading-none" role="img" aria-label={selectedCurrency.name}>{selectedCurrency.flag}</span>
                <span className="font-bold text-[#111111] tracking-tight">{selectedCurrency.code}</span>
                <span className="text-[#888888] font-mono text-[11px]">({selectedCurrency.symbol})</span>
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2.5 rounded-xl text-[#555555] hover:text-[#DF9F28] hover:bg-slate-100 border border-transparent hover:border-[#E2E8F0] transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-[#DF9F28]"
                aria-label="Wishlist"
                title="View Wishlist"
              >
                <Heart className="w-4 h-4" />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-[#DF9F28] text-[#111111] text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                    {totalWishlistItems}
                  </span>
                )}
              </Link>

              {/* User Account / Sign In */}
              <div className="relative" ref={userMenuRef}>
                {session?.user ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-[#E2E8F0] text-[#111111] transition-all text-xs font-semibold cursor-pointer shrink-0 group focus-visible:ring-2 focus-visible:ring-[#DF9F28]"
                      aria-label="User Account Menu"
                    >
                      <User className="w-3.5 h-3.5 text-[#DF9F28] group-hover:scale-110 transition-transform" />
                      <span className="max-w-[80px] truncate">
                        {session.user.name || 'Account'}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-[#888888] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Account Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
                          <p className="text-xs font-semibold text-[#111111] truncate">
                            {session.user.name || 'User'}
                          </p>
                          <p className="text-[11px] text-[#888888] truncate">
                            {session.user.email}
                          </p>
                        </div>

                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#555555] hover:bg-[#F8FAFC] hover:text-[#111111] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#888888]" />
                          <span>My Profile & Addresses</span>
                        </Link>

                        <Link
                          href="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#555555] hover:bg-[#F8FAFC] hover:text-[#111111] transition-colors"
                        >
                          <Package className="w-4 h-4 text-[#888888]" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          href="/lucky-draw"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#555555] hover:bg-[#F8FAFC] hover:text-[#111111] transition-colors"
                        >
                          <Ticket className="w-4 h-4 text-[#DF9F28]" />
                          <span>My Lucky Tickets</span>
                        </Link>

                        <div className="border-t border-[#F1F5F9] mt-1 pt-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('signin');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-[#E2E8F0] text-[#111111] transition-all text-xs font-semibold cursor-pointer shrink-0 group focus-visible:ring-2 focus-visible:ring-[#DF9F28]"
                    aria-label="Customer Sign In"
                  >
                    <User className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-[#DF9F28]" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={() => openDrawer()}
                className="relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#0A192F] hover:bg-[#061B3A] text-white transition-all duration-150 active:scale-95 shrink-0 group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#DF9F28] shadow-sm"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-white group-hover:text-[#DF9F28] transition-colors" />
                <span className="hidden sm:inline text-xs font-semibold tracking-wide">Cart</span>
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-[#DF9F28] text-[#111111]">
                  {totalItems}
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* 2. Secondary Category Navigation Bar (Tier 2 - Deep Navy #0A192F - 30% Structural Palette) */}
        <nav
          className="hidden lg:block bg-[#0A192F] border-t border-[#061B3A] border-b border-[#061B3A] text-white relative shadow-inner"
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-11 sm:h-12">
              
              {/* Category Nav Items */}
              <div className="flex items-center space-x-1 xl:space-x-2">
                {navCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategoryId === cat.id;

                  return (
                    <div key={cat.id} className="relative py-1">
                      <Link
                        href={cat.href}
                        onMouseEnter={() => handleCategoryMouseEnter(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none group ${
                          isActive
                            ? 'bg-[#DF9F28] text-[#111111] font-semibold shadow-xs hover:bg-[#C6891E]'
                            : 'text-slate-200 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className={isActive ? 'text-[#111111]' : 'text-[#DF9F28]'}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span>{cat.label}</span>
                        {cat.popular && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-[#DF9F28] text-[#111111]">
                            Popular
                          </span>
                        )}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            isActive ? 'rotate-180 text-[#111111]' : 'text-slate-400 group-hover:text-white'
                          }`}
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Right Trust & Guarantee Badges */}
              <div className="hidden xl:flex items-center gap-4 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Free Delivery over ₹999
                </span>
                <span className="text-slate-600">•</span>
                <Link href="/faq" className="text-slate-300 hover:text-[#DF9F28] transition-colors">
                  7-Day Easy Returns
                </Link>
              </div>

            </div>
          </div>

          {/* 3. Mega Menu Hover Panel */}
          {activeCategoryData && (
            <div
              className="absolute top-full inset-x-0 bg-white/98 backdrop-blur-xl border-b border-[#E2E8F0] shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseEnter={handleMegaMenuMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-12 gap-8 items-center">
                  
                  {/* Left Directory Grid (col-span-7) */}
                  <div className="col-span-7 space-y-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#DF9F28]">
                        {activeCategoryData.directoryTitle}
                      </span>
                      <h4 className="text-base font-bold text-[#111111] mt-0.5">
                        {activeCategoryData.directorySubtitle}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {activeCategoryData.items.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className="group flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-[#DF9F28] hover:bg-[#FEF8EE] transition-all"
                        >
                          <span className="text-xs font-medium text-[#111111] group-hover:text-[#DF9F28] transition-colors">
                            {item.title}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#888888] group-hover:text-[#DF9F28] group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Link
                        href={activeCategoryData.href}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DF9F28] hover:text-[#C6891E] hover:underline"
                      >
                        <span>View all {activeCategoryData.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Featured Recommendation (col-span-5) */}
                  <div className="col-span-5 border-l border-[#E2E8F0] pl-8">
                    <Link
                      href={activeCategoryData.featured.href}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#FEF8EE] border border-[#E2E8F0] hover:border-[#DF9F28] transition-all block"
                    >
                      <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-white shrink-0 border border-[#E2E8F0]">
                        <Image
                          src={activeCategoryData.featured.image}
                          alt={activeCategoryData.featured.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#DF9F28] bg-[#FEF8EE] border border-[#DF9F28]/30 px-2 py-0.5 rounded-full">
                          {activeCategoryData.featured.badge}
                        </span>
                        <h5 className="text-sm font-semibold text-[#111111] group-hover:text-[#DF9F28] transition-colors truncate">
                          {activeCategoryData.featured.title}
                        </h5>
                        <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                          {activeCategoryData.featured.description}
                        </p>
                        <p className="text-xs font-bold text-[#111111] pt-1">
                          {activeCategoryData.featured.price}
                        </p>
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* 4. Mobile Menu Drawer (Fixed Portal Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#0A192F]/70 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col justify-between overflow-y-auto z-50 animate-in slide-in-from-left duration-200">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="relative w-7 h-7 shrink-0">
                    <Image
                      src="/logo-icon.webp"
                      alt="JudesCart Logo"
                      fill
                      sizes="28px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-base font-bold tracking-tight text-[#111111] leading-none">
                    Judes<span className="text-[#DF9F28]">Cart</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[#555555] hover:text-[#111111] rounded-lg cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <Link
                  href="/product"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white text-[#111111] border border-[#E2E8F0] text-xs font-semibold hover:border-[#DF9F28]"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#555555] shrink-0" />
                  <span>All Products</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white text-[#111111] border border-[#E2E8F0] text-xs font-semibold hover:border-[#DF9F28]"
                >
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Wishlist ({totalWishlistItems})</span>
                </Link>
              </div>

              {/* Navigation Category Accordions */}
              <div className="p-3 space-y-1">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                  Departments & Categories
                </p>

                {navCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isExpanded = mobileExpandedCat === cat.id;

                  return (
                    <div key={cat.id} className="border-b border-[#F1F5F9] last:border-none">
                      <div className="flex items-center justify-between py-1">
                        <Link
                          href={cat.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#111111] hover:text-[#DF9F28] flex-1"
                        >
                          <Icon className="w-4 h-4 text-[#DF9F28]" />
                          <span>{cat.label}</span>
                          {cat.popular && (
                            <span className="text-[8px] px-1.5 py-0.2 rounded-full font-semibold bg-[#DF9F28] text-[#111111] uppercase">
                              Hot
                            </span>
                          )}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                          className="p-2 text-[#888888] hover:text-[#111111]"
                          aria-label={`Toggle ${cat.label} subcategories`}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="pl-9 pr-3 pb-2 space-y-1 animate-in fade-in duration-150">
                          {cat.items.map((sub, i) => (
                            <Link
                              key={i}
                              href={sub.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-1 text-xs font-medium text-[#555555] hover:text-[#DF9F28]"
                            >
                              {sub.title}
                            </Link>
                          ))}
                          <Link
                            href={cat.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DF9F28] pt-1"
                          >
                            <span>View All {cat.label}</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2 border-t border-[#F1F5F9]">
                  <Link
                    href="/lucky-draw"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-[#111111] bg-[#FEF8EE] rounded-xl border border-[#DF9F28]/30"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#DF9F28]" />
                      <span>Weekly Lucky Draw</span>
                    </div>
                    <span className="text-[10px] bg-[#DF9F28] text-[#111111] font-bold px-1.5 py-0.5 rounded-md">
                      LIVE
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Account & Support Links */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
              {session?.user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-7 h-7 rounded-full bg-[#FEF8EE] text-[#DF9F28] font-semibold text-xs flex items-center justify-center border border-[#DF9F28]/30">
                      {session.user.name ? session.user.name.charAt(0) : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#111111] truncate">{session.user.name}</p>
                      <p className="text-[10px] text-[#888888] truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-1.5 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-center text-[#555555] hover:border-[#DF9F28]"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-1.5 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-center text-[#555555] hover:border-[#DF9F28]"
                    >
                      Orders
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-1.5 text-xs font-semibold text-rose-600 text-center hover:underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0A192F] hover:bg-[#DF9F28] text-white hover:text-[#111111] rounded-xl text-xs font-semibold tracking-wide transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Join JudesCart</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Interactive Slide-Over Cart Drawer & Modals */}
      <CartDrawer />
      <AccountDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        onOpenAuth={(m) => {
          setAuthModalMode(m || 'signin');
          setIsAuthModalOpen(true);
        }}
        onOpenDailyGift={() => setIsDailyGiftModalOpen(true)}
      />
      <DailyGiftModal
        isOpen={isDailyGiftModalOpen}
        onClose={() => setIsDailyGiftModalOpen(false)}
      />
      <CurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={(c) => setSelectedCurrency(c)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
