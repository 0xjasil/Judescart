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
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface ZendropSettings {
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
}

interface ImportedProduct {
  id: string;
  zendropId: string;
  name: string;
  image: string;
  category: string;
  brand: string;
  wholesaleCost: number;
  storePrice: number;
  estimatedMargin: number;
  totalStock: number;
  variantsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ZendropIntegrationPage() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [settings, setSettings] = useState<ZendropSettings>({
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
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [connectionMessage, setConnectionMessage] = useState("");

  // Catalog state
  const [catalog, setCatalog] = useState<ZendropCatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [importingId, setImportingId] = useState<string | null>(null);

  // Imported products state
  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [isLoadingImported, setIsLoadingImported] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

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

  // Save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const payload: any = {
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

  // Test connection
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

  // 1-Click Import
  const handleImportProduct = async (item: ZendropCatalogItem) => {
    setImportingId(item.zendropId);
    try {
      const res = await apiFetch("/zendrop/import", {
        method: "POST",
        body: JSON.stringify({
          zendropId: item.zendropId,
          customPrice: item.calculatedSellingPrice,
          isCustomerFavorite: false,
          isNewArrival: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || `Imported "${item.name}"!`);
        // Refresh catalog and imported list
        fetchCatalog();
        fetchImported();
      } else {
        toast.error(json.error || "Failed to import product");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to import product");
    } finally {
      setImportingId(null);
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

  const categoriesList = ["ALL", "Apparel", "Leather Goods", "Accessories", "Footwear"];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-xl border border-amber-500/30 text-amber-500">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Zendrop Dropshipping Integration
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Import verified dropship products, sync stock & pricing, and manage your profit margins.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Connection Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
              settings.hasApiKey
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : "bg-amber-500/10 border-amber-500/30 text-amber-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                settings.hasApiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            {settings.hasApiKey ? "API Connected (Ready to Import)" : "API Key Not Set"}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchCatalog();
              fetchImported();
            }}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Catalog Available
              </p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {catalog.length} Products
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Verified Dropship Items</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Boxes className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Imported to Store
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">
                {importedProducts.length} Active
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Live on Steve John Store</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Configured Markup
              </p>
              <h3 className="text-2xl font-extrabold text-amber-500 mt-1">
                +{settings.markupPercent}% Margin
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Auto-applied on wholesale</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Avg Dispatch Time
              </p>
              <h3 className="text-2xl font-extrabold text-purple-500 mt-1">2-4 Days</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Fast tracked supplier lane</p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 max-w-md">
          <TabsTrigger value="catalog" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5">
            <Package className="h-4 w-4" />
            <span>Catalog Explorer</span>
          </TabsTrigger>
          <TabsTrigger value="imported" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5">
            <Boxes className="h-4 w-4" />
            <span>Imported ({importedProducts.length})</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5">
            <Key className="h-4 w-4" />
            <span>API & Markup</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CATALOG EXPLORER */}
        <TabsContent value="catalog" className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-card p-4 rounded-xl border border-border/40 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, keywords, or SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchCatalog(e.target.value, selectedCategory);
                }}
                className="pl-9 h-10"
              />
            </div>

            {/* Category Pills */}
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
                  className="rounded-lg text-xs font-medium"
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
            <div className="text-center py-16 bg-card rounded-2xl border border-border/40">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-bold text-foreground">No Zendrop products found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                Try adjusting your search keywords or filter to browse more items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalog.map((item) => (
                <Card
                  key={item.zendropId}
                  className="group overflow-hidden rounded-2xl border-border/40 bg-card hover:shadow-lg transition-all flex flex-col"
                >
                  {/* Image Showcase */}
                  <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <Badge className="bg-black/70 backdrop-blur-md text-white border-white/20 text-[11px] font-semibold">
                        {item.categoryName}
                      </Badge>
                      <Badge className="bg-amber-500/90 text-black font-bold text-[11px]">
                        ★ {item.rating}
                      </Badge>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs gap-1 font-medium">
                        <Truck className="h-3 w-3 text-muted-foreground" />
                        <span>{item.shippingDays}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono">{item.zendropId}</span>
                        <span>{item.variants.length} Variants</span>
                      </div>

                      <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Pricing Breakdown Card */}
                    <div className="bg-muted/40 rounded-xl p-3 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Wholesale Cost:</span>
                        <span className="font-mono font-semibold text-foreground">₹{item.wholesalePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Store Retail Price:</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] text-muted-foreground line-through">₹{item.calculatedListPrice.toLocaleString()}</span>
                          <span className="font-bold text-sm text-amber-500 font-mono">₹{item.calculatedSellingPrice.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
                        <span className="font-medium text-emerald-500 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Est. Profit ({item.profitPercent}%):
                        </span>
                        <span className="font-bold text-emerald-500 font-mono">+₹{item.profitMargin.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1">
                      {item.isImported ? (
                        <Button
                          disabled
                          variant="secondary"
                          className="w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Imported in Store</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleImportProduct(item)}
                          disabled={importingId === item.zendropId}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold gap-2 shadow-sm"
                        >
                          {importingId === item.zendropId ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Importing to Store...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span>1-Click Import to Store</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: IMPORTED PRODUCTS */}
        <TabsContent value="imported" className="space-y-6">
          <Card className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold">Imported Zendrop Products</CardTitle>
                <CardDescription>
                  Products currently active in Steve John catalog linked with Zendrop inventory.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchImported} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh List</span>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingImported ? (
                <div className="py-12 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground opacity-60" />
                  <p className="text-sm text-muted-foreground mt-2">Loading imported products...</p>
                </div>
              ) : importedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Boxes className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <h3 className="text-base font-bold text-foreground">No products imported yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                    Go to the Catalog Explorer tab and click &quot;1-Click Import to Store&quot; on any product.
                  </p>
                  <Button
                    onClick={() => setActiveTab("catalog")}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  >
                    Browse Zendrop Catalog
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/40">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Zendrop SKU</th>
                        <th className="px-4 py-3">Wholesale</th>
                        <th className="px-4 py-3">Retail Price</th>
                        <th className="px-4 py-3">Margin</th>
                        <th className="px-4 py-3">Stock Qty</th>
                        <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {importedProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted border border-border/40 shrink-0">
                                <Image
                                  src={p.image || "/placeholder.svg"}
                                  alt={p.name}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <p className="font-semibold text-foreground truncate">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{p.variantsCount} variants</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-medium">{p.category}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.zendropId}</td>
                          <td className="px-4 py-3 font-mono text-foreground font-medium">₹{p.wholesaleCost.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono font-bold text-amber-500">₹{p.storePrice.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-emerald-500">+₹{p.estimatedMargin.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={p.totalStock > 20 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-amber-500/10 text-amber-500 border-amber-500/30"}
                            >
                              {p.totalStock} in stock
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSyncProduct(p.id, p.name)}
                                disabled={syncingId === p.id}
                                className="gap-1 text-xs"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${syncingId === p.id ? "animate-spin" : ""}`} />
                                <span>Sync</span>
                              </Button>

                              <Link href={`/products`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: API & SETTINGS */}
        <TabsContent value="settings" className="space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  <span>Zendrop API Authentication</span>
                </CardTitle>
                <CardDescription>
                  Enter your Zendrop API Key or Access Token to link your store with supplier catalog feeds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="font-semibold text-sm">
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
                      className="pr-24 font-mono text-sm h-11"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-8 w-8 p-0"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Obtain your API Key from Zendrop Dashboard &gt; Settings &gt; API &amp; Integrations.
                  </p>
                </div>

                {/* Connection Test Action */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="gap-2"
                  >
                    {isTestingConnection ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Testing Gateway...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-amber-500" />
                        <span>Test &amp; Verify Connection</span>
                      </>
                    )}
                  </Button>

                  {connectionStatus === "success" && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{connectionMessage || "Connection Verified"}</span>
                    </div>
                  )}

                  {connectionStatus === "error" && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                      <AlertCircle className="h-4 w-4" />
                      <span>{connectionMessage || "Authentication Failed"}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Markup Configuration */}
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-amber-500" />
                  <span>Profit Margin &amp; Price Rules</span>
                </CardTitle>
                <CardDescription>
                  Configure automated retail pricing rules applied on top of Zendrop wholesale prices upon import.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="markupPercent" className="font-semibold text-sm">
                      Default Profit Markup Percentage (%)
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
                        className="pr-9 h-11 font-mono"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Example: 35% markup on ₹4,000 wholesale calculates to ₹5,400 retail price.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultBrandName" className="font-semibold text-sm">
                      Default Brand Assignment
                    </Label>
                    <Input
                      id="defaultBrandName"
                      value={settings.defaultBrandName}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultBrandName: e.target.value })
                      }
                      placeholder="e.g. Steve John Atelier"
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Brand assigned to imported items if not specified in supplier payload.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSavingSettings}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 h-11 gap-2 shadow-sm"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving Configuration...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Save Zendrop Settings</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
