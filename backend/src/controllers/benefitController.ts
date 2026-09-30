import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary, safeDeleteImage } from '../lib/upload.js';

const BENEFIT_TAG = 'BRAND_BENEFIT_CONFIG';

const DEFAULT_BENEFITS = {
  tag: 'The JudesCart Standard',
  title: 'Bespoke Quality. Master Craftsmanship. Timeless Style.',
  description: 'At JudesCart, every garment, fine leather good, and bespoke accessory is created with unyielding dedication to material excellence, tailored comfort, and verifiable authenticity.',
  benefit1Title: 'Atelier Guarantee',
  benefit1Desc: 'Comprehensive 1-year warranty on all apparel, leathers, and accessories.',
  benefit2Title: 'Carbon-Neutral Dispatch',
  benefit2Desc: 'Every order is packaged sustainably and shipped with 100% carbon-neutral delivery.',
  buttonText: 'Explore the complete catalog',
  buttonLink: '/product',
  image: '/about_atelier.png',
  isActive: true,
};

export const getBenefits = async (req: Request, res: Response) => {
  try {
    const record = await prisma.banner.findFirst({
      where: { tag: BENEFIT_TAG },
    });

    if (!record) {
      return res.json({
        success: true,
        data: DEFAULT_BENEFITS,
      });
    }

    let extraData = {};
    try {
      if (record.description && record.description.startsWith('{')) {
        extraData = JSON.parse(record.description);
      }
    } catch {
      extraData = {};
    }

    return res.json({
      success: true,
      data: {
        id: record.id,
        tag: record.badge || DEFAULT_BENEFITS.tag,
        title: record.title || DEFAULT_BENEFITS.title,
        description: (extraData as any).description || record.offerPrice || DEFAULT_BENEFITS.description,
        benefit1Title: (extraData as any).benefit1Title || DEFAULT_BENEFITS.benefit1Title,
        benefit1Desc: (extraData as any).benefit1Desc || DEFAULT_BENEFITS.benefit1Desc,
        benefit2Title: (extraData as any).benefit2Title || DEFAULT_BENEFITS.benefit2Title,
        benefit2Desc: (extraData as any).benefit2Desc || DEFAULT_BENEFITS.benefit2Desc,
        buttonText: record.buttonText || DEFAULT_BENEFITS.buttonText,
        buttonLink: record.buttonLink || DEFAULT_BENEFITS.buttonLink,
        image: record.image || DEFAULT_BENEFITS.image,
        isActive: record.isActive,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching brand benefits:', error);
    res.status(500).json({ error: 'Failed to fetch brand benefits' });
  }
};

export const updateBenefits = async (req: Request, res: Response) => {
  try {
    const {
      tag,
      title,
      description,
      benefit1Title,
      benefit1Desc,
      benefit2Title,
      benefit2Desc,
      buttonText,
      buttonLink,
      isActive,
    } = req.body;

    const file = req.file;

    const existing = await prisma.banner.findFirst({
      where: { tag: BENEFIT_TAG },
    });

    let photoUrl = existing?.image || DEFAULT_BENEFITS.image;
    if (file) {
      if (existing?.image && existing.image.startsWith('http')) {
        await safeDeleteImage(existing.image);
      }
      photoUrl = await uploadToCloudinary(file.buffer, file.originalname);
    }

    const payloadDescription = JSON.stringify({
      description: description || DEFAULT_BENEFITS.description,
      benefit1Title: benefit1Title || DEFAULT_BENEFITS.benefit1Title,
      benefit1Desc: benefit1Desc || DEFAULT_BENEFITS.benefit1Desc,
      benefit2Title: benefit2Title || DEFAULT_BENEFITS.benefit2Title,
      benefit2Desc: benefit2Desc || DEFAULT_BENEFITS.benefit2Desc,
    });

    let record;
    if (existing) {
      record = await prisma.banner.update({
        where: { id: existing.id },
        data: {
          title: title || existing.title,
          badge: tag || existing.badge,
          offerPrice: description || existing.offerPrice,
          description: payloadDescription,
          buttonText: buttonText || existing.buttonText,
          buttonLink: buttonLink || existing.buttonLink,
          image: photoUrl,
          isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.isActive,
        },
      });
    } else {
      record = await prisma.banner.create({
        data: {
          tag: BENEFIT_TAG,
          badge: tag || DEFAULT_BENEFITS.tag,
          title: title || DEFAULT_BENEFITS.title,
          offerPrice: description || DEFAULT_BENEFITS.description,
          description: payloadDescription,
          buttonText: buttonText || DEFAULT_BENEFITS.buttonText,
          buttonLink: buttonLink || DEFAULT_BENEFITS.buttonLink,
          image: photoUrl,
          isActive: true,
        },
      });
    }

    res.json({
      success: true,
      message: 'Brand benefits updated successfully',
      data: record,
    });
  } catch (error) {
    console.error('Error updating brand benefits:', error);
    res.status(500).json({ error: 'Failed to update brand benefits' });
  }
};
