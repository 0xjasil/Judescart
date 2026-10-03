import VariationsPage from "@/components/variations/VariationsPage";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  let initialAttributes = [];

  try {
    const res = await fetch(`${apiUrl}/attributes`, { cache: "no-store" });
    if (res.ok) {
      initialAttributes = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch initial attributes:", err);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Variations</h1>
              <p className="text-muted-foreground">Manage attributes and values</p>
            </div>
          </div>
          <VariationsPage initialData={Array.isArray(initialAttributes) ? initialAttributes : []} />
        </div>
      </div>
    </div>
  );
}



