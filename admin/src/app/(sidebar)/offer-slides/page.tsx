"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { ArrowUp, ArrowDown, MoreVertical, ImageIcon } from "lucide-react";
import { API_URL } from "@/lib/api-client";

type OfferSlide = {
  id: string;
  image: string;
  route: string;
  order: number;
  isActive: boolean;
};

// ─── Delete Dialog ─────────────────────────────────────────────────────────
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

// ─── Toggle Confirm Dialog ─────────────────────────────────────────────────
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
      
      const res = await fetch(`${API_URL}/offer-slides/${slide.id}`, {
        method: "PATCH",
        body: formData,
      });
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

// ─── Edit Dialog ──────────────────────────────────────────────────────────
function EditSlideDialog({ open, setOpen, slide, onUpdated }: {
  open: boolean; setOpen: (v: boolean) => void;
  slide: OfferSlide; onUpdated: () => void;
}) {
  const [route, setRoute] = useState(slide.route);
  const [preview, setPreview] = useState(slide.image);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
const validateImageSize = (file: File): boolean => {
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be under 5 MB");
    return false;
  }
  return true;
};

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!validateImageSize(f)) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("route", route);
      if (file) {
          formData.append("image", file);
      }
      
      const res = await fetch(`${API_URL}/offer-slides/${slide.id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) throw new Error();
      toast.success("Slide updated successfully");
      onUpdated(); setOpen(false);
    } catch { toast.error("Failed to update slide"); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Offer Slide</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update offer slide link route and banner image.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Route (link)</label>
            <Input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="/shop/category/..." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Image</label>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div onClick={() => imgRef.current?.click()}
              className="relative border-2 border-dashed border-border rounded-lg cursor-pointer overflow-hidden hover:border-primary transition-colors"
              style={{ height: 160 }}>
              <Image src={preview} alt="Preview" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Change Image</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Row Actions ──────────────────────────────────────────────────────────
function SlideActions({ slide, onRefresh }: {
  slide: OfferSlide;
  onRefresh: () => void;
}) {
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

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function AdminOfferSlidesPage() {
  const [slides, setSlides] = useState<OfferSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [route, setRoute] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!validateImageSize(f)) return; 
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleAdd = async () => {
    if (!file || !route) {
      toast.error("Please select an image and enter a route"); return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("route", route);
      
      const res = await fetch(`${API_URL}/offer-slides`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      toast.success("Offer slide added successfully");
      setRoute(""); setFile(null); setPreview(null);
      fetchSlides();
    } catch { toast.error("Failed to add slide"); }
    finally { setUploading(false); }
  };
const validateImageSize = (file: File): boolean => {
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be under 5 MB");
    return false;
  }
  return true;
};
  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = slides.findIndex((s) => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === slides.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    
    try {
        const formData1 = new FormData();
        formData1.append("order", String(swapIdx));
        const formData2 = new FormData();
        formData2.append("order", String(idx));
        
        await Promise.all([
          fetch(`${API_URL}/offer-slides/${slides[idx].id}`, { method: "PATCH", body: formData1 }),
          fetch(`${API_URL}/offer-slides/${slides[swapIdx].id}`, { method: "PATCH", body: formData2 }),
        ]);
        fetchSlides();
    } catch {
        toast.error("Failed to reorder");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="container flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Offer Slides</h1>
              <p className="text-muted-foreground">Manage homepage offer banners</p>
            </div>
          </div>

          {/* Add Slide */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Offer Slide</CardTitle>
              <CardDescription>Upload a banner image and set the link route</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 max-w-sm">
                <label className="text-sm font-medium">Route (link) *</label>
                <Input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="/shop/category/..." />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Banner Image *</label>
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <div onClick={() => imgRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors overflow-hidden max-w-sm"
                  style={{ height: 150 }}>
                  {preview ? (
                    <div className="relative w-full h-full">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">Click to upload image</span>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleAdd} disabled={uploading || !file || !route}>
                {uploading ? "Uploading..." : "Add Slide"}
              </Button>
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
                        <Image src={slide.image} alt="Slide" fill className="object-cover" />
                      </div>

                      {/* Route */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{slide.route}</p>
                      </div>

                      {/* Status badge */}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        slide.isActive
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {slide.isActive ? "Active" : "Hidden"}
                      </span>

                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5">
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
