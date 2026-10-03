import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { toNodeHandler } from 'better-auth/node';
import { webAuth, adminAuth } from "./lib/auth.js";
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import offerSlideRoutes from './routes/offerSlideRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import attributeRoutes from './routes/attributeRoutes.js';
import variantRoutes from './routes/variantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import drawCampaignRoutes from './routes/drawCampaignRoutes.js';
import logRoutes from './routes/logRoutes.js';
import razorpayRoutes from "./routes/razorpayRoutes.js";
import benefitRoutes from './routes/benefitRoutes.js';
import zendropRoutes from './routes/zendropRoutes.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    process.env.ADMIN_URL
].filter(Boolean) as string[];

const isLocalOrigin = (origin: string) => {
    try {
        const url = new URL(origin);
        return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    } catch {
        return false;
    }
};

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || isLocalOrigin(origin) || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️ Blocked by CORS: Origin is "${origin}"`);
            callback(null, false);
        }
    },
    credentials: true
}));
app.use(morgan('dev'));


// Better Auth handlers must be mounted before express.json()
app.all(/^\/api\/auth-web(\/.*)?$/, toNodeHandler(webAuth));
app.all(/^\/api\/auth-admin(\/.*)?$/, toNodeHandler(adminAuth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve uploaded media locally
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offer-slides', offerSlideRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/benefits', benefitRoutes);
app.use('/api/zendrop', zendropRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/draws', drawCampaignRoutes);
app.use('/api/logs', logRoutes);
app.use("/api/payments/razorpay", razorpayRoutes);
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
}

export default app;


