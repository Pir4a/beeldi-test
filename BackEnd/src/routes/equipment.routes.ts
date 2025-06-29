import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';

const router = Router();
const equipmentController = new EquipmentController();

router.get('/', equipmentController.getAll);
router.get('/:id', equipmentController.getById);
router.post('/', equipmentController.create);
router.put('/:id', equipmentController.update);
router.delete('/:id', equipmentController.delete);

export default router;