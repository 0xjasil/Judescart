import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding / updating featured customer favourite products in DB...');

  // 1. Get or create JudesCart Brand
  let judesBrand = await prisma.brand.findFirst({
    where: { name: { in: ['JudesCart', 'Steve John Atelier', 'Steve John Craft'] } }
  });
  if (!judesBrand) {
    judesBrand = await prisma.brand.create({
      data: { name: 'JudesCart' }
    });
  }

  // 2. Mark existing top products as customer favorites
  await prisma.product.updateMany({
    where: {
      name: {
        in: [
          'Sartorial Italian Wool Blend Blazer',
          'Heritage Full-Grain Leather Weekender Duffle',
          'Classic Denim Jeans',
          'Puffer Winter Jacket',
          'Striped Polo Shirt',
          'Floral Print Summer Dress'
        ]
      }
    },
    data: {
      isCustomerFavorite: true,
      isNewArrival: true,
    }
  });

  // 3. Ensure essential categories exist
  const categoriesToEnsure = [
    { name: 'Apparel', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80' },
    { name: 'Leather Goods', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
    { name: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
    { name: 'Home Living', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80' },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoriesToEnsure) {
    let cat = await prisma.category.findFirst({ where: { name: { equals: c.name, mode: 'insensitive' } } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name: c.name, image: c.image } });
    }
    catMap[c.name] = cat.id;
  }

  // 4. Create premium JudesCart signature products if they don't exist
  const signatureProducts = [
    {
      name: 'Utility Wool Blend Overshirt',
      description: 'Tailored heavy wool-blend overshirt with horn buttons and structured utility pockets.',
      categoryName: 'Apparel',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      price: 5249,
      offerPrice: 4299,
      isCustomerFavorite: true,
      isNewArrival: true,
    },
    {
      name: 'Executive Full-Grain Leather Briefcase',
      description: 'Handcrafted executive briefcase engineered with Italian calf leather and brass hardware.',
      categoryName: 'Leather Goods',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      price: 9999,
      offerPrice: 8299,
      isCustomerFavorite: true,
      isNewArrival: true,
    },
    {
      name: 'Italian Calfskin Oxford Dress Shoes',
      description: 'Classic Goodyear-welted burnished leather oxfords with cushioned leather insoles.',
      categoryName: 'Footwear',
      image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80',
      price: 11999,
      offerPrice: 8999,
      isCustomerFavorite: true,
      isNewArrival: true,
    },
    {
      name: 'Precision Wireless ANC Studio Headphones',
      description: 'Acoustic perfection featuring bespoke leather ear cushions and active noise cancellation.',
      categoryName: 'Accessories',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      price: 8999,
      offerPrice: 6499,
      isCustomerFavorite: true,
      isNewArrival: true,
    },
    {
      name: 'Bespoke Pure Cashmere Throw Blanket',
      description: 'Plush hand-spun Mongolian cashmere throw blanket woven for incomparable warmth and elegance.',
      categoryName: 'Home Living',
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
      price: 6999,
      offerPrice: 5499,
      isCustomerFavorite: true,
      isNewArrival: true,
    },
  ];

  for (const sp of signatureProducts) {
    const existing = await prisma.product.findFirst({ where: { name: sp.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: sp.name,
          description: sp.description,
          image: sp.image,
          categoryId: catMap[sp.categoryName],
          brandId: judesBrand.id,
          isCustomerFavorite: sp.isCustomerFavorite,
          isNewArrival: sp.isNewArrival,
          variants: {
            create: [
              {
                price: sp.price,
                offerPrice: sp.offerPrice,
                qty: 50,
                sku: `JUDES-${sp.name.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
                images: [sp.image],
              }
            ]
          }
        }
      });
      console.log(`Created product: ${sp.name}`);
    }
  }

  console.log('Finished seeding featured products.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
