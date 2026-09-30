import { prisma } from "../lib/prisma.js";

async function main() {
  const reqQuery: any = { limit: '100' };
  const { 
    categoryId, 
    category,
    subCategoryId, 
    brandId, 
    search, 
    searchType, 
    sort, 
    priceRanges, 
    page = '1', 
    limit = '10',
    isCustomerFavorite,
    isNewArrival,
    trending,
    includeAll,
  } = reqQuery;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const where: any = {};

  if (includeAll !== 'true') {
    where.isPermitted = { not: false };
  }

  try {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          subCategory: true,
          variants: {
            include: {
              options: {
                include: {
                  attribute: true,
                  attributeValue: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.product.count({ where })
    ]);

    console.log("SUCCESS FETCHED PRODUCTS:", products.length, "Total:", totalCount);
    const cats = await prisma.category.findMany({
      include: { _count: { select: { products: true } } }
    });
    console.log("CATEGORIES AND COUNTS:", JSON.stringify(cats.map(c => ({ id: c.id, name: c.name, productCount: c._count.products })), null, 2));
    console.log("PRODUCTS LIST:", JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category?.name, isPermitted: (p as any).isPermitted })), null, 2));
  } catch (err) {
    console.error("DEBUG QUERY ERROR:", err);
  }
}

main().finally(() => prisma.$disconnect());
