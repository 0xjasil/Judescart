import { Router } from 'express';
import multer from 'multer';
import { getBenefits, updateBenefits } from '../controllers/benefitController.js';
import { adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getBenefits);

// Admin only routes
router.use(adminMiddleware);
router.post('/', upload.single('image'), updateBenefits);
router.patch('/', upload.single('image'), updateBenefits);

export default router;
