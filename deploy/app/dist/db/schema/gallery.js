import { pgTable, uuid, varchar, text, integer, boolean, timestamp, json } from 'drizzle-orm/pg-core';
// Interior Schemes (Coastal, Modern Luxe, Hamptons, Industrial)
export const interiorSchemes = pgTable('interior_schemes', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    tagline: varchar('tagline', { length: 255 }),
    description: text('description'),
    heroImage: text('hero_image'),
    colorPalette: json('color_palette').$type(),
    materials: json('materials').$type(),
    rooms: json('rooms').$type(),
    features: json('features').$type(),
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// Gallery Images for Image Gallery page
export const galleryImages = pgTable('gallery_images', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }),
    imageUrl: text('image_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    category: varchar('category', { length: 100 }), // 'exterior' | 'interior' | 'kitchen' | 'bathroom' | 'living' | 'bedroom' | 'facade'
    tags: json('tags').$type(),
    altText: varchar('alt_text', { length: 255 }),
    projectName: varchar('project_name', { length: 255 }),
    location: varchar('location', { length: 255 }),
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    isFeatured: boolean('is_featured').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
