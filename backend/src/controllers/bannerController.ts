import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary, safeDeleteImage } from '../lib/upload.js';

const MAX_ACTIVE = 5;

export const getBanners = async (req: Request, res: Response) => {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch banners" });
    }
};

export const createBanner = async (req: Request, res: Response) => {
    try {
        const { title, buttonText, buttonLink, tag, offerPrice, description, badge } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files?.image?.[0]) {
            return res.status(400).json({ error: "Banner image is required" });
        }

        // Check active count
        const activeCount = await prisma.banner.count({ where: { isActive: true } });
        if (activeCount >= MAX_ACTIVE) {
            return res.status(400).json({ error: `Maximum ${MAX_ACTIVE} active banners allowed. Hide one first.` });
        }

        const imageUrl = await uploadToCloudinary(files.image[0].buffer, files.image[0].originalname);

        const lastBanner = await prisma.banner.findFirst({ orderBy: { order: 'desc' } });
        const nextOrder = lastBanner ? lastBanner.order + 1 : 0;

        const banner = await prisma.banner.create({
            data: {
                title: title ? title.trim() : "",
                image: imageUrl,
                tag: tag?.trim() || null,
                offerPrice: offerPrice?.trim() || null,
                description: description?.trim() || null,
                badge: badge?.trim() || null,
                buttonText: buttonText?.trim() || null,
                buttonLink: buttonLink?.trim() || null,
                order: nextOrder,
                isActive: true
            }
        });

        res.status(201).json(banner);
    } catch (error) {
        console.error("Create banner error:", error);
        res.status(500).json({ error: "Failed to create banner" });
    }
};

export const updateBanner = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title, order, isActive, buttonText, buttonLink, tag, offerPrice, description, badge } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const existingBanner = await prisma.banner.findUnique({ where: { id } });
        if (!existingBanner) return res.status(404).json({ error: "Banner not found" });

        // Check max active when activating
        if (isActive === 'true' && !existingBanner.isActive) {
            const activeCount = await prisma.banner.count({ where: { isActive: true } });
            if (activeCount >= MAX_ACTIVE) {
                return res.status(400).json({ error: `Maximum ${MAX_ACTIVE} active banners. Hide one first.` });
            }
        }

        let imageUrl = existingBanner.image;

        if (files?.image?.[0]) {
            await safeDeleteImage(existingBanner.image);
            imageUrl = await uploadToCloudinary(files.image[0].buffer, files.image[0].originalname);
        }

        const updatedBanner = await prisma.banner.update({
            where: { id },
            data: {
                title: title !== undefined ? title.trim() : existingBanner.title,
                image: imageUrl,
                tag: tag !== undefined ? (tag.trim() || null) : existingBanner.tag,
                offerPrice: offerPrice !== undefined ? (offerPrice.trim() || null) : existingBanner.offerPrice,
                description: description !== undefined ? (description.trim() || null) : existingBanner.description,
                badge: badge !== undefined ? (badge.trim() || null) : existingBanner.badge,
                buttonText: buttonText !== undefined ? (buttonText.trim() || null) : existingBanner.buttonText,
                buttonLink: buttonLink !== undefined ? (buttonLink.trim() || null) : existingBanner.buttonLink,
                order: order !== undefined ? parseInt(order) : existingBanner.order,
                isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existingBanner.isActive,
            }
        });

        res.json(updatedBanner);
    } catch (error) {
        console.error("Update banner error:", error);
        res.status(500).json({ error: "Failed to update banner" });
    }
};

export const deleteBanner = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const banner = await prisma.banner.findUnique({ where: { id } });
        if (!banner) return res.status(404).json({ error: "Banner not found" });

        await safeDeleteImage(banner.image);
        await prisma.banner.delete({ where: { id } });
        res.json({ message: "Banner deleted" });
    } catch (error) {
        console.error("Delete banner error:", error);
        res.status(500).json({ error: "Failed to delete banner" });
    }
};
