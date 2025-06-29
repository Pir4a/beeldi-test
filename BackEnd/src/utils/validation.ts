import { z } from 'zod';

export const createEquipmentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  equipmentTypeId: z.string().uuid('ID de type invalide'),
  brand: z.string().max(255).optional(),
  model: z.string().max(255).optional(),
  description: z.string().optional(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

export const createEquipmentTypeSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  parentId: z.string().uuid().optional(),
  level: z.number().int().min(1).max(4),
});