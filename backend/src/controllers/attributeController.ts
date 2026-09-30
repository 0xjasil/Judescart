import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getAttributes = async (req: Request, res: Response) => {
    try {
        const attrs = await prisma.attribute.findMany({
            include: { values: true },
            orderBy: { name: "asc" },
        });
        res.json(attrs);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch attributes" });
    }
};

export const createAttribute = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const existing = await prisma.attribute.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
        if (existing) return res.status(400).json({ error: "Attribute already exists" });

        const attribute = await prisma.attribute.create({ data: { name } });
        res.status(201).json(attribute);
    } catch (e) {
        res.status(500).json({ error: "Failed to create attribute" });
    }
};

export const updateAttribute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const attribute = await prisma.attribute.update({ where: { id: id as string }, data: { name } });
        res.json(attribute);
    } catch (e) {
        res.status(500).json({ error: "Failed to update attribute" });
    }
};

export const deleteAttribute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const usageCount = await prisma.variantOption.count({ where: { attributeId: id as string } });
        if (usageCount > 0) return res.status(400).json({ error: `Attribute is used by ${usageCount} variants` });

        await prisma.attribute.delete({ where: { id: id as string } });
        res.json({ message: "Attribute deleted" });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete attribute" });
    }
};

export const createAttributeValue = async (req: Request, res: Response) => {
    try {
        const attributeId = (req.params.attributeId || req.body.attributeId) as string;
        const { value } = req.body;
        if (!attributeId || !value?.trim()) {
            return res.status(400).json({ error: "attributeId and value are required" });
        }

        const existing = await prisma.attributeValue.findFirst({
            where: {
                attributeId,
                value: { equals: value.trim(), mode: "insensitive" }
            }
        });
        if (existing) return res.status(400).json({ error: "Value already exists for this attribute" });

        const attrValue = await prisma.attributeValue.create({
            data: { attributeId, value: value.trim() }
        });
        res.status(201).json(attrValue);
    } catch (e) {
        res.status(500).json({ error: "Failed to create attribute value" });
    }
};

export const updateAttributeValue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        if (!value?.trim()) return res.status(400).json({ error: "Value is required" });

        const attrValue = await prisma.attributeValue.update({
            where: { id: id as string },
            data: { value: value.trim() }
        });
        res.json(attrValue);
    } catch (e) {
        res.status(500).json({ error: "Failed to update attribute value" });
    }
};

export const deleteAttributeValue = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const usageCount = await prisma.variantOption.count({ where: { valueId: id as string } });
        if (usageCount > 0) return res.status(400).json({ error: `Value is used by ${usageCount} variants` });

        await prisma.attributeValue.delete({ where: { id: id as string } });
        res.json({ message: "Value deleted" });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete value" });
    }
};

