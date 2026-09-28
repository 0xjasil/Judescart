import cloudinary from './cloudinary.js';
import fs from 'fs';
import path from 'path';

export const uploadToCloudinary = async (fileBuffer: Buffer, originalName: string) => {
    const hasCloudinary = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinary) {
        try {
            const base64 = fileBuffer.toString('base64');
            const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, {
                folder: 'stevejon',
            });
            return uploadResult.secure_url;
        } catch (error: any) {
            console.warn('Cloudinary upload failed, using local storage fallback:', error?.message || error);
        }
    }

    // Local storage fallback
    try {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(originalName) || '.jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, fileBuffer);
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        return `${baseUrl}/uploads/${fileName}`;
    } catch (localErr) {
        console.error('Upload storage error:', localErr);
        throw localErr;
    }
};

export const safeDeleteImage = async (imageUrl?: string | null) => {
    if (!imageUrl) return;
    try {
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
                await (cloudinary as any).uploader.destroy(`stevejon/${publicId}`).catch(() => {});
            }
        }
    } catch (err) {
        console.warn('safeDeleteImage non-fatal warning:', err);
    }
};

