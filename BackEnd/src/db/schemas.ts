import { 
    pgTable, 
    uuid, 
    varchar, 
    timestamp, 
    text,
    index,
    uniqueIndex 
  } from 'drizzle-orm/pg-core';
  import { relations } from 'drizzle-orm';
  
  // Table des types d'équipements (hiérarchie à 4 niveaux)
  export const equipmentTypes = pgTable('equipment_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    parentId: uuid('parent_id').references(() => equipmentTypes.id),
    level: varchar('level', { length: 20 }).notNull(), // 'domain', 'type', 'category', 'subcategory'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }, (table) => [
     index('equipment_types_name_idx').on(table.name),
     index('equipment_types_parent_idx').on(table.parentId),
     index('equipment_types_level_idx').on(table.level),
    uniqueIndex('unique_name_per_parent').on(table.name, table.parentId),
]);
  
  // Table des équipements
  export const equipments = pgTable('equipments', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    equipmentTypeId: uuid('equipment_type_id')
      .notNull()
      .references(() => equipmentTypes.id),
    brand: varchar('brand', { length: 255 }),
    model: varchar('model', { length: 255 }),
    description: text('description'),
    isDeleted: timestamp('is_deleted'), // Suppression logique
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }, (table) => [
    index('equipments_name_idx').on(table.name),
    index('equipments_type_idx').on(table.equipmentTypeId),
    index('equipments_brand_idx').on(table.brand),
    index('equipments_model_idx').on(table.model),
    index('equipments_deleted_idx').on(table.isDeleted),
  ]);
  
  // Relations
  export const equipmentTypesRelations = relations(equipmentTypes, ({ one, many }) => ({
    parent: one(equipmentTypes, {
      fields: [equipmentTypes.parentId],
      references: [equipmentTypes.id],
      relationName: 'parent_child'
    }),
    children: many(equipmentTypes, {
      relationName: 'parent_child'
    }),
    equipments: many(equipments),
  }));
  
  export const equipmentsRelations = relations(equipments, ({ one }) => ({
    equipmentType: one(equipmentTypes, {
      fields: [equipments.equipmentTypeId],
      references: [equipmentTypes.id],
    }),
  }));
  
  // Types TypeScript inférés
  export type EquipmentType = typeof equipmentTypes.$inferSelect;
  export type NewEquipmentType = typeof equipmentTypes.$inferInsert;
  export type Equipment = typeof equipments.$inferSelect;
  export type NewEquipment = typeof equipments.$inferInsert;
  
  // Types étendus avec relations
  export type EquipmentWithType = Equipment & {
    equipmentType: EquipmentType;
  };
  
  export type EquipmentTypeWithChildren = EquipmentType & {
    children: EquipmentType[];
  };
  
  export type EquipmentTypeHierarchy = EquipmentType & {
    parent?: EquipmentType;
    children: EquipmentType[];
    equipments?: Equipment[];
  };
  
  // Vue pour la hiérarchie complète (utilisée dans les selects en cascade)
  export type EquipmentTypeTree = {
    domain: EquipmentType;
    types: Array<{
      type: EquipmentType;
      categories: Array<{
        category: EquipmentType;
        subcategories: EquipmentType[];
      }>;
    }>;
  };