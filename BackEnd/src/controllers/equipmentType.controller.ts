import { Request, Response } from 'express';
import { EquipmentTypeService } from '../services/equipmentType.service';
import { createEquipmentTypeSchema } from '../utils/validation';
import { ZodError } from 'zod';

export class EquipmentTypeController {
  private equipmentTypeService = new EquipmentTypeService();

  getAll = async (req: Request, res: Response) => {
    try {
      const equipmentTypes = await this.equipmentTypeService.getAll();
      res.json(equipmentTypes);
    } catch (error) {
      console.error('Error fetching equipment types:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des types d\'équipements' });
    }
  };

  getDomains = async (req: Request, res: Response) => {
    try {
      const domains = await this.equipmentTypeService.getDomains();
      res.json(domains);
    } catch (error) {
      console.error('Error fetching domains:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des domaines' });
    }
  };

  getChildren = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const children = await this.equipmentTypeService.getChildren(id);
      res.json(children);
    } catch (error) {
      console.error('Error fetching children:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des enfants' });
    }
  };

  getHierarchy = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const hierarchy = await this.equipmentTypeService.getHierarchy(id);
      res.json(hierarchy);
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la hiérarchie' });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const equipmentType = await this.equipmentTypeService.getById(id);
      
      if (!equipmentType) {
        return res.status(404).json({ error: 'Type d\'équipement non trouvé' });
      }
      
      res.json(equipmentType);
    } catch (error) {
      console.error('Error fetching equipment type:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du type d\'équipement' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const validatedData = createEquipmentTypeSchema.parse(req.body);
      const equipmentType = await this.equipmentTypeService.create(validatedData);
      res.status(201).json(equipmentType);
    } catch (error) {
      console.error('Error creating equipment type:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: 'Données invalides', 
          details: error.errors 
        });
      }
      res.status(500).json({ error: 'Erreur lors de la création du type d\'équipement' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = createEquipmentTypeSchema.partial().parse(req.body);
      const equipmentType = await this.equipmentTypeService.update(id, validatedData);
      
      if (!equipmentType) {
        return res.status(404).json({ error: 'Type d\'équipement non trouvé' });
      }
      
      res.json(equipmentType);
    } catch (error) {
      console.error('Error updating equipment type:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: 'Données invalides', 
          details: error.errors 
        });
      }
      res.status(500).json({ error: 'Erreur lors de la mise à jour du type d\'équipement' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if type has children or equipments
      const hasChildren = await this.equipmentTypeService.hasChildren(id);
      const hasEquipments = await this.equipmentTypeService.hasEquipments(id);
      
      if (hasChildren) {
        return res.status(400).json({ 
          error: 'Impossible de supprimer un type ayant des sous-types' 
        });
      }
      
      if (hasEquipments) {
        return res.status(400).json({ 
          error: 'Impossible de supprimer un type ayant des équipements associés' 
        });
      }
      
      const deleted = await this.equipmentTypeService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Type d\'équipement non trouvé' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting equipment type:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du type d\'équipement' });
    }
  };

  importFromCSV = async (req: Request, res: Response) => {
    try {
      const { csvData } = req.body;
      
      if (!csvData || !Array.isArray(csvData)) {
        return res.status(400).json({ 
          error: 'Données CSV manquantes ou invalides' 
        });
      }
      
      await this.equipmentTypeService.importFromCSV(csvData);
      res.json({ message: 'Import réussi', imported: csvData.length });
    } catch (error) {
      console.error('Error importing CSV:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'import CSV',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };
}