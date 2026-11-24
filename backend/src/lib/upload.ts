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

export const uploadToCloudinary = async (fileBuffer: Buffer, originalName: string) => {
    const hasCloudinary = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    const mimeType = getMimeType(originalName);
    const base64 = fileBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

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
            console.warn('Cloudinary upload failed, falling back:', error?.message || error);
        }
    }

    // In a serverless environment (Vercel, AWS Lambda), local disk (/var/task) is strictly read-only.
    // Falling back to local disk write will cause "ENOENT: mkdir /var/task/uploads".
    // We safely return the base64 data URI so product creation always succeeds in serverless.
    const isServerless = Boolean(
        process.env.VERCEL ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.LAMBDA_TASK_ROOT
    );

    if (isServerless) {
        console.warn(
            '⚠️ [Upload Notice] Cloudinary is not configured or failed on Vercel. Storing image as inline Data URL. ' +
            'For optimal production performance, configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel project settings.'
        );
        return dataUri;
    }

    // Local development storage fallback
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
        console.warn('Local disk write failed, falling back to data URL:', localErr);
        return dataUri;
    }
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


