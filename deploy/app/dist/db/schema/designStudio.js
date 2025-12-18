import { pgTable, uuid, varchar, text, integer, boolean, timestamp, json } from 'drizzle-orm/pg-core';
// Floor Plans for Design Studio
export const studioFloorPlans = pgTable('studio_floor_plans', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(), // 'single' | 'double'
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    garages: integer('garages'),
    squareMeters: integer('square_meters'),
    imageUrl: text('image_url'),
    floorPlanImage: text('floor_plan_image'),
    description: text('description'),
    features: json('features').$type(),
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Facades for Design Studio
export const studioFacades = pgTable('studio_facades', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(), // 'single' | 'double'
    style: varchar('style', { length: 100 }), // 'modern' | 'traditional' | 'contemporary' | 'classic'
    imageUrl: text('image_url'),
    description: text('description'),
    features: json('features').$type(),
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// User Submissions from Design Studio
export const studioSubmissions = pgTable('studio_submissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    floorPlanId: uuid('floor_plan_id').references(() => studioFloorPlans.id),
    facadeId: uuid('facade_id').references(() => studioFacades.id),
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
