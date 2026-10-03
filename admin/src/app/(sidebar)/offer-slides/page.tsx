"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, MoreVertical, ImageIcon, Eye, Palette, Type, MousePointerClick } from "lucide-react";
import { API_URL } from "@/lib/api-client";

type OfferSlide = {
  id: string;
  image: string;
  route: string;
  order: number;
  isActive: boolean;
  // Content
  title?: string | null;
  tagline?: string | null;
  badgeLabel?: string | null;
  buttonText?: string | null;
  // Visual
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  gradientDir?: string | null;
  titleColor?: string | null;
  buttonColor?: string | null;
  buttonTextColor?: string | null;
  imageOpacity?: number | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GRADIENT_OPTIONS = [
  { value: "to-r", label: "Left → Right" },
  { value: "to-l", label: "Right → Left" },
  { value: "to-b", label: "Top → Bottom" },
  { value: "to-t", label: "Bottom → Top" },
];

function hexRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function SlidePreview({ slide, previewImg }: { slide: Partial<OfferSlide>; previewImg?: string }) {
  const overlayCol = slide.overlayColor ?? "#061B3A";
  const overlayOp = slide.overlayOpacity ?? 0.75;
  const imgOp = slide.imageOpacity ?? 0.85;
  const gradDir = slide.gradientDir ?? "to-r";
  const titleCol = slide.titleColor ?? "#FFFFFF";
  const btnCol = slide.buttonColor ?? "#DF9F28";
  const btnTxtCol = slide.buttonTextColor ?? "#111111";
  const badge = slide.badgeLabel || "Featured Promotion";
  const title = slide.title || "Exclusive Seasonal Curation & Limited Offers";
  const tagline = slide.tagline || null;
  const btnText = slide.buttonText || "Claim Offer Now";
  const imgSrc = previewImg || slide.image || "";

  const gradCss =
    gradDir === "to-r"
      ? `linear-gradient(to right, ${hexRgba(overlayCol, overlayOp)}, ${hexRgba(overlayCol, overlayOp * 0.7)}, transparent)`
      : gradDir === "to-l"
      ? `linear-gradient(to left, ${hexRgba(overlayCol, overlayOp)}, ${hexRgba(overlayCol, overlayOp * 0.7)}, transparent)`
      : gradDir === "to-b"
      ? `linear-gradient(to bottom, ${hexRgba(overlayCol, overlayOp)}, ${hexRgba(overlayCol, overlayOp * 0.7)}, transparent)`
      : `linear-gradient(to top, ${hexRgba(overlayCol, overlayOp)}, ${hexRgba(overlayCol, overlayOp * 0.7)}, transparent)`;

  return (
    <div className="relative rounded-lg overflow-hidden bg-[#0A192F] text-white flex flex-col justify-between" style={{ height: 200 }}>
      {imgSrc && (
        <Image src={imgSrc} alt="Preview" fill className="object-cover object-center" style={{ opacity: imgOp }} unoptimized />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: gradCss }} />
      <div className="relative z-10 space-y-1 p-4">
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#DF9F28]/20 text-[#DF9F28] border border-[#DF9F28]/40">
          {badge}
        </span>
        <h3 className="text-sm font-bold leading-snug" style={{ color: titleCol }}>{title}</h3>
        {tagline && <p className="text-[10px] text-white/80">{tagline}</p>}
      </div>
      <div className="relative z-10 p-4 pt-0">
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: btnCol, color: btnTxtCol }}>
          {btnText}
        </span>
      </div>
    </div>
  );
}

