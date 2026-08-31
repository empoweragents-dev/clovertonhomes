import { mysqlTable, varchar, text, int, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { randomUUID } from "crypto";
import { jsonType } from "../customTypes.js";

// Floor Plans for Design Studio
export const studioFloorPlans = mysqlTable('studio_floor_plans', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(), // 'single' | 'double'
    bedrooms: int('bedrooms'),
    bathrooms: int('bathrooms'),
    garages: int('garages'),
    squareMeters: int('square_meters'),
    imageUrl: text('image_url'),
    floorPlanImage: text('floor_plan_image'),
    description: text('description'),
    features: jsonType<string[]>('features'),
    sortOrder: int('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Facades for Design Studio
export const studioFacades = mysqlTable('studio_facades', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(), // 'single' | 'double'
    style: varchar('style', { length: 100 }), // 'modern' | 'traditional' | 'contemporary' | 'classic'
    imageUrl: text('image_url'),
    description: text('description'),
    features: jsonType<string[]>('features'),
    sortOrder: int('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// User Submissions from Design Studio
export const studioSubmissions = mysqlTable('studio_submissions', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    floorPlanId: varchar('floor_plan_id', { length: 36 }).references(() => studioFloorPlans.id),
    facadeId: varchar('facade_id', { length: 36 }).references(() => studioFacades.id),
    inclusionTier: varchar('inclusion_tier', { length: 50 }), // 'standard' | 'designer' | 'premium'
    customerName: varchar('customer_name', { length: 255 }).notNull(),
    customerEmail: varchar('customer_email', { length: 255 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 50 }),
    landAddress: text('land_address'),
    comments: text('comments'),
    status: varchar('status', { length: 50 }).default('pending'), // 'pending' | 'contacted' | 'converted' | 'closed'
    brochureUrl: text('brochure_url'),
    adminNotes: text('admin_notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type StudioFloorPlan = typeof studioFloorPlans.$inferSelect;
export type NewStudioFloorPlan = typeof studioFloorPlans.$inferInsert;
export type StudioFacade = typeof studioFacades.$inferSelect;
export type NewStudioFacade = typeof studioFacades.$inferInsert;
export type StudioSubmission = typeof studioSubmissions.$inferSelect;
export type NewStudioSubmission = typeof studioSubmissions.$inferInsert;
