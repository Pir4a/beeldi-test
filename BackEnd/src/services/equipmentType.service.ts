import { db } from '../db';
import { equipmentTypes, EquipmentType, NewEquipmentType, EquipmentTypeWithHierarchy, equipments } from '../db/schemas';
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

  // Récupérer un type par ID
  async getById(id: string): Promise<EquipmentTypeWithHierarchy | null> {
    return await db.query.equipmentTypes.findFirst({
      where: eq(equipmentTypes.id, id),
      with: {
        parent: true,
        children: true,
      },
    }) as EquipmentTypeWithHierarchy | null;
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

  // Mettre à jour un type d'équipement
  async update(id: string, data: Partial<NewEquipmentType>): Promise<EquipmentType | null> {
    const [updated] = await db
      .update(equipmentTypes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(equipmentTypes.id, id))
      .returning();

    return updated || null;
  }

  // Supprimer un type d'équipement
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(equipmentTypes).where(eq(equipmentTypes.id, id));
    return Array.isArray(result) ? result.length > 0 : false;
  }

  // Vérifier si un type a des enfants
  async hasChildren(id: string): Promise<boolean> {
    const children = await db.query.equipmentTypes.findFirst({
      where: eq(equipmentTypes.parentId, id),
    });
    return !!children;
  }

  // Vérifier si un type a des équipements associés
  async hasEquipments(id: string): Promise<boolean> {
    const equipment = await db.query.equipments.findFirst({
      where: eq(equipments.equipmentTypeId, id),
    });
    return !!equipment;
  }
}