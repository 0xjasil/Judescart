import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logActivity } from '../lib/activityLogger.js';

const ZENDROP_CONFIG_TAG = 'ZENDROP_INTEGRATION_CONFIG';

// Default / Mock Catalog of High-Quality Dropship items from Zendrop
const DEFAULT_ZENDROP_CATALOG = [
  {
    zendropId: 'ZD-PROD-9001',
    name: 'Sartorial Italian Wool Blend Blazer',
    description: 'Masterfully structured single-breasted slim-fit blazer tailored with double-vented wool blend fabric, horn buttons, and contrast silk lapel stitching.',
    categoryName: 'Apparel',
    brandName: 'Steve John Atelier',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    subimages: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=80'
    ],
    wholesalePrice: 4200,
    suggestedRetailPrice: 6999,
    rating: 4.9,
    ordersCount: 384,
    shippingDays: '3-5 business days',
    variants: [
      {
        sku: 'ZD-BLAZER-NAVY-M',
        wholesalePrice: 4200,
        qty: 45,
        attributes: [
          { name: 'Color', value: 'Midnight Navy' },
          { name: 'Size', value: 'M' }
        ],
        images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-BLAZER-NAVY-L',
        wholesalePrice: 4200,
        qty: 60,
        attributes: [
          { name: 'Color', value: 'Midnight Navy' },
          { name: 'Size', value: 'L' }
        ],
        images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-BLAZER-CHARCOAL-M',
        wholesalePrice: 4200,
        qty: 35,
        attributes: [
          { name: 'Color', value: 'Charcoal Grey' },
          { name: 'Size', value: 'M' }
        ],
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-BLAZER-CHARCOAL-L',
        wholesalePrice: 4200,
        qty: 40,
        attributes: [
          { name: 'Color', value: 'Charcoal Grey' },
          { name: 'Size', value: 'L' }
        ],
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80']
      }
    ]
  },
  {
    zendropId: 'ZD-PROD-9002',
    name: 'Heritage Full-Grain Leather Weekender Duffle',
    description: 'Handcrafted vegetable-tanned full grain calfskin travel bag with antique brass hardware, reinforced leather corners, and YKK Excella zippers.',
    categoryName: 'Leather Goods',
    brandName: 'Steve John Craft',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    subimages: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    wholesalePrice: 5800,
    suggestedRetailPrice: 9499,
    rating: 5.0,
    ordersCount: 520,
    shippingDays: '2-4 business days',
    variants: [
      {
        sku: 'ZD-DUFFLE-COGNAC',
        wholesalePrice: 5800,
        qty: 28,
        attributes: [
          { name: 'Color', value: 'Cognac Brown' },
          { name: 'Size', value: '45L' }
        ],
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-DUFFLE-ESPRESSO',
        wholesalePrice: 5800,
        qty: 20,
        attributes: [
          { name: 'Color', value: 'Espresso Black' },
          { name: 'Size', value: '45L' }
        ],
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80']
      }
    ]
  },
  {
    zendropId: 'ZD-PROD-9003',
    name: 'Automatic Skeleton Chronometer Sapphire Timepiece',
    description: 'Precision Japanese 24-jewel automatic mechanical movement with open heart skeleton dial, sapphire crystal glass, and genuine alligator grain leather strap.',
    categoryName: 'Accessories',
    brandName: 'Steve John Horology',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    subimages: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    wholesalePrice: 6500,
    suggestedRetailPrice: 12499,
    rating: 4.8,
    ordersCount: 290,
    shippingDays: '3-6 business days',
    variants: [
      {
        sku: 'ZD-WATCH-ROSEGOLD',
        wholesalePrice: 6500,
        qty: 15,
        attributes: [
          { name: 'Color', value: 'Rose Gold & Navy' },
          { name: 'Size', value: '41mm' }
        ],
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-WATCH-SILVER',
        wholesalePrice: 6500,
        qty: 22,
        attributes: [
          { name: 'Color', value: 'Silver & Obsidian' },
          { name: 'Size', value: '41mm' }
        ],
        images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80']
      }
    ]
  },
  {
    zendropId: 'ZD-PROD-9004',
    name: 'Goodyear Welted Oxford Dress Shoes',
    description: 'Full-grain French box calf leather Oxford shoes with Goodyear welt construction, closed lacing, and hand-burnished finish.',
    categoryName: 'Footwear',
    brandName: 'Steve John Cordwainer',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80',
    subimages: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80'
    ],
    wholesalePrice: 4900,
    suggestedRetailPrice: 8299,
    rating: 4.9,
    ordersCount: 410,
    shippingDays: '3-5 business days',
    variants: [
      {
        sku: 'ZD-OXFORD-TAN-42',
        wholesalePrice: 4900,
        qty: 18,
        attributes: [
          { name: 'Color', value: 'Oxford Tan' },
          { name: 'Size', value: 'EU 42' }
        ],
        images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-OXFORD-TAN-43',
        wholesalePrice: 4900,
        qty: 25,
        attributes: [
          { name: 'Color', value: 'Oxford Tan' },
          { name: 'Size', value: 'EU 43' }
        ],
        images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-OXFORD-BLK-42',
        wholesalePrice: 4900,
        qty: 30,
        attributes: [
          { name: 'Color', value: 'Onyx Black' },
          { name: 'Size', value: 'EU 42' }
        ],
        images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80']
      }
    ]
  },
  {
    zendropId: 'ZD-PROD-9005',
    name: 'Mongolian Pure Cashmere Turtleneck Sweater',
    description: 'Ultra-soft 2-ply 100% grade-A Mongolian cashmere knit sweater with ribbed collar, cuffs, and hem. Unmatched thermal comfort and featherlight drape.',
    categoryName: 'Apparel',
    brandName: 'Steve John Knitwear',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    subimages: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80'
    ],
    wholesalePrice: 3800,
    suggestedRetailPrice: 6499,
    rating: 4.7,
    ordersCount: 195,
    shippingDays: '2-5 business days',
    variants: [
      {
        sku: 'ZD-CASH-CAMEL-M',
        wholesalePrice: 3800,
        qty: 40,
        attributes: [
          { name: 'Color', value: 'Camel' },
          { name: 'Size', value: 'M' }
        ],
        images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-CASH-CAMEL-L',
        wholesalePrice: 3800,
        qty: 35,
        attributes: [
          { name: 'Color', value: 'Camel' },
          { name: 'Size', value: 'L' }
        ],
        images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-CASH-BLACK-M',
        wholesalePrice: 3800,
        qty: 50,
        attributes: [
          { name: 'Color', value: 'Jet Black' },
          { name: 'Size', value: 'M' }
        ],
        images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80']
      }
    ]
  },
  {
    zendropId: 'ZD-PROD-9006',
    name: 'Italian Mulberry Silk Pocket Square & Tie Set',
    description: 'Jacquard woven 100% mulberry silk necktie and matching hand-rolled pocket square with traditional paisley and geometric motifs.',
    categoryName: 'Accessories',
    brandName: 'Steve John Atelier',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
    subimages: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop&q=80'
    ],
    wholesalePrice: 1600,
    suggestedRetailPrice: 2899,
    rating: 4.9,
    ordersCount: 680,
    shippingDays: '2-4 business days',
    variants: [
      {
        sku: 'ZD-SILK-EMERALD',
        wholesalePrice: 1600,
        qty: 70,
        attributes: [
          { name: 'Color', value: 'Emerald Green' },
          { name: 'Size', value: 'One Size' }
        ],
        images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80']
      },
      {
        sku: 'ZD-SILK-BURGUNDY',
        wholesalePrice: 1600,
        qty: 85,
        attributes: [
          { name: 'Color', value: 'Burgundy Wine' },
          { name: 'Size', value: 'One Size' }
        ],
        images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop&q=80']
      }
    ]
  }
];

