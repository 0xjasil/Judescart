import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary } from '../lib/upload.js';
import cloudinary from '../lib/cloudinary.js';
import { createProductSchema, updateProductSchema } from '../schemas/product-schema.js';
import { logActivity } from '../lib/activityLogger.js';

export const createProductWithVariants = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const files = req.files as Express.Multer.File[];

        // Extract files
        const mainImageFile = files.find(f => f.fieldname === 'mainImage');
        const thumbnailFiles = files.filter(f => f.fieldname.startsWith('thumbnails'));
        const variantImageFiles = files.filter(f => f.fieldname.startsWith('variantImages'));

        if (!mainImageFile) return res.status(400).json({ error: "Main image is required" });

        const photoUrl = await uploadToCloudinary(mainImageFile.buffer, mainImageFile.originalname);
        const subimageUrls = await Promise.all(thumbnailFiles.map(f => uploadToCloudinary(f.buffer, f.originalname)));

        // Parse variants data
        const variantsData = JSON.parse(data.variants || '[]');

        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                image: photoUrl,
                subimage: subimageUrls,
                brandId: data.brandId || null,
                categoryId: data.categoryId,
                subCategoryId: data.subCategoryId,
                isCustomerFavorite: data.isCustomerFavorite === 'true',
                isNewArrival: data.isNewArrival === 'true',
                variants: {
                    create: await Promise.all(variantsData.map(async (v: any, index: number) => {
                        const currentVariantImages = variantImageFiles.filter(f => f.fieldname.startsWith(`variantImages[${index}]`));
                        const imageUrls = await Promise.all(currentVariantImages.map(f => uploadToCloudinary(f.buffer, f.originalname)));
                        
                        return {
                            price: parseFloat(v.price),
                            qty: parseInt(v.qty),
                            offerPrice: v.offerPrice ? parseFloat(v.offerPrice) : null,
                            sku: `${data.name.toUpperCase()}-${index}-${Date.now()}`, // Simple SKU generator
                            images: imageUrls,
                            options: {
                                create: v.attributes.map((attr: any) => ({
                                    attributeId: attr.attributeId,
                                    valueId: attr.valueId,
                                })),
                            },
                        };
                    })),
                },
            },
            include: { variants: true },
        });

        logActivity('CREATE_PRODUCT', `Created new product "${product.name}" with variants.`, req);
        res.status(201).json({ success: true, data: product });
    } catch (error: any) {
        console.error("Create product with variants error:", error);
        res.status(500).json({ error: error.message || "Failed to create product" });
    }
};

