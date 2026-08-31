import { mysqlTable, varchar, text, int, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { randomUUID } from "crypto";
import { jsonType } from "../customTypes.js";

// Interior Schemes (Coastal, Modern Luxe, Hamptons, Industrial)
export const interiorSchemes = mysqlTable('interior_schemes', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    tagline: varchar('tagline', { length: 255 }),
    description: text('description'),
    heroImage: text('hero_image'),
    colorPalette: jsonType<{ name: string; hex: string }[]>('color_palette'),
    materials: jsonType<{ name: string; imageUrl: string; description?: string }[]>('materials'),
    rooms: jsonType<{ name: string; imageUrl: string; description?: string }[]>('rooms'),
    features: jsonType<string[]>('features'),
    sortOrder: int('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Gallery Images for Image Gallery page
export const galleryImages = mysqlTable('gallery_images', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    title: varchar('title', { length: 255 }),
    imageUrl: text('image_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    category: varchar('category', { length: 100 }), // 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'living' | 'bedroom' | 'facade'
    tags: jsonType<string[]>('tags'),
    altText: varchar('alt_text', { length: 255 }),
    projectName: varchar('project_name', { length: 255 }),
    location: varchar('location', { length: 255 }),
    sortOrder: int('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    isFeatured: boolean('is_featured').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type InteriorScheme = typeof interiorSchemes.$inferSelect;
export type NewInteriorScheme = typeof interiorSchemes.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;
