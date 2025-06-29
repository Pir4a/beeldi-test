import { Router } from 'express';
import { EquipmentTypeController } from '../controllers/equipmentType.controller';

const router = Router();
const equipmentTypeController = new EquipmentTypeController();

// Get all equipment types with hierarchy
router.get('/', equipmentTypeController.getAll);

// Get domains only (level 1)
router.get('/domains', equipmentTypeController.getDomains);

// Get children of a specific type
router.get('/:id/children', equipmentTypeController.getChildren);

// Get hierarchy path for a specific type
router.get('/:id/hierarchy', equipmentTypeController.getHierarchy);

// Get specific equipment type by ID
router.get('/:id', equipmentTypeController.getById);

// Create new equipment type
router.post('/', equipmentTypeController.create);

// Update equipment type
router.put('/:id', equipmentTypeController.update);

// Delete equipment type
router.delete('/:id', equipmentTypeController.delete);

// Import equipment types from CSV
router.post('/import', equipmentTypeController.importFromCSV);

export default router;