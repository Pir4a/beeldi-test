import { db } from '../db';
import { equipments, equipmentTypes, Equipment, NewEquipment, EquipmentWithType } from '../db/schemas';
import { eq, ilike, and, or, sql, SQL } from 'drizzle-orm';

export interface EquipmentFilters {
  search?: string;
  domain?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  model?: string;
}

export class EquipmentService {
  // Récupérer tous les équipements avec filtres
  async getAll(filters: EquipmentFilters = {}): Promise<EquipmentWithType[]> {
    let query = db
      .select({
        id: equipments.id,
        name: equipments.name,
        equipmentTypeId: equipments.equipmentTypeId,
        brand: equipments.brand,
        model: equipments.model,
        description: equipments.description,
        createdAt: equipments.createdAt,
        updatedAt: equipments.updatedAt,
        equipmentType: equipmentTypes,
      })
      .from(equipments)
      .leftJoin(equipmentTypes, eq(equipments.equipmentTypeId, equipmentTypes.id));

    // Appliquer les filtres
    const conditions: SQL[] = [];

    if (filters.search) {
      const searchConditions = [
        ilike(equipments.name, `%${filters.search}%`),
        ilike(equipments.brand, `%${filters.search}%`),
        ilike(equipments.model, `%${filters.search}%`)
      ].filter((c): c is SQL => c !== undefined);
      if (searchConditions.length > 0) {
        conditions.push;
      }
    }

    if (filters.brand) {
      const cond = ilike(equipments.brand, `%${filters.brand}%`);
      if (cond) conditions.push(cond);
    }

    if (filters.model) {
      const cond = ilike(equipments.model, `%${filters.model}%`);
      if (cond) conditions.push(cond);
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.query.equipments.findMany({
      where: whereCondition,
      with: {
        equipmentType: true,
      },
    });

    // Enrichir avec la hiérarchie complète
    return await Promise.all(
      results.map(async (item) => {
        const hierarchy = await this.getEquipmentHierarchy(item.equipmentTypeId);
        return {
          ...item,
          domain: hierarchy[0] || null,
          type: hierarchy[1] || null,
          category: hierarchy[2] || null,
          subcategory: hierarchy[3] || null,
        };
      })
    );
  }

  // Récupérer un équipement par ID
  async getById(id: string): Promise<EquipmentWithType | null> {
    const equipment = await db.query.equipments.findFirst({
      where: eq(equipments.id, id),
      with: {
        equipmentType: true,
      },
    });

    if (!equipment) return null;

    const hierarchy = await this.getEquipmentHierarchy(equipment.equipmentTypeId);

    return {
      ...equipment,
      domain: hierarchy[0] || null,
      type: hierarchy[1] || null,
      category: hierarchy[2] || null,
      subcategory: hierarchy[3] || null,
    };
  }

  // Créer un équipement
  async create(data: NewEquipment): Promise<Equipment> {
    const [created] = await db.insert(equipments).values(data).returning();
    return created;
  }

  // Mettre à jour un équipement
  async update(id: string, data: Partial<NewEquipment>): Promise<Equipment | null> {
    const [updated] = await db
      .update(equipments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(equipments.id, id))
      .returning();

    return updated || null;
  }

  // Supprimer un équipement
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(equipments).where(eq(equipments.id, id));
    return Array.isArray(result) ? result.length > 0 : false;
  }

  // Méthode utilitaire pour récupérer la hiérarchie
  private async getEquipmentHierarchy(typeId: string): Promise<(typeof equipmentTypes.$inferSelect | null)[]> {
    const hierarchy: (typeof equipmentTypes.$inferSelect | null)[] = [null, null, null, null];
    
    let currentType = await db.query.equipmentTypes.findFirst({
      where: eq(equipmentTypes.id, typeId),
    });

    while (currentType) {
      hierarchy[currentType.level - 1] = currentType;
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
}