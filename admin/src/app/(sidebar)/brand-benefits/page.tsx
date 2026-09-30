"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  ArrowRight,
  ImageIcon,
  Save,
  RefreshCw,
  Eye,
  Award,
} from "lucide-react";
import { API_URL, apiFetch } from "@/lib/api-client";

interface BenefitData {
  id?: string;
  tag: string;
  title: string;
  description: string;
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Title: string;
  benefit2Desc: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  isActive?: boolean;
}

const DEFAULT_BENEFITS: BenefitData = {
  tag: "The JudesCart Standard",
  title: "Bespoke Quality. Master Craftsmanship. Timeless Style.",
  description:
    "At JudesCart, every garment, fine leather good, and bespoke accessory is created with unyielding dedication to material excellence, tailored comfort, and verifiable authenticity.",
  benefit1Title: "Atelier Guarantee",
  benefit1Desc:
    "Comprehensive 1-year warranty on all apparel, leathers, and accessories.",
  benefit2Title: "Carbon-Neutral Dispatch",
  benefit2Desc:
    "Every order is packaged sustainably and shipped with 100% carbon-neutral delivery.",
  buttonText: "Explore the complete catalog",
  buttonLink: "/product",
  image: "/about_atelier.png",
  isActive: true,
};

export default function BrandBenefitsPage() {
  const [formData, setFormData] = useState<BenefitData>(DEFAULT_BENEFITS);
  const [preview, setPreview] = useState<string>(DEFAULT_BENEFITS.image);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchBenefits = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/benefits", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setFormData({
          tag: json.data.tag || DEFAULT_BENEFITS.tag,
          title: json.data.title || DEFAULT_BENEFITS.title,
          description: json.data.description || DEFAULT_BENEFITS.description,
          benefit1Title: json.data.benefit1Title || DEFAULT_BENEFITS.benefit1Title,
          benefit1Desc: json.data.benefit1Desc || DEFAULT_BENEFITS.benefit1Desc,
          benefit2Title: json.data.benefit2Title || DEFAULT_BENEFITS.benefit2Title,
          benefit2Desc: json.data.benefit2Desc || DEFAULT_BENEFITS.benefit2Desc,
          buttonText: json.data.buttonText || DEFAULT_BENEFITS.buttonText,
          buttonLink: json.data.buttonLink || DEFAULT_BENEFITS.buttonLink,
          image: json.data.image || DEFAULT_BENEFITS.image,
          isActive: json.data.isActive ?? true,
        });
        setPreview(json.data.image || DEFAULT_BENEFITS.image);
      }
    } catch (err) {
      console.error("Failed to load benefits CMS data:", err);
      toast.error("Failed to load brand benefits configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 8 * 1024 * 1024) {
      toast.error("Image size must be under 8 MB");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const bodyData = new FormData();
      bodyData.append("tag", formData.tag.trim());
      bodyData.append("title", formData.title.trim());
      bodyData.append("description", formData.description.trim());
      bodyData.append("benefit1Title", formData.benefit1Title.trim());
      bodyData.append("benefit1Desc", formData.benefit1Desc.trim());
      bodyData.append("benefit2Title", formData.benefit2Title.trim());
      bodyData.append("benefit2Desc", formData.benefit2Desc.trim());
      bodyData.append("buttonText", formData.buttonText.trim());
      bodyData.append("buttonLink", formData.buttonLink.trim());
      bodyData.append("isActive", String(formData.isActive ?? true));
      if (file) {
        bodyData.append("image", file);
      }

      const res = await fetch(`${API_URL}/benefits`, {
        method: "POST",
        body: bodyData,
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Brand Benefits updated successfully!");
        setFile(null);
        fetchBenefits();
      } else {
        toast.error(result.error || "Failed to update brand benefits");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving brand benefits");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="container flex flex-1 flex-col gap-4 py-4 md:py-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-500" />
              <span>Brand Benefits CMS</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage the storefront Brand Craftsmanship, Atelier Guarantee, and Value Propositions section.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchBenefits} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? "Saving Changes..." : "Publish to Storefront"}
            </Button>
          </div>
        </div>

        {/* Live Preview & Editor Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Editor Form (7 cols) */}
          <div className="xl:col-span-7 space-y-5">
            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Primary Content Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Headline & Overview</CardTitle>
                  <CardDescription>
                    Configure the main title, category badge, and brand summary statement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Badge / Category Tag</Label>
                    <Input
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. The JudesCart Standard"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Main Headline Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Bespoke Quality. Master Craftsmanship. Timeless Style."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Brand Narrative / Description</Label>
                    <Textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter the detailed brand craftsmanship paragraph..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Value Propositions Grid Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Value Proposition Cards (2 Slots)</span>
                  </CardTitle>
                  <CardDescription>
                    Customize the two guarantee/perk cards displayed to prospective buyers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Perk 1 */}
                  <div className="p-3.5 rounded-lg border bg-muted/20 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Value Prop #1 (Warranty / Guarantee)</span>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={formData.benefit1Title}
                        onChange={(e) => setFormData({ ...formData, benefit1Title: e.target.value })}
                        placeholder="e.g. Atelier Guarantee"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={formData.benefit1Desc}
                        onChange={(e) => setFormData({ ...formData, benefit1Desc: e.target.value })}
                        placeholder="e.g. Comprehensive 1-year warranty on all apparel..."
                      />
                    </div>
                  </div>

                  {/* Perk 2 */}
                  <div className="p-3.5 rounded-lg border bg-muted/20 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Leaf className="w-4 h-4 text-amber-600" />
                      <span>Value Prop #2 (Eco / Delivery Perk)</span>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input
                        value={formData.benefit2Title}
                        onChange={(e) => setFormData({ ...formData, benefit2Title: e.target.value })}
                        placeholder="e.g. Carbon-Neutral Dispatch"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={formData.benefit2Desc}
                        onChange={(e) => setFormData({ ...formData, benefit2Desc: e.target.value })}
                        placeholder="e.g. Every order is packaged sustainably..."
                      />
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Call to Action & Image Upload */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Call-to-Action & Visual Showcase</CardTitle>
                  <CardDescription>
                    Configure the action button and upload the right showcase photograph.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">CTA Button Label</Label>
                      <Input
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="e.g. Explore the complete catalog"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">CTA Destination URL</Label>
                      <Input
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        placeholder="e.g. /product"
                      />
                    </div>
                  </div>

                  {/* Image Upload Area */}
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs">Showcase Photo</Label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="relative border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors overflow-hidden bg-muted/20"
                      style={{ height: 180 }}
                    >
                      {preview ? (
                        <div className="relative w-full h-full">
                          <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-1">
                            <ImageIcon className="w-6 h-6 text-white" />
                            <span className="text-white text-xs font-semibold">Click to replace photo</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                          <ImageIcon className="w-8 h-8" />
                          <p className="text-xs font-medium">Click to upload showcase photo (Max 8 MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-2">
                <Button size="lg" onClick={handleSave} disabled={saving || loading} className="min-w-48">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Publishing..." : "Save & Publish"}
                </Button>
              </div>

            </form>
          </div>

          {/* Live Storefront Preview (5 cols) */}
          <div className="xl:col-span-5 space-y-3 sticky top-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" />
                <span>Live Storefront Preview</span>
              </span>
              <span className="text-xs text-muted-foreground">Real-time simulation</span>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white text-[#111111] shadow-md border border-[#E2E8F0] p-5 space-y-4">
              
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#946000]">
                  <Sparkles className="w-3.5 h-3.5 text-[#946000]" />
                  <span>{formData.tag || DEFAULT_BENEFITS.tag}</span>
                </div>

                <h3 className="text-lg font-bold leading-snug text-[#111111] tracking-tight">
                  {formData.title || DEFAULT_BENEFITS.title}
                </h3>

                <p className="text-xs text-[#334155] leading-relaxed line-clamp-3">
                  {formData.description || DEFAULT_BENEFITS.description}
                </p>
              </div>

              {/* Showcase Image in preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0] aspect-[16/9] w-full">
                <Image
                  src={preview || "/about_atelier.png"}
                  alt="Preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Value prop mini cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h4 className="font-bold text-[#111111] text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#946000]" />
                    <span>{formData.benefit1Title || DEFAULT_BENEFITS.benefit1Title}</span>
                  </h4>
                  <p className="text-[11px] text-[#334155] mt-1 leading-tight line-clamp-2">
                    {formData.benefit1Desc || DEFAULT_BENEFITS.benefit1Desc}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <h4 className="font-bold text-[#111111] text-xs flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#946000]" />
                    <span>{formData.benefit2Title || DEFAULT_BENEFITS.benefit2Title}</span>
                  </h4>
                  <p className="text-[11px] text-[#334155] mt-1 leading-tight line-clamp-2">
                    {formData.benefit2Desc || DEFAULT_BENEFITS.benefit2Desc}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#946000]">
                  <span>{formData.buttonText || DEFAULT_BENEFITS.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#946000]" />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