export const updateProductWithVariants = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = req.body;
        const files = req.files as Express.Multer.File[];

        const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: { variants: true }
        });

        if (!existingProduct) return res.status(404).json({ error: "Product not found" });

        // Handle Main Image
        let photoUrl = existingProduct.image;
        const mainImageFile = files.find(f => f.fieldname === 'mainImage');
        if (mainImageFile) {
            // Delete old safely
            if (existingProduct.image && existingProduct.image.includes('res.cloudinary.com') && process.env.CLOUDINARY_CLOUD_NAME) {
                const publicId = existingProduct.image.split("/").pop()?.split(".")[0];
                if (publicId) {
                    try {
                        await (cloudinary as any).uploader.destroy(`stevejon/${publicId}`);
                    } catch (e) {}
                }
            }
            photoUrl = await uploadToCloudinary(mainImageFile.buffer, mainImageFile.originalname);
        } else if (data.existingMainImage) {
            photoUrl = data.existingMainImage;
        }

        // Handle Subimages (thumbnails)
        const thumbnailFiles = files.filter(f => f.fieldname.startsWith('thumbnails'));
        const newSubimageUrls = await Promise.all(thumbnailFiles.map(f => uploadToCloudinary(f.buffer, f.originalname)));
        
        const existingSubimages = data.existingThumbnails ? JSON.parse(data.existingThumbnails) : [];
        const finalSubimages = [...existingSubimages, ...newSubimageUrls];

        // Parse variants data
        const variantsData = JSON.parse(data.variants || '[]');
        const deletedVariantIds = JSON.parse(data.deletedVariantIds || '[]');

        // Start Transaction
        const updatedProduct = await prisma.$transaction(async (tx: any) => {
            // Delete marked variants
            if (deletedVariantIds.length > 0) {
                const variantsToDelete = await tx.productVariant.findMany({
                    where: { id: { in: deletedVariantIds } }
                });
                for (const v of variantsToDelete) {
                    for (const img of v.images || []) {
                        if (img && img.includes('res.cloudinary.com') && process.env.CLOUDINARY_CLOUD_NAME) {
                            const publicId = img.split("/").pop()?.split(".")[0];
                            if (publicId) {
                                try {
                                    await (cloudinary as any).uploader.destroy(`stevejon/${publicId}`);
                                } catch (e) {}
                            }
                        }
                    }
                }
                await tx.variantOption.deleteMany({
                    where: { productVariantId: { in: deletedVariantIds } }
                });
                await tx.cartItem.deleteMany({
                    where: { productVariantId: { in: deletedVariantIds } }
                });
                await tx.wishlistItem.deleteMany({
                    where: { productVariantId: { in: deletedVariantIds } }
                });
                await tx.productVariant.deleteMany({
                    where: { id: { in: deletedVariantIds } }
                });
            }

            // Update Product Base Info
            await tx.product.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    image: photoUrl,
                    subimage: finalSubimages,
                    brandId: data.brandId || null,
                    categoryId: data.categoryId,
                    subCategoryId: data.subCategoryId,
                    isCustomerFavorite: data.isCustomerFavorite === 'true',
                    isNewArrival: data.isNewArrival === 'true',
                }
            });

            // Handle Variants
            for (let i = 0; i < variantsData.length; i++) {
                const v = variantsData[i];
                const variantId = v.id;
                
                // Get new images for this variant
                const currentVariantNewFiles = files.filter(f => f.fieldname.startsWith(`variantImages[${i}]`));
                const newVariantImageUrls = await Promise.all(currentVariantNewFiles.map(f => uploadToCloudinary(f.buffer, f.originalname)));
                
                // Existing images that were kept
                const existingImagesKey = `existingVariantImages[${i}]`;
                const existingImages = data[existingImagesKey] ? JSON.parse(data[existingImagesKey]) : [];
                
                const finalImages = [...existingImages, ...newVariantImageUrls];

                if (v.isNew) {
                    await tx.productVariant.create({
                        data: {
                            productId: id,
                            price: parseFloat(v.price),
                            qty: parseInt(v.qty),
                            offerPrice: v.offerPrice ? parseFloat(v.offerPrice) : null,
                            sku: `${data.name.toUpperCase()}-${i}-${Date.now()}`,
                            images: finalImages,
                            options: {
                                create: v.attributes.map((attr: any) => ({
                                    attributeId: attr.attributeId,
                                    valueId: attr.valueId,
                                })),
                            },
                        }
                    });
                } else if (v.isModified || currentVariantNewFiles.length > 0 || (v.images && v.images.length !== finalImages.length)) {
                    // Update existing
                    await tx.productVariant.update({
                        where: { id: variantId },
                        data: {
                            price: parseFloat(v.price),
                            qty: parseInt(v.qty),
                            offerPrice: v.offerPrice ? parseFloat(v.offerPrice) : null,
                            images: finalImages,
                            options: {
                                deleteMany: {}, // Simplest way to update options
                                create: v.attributes.map((attr: any) => ({
                                    attributeId: attr.attributeId,
                                    valueId: attr.valueId,
                                })),
                            },
                        }
                    });
                }
            }

            return tx.product.findUnique({
                where: { id },
                include: { variants: true }
            });
        });

        if (updatedProduct) {
            logActivity('UPDATE_PRODUCT', `Updated product "${updatedProduct.name}" and variants.`, req);
        }
        res.json({ success: true, data: updatedProduct });
    } catch (error: any) {
        console.error("Update product with variants error:", error);
        res.status(500).json({ error: error.message || "Failed to update product" });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const file = req.file;

        // validate input
        const parsedInput = createProductSchema.parse({
            ...data,
            isCustomerFavorite: data.isCustomerFavorite === 'true',
            isNewArrival: data.isNewArrival === 'true',
        });

        let photoUrl: string = "";
        if (file) {
            photoUrl = await uploadToCloudinary(file.buffer, file.originalname);
        }

        if (!photoUrl) return res.status(400).json({ error: "Image is required" });

        const product = await prisma.product.create({
            data: {
                name: (parsedInput as any).name,
                description: (parsedInput as any).description || null,
                brandId: (parsedInput as any).brandId || null,
                categoryId: (parsedInput as any).categoryId || null,
                subCategoryId: (parsedInput as any).subcategoryId || null,
                image: photoUrl,
                subimage: [],
                isCustomerFavorite: (parsedInput as any).isCustomerFavorite,
                isNewArrival: (parsedInput as any).isNewArrival,
            },
        });

        res.status(201).json({ success: true, data: product, message: "Product created successfully" });
    } catch (error: any) {
        console.error("Create product error:", error);
        res.status(500).json({ error: error.message || "Failed to create product" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const data = req.body;
        const file = req.file;

        const parsedInput = updateProductSchema.parse({
            id,
            ...data,
            isCustomerFavorite: data.isCustomerFavorite !== undefined ? data.isCustomerFavorite === 'true' : undefined,
            isNewArrival: data.isNewArrival !== undefined ? data.isNewArrival === 'true' : undefined,
        });

        const existingProduct = await prisma.product.findUnique({
            where: { id: id as string },
            select: { image: true }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        let photoUrl: string | undefined;
        if (file) {
            photoUrl = await uploadToCloudinary(file.buffer, file.originalname);
            
            if (existingProduct.image) {
                const oldPublicId = existingProduct.image.split("/").pop()?.split(".")[0];
                if (oldPublicId) {
                    try {
                        await (cloudinary as any).uploader.destroy(`Deco moja/${oldPublicId}`);
                    } catch (error) {
                        console.warn("Failed to delete old image:", error);
                    }
                }
            }
        }

        const updateData: any = {};
        if ((parsedInput as any).name) updateData.name = (parsedInput as any).name;
        if ((parsedInput as any).description !== undefined) updateData.description = (parsedInput as any).description;
        if ((parsedInput as any).brandId !== undefined) updateData.brandId = (parsedInput as any).brandId;
        if ((parsedInput as any).categoryId !== undefined) updateData.categoryId = (parsedInput as any).categoryId;
        if ((parsedInput as any).subcategoryId !== undefined) updateData.subCategoryId = (parsedInput as any).subcategoryId;
        if ((parsedInput as any).isCustomerFavorite !== undefined) updateData.isCustomerFavorite = (parsedInput as any).isCustomerFavorite;
        if ((parsedInput as any).isNewArrival !== undefined) updateData.isNewArrival = (parsedInput as any).isNewArrival;
        if (photoUrl) updateData.image = photoUrl;

        const updated = await prisma.product.update({
            where: { id: id as string },
            data: updateData,
        });

        res.json({ success: true, data: updated, message: "Product updated successfully" });
    } catch (error: any) {
        console.error("Update product error:", error);
        res.status(500).json({ error: error.message || "Failed to update product" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const product = await prisma.product.findUnique({ 
            where: { id: id as string },
            include: { variants: { include: { options: true } } }
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Delete Main Image safely
        if (product.image && product.image.includes('res.cloudinary.com') && process.env.CLOUDINARY_CLOUD_NAME) {
            const oldPublicId = product.image.split("/").pop()?.split(".")[0];
            if (oldPublicId) {
                try {
                    await (cloudinary as any).uploader.destroy(`stevejon/${oldPublicId}`);
                } catch (e) {
                    console.warn("Failed to delete product image:", e);
                }
            }
        }

        // Delete Subimages safely
        for (const img of product.subimage || []) {
            if (img && img.includes('res.cloudinary.com') && process.env.CLOUDINARY_CLOUD_NAME) {
                const publicId = img.split("/").pop()?.split(".")[0];
                if (publicId) {
                    try {
                        await (cloudinary as any).uploader.destroy(`stevejon/${publicId}`);
                    } catch (e) {}
                }
            }
        }

        // Delete Variant Images safely
        for (const v of product.variants || []) {
            for (const img of v.images || []) {
                if (img && img.includes('res.cloudinary.com') && process.env.CLOUDINARY_CLOUD_NAME) {
                    const publicId = img.split("/").pop()?.split(".")[0];
                    if (publicId) {
                        try {
                            await (cloudinary as any).uploader.destroy(`stevejon/${publicId}`);
                        } catch (e) {}
                    }
                }
            }
        }

        // Clean up child relations in MongoDB before deleting parent product
        const variantIds = (product.variants || []).map(v => v.id);
        if (variantIds.length > 0) {
            try {
                await prisma.variantOption.deleteMany({
                    where: { productVariantId: { in: variantIds } }
                });
            } catch (err) {
                console.warn("Could not delete variant options:", err);
            }
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
        logActivity('DELETE_PRODUCT', `Permanently deleted product "${product.name}" (ID: ${id}) and variants.`, req);
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error: any) {
        console.error("Delete product error:", error);
        res.status(500).json({ error: error.message || "Failed to delete product" });
    }
};

export const getTrendingProducts = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 12;
        
        let products = await prisma.product.findMany({
            where: {
                isPermitted: true,
                OR: [
                    { isCustomerFavorite: true },
                    { isNewArrival: true }
                ]
            },
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
            take: limit,
        });

        if (products.length === 0) {
            products = await prisma.product.findMany({
                where: {
                    isPermitted: true,
                },
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
                take: limit,
            });
        }

        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('Failed to fetch trending products:', error);
        res.status(500).json({ error: "Failed to fetch trending products" });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        console.log("🚀 GET /api/products called with query:", req.query);
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
        } = req.query;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const take = parseInt(limit as string);

        const where: any = {};

        // Enforce permission: only products with granted permission are visible on storefront
        if (includeAll !== 'true') {
            where.isPermitted = true;
        }

        if (categoryId) where.categoryId = categoryId;
        if (subCategoryId) where.subCategoryId = subCategoryId;
        if (brandId) where.brandId = brandId;

        if (category) {
            where.category = {
                name: { contains: category as string, mode: 'insensitive' }
            };
        }

        if (isCustomerFavorite === 'true') {
            where.isCustomerFavorite = true;
        } else if (isCustomerFavorite === 'false') {
            where.isCustomerFavorite = false;
        }

        if (isNewArrival === 'true') {
            where.isNewArrival = true;
        } else if (isNewArrival === 'false') {
            where.isNewArrival = false;
        }

        if (trending === 'true') {
            where.OR = [
                { isCustomerFavorite: true },
                { isNewArrival: true }
            ];
        }

        const andConditions: any[] = [];

        if (search) {
            const searchStr = search as string;
            if (searchType === 'sku') {
                andConditions.push({
                    variants: {
                        some: {
                            sku: { contains: searchStr, mode: 'insensitive' }
                        }
                    }
                });
            } else if (searchType === 'category') {
                andConditions.push({
                    category: {
                        name: { contains: searchStr, mode: 'insensitive' }
                    }
                });
            } else if (searchType === 'name') {
                andConditions.push({
                    name: { contains: searchStr, mode: 'insensitive' }
                });
            } else {
                // Default: OR search across name, description, category, and SKU
                andConditions.push({
                    OR: [
                        { name: { contains: searchStr, mode: 'insensitive' } },
                        { description: { contains: searchStr, mode: 'insensitive' } },
                        { category: { name: { contains: searchStr, mode: 'insensitive' } } },
                        { variants: { some: { sku: { contains: searchStr, mode: 'insensitive' } } } }
                    ]
                });
            }
        }

        if (priceRanges) {
            const ranges = (priceRanges as string).split(',');
            const priceConditions = ranges.map(range => {
                if (range === 'under_5000') {
                    return { variants: { some: { price: { lt: 5000 } } } };
                }
                if (range === '5000_10000') {
                    return { variants: { some: { price: { gte: 5000, lte: 10000 } } } };
                }
                if (range === 'over_10000') {
                    return { variants: { some: { price: { gt: 10000 } } } };
                }
                return {};
            }).filter(c => Object.keys(c).length > 0);

            if (priceConditions.length > 0) {
                andConditions.push({ OR: priceConditions });
            }
        }

        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort) {
            const [field, order] = (sort as string).split('_');
            if (field === 'name') orderBy = { name: order };
            if (field === 'price') orderBy = { variants: { _count: 'desc' } }; // Simplified, real price sort is harder with variants
            if (field === 'created') orderBy = { createdAt: order };
        }

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
                orderBy,
                skip,
                take,
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            data: products,
            pagination: {
                currentPage: parseInt(page as string),
                totalPages: Math.ceil(totalCount / take),
                totalCount,
                limit: take,
                hasNextPage: skip + take < totalCount,
                hasPreviousPage: skip > 0,
            }
        });
    } catch (error: any) {
        console.error('Failed to fetch products:', error);
        res.status(500).json({ error: error?.message || "Failed to fetch products" });
    }
};

export const getProductById = async (req: Request, res: Response) => {

    try {
        const id = req.params.id as string;
        const product = await prisma.product.findUnique({
            where: { id: id as string },
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
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!product) return res.status(404).json({ error: "Product not found" });

        res.json({ success: true, data: product });
    } catch (error) {
        console.error('Failed to fetch product:', error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};
