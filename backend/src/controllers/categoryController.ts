import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary, safeDeleteImage } from '../lib/upload.js';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                subcategories: true,
                _count: { select: { products: true } }
            },
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "Image is required" });

        const existing = await prisma.category.findFirst({ where: { name } });
        if (existing) return res.status(400).json({ error: "Category with this name already exists" });

        const photoUrl = await uploadToCloudinary(file.buffer, file.originalname);

        const category = await prisma.category.create({
            data: { name, image: photoUrl },
        });

        res.status(201).json({ success: true, data: category, message: "Category created successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to create category" });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const file = req.file;

        const existing = await prisma.category.findUnique({ where: { id: id as string } });
        if (!existing) return res.status(404).json({ error: "Category not found" });

        let photoUrl: string | undefined;
        if (file) {
            await safeDeleteImage(existing.image);
            photoUrl = await uploadToCloudinary(file.buffer, file.originalname);
        }

        const updated = await prisma.category.update({
            where: { id: id as string },
            data: {
                ...(name && { name }),
                ...(photoUrl && { image: photoUrl }),
            },
        });

        res.json({ success: true, data: updated, message: "Category updated successfully" });
    } catch (error: any) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: error.message || "Failed to update category" });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({ where: { id: id as string } });
        if (!category) return res.status(404).json({ error: "Category not found" });

        await safeDeleteImage(category.image);
        await prisma.category.delete({ where: { id: id as string } });
        res.json({ success: true, message: "Category deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: error.message || "Failed to delete category" });
    }
};