// ─── Shared Form Fields ────────────────────────────────────────────────────────
function SlideFormFields({
  values,
  onChange,
  preview,
  onFileChange,
  imgRef,
}: {
  values: Partial<OfferSlide>;
  onChange: (field: keyof OfferSlide, val: string | number | null) => void;
  preview: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imgRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="content" className="flex items-center gap-1.5 text-xs"><Type className="w-3.5 h-3.5" />Content</TabsTrigger>
        <TabsTrigger value="visual" className="flex items-center gap-1.5 text-xs"><Palette className="w-3.5 h-3.5" />Visual</TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center gap-1.5 text-xs"><Eye className="w-3.5 h-3.5" />Preview</TabsTrigger>
      </TabsList>

      {/* ── Content Tab ── */}
      <TabsContent value="content" className="space-y-4 mt-0">
        {/* Route */}
        <div className="space-y-1.5">
          <Label>Route (link) *</Label>
          <Input
            value={values.route ?? ""}
            onChange={(e) => onChange("route", e.target.value)}
            placeholder="/shop/category/..."
          />
          <p className="text-xs text-muted-foreground">Where does the CTA button navigate?</p>
        </div>

        <Separator />

        {/* Badge label */}
        <div className="space-y-1.5">
          <Label>Badge Label</Label>
          <Input
            value={values.badgeLabel ?? ""}
            onChange={(e) => onChange("badgeLabel", e.target.value)}
            placeholder="Featured Promotion"
          />
          <p className="text-xs text-muted-foreground">Small tag shown above the title. Defaults to &quot;Featured Promotion&quot;.</p>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label>Slide Title</Label>
          <Input
            value={values.title ?? ""}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Exclusive Seasonal Curation & Limited Offers"
          />
          <p className="text-xs text-muted-foreground">Main headline displayed on the banner.</p>
        </div>

        {/* Tagline */}
        <div className="space-y-1.5">
          <Label>Tagline / Subtext</Label>
          <Input
            value={values.tagline ?? ""}
            onChange={(e) => onChange("tagline", e.target.value)}
            placeholder="Optional supporting text below the title..."
          />
          <p className="text-xs text-muted-foreground">Short supporting line beneath the title (optional).</p>
        </div>

        <Separator />

        {/* Button */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><MousePointerClick className="w-3.5 h-3.5" />CTA Button Text</Label>
          <Input
            value={values.buttonText ?? ""}
            onChange={(e) => onChange("buttonText", e.target.value)}
            placeholder="Claim Offer Now"
          />
        </div>
      </TabsContent>

      {/* ── Visual Tab ── */}
      <TabsContent value="visual" className="space-y-4 mt-0">
        {/* Image upload */}
        <div className="space-y-1.5">
          <Label>Banner Image</Label>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          <div
            onClick={() => imgRef.current?.click()}
            className="relative border-2 border-dashed border-border rounded-lg cursor-pointer overflow-hidden hover:border-primary transition-colors"
            style={{ height: 130 }}
          >
            {preview ? (
              <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">Click to upload image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Change Image</span>
            </div>
          </div>
        </div>

        {/* Image opacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Image Opacity</Label>
            <span className="text-xs text-muted-foreground font-mono">{Math.round((values.imageOpacity ?? 0.85) * 100)}%</span>
          </div>
          <Slider
            min={0} max={100} step={5}
            value={[Math.round((values.imageOpacity ?? 0.85) * 100)]}
            onValueChange={([v]) => onChange("imageOpacity", v / 100)}
          />
        </div>

        <Separator />

        {/* Overlay color */}
        <div className="space-y-1.5">
          <Label>Overlay / Gradient Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={values.overlayColor ?? "#061B3A"}
              onChange={(e) => onChange("overlayColor", e.target.value)}
              className="h-9 w-16 rounded border border-border cursor-pointer p-0.5 bg-background"
            />
            <Input
              value={values.overlayColor ?? "#061B3A"}
              onChange={(e) => onChange("overlayColor", e.target.value)}
              placeholder="#061B3A"
              className="font-mono text-sm"
            />
          </div>
        </div>

        {/* Overlay opacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Overlay Opacity</Label>
            <span className="text-xs text-muted-foreground font-mono">{Math.round((values.overlayOpacity ?? 0.75) * 100)}%</span>
          </div>
          <Slider
            min={0} max={100} step={5}
            value={[Math.round((values.overlayOpacity ?? 0.75) * 100)]}
            onValueChange={([v]) => onChange("overlayOpacity", v / 100)}
          />
        </div>

        {/* Gradient direction */}
        <div className="space-y-1.5">
          <Label>Gradient Direction</Label>
          <Select value={values.gradientDir ?? "to-r"} onValueChange={(v) => onChange("gradientDir", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRADIENT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Title color */}
        <div className="space-y-1.5">
          <Label>Title Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={values.titleColor ?? "#FFFFFF"}
              onChange={(e) => onChange("titleColor", e.target.value)}
              className="h-9 w-16 rounded border border-border cursor-pointer p-0.5 bg-background"
            />
            <Input
              value={values.titleColor ?? "#FFFFFF"}
              onChange={(e) => onChange("titleColor", e.target.value)}
              placeholder="#FFFFFF"
              className="font-mono text-sm"
            />
          </div>
        </div>

        {/* Button color */}
        <div className="space-y-1.5">
          <Label>Button Background Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={values.buttonColor ?? "#DF9F28"}
              onChange={(e) => onChange("buttonColor", e.target.value)}
              className="h-9 w-16 rounded border border-border cursor-pointer p-0.5 bg-background"
            />
            <Input
              value={values.buttonColor ?? "#DF9F28"}
              onChange={(e) => onChange("buttonColor", e.target.value)}
              placeholder="#DF9F28"
              className="font-mono text-sm"
            />
          </div>
        </div>

        {/* Button text color */}
        <div className="space-y-1.5">
          <Label>Button Text Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={values.buttonTextColor ?? "#111111"}
              onChange={(e) => onChange("buttonTextColor", e.target.value)}
              className="h-9 w-16 rounded border border-border cursor-pointer p-0.5 bg-background"
            />
            <Input
              value={values.buttonTextColor ?? "#111111"}
              onChange={(e) => onChange("buttonTextColor", e.target.value)}
              placeholder="#111111"
              className="font-mono text-sm"
            />
          </div>
        </div>
      </TabsContent>

      {/* ── Preview Tab ── */}
      <TabsContent value="preview" className="mt-0">
        <p className="text-xs text-muted-foreground mb-3">Live preview of your slide as it will appear on the homepage.</p>
        <SlidePreview slide={values} previewImg={preview || undefined} />
        <div className="mt-3 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
          <p><span className="font-semibold text-foreground">Route:</span> {values.route || "(not set)"}</p>
          <p><span className="font-semibold text-foreground">Title:</span> {values.title || "Exclusive Seasonal Curation & Limited Offers"}</p>
          <p><span className="font-semibold text-foreground">Tagline:</span> {values.tagline || "(none)"}</p>
          <p><span className="font-semibold text-foreground">Badge:</span> {values.badgeLabel || "Featured Promotion"}</p>
          <p><span className="font-semibold text-foreground">CTA:</span> {values.buttonText || "Claim Offer Now"}</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// ─── Delete Dialog ─────────────────────────────────────────────────────────────
function DeleteSlideDialog({ open, setOpen, slide, onDeleted }: {
  open: boolean; setOpen: (v: boolean) => void;
  slide: OfferSlide; onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/offer-slides/${slide.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Offer slide deleted");
      onDeleted();
    } catch { toast.error("Failed to delete"); }
    finally { setLoading(false); setOpen(false); }
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Offer Slide</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete this slide? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" disabled={loading} onClick={handleDelete}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Toggle Confirm Dialog ─────────────────────────────────────────────────────
function ToggleSlideDialog({ open, setOpen, slide, onToggled }: {
  open: boolean; setOpen: (v: boolean) => void;
  slide: OfferSlide; onToggled: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const next = !slide.isActive;
  const handleToggle = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("isActive", String(next));
      const res = await fetch(`${API_URL}/offer-slides/${slide.id}`, { method: "PATCH", body: formData });
      if (!res.ok) throw new Error();
      toast.success(`Slide marked as ${next ? "Active" : "Hidden"}`);
      onToggled();
    } catch { toast.error("Failed to update"); }
    finally { setLoading(false); setOpen(false); }
  };
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{next ? "Activate Slide" : "Hide Slide"}</AlertDialogTitle>
          <AlertDialogDescription>
            {next ? "This will make the slide visible on the homepage." : "This will hide the slide from the homepage."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={next ? "default" : "outline"} disabled={loading} onClick={handleToggle}>
              {loading ? "Updating..." : next ? "Yes, Activate" : "Yes, Hide"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Edit Dialog ───────────────────────────────────────────────────────────────
function EditSlideDialog({ open, setOpen, slide, onUpdated }: {
  open: boolean; setOpen: (v: boolean) => void;
  slide: OfferSlide; onUpdated: () => void;
}) {
  const [values, setValues] = useState<Partial<OfferSlide>>({ ...slide });
  const [preview, setPreview] = useState(slide.image);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: keyof OfferSlide, val: string | number | null) => {
    setValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (values.route !== undefined) formData.append("route", values.route ?? "");
      if (file) formData.append("image", file);
      // Content
      formData.append("title", values.title ?? "");
      formData.append("tagline", values.tagline ?? "");
      formData.append("badgeLabel", values.badgeLabel ?? "");
      formData.append("buttonText", values.buttonText ?? "");
      // Visual
      formData.append("overlayColor", values.overlayColor ?? "");
      formData.append("overlayOpacity", String(values.overlayOpacity ?? 0.75));
      formData.append("gradientDir", values.gradientDir ?? "to-r");
      formData.append("titleColor", values.titleColor ?? "");
      formData.append("buttonColor", values.buttonColor ?? "");
      formData.append("buttonTextColor", values.buttonTextColor ?? "");
      formData.append("imageOpacity", String(values.imageOpacity ?? 0.85));

      const res = await fetch(`${API_URL}/offer-slides/${slide.id}`, { method: "PATCH", body: formData });
      if (!res.ok) throw new Error();
      toast.success("Slide updated successfully");
      onUpdated(); setOpen(false);
    } catch { toast.error("Failed to update slide"); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Offer Slide</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Customize content, visuals, and overlay settings for this slide.
          </DialogDescription>
        </DialogHeader>
        <SlideFormFields values={values} onChange={handleChange} preview={preview} onFileChange={handleFile} imgRef={imgRef} />
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Row Actions ───────────────────────────────────────────────────────────────
function SlideActions({ slide, onRefresh }: { slide: OfferSlide; onRefresh: () => void }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openToggle, setOpenToggle] = useState(false);
  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>Edit Slide</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenToggle(true)}>
            {slide.isActive ? "Hide Slide" : "Activate Slide"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setOpenDelete(true)}>
            Delete Slide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {openEdit && <EditSlideDialog open={openEdit} setOpen={setOpenEdit} slide={slide} onUpdated={() => { setOpenEdit(false); onRefresh(); }} />}
      <ToggleSlideDialog open={openToggle} setOpen={setOpenToggle} slide={slide} onToggled={() => { setOpenToggle(false); onRefresh(); }} />
      <DeleteSlideDialog open={openDelete} setOpen={setOpenDelete} slide={slide} onDeleted={() => { setOpenDelete(false); onRefresh(); }} />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOfferSlidesPage() {
  const [slides, setSlides] = useState<OfferSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [newValues, setNewValues] = useState<Partial<OfferSlide>>({
    route: "",
    overlayColor: "#061B3A",
    overlayOpacity: 0.75,
    imageOpacity: 0.85,
    gradientDir: "to-r",
    titleColor: "#FFFFFF",
    buttonColor: "#DF9F28",
    buttonTextColor: "#111111",
  });
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: keyof OfferSlide, val: string | number | null) => {
    setNewValues((prev) => ({ ...prev, [field]: val }));
  };

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/offer-slides`);
      const data = await res.json();
      setSlides(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load slides"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleAdd = async () => {
    if (!file || !newValues.route) {
      toast.error("Please select an image and enter a route"); return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("route", newValues.route ?? "");
      // Content
      if (newValues.title) formData.append("title", newValues.title);
      if (newValues.tagline) formData.append("tagline", newValues.tagline);
      if (newValues.badgeLabel) formData.append("badgeLabel", newValues.badgeLabel);
      if (newValues.buttonText) formData.append("buttonText", newValues.buttonText);
      // Visual
      formData.append("overlayColor", newValues.overlayColor ?? "#061B3A");
      formData.append("overlayOpacity", String(newValues.overlayOpacity ?? 0.75));
      formData.append("gradientDir", newValues.gradientDir ?? "to-r");
      formData.append("titleColor", newValues.titleColor ?? "#FFFFFF");
      formData.append("buttonColor", newValues.buttonColor ?? "#DF9F28");
      formData.append("buttonTextColor", newValues.buttonTextColor ?? "#111111");
      formData.append("imageOpacity", String(newValues.imageOpacity ?? 0.85));

      const res = await fetch(`${API_URL}/offer-slides`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      toast.success("Offer slide added successfully");
      setNewValues({
        route: "",
        overlayColor: "#061B3A",
        overlayOpacity: 0.75,
        imageOpacity: 0.85,
        gradientDir: "to-r",
        titleColor: "#FFFFFF",
        buttonColor: "#DF9F28",
        buttonTextColor: "#111111",
      });
      setFile(null); setPreview("");
      fetchSlides();
    } catch { toast.error("Failed to add slide"); }
    finally { setUploading(false); }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = slides.findIndex((s) => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === slides.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    try {
      const f1 = new FormData(); f1.append("order", String(swapIdx));
      const f2 = new FormData(); f2.append("order", String(idx));
      await Promise.all([
        fetch(`${API_URL}/offer-slides/${slides[idx].id}`, { method: "PATCH", body: f1 }),
        fetch(`${API_URL}/offer-slides/${slides[swapIdx].id}`, { method: "PATCH", body: f2 }),
      ]);
      fetchSlides();
    } catch { toast.error("Failed to reorder"); }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="container flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Offer Slides</h1>
              <p className="text-muted-foreground">Manage homepage offer banners — content, visuals & layout</p>
            </div>
          </div>

          {/* Add Slide */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Offer Slide</CardTitle>
              <CardDescription>Configure content, overlay, colors, and preview before publishing</CardDescription>
            </CardHeader>
            <CardContent>
              <SlideFormFields
                values={newValues}
                onChange={handleChange}
                preview={preview}
                onFileChange={handleFile}
                imgRef={imgRef}
              />
              <div className="pt-4 border-t border-border mt-4">
                <Button onClick={handleAdd} disabled={uploading || !file || !newValues.route} className="w-full sm:w-auto">
                  {uploading ? "Uploading..." : "Add Slide"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Slides List */}
          <Card>
            <CardHeader>
              <CardTitle>All Offer Slides</CardTitle>
              <CardDescription>{slides.length} slide{slides.length !== 1 ? "s" : ""} total</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
                </div>
              ) : slides.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  No offer slides yet. Add your first slide above.
                </div>
              ) : (
                <div className="space-y-3">
                  {slides.map((slide, idx) => (
                    <div key={slide.id} className="flex items-center gap-3 border border-border rounded-lg p-3 bg-card">
                      {/* Image thumbnail */}
                      <div className="relative rounded-md overflow-hidden flex-shrink-0 bg-muted border border-border" style={{ width: 100, height: 64 }}>
                        <Image src={slide.image} alt="Slide" fill className="object-cover" unoptimized />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-sm font-medium truncate">{slide.title || "Exclusive Seasonal Curation & Limited Offers"}</p>
                        <p className="text-xs text-muted-foreground truncate">{slide.route}</p>
                        {slide.badgeLabel && (
                          <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                            {slide.badgeLabel}
                          </span>
                        )}
                      </div>

                      {/* Visual swatches */}
                      <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                        {slide.overlayColor && (
                          <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: slide.overlayColor }} title={`Overlay: ${slide.overlayColor}`} />
                        )}
                        {slide.buttonColor && (
                          <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: slide.buttonColor }} title={`Button: ${slide.buttonColor}`} />
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        slide.isActive
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {slide.isActive ? "Active" : "Hidden"}
                      </span>

                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => handleReorder(slide.id, "up")}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === slides.length - 1} onClick={() => handleReorder(slide.id, "down")}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Three dot menu */}
                      <SlideActions slide={slide} onRefresh={fetchSlides} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
