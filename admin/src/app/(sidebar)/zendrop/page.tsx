"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowUpRight,
  TrendingUp,
  Package,
  Layers,
  Key,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Percent,
  Download,
  Boxes,
  Truck,
  Sparkles,
  ExternalLink,
  DollarSign,
  Tag,
  Sliders,
  Trash2,
  HelpCircle,
  Store,
  Check,
  X,
  Info,
  Layers3,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface ZendropSettings {
  isAuthorized: boolean;
  apiKey: string;
  maskedApiKey: string;
  hasApiKey: boolean;
  apiUrl: string;
  markupPercent: number;
  markupType: string;
  autoPublish: boolean;
  defaultBrandName: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

interface ZendropVariant {
  sku: string;
  wholesalePrice: number;
  qty: number;
  attributes: { name: string; value: string }[];
  images: string[];
}

interface ZendropCatalogItem {
  zendropId: string;
  name: string;
  description: string;
  categoryName: string;
  brandName: string;
  image: string;
  subimages: string[];
  wholesalePrice: number;
  suggestedRetailPrice: number;
  calculatedSellingPrice: number;
  calculatedListPrice: number;
  profitMargin: number;
  profitPercent: number;
  rating: number;
  ordersCount: number;
  shippingDays: string;
  variants: ZendropVariant[];
  isImported: boolean;
  dbProductId: string | null;
  isPermitted: boolean;
}

interface ImportedProduct {
  id: string;
  zendropId: string;
  name: string;
  description?: string;
  image: string;
  category: string;
  brand: string;
  wholesaleCost: number;
  storePrice: number;
  estimatedMargin: number;
  profitPercent?: number;
  totalStock: number;
  variantsCount: number;
  isPermitted: boolean;
  variants?: Array<{
    id: string;
    sku: string;
    price: number;
    offerPrice?: number;
    qty: number;
    images: string[];
    options?: Array<{ attribute?: string; value?: string }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ZendropIntegrationPage() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [settings, setSettings] = useState<ZendropSettings>({
    isAuthorized: true,
    apiKey: "",
    maskedApiKey: "",
    hasApiKey: false,
    apiUrl: "https://api.zendrop.com",
    markupPercent: 35,
    markupType: "PERCENTAGE",
    autoPublish: true,
    defaultBrandName: "Steve John Atelier",
    isConnected: false,
  });

  const [inputApiKey, setInputApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTogglingPermission, setIsTogglingPermission] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [connectionMessage, setConnectionMessage] = useState("");

  // Catalog state
  const [catalog, setCatalog] = useState<ZendropCatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Detail modal state
  const [selectedProductDetails, setSelectedProductDetails] = useState<ZendropCatalogItem | ImportedProduct | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Imported products state
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [isLoadingImported, setIsLoadingImported] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Live calculator state
  const [calcWholesale, setCalcWholesale] = useState(4000);

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await apiFetch("/zendrop/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
        if (json.data.hasApiKey) {
          setConnectionStatus("success");
          setConnectionMessage("API Key configured & operational.");
        }
      }
    } catch (e) {
      console.error("Failed to load Zendrop settings", e);
    }
  };

  // Fetch catalog
  const fetchCatalog = async (query = searchQuery, category = selectedCategory) => {
    setIsLoadingCatalog(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (category && category !== "ALL") params.append("category", category);

      const res = await apiFetch(`/zendrop/catalog?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCatalog(json.data);
      }
    } catch (e) {
      toast.error("Failed to load Zendrop catalog");
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  // Fetch imported products
  const fetchImported = async () => {
    setIsLoadingImported(true);
    try {
      const res = await apiFetch("/zendrop/imported");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setImportedProducts(json.data);
      }
    } catch (e) {
      console.error("Failed to load imported products", e);
    } finally {
      setIsLoadingImported(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCatalog();
    fetchImported();
  }, []);

  // Toggle Global Showcasing Permission
  const handleToggleGlobalPermission = async (newAuthorizedState: boolean) => {
    setIsTogglingPermission(true);
    try {
      const payload: any = {
        isAuthorized: newAuthorizedState,
        apiUrl: settings.apiUrl,
        markupPercent: Number(settings.markupPercent),
        markupType: settings.markupType,
        autoPublish: settings.autoPublish,
        defaultBrandName: settings.defaultBrandName,
      };

      const res = await apiFetch("/zendrop/settings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        if (newAuthorizedState) {
          toast.success("Master showcasing permission enabled.");
        } else {
          toast.warning("Master showcasing permission disabled.");
        }
        fetchCatalog();
      } else {
        toast.error(json.error || "Failed to update permission");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred updating permission");
    } finally {
      setIsTogglingPermission(false);
    }
  };

  // Toggle Single Product Permission (Grant or Revoke)
  const handleToggleProductPermission = async (
    targetId: string,
    isImported: boolean,
    currentPermitted: boolean,
    catalogItem?: ZendropCatalogItem
  ) => {
    setActioningId(targetId);
    try {
      if (!isImported && catalogItem) {
        // Import and grant permission
        const res = await apiFetch("/zendrop/import", {
          method: "POST",
          body: JSON.stringify({
            zendropId: catalogItem.zendropId,
            customPrice: catalogItem.calculatedSellingPrice,
            isCustomerFavorite: false,
            isNewArrival: true,
            isPermitted: true,
          }),
        });

        const json = await res.json();
        if (json.success) {
          toast.success(json.message || `Granted permission for "${catalogItem.name}"!`);
          fetchCatalog();
          fetchImported();
        } else {
          toast.error(json.error || "Failed to grant permission");
        }
      } else {
        // Toggle existing product permission in DB
        const res = await apiFetch(`/zendrop/toggle-permission/${targetId}`, {
          method: "POST",
          body: JSON.stringify({
            isPermitted: !currentPermitted,
          }),
        });

        const json = await res.json();
        if (json.success) {
          if (json.isPermitted) {
            toast.success(json.message || "Permission granted (Live on storefront)");
          } else {
            toast.warning(json.message || "Permission revoked (Hidden from storefront)");
          }
          fetchCatalog();
          fetchImported();
        } else {
          toast.error(json.error || "Failed to update product permission");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    } finally {
      setActioningId(null);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload: any = {
        isAuthorized: settings.isAuthorized,
        apiUrl: settings.apiUrl,
        markupPercent: Number(settings.markupPercent),
        markupType: settings.markupType,
        autoPublish: settings.autoPublish,
        defaultBrandName: settings.defaultBrandName,
      };

      if (inputApiKey && inputApiKey.trim().length > 0) {
        payload.apiKey = inputApiKey.trim();
      }

      const res = await apiFetch("/zendrop/settings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Zendrop settings saved successfully!");
        setSettings(json.data);
        setInputApiKey("");
        fetchCatalog();
      } else {
        toast.error(json.error || "Failed to save Zendrop settings");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Test Connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");
    setConnectionMessage("");
    try {
      const res = await apiFetch("/zendrop/test-connection", {
        method: "POST",
        body: JSON.stringify({
          apiKey: inputApiKey.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.connected) {
        setConnectionStatus("success");
        setConnectionMessage(json.message || "Connected to Zendrop successfully!");
        toast.success("Zendrop API connection verified!");
      } else {
        setConnectionStatus("error");
        setConnectionMessage(json.error || "Failed to authenticate with Zendrop.");
        toast.error(json.error || "Zendrop connection failed");
      }
    } catch (e: any) {
      setConnectionStatus("error");
      setConnectionMessage(e.message || "Connection error");
      toast.error("Connection test failed");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Sync a single product
  const handleSyncProduct = async (productId: string, productName: string) => {
    setSyncingId(productId);
    try {
      const res = await apiFetch(`/zendrop/sync/${productId}`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || `Synced "${productName}"!`);
        fetchImported();
      } else {
        toast.error(json.error || "Failed to sync product");
      }
    } catch (e: any) {
      toast.error(e.message || "Sync failed");
    } finally {
      setSyncingId(null);
    }
  };

  // Delete/Revoke an imported product from DB
  const handleDeleteImportedProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to completely remove "${productName}" from your store database?`)) {
      return;
    }

    setDeletingId(productId);
    try {
      const res = await apiFetch(`/zendrop/imported/${productId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || `Removed "${productName}"`);
        fetchImported();
        fetchCatalog();
      } else {
        toast.error(json.error || "Failed to remove product");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to remove product");
    } finally {
      setDeletingId(null);
    }
  };

  const categoriesList = ["ALL", "Apparel", "Leather Goods", "Accessories", "Footwear"];

  // Calculate live margin preview
  const calcRetail = Math.round((calcWholesale * (1 + settings.markupPercent / 100)) / 10) * 10 - 1;
  const calcProfit = calcRetail - calcWholesale;
  const calcMarginPct = Math.round((calcProfit / calcWholesale) * 100);

  const activePermittedCount = importedProducts.filter((p) => p.isPermitted).length;
  const revokedCount = importedProducts.filter((p) => !p.isPermitted).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 rounded-xl border border-amber-500/30 text-amber-500 shadow-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Zendrop Dropshipping Integration
                </h1>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] uppercase font-bold tracking-wider">
                  Verified Catalog
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Browse supplier products, grant explicit storefront showcasing permissions, and manage live prices and margins.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSettings();
              fetchCatalog();
              fetchImported();
              toast.info("Refreshed Zendrop catalog & live products.");
            }}
            className="gap-1.5 h-9 rounded-lg"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh All</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleToggleGlobalPermission(!settings.isAuthorized)}
            disabled={isTogglingPermission}
            className={`gap-2 h-9 rounded-lg font-bold text-xs shadow-sm transition-all ${
              settings.isAuthorized
                ? "bg-muted hover:bg-muted/80 text-foreground border border-border"
                : "bg-amber-500 hover:bg-amber-600 text-black"
            }`}
          >
            {isTogglingPermission ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : settings.isAuthorized ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            <span>
              {settings.isAuthorized ? "Integration Active" : "Enable Integration"}
            </span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/50 hover:border-border transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Catalog Items
              </p>
              <h3 className="text-xl font-extrabold text-foreground">
                {catalog.length} Products
              </h3>
              <p className="text-[11px] text-muted-foreground">Available to showcase</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Boxes className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/50 hover:border-border transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Permission Granted
              </p>
              <h3 className="text-xl font-extrabold text-emerald-500">
                {activePermittedCount} Showcased
              </h3>
              <p className="text-[11px] text-muted-foreground">Live on http://localhost:3000</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/50 hover:border-border transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Configured Markup
              </p>
              <h3 className="text-xl font-extrabold text-amber-500">
                +{settings.markupPercent}% Margin
              </h3>
              <p className="text-[11px] text-muted-foreground">Automated profit markup</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/50 hover:border-border transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Avg Dispatch Time
              </p>
              <h3 className="text-xl font-extrabold text-purple-500">2-4 Days</h3>
              <p className="text-[11px] text-muted-foreground">Fast tracked supplier lane</p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/70 p-1.5 rounded-2xl grid grid-cols-3 max-w-lg border border-border/40">
          <TabsTrigger
            value="catalog"
            onClick={() => setActiveTab("catalog")}
            className="rounded-xl text-xs sm:text-sm font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
          >
            <Package className="h-4 w-4 text-amber-500" />
            <span>Catalog Explorer ({catalog.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="imported"
            onClick={() => setActiveTab("imported")}
            className="rounded-xl text-xs sm:text-sm font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
          >
            <Boxes className="h-4 w-4 text-emerald-500" />
            <span>Showcased ({importedProducts.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            onClick={() => setActiveTab("settings")}
            className="rounded-xl text-xs sm:text-sm font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
          >
            <Key className="h-4 w-4 text-blue-500" />
            <span>Pricing &amp; API</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CATALOG EXPLORER */}
        <TabsContent value="catalog" className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search catalog by title, SKU, fabric..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchCatalog(e.target.value, selectedCategory);
                }}
                className="pl-10 h-10 rounded-xl"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat);
                    fetchCatalog(searchQuery, cat);
                  }}
                  className={`rounded-xl text-xs font-semibold h-9 px-3.5 ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-black hover:bg-amber-600"
                      : ""
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          {isLoadingCatalog ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
              ))}
            </div>
          ) : catalog.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-bold text-foreground">No Zendrop products match your filter</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Try searching for another keyword or switch category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalog.map((item) => {
                const isItemActioning = actioningId === item.zendropId || (item.dbProductId && actioningId === item.dbProductId);

                return (
                  <Card
                    key={item.zendropId}
                    className="group overflow-hidden rounded-2xl border-border/50 bg-card hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Product Visual */}
                    <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <Badge className="bg-black/80 backdrop-blur-md text-white border-white/20 text-[11px] font-semibold">
                          {item.categoryName}
                        </Badge>
                        <Badge className="bg-amber-500 text-black font-extrabold text-[11px]">
                          ★ {item.rating}
                        </Badge>
                      </div>

                      {/* Permission Badge */}
                      <div className="absolute top-3 right-3">
                        {item.isImported && item.isPermitted ? (
                          <Badge className="bg-emerald-500 text-black font-extrabold text-[10px] shadow-sm">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            PERMISSION GRANTED
                          </Badge>
                        ) : item.isImported && !item.isPermitted ? (
                          <Badge className="bg-rose-500 text-white font-extrabold text-[10px] shadow-sm">
                            <Lock className="h-3 w-3 mr-1" />
                            PERMISSION REVOKED
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-black/70 backdrop-blur-sm text-white/80 text-[10px]">
                            NO PERMISSION
                          </Badge>
                        )}
                      </div>

                      {/* Bottom Info Bar */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-mono text-[11px] bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
                          {item.zendropId}
                        </span>
                        <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-sm text-[11px]">
                          <Truck className="h-3 w-3 text-amber-400" />
                          {item.shippingDays}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium text-amber-500">{item.brandName}</span>
                          <span>{item.variants.length} Variants</span>
                        </div>

                        <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
                          {item.name}
                        </h3>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Financial / Pricing Breakdown */}
                      <div className="bg-muted/40 rounded-xl p-3.5 border border-border/40 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Wholesale Supplier Cost:</span>
                          <span className="font-mono font-semibold text-foreground">₹{item.wholesalePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Store Retail (+{settings.markupPercent}%):</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[11px] text-muted-foreground line-through">₹{item.calculatedListPrice.toLocaleString()}</span>
                            <span className="font-extrabold text-sm text-amber-500 font-mono">₹{item.calculatedSellingPrice.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/30">
                          <span className="font-semibold text-emerald-500 flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Est. Net Profit ({item.profitPercent}%):
                          </span>
                          <span className="font-extrabold text-emerald-500 font-mono text-sm">+₹{item.profitMargin.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProductDetails(item);
                            setIsDetailsOpen(true);
                          }}
                          className="h-10 px-3 rounded-xl text-xs font-semibold gap-1.5 border-border"
                          title="View complete specs & variants"
                        >
                          <Info className="h-4 w-4" />
                          <span>Details</span>
                        </Button>

                        {/* Permission Action Button */}
                        {item.isImported && item.isPermitted ? (
                          <Button
                            onClick={() =>
                              handleToggleProductPermission(
                                item.dbProductId || item.zendropId,
                                true,
                                true,
                                item
                              )
                            }
                            disabled={Boolean(isItemActioning)}
                            className="flex-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 font-bold gap-1.5 h-10 rounded-xl text-xs transition-all"
                          >
                            {isItemActioning ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                            <span>Revoke Permission</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              handleToggleProductPermission(
                                item.dbProductId || item.zendropId,
                                item.isImported,
                                item.isPermitted,
                                item
                              )
                            }
                            disabled={Boolean(isItemActioning)}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-extrabold gap-1.5 h-10 rounded-xl text-xs shadow-sm transition-all"
                          >
                            {isItemActioning ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Updating...</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4" />
                                <span>Grant Permission &amp; Showcase</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: IMPORTED PRODUCTS */}
        <TabsContent value="imported" className="space-y-6">
          <Card className="border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4 bg-muted/20">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Store className="h-5 w-5 text-emerald-500" />
                  <span>Showcased &amp; Managed Products</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Products in your database. Control storefront visibility permissions with a single click.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchImported} className="gap-1.5 h-8 rounded-lg">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh List</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingImported ? (
                <div className="py-16 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground opacity-60" />
                  <p className="text-xs text-muted-foreground mt-2">Loading active products...</p>
                </div>
              ) : importedProducts.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Boxes className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <h3 className="text-base font-bold text-foreground">No Zendrop products imported yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                    Explore verified items in the Catalog Explorer tab and authorize products for your storefront.
                  </p>
                  <Button
                    onClick={() => setActiveTab("catalog")}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-9 rounded-lg"
                  >
                    Browse Dropship Catalog
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] uppercase bg-muted/60 text-muted-foreground font-bold border-b border-border/40">
                      <tr>
                        <th className="px-5 py-3.5">Product</th>
                        <th className="px-4 py-3.5">Permission Status</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5">Zendrop SKU</th>
                        <th className="px-4 py-3.5">Wholesale</th>
                        <th className="px-4 py-3.5">Store Retail</th>
                        <th className="px-4 py-3.5">Net Margin</th>
                        <th className="px-4 py-3.5">Stock</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {importedProducts.map((p) => {
                        const isActioning = actioningId === p.id;

                        return (
                          <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted border border-border/40 shrink-0">
                                  <Image
                                    src={p.image || "/placeholder.svg"}
                                    alt={p.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 max-w-xs">
                                  <p className="font-semibold text-foreground truncate text-sm">{p.name}</p>
                                  <p className="text-[11px] text-muted-foreground">{p.brand} &bull; {p.variantsCount} variants</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleToggleProductPermission(p.id, true, p.isPermitted)
                                }
                                disabled={isActioning}
                                className={`h-7 px-2.5 rounded-lg text-[10px] font-bold gap-1 border ${
                                  p.isPermitted
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                                }`}
                              >
                                {isActioning ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : p.isPermitted ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <Lock className="h-3 w-3" />
                                )}
                                <span>{p.isPermitted ? "Permission: ACTIVE" : "Permission: HIDDEN"}</span>
                              </Button>
                            </td>

                            <td className="px-4 py-3.5 text-muted-foreground font-medium text-xs">{p.category}</td>
                            <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{p.zendropId}</td>
                            <td className="px-4 py-3.5 font-mono text-foreground font-medium text-xs">₹{p.wholesaleCost.toLocaleString()}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-amber-500 text-xs">₹{p.storePrice.toLocaleString()}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-emerald-500 text-xs">+₹{p.estimatedMargin.toLocaleString()}</td>
                            <td className="px-4 py-3.5">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${
                                  p.totalStock > 20
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                    : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                }`}
                              >
                                {p.totalStock} in stock
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProductDetails(p);
                                    setIsDetailsOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                                  title="View full specs & variants"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>

                                <a
                                  href={`http://localhost:3000/product?id=${p.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                                    title="View live on customer storefront"
                                  >
                                    <Store className="h-4 w-4" />
                                  </Button>
                                </a>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSyncProduct(p.id, p.name)}
                                  disabled={syncingId === p.id}
                                  className="h-8 px-2.5 text-xs gap-1 rounded-lg"
                                  title="Sync live pricing and inventory"
                                >
                                  <RefreshCw className={`h-3 w-3 ${syncingId === p.id ? "animate-spin" : ""}`} />
                                  <span className="hidden sm:inline">Sync</span>
                                </Button>

                                <Link href={`/products/edit-product/${p.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                                    title="Edit product in admin catalog"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteImportedProduct(p.id, p.name)}
                                  disabled={deletingId === p.id}
                                  className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                  title="Remove from store database"
                                >
                                  {deletingId === p.id ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PERMISSIONS & API SETTINGS */}
        <TabsContent value="settings" className="space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* API Authentication */}
            <Card className="border-border/50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  <span>API Authentication &amp; Endpoint</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure secure credentials for communicating with the Zendrop dropshipping backend.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    Zendrop API Key / Access Token
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder={
                        settings.hasApiKey
                          ? `Configured (${settings.maskedApiKey})`
                          : "Enter Zendrop API Key (e.g. zd_live_...)"
                      }
                      value={inputApiKey}
                      onChange={(e) => setInputApiKey(e.target.value)}
                      className="pr-24 font-mono text-sm h-11 rounded-xl"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Obtain your live token from your Zendrop account dashboard under Settings &gt; Integrations &gt; API.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiUrl" className="font-semibold text-xs text-foreground uppercase tracking-wider">
                      Gateway URL
                    </Label>
                    <Input
                      id="apiUrl"
                      value={settings.apiUrl}
                      onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                      placeholder="https://api.zendrop.com"
                      className="h-11 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultBrandName" className="font-semibold text-xs text-foreground uppercase tracking-wider">
                      Default Brand Assignment
                    </Label>
                    <Input
                      id="defaultBrandName"
                      value={settings.defaultBrandName}
                      onChange={(e) => setSettings({ ...settings, defaultBrandName: e.target.value })}
                      placeholder="Steve John Atelier"
                      className="h-11 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Connection Test Action */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="gap-2 h-10 rounded-xl"
                  >
                    {isTestingConnection ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Testing Gateway...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-amber-500" />
                        <span>Test Gateway Handshake</span>
                      </>
                    )}
                  </Button>

                  {connectionStatus === "success" && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{connectionMessage || "Connection Verified"}</span>
                    </div>
                  )}

                  {connectionStatus === "error" && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
                      <AlertCircle className="h-4 w-4" />
                      <span>{connectionMessage || "Authentication Failed"}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profit Margin & Calculator */}
            <Card className="border-border/50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-amber-500" />
                  <span>Profit Margin &amp; Price Calculator</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure automated markup percentage applied to wholesale cost when importing products.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="markupPercent" className="font-semibold text-xs text-foreground uppercase tracking-wider">
                        Default Markup Percentage (%)
                      </Label>
                      <div className="relative">
                        <Input
                          id="markupPercent"
                          type="number"
                          min={0}
                          max={500}
                          value={settings.markupPercent}
                          onChange={(e) =>
                            setSettings({ ...settings, markupPercent: Number(e.target.value) })
                          }
                          className="pr-9 h-11 rounded-xl font-mono text-base font-bold"
                        />
                        <Percent className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Applied automatically across all variants during product import.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold text-xs text-foreground uppercase tracking-wider">
                        Interactive Wholesale Cost Simulation
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={calcWholesale}
                          onChange={(e) => setCalcWholesale(Number(e.target.value) || 0)}
                          className="pl-8 h-10 rounded-xl font-mono text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Simulation Card */}
                  <div className="bg-gradient-to-br from-card to-muted/40 p-5 rounded-2xl border border-border/60 space-y-3">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Live Price &amp; Profit Preview
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wholesale Supplier Cost:</span>
                        <span className="font-mono font-semibold text-foreground">₹{calcWholesale.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Markup Applied:</span>
                        <span className="font-mono font-semibold text-amber-500">+{settings.markupPercent}%</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border/40">
                        <span className="font-bold text-foreground">Calculated Store Retail Price:</span>
                        <span className="font-mono font-extrabold text-base text-amber-500">₹{calcRetail.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="font-bold text-emerald-500">Estimated Gross Profit ({calcMarginPct}%):</span>
                        <span className="font-mono font-extrabold text-base text-emerald-500">+₹{calcProfit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Settings */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSavingSettings}
                className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold px-8 h-11 rounded-xl gap-2 shadow-md shadow-amber-500/20"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save All Zendrop Settings</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* PRODUCT DETAILS & SPECIFICATIONS MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          {selectedProductDetails && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs uppercase font-mono bg-muted">
                    {selectedProductDetails.zendropId}
                  </Badge>
                  {"isPermitted" in selectedProductDetails && (
                    <Badge
                      className={
                        selectedProductDetails.isPermitted
                          ? "bg-emerald-500 text-black font-bold"
                          : "bg-amber-500 text-black font-bold"
                      }
                    >
                      {selectedProductDetails.isPermitted ? "PERMISSION: ACTIVE" : "PERMISSION: HIDDEN"}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl font-extrabold text-foreground pt-1">
                  {selectedProductDetails.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {"categoryName" in selectedProductDetails ? selectedProductDetails.categoryName : selectedProductDetails.category} &bull; {"brandName" in selectedProductDetails ? selectedProductDetails.brandName : selectedProductDetails.brand}
                </DialogDescription>
              </DialogHeader>

              {/* Visual Preview */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border">
                <Image
                  src={selectedProductDetails.image || "/placeholder.svg"}
                  alt={selectedProductDetails.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Description</p>
                <p className="text-xs text-foreground leading-relaxed bg-muted/40 p-3 rounded-xl border">
                  {selectedProductDetails.description}
                </p>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted/40 rounded-xl border text-center">
                  <p className="text-[11px] text-muted-foreground font-semibold">Wholesale Cost</p>
                  <p className="text-base font-extrabold font-mono text-foreground mt-0.5">
                    ₹{("wholesalePrice" in selectedProductDetails ? selectedProductDetails.wholesalePrice : selectedProductDetails.wholesaleCost).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                  <p className="text-[11px] text-amber-500 font-semibold">Store Retail Price</p>
                  <p className="text-base font-extrabold font-mono text-amber-500 mt-0.5">
                    ₹{("calculatedSellingPrice" in selectedProductDetails ? selectedProductDetails.calculatedSellingPrice : selectedProductDetails.storePrice).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <p className="text-[11px] text-emerald-500 font-semibold">Est. Profit Margin</p>
                  <p className="text-base font-extrabold font-mono text-emerald-500 mt-0.5">
                    +₹{("profitMargin" in selectedProductDetails ? selectedProductDetails.profitMargin : selectedProductDetails.estimatedMargin).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Variants Breakdown */}
              {"variants" in selectedProductDetails && Array.isArray(selectedProductDetails.variants) && selectedProductDetails.variants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Available Variants ({selectedProductDetails.variants.length})
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {selectedProductDetails.variants.map((v: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/30 border">
                        <span className="font-mono text-foreground font-semibold">{v.sku}</span>
                        <div className="flex items-center gap-2">
                          {v.attributes ? (
                            v.attributes.map((a: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {a.name}: {a.value}
                              </Badge>
                            ))
                          ) : v.options ? (
                            v.options.map((o: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {o.attribute}: {o.value}
                              </Badge>
                            ))
                          ) : null}
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                            {v.qty} in stock
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2">
                  {("dbProductId" in selectedProductDetails && selectedProductDetails.dbProductId || "id" in selectedProductDetails && selectedProductDetails.id) && (
                    <a
                      href={`http://localhost:3000/product?id=${("dbProductId" in selectedProductDetails && selectedProductDetails.dbProductId) || ("id" in selectedProductDetails && selectedProductDetails.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-1.5 text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10 font-semibold"
                      >
                        <Store className="h-3.5 w-3.5" />
                        <span>View on Storefront</span>
                      </Button>
                    </a>
                  )}

                  {("dbProductId" in selectedProductDetails && selectedProductDetails.dbProductId || "id" in selectedProductDetails && selectedProductDetails.id) && (
                    <Link
                      href={`/products/edit-product/${("dbProductId" in selectedProductDetails && selectedProductDetails.dbProductId) || ("id" in selectedProductDetails && selectedProductDetails.id)}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-1.5 text-xs font-semibold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Edit Product</span>
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)} className="rounded-xl text-xs">
                    Close
                  </Button>
                  {"isPermitted" in selectedProductDetails && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const id = "dbProductId" in selectedProductDetails && selectedProductDetails.dbProductId ? selectedProductDetails.dbProductId : ("id" in selectedProductDetails ? selectedProductDetails.id : selectedProductDetails.zendropId);
                        const isItemImp = "isImported" in selectedProductDetails ? selectedProductDetails.isImported : true;
                        handleToggleProductPermission(
                          id,
                          isItemImp,
                          selectedProductDetails.isPermitted,
                          "wholesalePrice" in selectedProductDetails ? (selectedProductDetails as ZendropCatalogItem) : undefined
                        );
                        setIsDetailsOpen(false);
                      }}
                      className={`rounded-xl font-bold text-xs ${
                        selectedProductDetails.isPermitted
                          ? "bg-rose-500 hover:bg-rose-600 text-white"
                          : "bg-amber-500 hover:bg-amber-600 text-black"
                      }`}
                    >
                      {selectedProductDetails.isPermitted ? "Revoke Showcasing Permission" : "Grant Showcasing Permission"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
