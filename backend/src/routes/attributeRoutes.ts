import { Router } from 'express';
import { 
    getAttributes, 
    createAttribute, 
    updateAttribute, 
    deleteAttribute, 
    createAttributeValue, 
    updateAttributeValue,
    deleteAttributeValue 
} from '../controllers/attributeController.js';
import { adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAttributes);

// Admin routes
router.use(adminMiddleware);
router.post('/', createAttribute);
router.patch('/:id', updateAttribute);
router.delete('/:id', deleteAttribute);

// Values routes
router.post('/values', createAttributeValue);
router.post('/:attributeId/values', createAttributeValue);
router.patch('/values/:id', updateAttributeValue);
router.delete('/values/:id', deleteAttributeValue);

export default router;