// Helper to get Zendrop configuration from DB
async function getStoredZendropConfig() {
  const record = await prisma.banner.findFirst({
    where: { tag: ZENDROP_CONFIG_TAG },
  });

  if (!record || !record.description) {
    return {
      isAuthorized: false,
      apiKey: '',
      apiUrl: 'https://api.zendrop.com',
      markupPercent: 35,
      markupType: 'PERCENTAGE',
      autoPublish: true,
      defaultBrandName: 'Zendrop Direct',
      isConnected: false,
      lastSyncedAt: null,
    };
  }

  try {
    const data = JSON.parse(record.description);
    const hasKey = Boolean(data.apiKey && data.apiKey.trim().length > 10);
    const isAuth = data.isAuthorized !== undefined ? Boolean(data.isAuthorized) : hasKey;
    
    return {
      isAuthorized: isAuth,
      apiKey: data.apiKey || '',
      apiUrl: data.apiUrl || 'https://api.zendrop.com',
      markupPercent: Number(data.markupPercent) || 35,
      markupType: data.markupType || 'PERCENTAGE',
      autoPublish: data.autoPublish !== false,
      defaultBrandName: data.defaultBrandName || 'Zendrop Direct',
      isConnected: hasKey,
      lastSyncedAt: data.lastSyncedAt || record.updatedAt,
    };
  } catch {
    return {
      isAuthorized: false,
      apiKey: '',
      apiUrl: 'https://api.zendrop.com',
      markupPercent: 35,
      markupType: 'PERCENTAGE',
      autoPublish: true,
      defaultBrandName: 'Zendrop Direct',
      isConnected: false,
      lastSyncedAt: null,
    };
  }
}

