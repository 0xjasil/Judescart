import { BrandDialogForm } from "@/components/brand/brand-dialog-from";
import BrandTable from "@/components/brand/brand-table";
import { Brand } from "@prisma/client";
import { brandColumns } from "@/components/brand/brand-columns";

export const dynamic = 'force-dynamic';

export default async function BrandPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  let brands: Brand[] = [];

  try {
    const res = await fetch(`${apiUrl}/brands`, {
      cache: "no-store",
    });

    if (res.ok) {
      brands = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch brands:", err);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
              <p className="text-muted-foreground">Manage Brands</p>
            </div>
            <BrandDialogForm />
          </div>

          {/* Brand Table */}
          <BrandTable data={brands} columns={brandColumns} />
        </div>
      </div>
    </div>
  );
}
