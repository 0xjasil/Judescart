"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { API_URL } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { exportWinnersPDF, WinnerSummary } from "@/components/admin/analytics/analytic-pdf";
import AdminLoader from "@/components/admin/AdminLoader";
import { IconDownload, IconSearch } from "@tabler/icons-react";
import { ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

// ─── Showcase Upload Dialog ───────────────────────────────────────────────────
function ShowcaseDialog({ open, setOpen, winner, onSaved }: {
  open: boolean; setOpen: (v: boolean) => void;
  winner: WinnerSummary; onSaved: () => void;
}) {
  const [name, setName] = useState(winner.userName || "");
  const [place, setPlace] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Display name is required"); return; }
    if (!place.trim()) { toast.error("Place is required"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("winnerName", name.trim());
      fd.append("winnerPlace", place.trim());
      if (file) fd.append("winnerImage", file);

      const res = await fetch(`${API_URL}/draws/winners/${winner.id}/showcase`, {
        method: "PATCH", body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success("Winner showcase updated!");
      onSaved();
      setOpen(false);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error(err.message || "Failed to update showcase");
    }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Set Winner Showcase</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload a photo and story for this campaign winner.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Image upload */}
          <div className="space-y-1.5">
            <Label>Winner Photo <span className="text-destructive">*</span></Label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div
              onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-border rounded-xl cursor-pointer overflow-hidden hover:border-primary transition-colors bg-muted/20"
              style={{ height: 180 }}
            >
              {preview ? (
                <div className="relative w-full h-full">
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">Click to upload winner photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-1.5">
            <Label>Display Name <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maria Thomas" />
          </div>

          {/* Place */}
          <div className="space-y-1.5">
            <Label>Place / City <span className="text-destructive">*</span></Label>
            <Input value={place} onChange={e => setPlace(e.target.value)} placeholder="e.g. Kozhikode" />
          </div>

          {/* Context */}
          <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 space-y-0.5">
            <p><span className="font-medium">Campaign:</span> {winner.campaignName}</p>
            <p><span className="font-medium">Prize:</span> {winner.prizeName}</p>
            <p><span className="font-medium">Ticket:</span> {winner.ticketNumber}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Publish to Homepage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WinnerReportsPage() {
  const [winners, setWinners] = useState<WinnerSummary[]>([]);
  const [filteredWinners, setFilteredWinners] = useState<WinnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showcaseWinner, setShowcaseWinner] = useState<WinnerSummary | null>(null);

  const fetchWinners = async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/winners-report`);
      if (response.ok) {
        const data = await response.json();
        const transformed = data.map((w: Omit<WinnerSummary, "drawnAt"> & { drawnAt: string | Date }) => ({ ...w, drawnAt: new Date(w.drawnAt) }));
        setWinners(transformed);
        setFilteredWinners(transformed);
      }
    } catch (error) {
      console.error("Failed to fetch winners analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWinners(); }, []);

  useEffect(() => {
    const term = search.toLowerCase().trim();
    if (!term) { setFilteredWinners(winners); return; }
    setFilteredWinners(winners.filter(w =>
      w.ticketNumber.toLowerCase().includes(term) ||
      w.userName.toLowerCase().includes(term) ||
      w.userEmail.toLowerCase().includes(term) ||
      w.campaignName.toLowerCase().includes(term) ||
      w.prizeName.toLowerCase().includes(term)
    ));
  }, [search, winners]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><AdminLoader /></div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lucky Draw Winner Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Total Winners: {winners.length}</p>
        </div>
        <Button onClick={() => exportWinnersPDF(filteredWinners, "All Time")} className="flex items-center gap-2">
          <IconDownload size={18} /> Export to PDF
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm mb-6 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch size={18} /></div>
        <input
          type="text"
          placeholder="Search winners, campaigns, tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket Number</TableHead>
              <TableHead>Winner Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Prize</TableHead>
              <TableHead>Drawn At</TableHead>
              <TableHead className="text-right">Showcase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWinners.map((winner) => (
              <TableRow key={winner.id}>
                <TableCell className="font-mono font-bold text-sky-600">{winner.ticketNumber}</TableCell>
                <TableCell className="font-medium">{winner.userName}</TableCell>
                <TableCell>{winner.userEmail}</TableCell>
                <TableCell>{winner.userPhone}</TableCell>
                <TableCell>{winner.campaignName}</TableCell>
                <TableCell className="font-semibold text-purple-700">{winner.prizeName}</TableCell>
                <TableCell>{new Date(winner.drawnAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => setShowcaseWinner(winner)}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Set Showcase
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredWinners.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">No winners found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showcaseWinner && (
        <ShowcaseDialog
          open={!!showcaseWinner}
          setOpen={(v) => !v && setShowcaseWinner(null)}
          winner={showcaseWinner}
          onSaved={fetchWinners}
        />
      )}
    </div>
  );
}
