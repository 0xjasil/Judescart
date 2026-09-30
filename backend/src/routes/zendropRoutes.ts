import { Router } from 'express';
import {
  getZendropSettings,
  updateZendropSettings,
  testZendropConnection,
  getZendropCatalog,
  importZendropProduct,
  getImportedProducts,
  syncZendropProduct,
} from '../controllers/zendropController.js';

const router = Router();

router.get('/settings', getZendropSettings);
router.post('/settings', updateZendropSettings);
router.post('/test-connection', testZendropConnection);
router.get('/catalog', getZendropCatalog);
router.post('/import', importZendropProduct);
router.get('/imported', getImportedProducts);
router.post('/sync/:id', syncZendropProduct);

export default router;
