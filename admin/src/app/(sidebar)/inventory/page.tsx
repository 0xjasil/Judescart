import { inventoryColumns } from "@/components/inventory/inventory-column";
import InventoryTable from "@/components/inventory/inventory-table";
import React from "react";
import { Brand, Category } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  let brands: Brand[] = [];
  let categories: Category[] = [];

  try {
    const [brandsRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/brands`, { cache: "no-store" }),
      fetch(`${apiUrl}/categories`, { cache: "no-store" }),
    ]);

    if (brandsRes.ok) {
      brands = await brandsRes.json();
    }
    if (categoriesRes.ok) {
      categories = await categoriesRes.json();
    }
  } catch (err) {
    console.error("Failed to fetch brands/categories for inventory:", err);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
              <p className="text-muted-foreground">Manage Inventory</p>
            </div>
          </div>

          <InventoryTable brands={Array.isArray(brands) ? brands : []} categories={Array.isArray(categories) ? categories : []} columns={inventoryColumns} />
        </div>
      </div>
    </div>
  );
}
