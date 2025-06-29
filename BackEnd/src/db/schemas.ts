import { pgTable, uuid, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Table des types d'équipements (hiérarchique)

export const equipmentTypes: any = pgTable('equipment_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: uuid('parent_id').references(() => equipmentTypes.id),
  level: integer('level').notNull().default(1), // 1=domaine, 2=type, 3=catégorie, 4=sous-catégorie
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// Table des équipements
export const equipments = pgTable('equipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  equipmentTypeId: uuid('equipment_type_id').references(() => equipmentTypes.id).notNull(),
  brand: varchar('brand', { length: 255 }),
  model: varchar('model', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const equipmentTypesRelations = relations(equipmentTypes, ({ one, many }) => ({
  parent: one(equipmentTypes, {
    fields: [equipmentTypes.parentId],
    references: [equipmentTypes.id],
    relationName: 'parent_child',
  }),
  children: many(equipmentTypes, {
    relationName: 'parent_child',
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

// Types étendus pour l'API
export interface EquipmentTypeWithHierarchy extends EquipmentType {
  parent?: EquipmentType | null;
  children?: EquipmentType[];
}

export interface EquipmentWithType extends Equipment {
  equipmentType: EquipmentType;
  // Hiérarchie complète pour l'affichage
  domain?: EquipmentType;
  type?: EquipmentType;
  category?: EquipmentType;
  subcategory?: EquipmentType;
}