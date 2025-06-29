import { db } from '../db';
import { equipmentTypes, EquipmentType, NewEquipmentType, EquipmentTypeWithHierarchy } from '../db/schemas';
import { eq, isNull, sql } from 'drizzle-orm';

export class EquipmentTypeService {
  // Récupérer tous les types avec hiérarchie
  async getAll(): Promise<EquipmentTypeWithHierarchy[]> {
    const types = await db.query.equipmentTypes.findMany({
      with: {
        parent: true,
        children: true,
      },
      orderBy: [equipmentTypes.level, equipmentTypes.name],
    });
    return types;
  }

  // Récupérer la hiérarchie complète d'un type
  async getHierarchy(typeId: string): Promise<EquipmentType[]> {
    const hierarchy: EquipmentType[] = [];
    let currentType = await db.query.equipmentTypes.findFirst({
      where: eq(equipmentTypes.id, typeId),
    });

    while (currentType) {
      hierarchy.unshift(currentType);
      if (currentType.parentId) {
        currentType = await db.query.equipmentTypes.findFirst({
          where: eq(equipmentTypes.id, currentType.parentId),
        });
      } else {
        break;
      }
    }

    return hierarchy;
  }

  // Récupérer les domaines (niveau 1)
  async getDomains(): Promise<EquipmentType[]> {
    return await db.query.equipmentTypes.findMany({
      where: isNull(equipmentTypes.parentId),
      orderBy: equipmentTypes.name,
    });
  }

  // Récupérer les enfants d'un type
  async getChildren(parentId: string): Promise<EquipmentType[]> {
    return await db.query.equipmentTypes.findMany({
      where: eq(equipmentTypes.parentId, parentId),
      orderBy: equipmentTypes.name,
    });
  }

  // Créer un type d'équipement
  async create(data: NewEquipmentType): Promise<EquipmentType> {
    const [created] = await db.insert(equipmentTypes).values(data).returning();
    return created;
  }

  // Importer depuis CSV
  async importFromCSV(csvData: any[]): Promise<void> {
    // Logique d'import depuis le CSV fourni
    // À implémenter selon le format du CSV
  }
}