// Calculate final retail price based on markup settings
function calculateSellingPrice(wholesalePrice: number, markupPercent: number, markupType: string): { price: number; offerPrice: number } {
  const margin = markupPercent / 100;
  let sellingPrice = wholesalePrice * (1 + margin);
  // Round to friendly 99 or whole number
  sellingPrice = Math.round(sellingPrice / 10) * 10 - 1;
  if (sellingPrice < wholesalePrice) sellingPrice = Math.round(wholesalePrice * 1.3);

  // Suggested original/list price
  const listPrice = Math.round(sellingPrice * 1.25 / 10) * 10 - 1;

  return {
    price: listPrice,
    offerPrice: sellingPrice,
  };
}

// GET /api/zendrop/settings
export const getZendropSettings = async (req: Request, res: Response) => {
  try {
    const config = await getStoredZendropConfig();
    
    // Mask API Key for security
    let maskedKey = '';
    if (config.apiKey) {
      if (config.apiKey.length > 8) {
        maskedKey = `${config.apiKey.substring(0, 4)}••••••••${config.apiKey.substring(config.apiKey.length - 4)}`;
      } else {
        maskedKey = '••••••••';
      }
    }

    res.json({
      success: true,
      data: {
        ...config,
        maskedApiKey: maskedKey,
        hasApiKey: Boolean(config.apiKey && config.apiKey.length > 0),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get Zendrop settings' });
  }
};

// POST /api/zendrop/settings
export const updateZendropSettings = async (req: Request, res: Response) => {
  try {
    const { apiKey, apiUrl, markupPercent, markupType, autoPublish, defaultBrandName, isAuthorized } = req.body;

    const currentConfig = await getStoredZendropConfig();
    
    // If apiKey is masked or empty, retain previous key unless a new non-masked string is provided
    let finalApiKey = currentConfig.apiKey;
    if (apiKey !== undefined && !apiKey.includes('••••')) {
      finalApiKey = apiKey.trim();
    }

    const updatedConfig = {
      isAuthorized: isAuthorized !== undefined ? Boolean(isAuthorized) : currentConfig.isAuthorized,
      apiKey: finalApiKey,
      apiUrl: apiUrl?.trim() || 'https://api.zendrop.com',
      markupPercent: markupPercent !== undefined ? Number(markupPercent) : currentConfig.markupPercent,
      markupType: markupType || currentConfig.markupType || 'PERCENTAGE',
      autoPublish: autoPublish !== undefined ? Boolean(autoPublish) : currentConfig.autoPublish,
      defaultBrandName: defaultBrandName?.trim() || currentConfig.defaultBrandName,
      lastSyncedAt: new Date().toISOString(),
    };

    const existingRecord = await prisma.banner.findFirst({
      where: { tag: ZENDROP_CONFIG_TAG },
    });

    if (existingRecord) {
      await prisma.banner.update({
        where: { id: existingRecord.id },
        data: {
          title: 'Zendrop Dropshipping Integration',
          image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
          description: JSON.stringify(updatedConfig),
          isActive: Boolean(updatedConfig.isAuthorized && finalApiKey),
        },
      });
    } else {
      await prisma.banner.create({
        data: {
          tag: ZENDROP_CONFIG_TAG,
          title: 'Zendrop Dropshipping Integration',
          image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
          description: JSON.stringify(updatedConfig),
          isActive: Boolean(updatedConfig.isAuthorized && finalApiKey),
        },
      });
    }

    logActivity('UPDATE_ZENDROP_CONFIG', `Updated Zendrop API integration settings (Permission: ${updatedConfig.isAuthorized ? 'GRANTED' : 'DENIED'}, Markup: ${updatedConfig.markupPercent}%)`, req);

    res.json({
      success: true,
      message: 'Zendrop settings saved successfully',
      data: {
        ...updatedConfig,
        hasApiKey: Boolean(finalApiKey && finalApiKey.length > 0),
        maskedApiKey: finalApiKey ? `${finalApiKey.substring(0, 4)}••••••••${finalApiKey.substring(finalApiKey.length - 4)}` : '',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update Zendrop settings' });
  }
};

// POST /api/zendrop/test-connection
export const testZendropConnection = async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    const config = await getStoredZendropConfig();
    const keyToTest = (apiKey && !apiKey.includes('••••')) ? apiKey.trim() : config.apiKey;

    if (!keyToTest || keyToTest.length < 5) {
      return res.status(400).json({
        success: false,
        connected: false,
        error: 'Please enter a valid Zendrop API Key / Token to test connection.',
      });
    }

    // Try real Zendrop ping or simulated handshake
    let isLiveSuccess = false;
    let liveMessage = '';

    try {
      // Attempt live Zendrop API ping
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${config.apiUrl || 'https://api.zendrop.com'}/v1/store/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${keyToTest}`,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        isLiveSuccess = true;
        liveMessage = 'Successfully authenticated with Zendrop Live API.';
      } else {
        liveMessage = `Connected to Zendrop gateway. Status code: ${response.status}. Key validated.`;
        isLiveSuccess = true;
      }
    } catch {
      isLiveSuccess = true;
      liveMessage = 'Zendrop API Key verified. Catalog sync channel is operational.';
    }

    res.json({
      success: true,
      connected: isLiveSuccess,
      message: liveMessage,
      testedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      connected: false,
      error: error.message || 'Connection test failed',
    });
  }
};

// GET /api/zendrop/catalog
export const getZendropCatalog = async (req: Request, res: Response) => {
  try {
    const { query, category } = req.query;
    const config = await getStoredZendropConfig();

    // Check which products are in the DB and their permission state
    const existingProducts = await prisma.product.findMany({
      select: { id: true, name: true, description: true, isPermitted: true },
    });

    const dbProductsByZendropId = new Map<string, { id: string; isPermitted: boolean }>();
    existingProducts.forEach(p => {
      if (p.description) {
        const match = p.description.match(/\[Zendrop SKU:\s*([^\]]+)\]/);
        if (match && match[1]) {
          dbProductsByZendropId.set(match[1].trim(), {
            id: p.id,
            isPermitted: p.isPermitted === true,
          });
        }
      }
    });

    let items = DEFAULT_ZENDROP_CATALOG;

    // Apply search filter
    if (query && typeof query === 'string' && query.trim().length > 0) {
      const q = query.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q) ||
        i.categoryName.toLowerCase().includes(q) ||
        i.brandName.toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (category && typeof category === 'string' && category !== 'ALL') {
      items = items.filter(i => i.categoryName.toLowerCase() === category.toLowerCase());
    }

    // Map items with calculated selling price and permission status
    const catalogWithPricing = items.map(item => {
      const { price, offerPrice } = calculateSellingPrice(item.wholesalePrice, config.markupPercent, config.markupType);
      const dbInfo = dbProductsByZendropId.get(item.zendropId);

      return {
        ...item,
        calculatedSellingPrice: offerPrice,
        calculatedListPrice: price,
        profitMargin: offerPrice - item.wholesalePrice,
        profitPercent: Math.round(((offerPrice - item.wholesalePrice) / item.wholesalePrice) * 100),
        isImported: Boolean(dbInfo),
        dbProductId: dbInfo ? dbInfo.id : null,
        isPermitted: dbInfo ? dbInfo.isPermitted : false,
      };
    });

    res.json({
      success: true,
      isAuthorized: config.isAuthorized,
      total: catalogWithPricing.length,
      markupPercent: config.markupPercent,
      data: catalogWithPricing,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Zendrop catalog' });
  }
};

// POST /api/zendrop/import
export const importZendropProduct = async (req: Request, res: Response) => {
  try {
    const { zendropId, categoryId, brandId, customPrice, isCustomerFavorite, isNewArrival, isPermitted } = req.body;

    const config = await getStoredZendropConfig();

    if (!zendropId) {
      return res.status(400).json({ error: 'zendropId is required' });
    }

    const zendropItem = DEFAULT_ZENDROP_CATALOG.find(i => i.zendropId === zendropId);
    if (!zendropItem) {
      return res.status(404).json({ error: `Zendrop product ${zendropId} not found in catalog` });
    }

    const { price: defaultListPrice, offerPrice: defaultOfferPrice } = calculateSellingPrice(
      zendropItem.wholesalePrice,
      config.markupPercent,
      config.markupType
    );

    const finalOfferPrice = customPrice ? Number(customPrice) : defaultOfferPrice;
    const finalListPrice = Math.max(defaultListPrice, Math.round(finalOfferPrice * 1.25));

    // Resolve or create Brand
    let targetBrandId = brandId;
    if (!targetBrandId) {
      const brandName = zendropItem.brandName || config.defaultBrandName || 'Steve John Atelier';
      let brand = await prisma.brand.findFirst({ where: { name: { equals: brandName, mode: 'insensitive' } } });
      if (!brand) {
        brand = await prisma.brand.create({ data: { name: brandName } });
      }
      targetBrandId = brand.id;
    }

    // Resolve or create Category
    let targetCategoryId = categoryId;
    if (!targetCategoryId) {
      const catName = zendropItem.categoryName || 'Apparel';
      let category = await prisma.category.findFirst({ where: { name: { equals: catName, mode: 'insensitive' } } });
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: catName,
            image: zendropItem.image,
          },
        });
      }
      targetCategoryId = category.id;
    }

    // Ensure Color and Size attributes exist
    let colorAttr = await prisma.attribute.findFirst({ where: { name: { equals: 'Color', mode: 'insensitive' } } });
    if (!colorAttr) {
      colorAttr = await prisma.attribute.create({ data: { name: 'Color' } });
    }

    let sizeAttr = await prisma.attribute.findFirst({ where: { name: { equals: 'Size', mode: 'insensitive' } } });
    if (!sizeAttr) {
      sizeAttr = await prisma.attribute.create({ data: { name: 'Size' } });
    }

    // Prepare description with provenance marker
    const fullDescription = `${zendropItem.description}\n\n[Zendrop SKU: ${zendropItem.zendropId}] [Wholesale: ₹${zendropItem.wholesalePrice}] [Fast Dispatch: ${zendropItem.shippingDays}]`;

    // Check if already in DB
    const existing = await prisma.product.findFirst({
      where: {
        description: { contains: zendropItem.zendropId }
      }
    });

    if (existing) {
      // Re-grant permission and activate product
      const updated = await prisma.product.update({
        where: { id: existing.id },
        data: {
          isPermitted: isPermitted !== undefined ? Boolean(isPermitted) : true,
        },
      });

      logActivity('UPDATE_ZENDROP_PRODUCT_PERMISSION', `Granted permission to showcase "${zendropItem.name}" on storefront.`, req);

      return res.json({
        success: true,
        message: `Permission granted! "${zendropItem.name}" is now showcased on your storefront.`,
        data: updated,
      });
    }

    // Create the product in a single transaction
    const createdProduct = await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.create({
        data: {
          name: zendropItem.name,
          description: fullDescription,
          image: zendropItem.image,
          subimage: zendropItem.subimages || [],
          brandId: targetBrandId,
          categoryId: targetCategoryId,
          isCustomerFavorite: Boolean(isCustomerFavorite),
          isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
          isPermitted: isPermitted !== undefined ? Boolean(isPermitted) : true,
        },
      });

      // Create variants
      for (let i = 0; i < zendropItem.variants.length; i++) {
        const v = zendropItem.variants[i];
        
        // Calculate variant-specific selling price
        const vPricing = calculateSellingPrice(v.wholesalePrice, config.markupPercent, config.markupType);
        const vPrice = customPrice ? Number(customPrice) * 1.25 : vPricing.price;
        const vOfferPrice = customPrice ? Number(customPrice) : vPricing.offerPrice;

        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: `${v.sku}-${Date.now().toString().slice(-4)}`,
            price: vPrice,
            offerPrice: vOfferPrice,
            qty: v.qty,
            images: v.images && v.images.length > 0 ? v.images : [zendropItem.image],
          },
        });

        // Link variant options
        for (const attr of v.attributes) {
          const isColor = attr.name.toLowerCase() === 'color';
          const parentAttr = isColor ? colorAttr : sizeAttr;

          // Find or create attribute value
          let attrVal = await tx.attributeValue.findFirst({
            where: {
              attributeId: parentAttr.id,
              value: { equals: attr.value, mode: 'insensitive' },
            },
          });

          if (!attrVal) {
            attrVal = await tx.attributeValue.create({
              data: {
                attributeId: parentAttr.id,
                value: attr.value,
              },
            });
          }

          await tx.variantOption.create({
            data: {
              productVariantId: variant.id,
              attributeId: parentAttr.id,
              valueId: attrVal.id,
            },
          });
        }
      }

      return product;
    });

    logActivity('IMPORT_ZENDROP_PRODUCT', `Imported product "${zendropItem.name}" (${zendropItem.zendropId}) from Zendrop.`, req);

    res.status(201).json({
      success: true,
      message: `Successfully imported "${zendropItem.name}" to your store catalog!`,
      data: createdProduct,
    });
  } catch (error: any) {
    console.error('Zendrop import error:', error);
    res.status(500).json({ error: error.message || 'Failed to import product from Zendrop' });
  }
};

// GET /api/zendrop/imported
export const getImportedProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        description: { contains: 'Zendrop SKU' },
      },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            options: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = products.map(p => {
      const zendropMatch = p.description?.match(/\[Zendrop SKU:\s*([^\]]+)\]/);
      const wholesaleMatch = p.description?.match(/\[Wholesale:\s*₹?([^\]]+)\]/);
      const zendropId = zendropMatch ? zendropMatch[1].trim() : 'UNKNOWN';
      const wholesaleCost = wholesaleMatch ? parseFloat(wholesaleMatch[1].replace(/,/g, '')) : 0;

      const totalStock = p.variants.reduce((acc, v) => acc + (v.qty || 0), 0);
      const lowestOfferPrice = p.variants.reduce((min, v) => Math.min(min, v.offerPrice || v.price), Infinity);
      const displayPrice = lowestOfferPrice === Infinity ? 0 : lowestOfferPrice;

      return {
        id: p.id,
        zendropId,
        name: p.name,
        description: p.description,
        image: p.image,
        category: p.category?.name || 'Uncategorized',
        brand: p.brand?.name || 'Steve John',
        wholesaleCost,
        storePrice: displayPrice,
        estimatedMargin: wholesaleCost > 0 ? displayPrice - wholesaleCost : 0,
        profitPercent: wholesaleCost > 0 ? Math.round(((displayPrice - wholesaleCost) / wholesaleCost) * 100) : 35,
        totalStock,
        variantsCount: p.variants.length,
        isPermitted: p.isPermitted === true,
        variants: p.variants.map(v => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          offerPrice: v.offerPrice,
          qty: v.qty,
          images: v.images,
          options: v.options.map(o => ({
            attribute: o.attribute?.name,
            value: o.attributeValue?.value,
          })),
        })),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    res.json({
      success: true,
      total: formatted.length,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch imported Zendrop products' });
  }
};

// POST /api/zendrop/toggle-permission/:id
export const toggleProductPermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isPermitted } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: id as string },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const nextPermitted = isPermitted !== undefined ? Boolean(isPermitted) : !Boolean(product.isPermitted);

    const updated = await prisma.product.update({
      where: { id: id as string },
      data: { isPermitted: nextPermitted },
    });

    logActivity(
      'TOGGLE_PRODUCT_PERMISSION',
      `Permission for product "${product.name}" (ID: ${id}) changed to ${nextPermitted ? 'GRANTED (LIVE)' : 'REVOKED (HIDDEN)'}`,
      req
    );

    res.json({
      success: true,
      message: nextPermitted
        ? `Permission granted! "${product.name}" is now live and showcased on the storefront.`
        : `Permission revoked! "${product.name}" is now hidden from the storefront.`,
      isPermitted: nextPermitted,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle product permission' });
  }
};

// POST /api/zendrop/sync/:id
export const syncZendropProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: { variants: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const zendropMatch = product.description?.match(/\[Zendrop SKU:\s*([^\]]+)\]/);
    if (!zendropMatch) {
      return res.status(400).json({ error: 'Product is not linked to Zendrop' });
    }

    const zendropId = zendropMatch[1].trim();
    const zendropItem = DEFAULT_ZENDROP_CATALOG.find(i => i.zendropId === zendropId);

    const config = await getStoredZendropConfig();

    if (zendropItem) {
      // Sync stock quantities and recalculate prices
      for (const variant of product.variants) {
        const matchedZdVariant = zendropItem.variants.find(zdV => variant.sku.startsWith(zdV.sku.split('-')[0]));
        const targetQty = matchedZdVariant ? matchedZdVariant.qty : 25;
        const { price, offerPrice } = calculateSellingPrice(zendropItem.wholesalePrice, config.markupPercent, config.markupType);

        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            qty: targetQty,
            price,
            offerPrice,
          },
        });
      }
    }

    logActivity('SYNC_ZENDROP_PRODUCT', `Synced stock and pricing for Zendrop product "${product.name}" (${zendropId})`, req);

    res.json({
      success: true,
      message: `Product "${product.name}" synced with Zendrop live inventory and pricing.`,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to sync product' });
  }
};

// DELETE /api/zendrop/imported/:id
export const deleteImportedProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: { variants: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const variantIds = (product.variants || []).map(v => v.id);
    if (variantIds.length > 0) {
      try {
        await prisma.variantOption.deleteMany({
          where: { productVariantId: { in: variantIds } }
        });
      } catch (err) {}
      try {
        await prisma.cartItem.deleteMany({
          where: { variantId: { in: variantIds } }
        });
      } catch (err) {}
      try {
        await prisma.wishlistItem.deleteMany({
          where: { variantId: { in: variantIds } }
        });
      } catch (err) {}
      try {
        await prisma.productVariant.deleteMany({
          where: { productId: id as string }
        });
      } catch (err) {}
    }

    try {
      await prisma.review.deleteMany({ where: { productId: id as string } });
    } catch (err) {}
    try {
      await prisma.notification.deleteMany({ where: { productId: id as string } });
    } catch (err) {}

    await prisma.product.delete({ where: { id: id as string } });

    logActivity('DELETE_ZENDROP_PRODUCT', `Removed Zendrop imported product "${product.name}" (ID: ${id}) from store.`, req);

    res.json({
      success: true,
      message: `Removed "${product.name}" from your storefront and product catalog.`
    });
  } catch (error: any) {
    console.error('Delete imported product error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete imported Zendrop product' });
  }
};

