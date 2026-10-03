import { Router } from 'express';
import {
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from '../controllers/couponController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Customer coupon verification endpoint (public for checkout & cart)
router.post('/validate', validateCoupon);

// Admin Coupon CRUD endpoints (requires admin role)
router.get('/', adminMiddleware, getAllCoupons);
router.post('/', adminMiddleware, createCoupon);
router.patch('/:id', adminMiddleware, updateCoupon);
router.delete('/:id', adminMiddleware, deleteCoupon);

export default router;
