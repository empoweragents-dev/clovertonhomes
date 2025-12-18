import { db } from "../config/database";
import { testimonials, Testimonial, NewTestimonial } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export const testimonialService = {
    // Get all active testimonials
    async getAll(): Promise<Testimonial[]> {
        return db.select()
            .from(testimonials)
            .where(eq(testimonials.isActive, true))
            .orderBy(testimonials.sortOrder);
    },

    // Get testimonial by ID
    async getById(id: string): Promise<Testimonial | undefined> {
        const result = await db.select().from(testimonials).where(eq(testimonials.id, id));
        return result[0];
    },

    // Create testimonial
    async create(data: Omit<NewTestimonial, "id" | "createdAt">): Promise<Testimonial> {
        const result = await db.insert(testimonials).values(data).returning();
        return result[0];
    },

    // Update testimonial
    async update(id: string, data: Partial<NewTestimonial>): Promise<Testimonial | undefined> {
        const result = await db.update(testimonials).set(data).where(eq(testimonials.id, id)).returning();
        return result[0];
    },

    // Delete testimonial (soft delete)
    async delete(id: string): Promise<boolean> {
        const result = await db.update(testimonials).set({ isActive: false }).where(eq(testimonials.id, id));
        return result.length > 0;
    },
};
