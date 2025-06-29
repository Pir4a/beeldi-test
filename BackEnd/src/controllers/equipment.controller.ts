import { Request, Response } from 'express';
import { EquipmentService } from '../services/equipment.service';
import { createEquipmentSchema, updateEquipmentSchema } from '../utils/validation';

export class EquipmentController {
  private equipmentService = new EquipmentService();

  getAll = async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      const equipments = await this.equipmentService.getAll(filters);
      res.json(equipments);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des équipements' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const equipment = await this.equipmentService.getById(id);
      
      if (!equipment) {
        return res.status(404).json({ error: 'Équipement non trouvé' });
      }
      
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'équipement' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const validatedData = createEquipmentSchema.parse(req.body);
      const equipment = await this.equipmentService.create(validatedData);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(400).json({ error: 'Données invalides', details: error });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updateEquipmentSchema.parse(req.body);
      const equipment = await this.equipmentService.update(id, validatedData);
      
      if (!equipment) {
        return res.status(404).json({ error: 'Équipement non trouvé' });
      }
      
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ error: 'Données invalides', details: error });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await this.equipmentService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Équipement non trouvé' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  };
}