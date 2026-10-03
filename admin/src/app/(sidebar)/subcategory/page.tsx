import { SubcategoryDialogForm } from "@/components/subcategory/subcategory-dialog-form";
import SubcategoryTable from "@/components/subcategory/subcategory-table";
import { subcategoryColumns } from "@/components/subcategory/subcategory-columns";
import { SubCategoryWithCategory } from "@/types/subcategory";

export const dynamic = 'force-dynamic';

export default async function SubcategoriesPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  let subcategories: SubCategoryWithCategory[] = [];

  try {
    const res = await fetch(`${apiUrl}/subcategories`, { cache: "no-store" });
    if (res.ok) {
      subcategories = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch subcategories:", err);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="container flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Subcategories</h1>
              <p className="text-muted-foreground">Manage all subcategories</p>
            </div>
            <SubcategoryDialogForm />
          </div>

          {/* Subcategories Table */}
          <SubcategoryTable columns={subcategoryColumns} data={Array.isArray(subcategories) ? subcategories : []} />
        </div>
      </div>
    </div>
  );
}
