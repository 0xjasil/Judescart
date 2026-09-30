import { Router } from 'express';
import multer from 'multer';
import { createProduct, updateProduct, deleteProduct, getProductById, createProductWithVariants, updateProductWithVariants, getProducts, getTrendingProducts } from '../controllers/productController.js';
import { adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getProducts);
router.get('/trending', getTrendingProducts);
router.get('/:id', getProductById);

// Protected admin routes
router.use(adminMiddleware);
router.post('/', upload.single('image'), createProduct);
router.post('/withvariant', upload.any(), createProductWithVariants);
router.patch('/withvariant/:id', upload.any(), updateProductWithVariants);
router.patch('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
