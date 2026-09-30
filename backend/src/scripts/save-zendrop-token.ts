import { prisma } from '../lib/prisma.js';

async function saveZendropToken() {
  const ZENDROP_CONFIG_TAG = 'ZENDROP_INTEGRATION_CONFIG';
  const token = 'eMvUpELHmIPPqV9T8DYcBQ0tglCPmRx9qXjy5ZCCRlnRijpsAa3NyceJFQ40VeJe';
  
  const config = {
    apiKey: token,
    tokenName: 'Judes',
    apiUrl: 'https://api.zendrop.com',
    markupPercent: 35,
    markupType: 'PERCENTAGE',
    autoPublish: true,
    defaultBrandName: 'Judes Collection',
    lastSyncedAt: new Date().toISOString(),
  };

  const existing = await prisma.banner.findFirst({
    where: { tag: ZENDROP_CONFIG_TAG },
  });

  if (existing) {
    await prisma.banner.update({
      where: { id: existing.id },
      data: {
        title: 'Zendrop Dropshipping Integration',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
        description: JSON.stringify(config),
        isActive: true,
      },
    });
    console.log('✅ Updated Zendrop configuration in database with token for Judes.');
  } else {
    await prisma.banner.create({
      data: {
        tag: ZENDROP_CONFIG_TAG,
        title: 'Zendrop Dropshipping Integration',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
        description: JSON.stringify(config),
        isActive: true,
      },
    });
    console.log('✅ Created Zendrop configuration in database with token for Judes.');
  }
}

saveZendropToken()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error saving Zendrop token:', err);
    process.exit(1);
  });
