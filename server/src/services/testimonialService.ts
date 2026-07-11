import { db } from "../config/database";
import { testimonials, Testimonial, NewTestimonial } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { insertReturning, updateReturning } from "../db/helpers";

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
        return insertReturning<Testimonial>(testimonials, data);
    },

    // Update testimonial
    async update(id: string, data: Partial<NewTestimonial>): Promise<Testimonial | undefined> {
        return updateReturning<Testimonial>(testimonials, id, data);
    },

    // Delete testimonial (soft delete)
    async delete(id: string): Promise<boolean> {
        const result: any = await db.update(testimonials).set({ isActive: false }).where(eq(testimonials.id, id));
        return result[0].affectedRows > 0;
    },
};
