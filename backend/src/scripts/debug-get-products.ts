import { prisma } from "../lib/prisma.js";

async function main() {
  const prods = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log("=== TOTAL PRODUCTS IN STORE DATABASE:", prods.length, "===");

  const report = prods.map((p, idx) => {
    const isZendrop = (p.description || '').includes('Zendrop SKU');
    const zendropMatch = (p.description || '').match(/\[Zendrop SKU:\s*([^\]]+)\]/);
    const zendropSku = zendropMatch ? zendropMatch[1].trim() : 'N/A';
    const totalStock = p.variants.reduce((sum, v) => sum + (v.qty || 0), 0);
    const priceDisplay = p.variants.length > 0 ? `₹${p.variants[0].price}` : 'N/A';

    return {
      no: idx + 1,
      id: p.id,
      name: p.name,
      origin: isZendrop ? `⚡ IMPORTED FROM ZENDROP API (${zendropSku})` : `📦 STORE DIRECT DB (Manual/Seeded)`,
      category: p.category?.name || 'Uncategorized',
      brand: p.brand?.name || 'Steve John',
      price: priceDisplay,
      variantsCount: p.variants.length,
      stock: totalStock,
      isPermitted: (p as any).isPermitted,
      createdAt: p.createdAt,
    };
  });

  console.log(JSON.stringify(report, null, 2));

  const zendropCount = report.filter(r => r.origin.includes('ZENDROP')).length;
  const localDbCount = report.filter(r => r.origin.includes('STORE DIRECT')).length;

  console.log("\n================ SUMMARY ================");
  console.log(`Total Products in Database: ${prods.length}`);
  console.log(`- Imported from Zendrop API: ${zendropCount}`);
  console.log(`- Created / Seeded directly in Database: ${localDbCount}`);
  console.log("=========================================\n");
}

main().finally(() => prisma.$disconnect());
