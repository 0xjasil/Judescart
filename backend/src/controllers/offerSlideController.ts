import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary, safeDeleteImage } from '../lib/upload.js';

export const getOfferSlides = async (req: Request, res: Response) => {
    try {
        const { activeOnly } = req.query;
        const whereClause: any = {};
        if (activeOnly === 'true') {
            whereClause.isActive = true;
        }
        const slides = await prisma.offerSlide.findMany({
            where: whereClause,
            orderBy: { order: 'asc' }
        });
        res.json(slides);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch offer slides" });
    }
};


export const createOfferSlide = async (req: Request, res: Response) => {
    try {
        const {
            route, order,
            title, tagline, badgeLabel, buttonText,
            overlayColor, overlayOpacity, gradientDir,
            titleColor, buttonColor, buttonTextColor, imageOpacity
        } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "Image is required" });

        const photoUrl = await uploadToCloudinary(file.buffer, file.originalname);

        const slide = await prisma.offerSlide.create({
            data: {
                route: route || "/",
                order: order ? parseInt(order) : 0,
                image: photoUrl,
                title: title || null,
                tagline: tagline || null,
                badgeLabel: badgeLabel || null,
                buttonText: buttonText || null,
                overlayColor: overlayColor || null,
                overlayOpacity: overlayOpacity !== undefined && overlayOpacity !== '' ? parseFloat(overlayOpacity) : null,
                gradientDir: gradientDir || null,
                titleColor: titleColor || null,
                buttonColor: buttonColor || null,
                buttonTextColor: buttonTextColor || null,
                imageOpacity: imageOpacity !== undefined && imageOpacity !== '' ? parseFloat(imageOpacity) : null,
            },
        });

        res.status(201).json(slide);
    } catch (error) {
        console.error("Create offer slide error:", error);
        res.status(500).json({ error: "Failed to create offer slide" });
    }
};

export const updateOfferSlide = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const {
            route, order, isActive,
            title, tagline, badgeLabel, buttonText,
            overlayColor, overlayOpacity, gradientDir,
            titleColor, buttonColor, buttonTextColor, imageOpacity
        } = req.body;
        const file = req.file;

        const existingSlide = await prisma.offerSlide.findUnique({ where: { id } });
        if (!existingSlide) return res.status(404).json({ error: "Slide not found" });

        let photoUrl = existingSlide.image;
        if (file) {
            await safeDeleteImage(existingSlide.image);
            photoUrl = await uploadToCloudinary(file.buffer, file.originalname);
        }

        const updatedSlide = await prisma.offerSlide.update({
            where: { id },
            data: {
                route: route !== undefined ? route : existingSlide.route,
                order: order !== undefined ? parseInt(order) : existingSlide.order,
                isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existingSlide.isActive,
                image: photoUrl,
                title: title !== undefined ? (title || null) : existingSlide.title,
                tagline: tagline !== undefined ? (tagline || null) : existingSlide.tagline,
                badgeLabel: badgeLabel !== undefined ? (badgeLabel || null) : existingSlide.badgeLabel,
                buttonText: buttonText !== undefined ? (buttonText || null) : existingSlide.buttonText,
                overlayColor: overlayColor !== undefined ? (overlayColor || null) : existingSlide.overlayColor,
                overlayOpacity: overlayOpacity !== undefined ? (overlayOpacity !== '' ? parseFloat(overlayOpacity) : null) : existingSlide.overlayOpacity,
                gradientDir: gradientDir !== undefined ? (gradientDir || null) : existingSlide.gradientDir,
                titleColor: titleColor !== undefined ? (titleColor || null) : existingSlide.titleColor,
                buttonColor: buttonColor !== undefined ? (buttonColor || null) : existingSlide.buttonColor,
                buttonTextColor: buttonTextColor !== undefined ? (buttonTextColor || null) : existingSlide.buttonTextColor,
                imageOpacity: imageOpacity !== undefined ? (imageOpacity !== '' ? parseFloat(imageOpacity) : null) : existingSlide.imageOpacity,
            }
        });

        res.json(updatedSlide);
    } catch (error) {
        console.error("Update offer slide error:", error);
        res.status(500).json({ error: "Failed to update offer slide" });
    }
};

export const deleteOfferSlide = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const slide = await prisma.offerSlide.findUnique({ where: { id: id as string } });
        if (!slide) return res.status(404).json({ error: "Slide not found" });

        await safeDeleteImage(slide.image);
        await prisma.offerSlide.delete({ where: { id: id as string } });
        res.json({ message: "Slide deleted" });
    } catch (error) {
        console.error("Delete offer slide error:", error);
        res.status(500).json({ error: "Failed to delete offer slide" });
    }
};
