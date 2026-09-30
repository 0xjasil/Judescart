"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconInnerShadowTop } from "@tabler/icons-react";
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
  Gift,
  ImageIcon,
  LayoutTemplate,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogoutDialog } from "@/components/auth/logout-modal";
import { SIDEBAR_DATA, COMPANY_INFO } from "@/constants/navigation";
import { UserProfile } from "@/types/user";
import { NavGroup } from "./nav-group";
import { cn } from "@/lib/utils";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: UserProfile;
  isAdminMode?: boolean; // Toggle between admin and regular mode
}

interface AdminNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const adminNavigation: AdminNavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package },
  { title: "Brands", href: "/brand", icon: Tag },
  { title: "Categories", href: "/category", icon: Layers },
  { title: "Subcategories", href: "/subcategory", icon: FileText },
  { title: "Orders", href: "/orders", icon: ShoppingCart },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Inventory", href: "/inventory", icon: Boxes },
  { title: "Variations", href: "/variations", icon: Layers },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Hero Banners", href: "/banners", icon: ImageIcon },
  { title: "Offer Slides", href: "/offer-slides", icon: LayoutTemplate },
  { title: "Brand Benefits", href: "/brand-benefits", icon: Sparkles },
  { title: "Draw Campaigns", href: "/draws", icon: Gift },
  { title: "Zendrop Dropship", href: "/zendrop", icon: Zap },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({ user, isAdminMode = false, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const filteredNavMain = SIDEBAR_DATA?.navMain?.filter(
    () => user?.role?.toLowerCase() !== "staff"
  ) || [];

  // Check if we're in admin route
  const isAdminRoute = pathname?.startsWith('/') || isAdminMode;

  if (isAdminRoute) {
    return (
      <>
        {/* Mobile menu button for admin mode */}
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

        {/* Mobile overlay for admin mode */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Admin Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Admin Header */}
            <div className="flex h-16 items-center border-b border-sidebar-border px-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                  <LayoutDashboard className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-sidebar-foreground">
                  Admin Panel
                </span>
              </Link>
            </div>

            {/* Admin Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="rounded-full bg-sidebar-primary px-2 py-0.5 text-xs text-sidebar-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Admin Footer */}
            <div className="border-t border-sidebar-border p-4">
              <div className="space-y-2">
                {/* User info */}
                <div className="flex items-center space-x-3 rounded-lg px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                    <span className="text-sm font-medium text-sidebar-accent-foreground">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/70 truncate">
                      {user?.email || 'admin@example.com'}
                    </p>
                  </div>
                </div>

                {/* Logout button with dialog */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setOpenLogout(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Logout modal */}
        <LogoutDialog open={openLogout} setOpen={setOpenLogout} />
      </>
    );
  }

  // Regular sidebar for non-admin routes
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {COMPANY_INFO?.name || 'Dashboard'}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {SIDEBAR_DATA?.admin && (
          <NavGroup label="Admin Area" items={SIDEBAR_DATA.admin} />
        )}
      </SidebarContent>
      
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
