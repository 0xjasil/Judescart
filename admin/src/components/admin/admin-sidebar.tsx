"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Tag,
  Layers,
  Package,
  Users,
  Settings,
  BarChart3,
  ShoppingCart,
  FileText,
  LogOut,
  Menu,
  X,
  Boxes,
  ImageIcon,
  LayoutTemplate,
  Gift,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoutDialog } from "@/components/auth/logout-modal";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Products", href: "/products", icon: Package },
      { title: "Brands", href: "/brand", icon: Tag },
      { title: "Categories", href: "/category", icon: Layers },
      { title: "Subcategories", href: "/subcategory", icon: FileText },
      { title: "Variations", href: "/variations", icon: Layers },
      { title: "Orders", href: "/orders", icon: ShoppingCart },
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Inventory", href: "/inventory", icon: Boxes },
      { title: "Coupons", href: "/coupons", icon: Tag },
    ],
  },
  {
    label: "Storefront CMS",
    items: [
      { title: "Hero Banners", href: "/banners", icon: ImageIcon },
      { title: "Offer Slides", href: "/offer-slides", icon: LayoutTemplate },
      { title: "Brand Benefits", href: "/brand-benefits", icon: Sparkles },
      { title: "Lucky Draw Setup", href: "/draws", icon: Gift },
    ],
  },
  {
    label: "Integrations",
    items: [
      { title: "Zendrop Dropship", href: "/zendrop", icon: Zap },
    ],
  },
  {
    label: "Reports & Analytics",
    items: [
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
      { title: "Order Reports", href: "/reports/order-reports", icon: FileText },
      { title: "Customer Reports", href: "/reports/customer-reports", icon: FileText },
      { title: "Lucky Draw Reports", href: "/reports/lucky-draw-reports", icon: FileText },
      { title: "Winner Reports", href: "/reports/winner-reports", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Activity Logs", href: "/activity-logs", icon: FileText },
      { title: "Payment Logs", href: "/payment-logs", icon: FileText },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar using regular div elements */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 p-6 flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 via-amber-600 to-amber-700 shadow-md">
              <span className="text-xs font-extrabold text-white tracking-tighter">SJ</span>
            </div>
            <span className="text-md font-bold tracking-tight text-gray-900 dark:text-gray-100">
              STEVE JOHN
            </span>
          </Link>
        </div>

        {/* Navigation - Grouped into CMS, Main, Reports */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
                {group.label}
              </p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                        isActive
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/20"
                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", isActive ? "text-amber-600 dark:text-amber-400" : "text-gray-500")} />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer - User Profile & Logout - Always at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3 rounded-lg px-3 py-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                A
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                admin@gmail.com
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={() => setOpenLogout(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Logout modal */}
      <LogoutDialog open={openLogout} setOpen={setOpenLogout} />
    </>
  );
}
