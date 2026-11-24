import cloudinary from './cloudinary.js';
import fs from 'fs';
import path from 'path';

const getMimeType = (filename: string): string => {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        case '.gif':
            return 'image/gif';
        case '.svg':
            return 'image/svg+xml';
        case '.jpg':
        case '.jpeg':
        default:
            return 'image/jpeg';
    }
};

// Cloudinary is temporarily disabled per user request.
// Set ENABLE_CLOUDINARY=true in environment variables to re-enable cloud upload.
const ENABLE_CLOUD_STORAGE = process.env.ENABLE_CLOUDINARY === 'true';

export const uploadToCloudinary = async (fileBuffer: Buffer, originalName: string) => {
    const mimeType = getMimeType(originalName);
    const base64 = fileBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    const hasCloudinary = ENABLE_CLOUD_STORAGE && Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinary) {
        try {
            const uploadResult = await cloudinary.uploader.upload(dataUri, {
                folder: process.env.CLOUDINARY_FOLDER || 'judescart',
                resource_type: 'auto',
            });
            if (uploadResult?.secure_url) {
                return uploadResult.secure_url;
            }
        } catch (error: any) {
            console.warn('Cloudinary upload failed, falling back to data URL:', error?.message || error);
        }
    }

    // Cloud upload temporarily removed: return Base64 Data URL directly
    // This requires 0 external services, 0 disk writes, and works seamlessly in Vercel Serverless & local
    return dataUri;
};

export const safeDeleteImage = async (imageUrl?: string | null) => {
    if (!imageUrl) return;
    try {
        if (imageUrl.startsWith('data:')) {
            return;
        }
        if (imageUrl.includes('/uploads/')) {
            const fileName = imageUrl.split('/uploads/').pop();
            if (fileName) {
                const filePath = path.join(process.cwd(), 'uploads', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        } else if (imageUrl.includes('res.cloudinary.com') || imageUrl.includes('cloudinary')) {
            const publicId = imageUrl.split('/').pop()?.split('.')[0];
            if (publicId && process.env.CLOUDINARY_CLOUD_NAME) {
                const folder = process.env.CLOUDINARY_FOLDER || 'judescart';
                await (cloudinary as any).uploader.destroy(`${folder}/${publicId}`).catch(() => {});
            }
        }
    } catch (err) {
        console.warn('safeDeleteImage non-fatal warning:', err);
    }
};


