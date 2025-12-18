import { db } from "../config/database";
import { consultants, Consultant, NewConsultant } from "../db/schema";
import { eq } from "drizzle-orm";

export const consultantService = {
    // Get all active consultants
    async getAll(): Promise<Consultant[]> {
        return db.select().from(consultants).where(eq(consultants.isActive, true));
    },

    // Get consultant by ID
    async getById(id: string): Promise<Consultant | undefined> {
        const result = await db.select().from(consultants).where(eq(consultants.id, id));
        return result[0];
    },

    // Create consultant
    async create(data: Omit<NewConsultant, "id" | "createdAt">): Promise<Consultant> {
        const result = await db.insert(consultants).values(data).returning();
        return result[0];
    },

    // Update consultant
    async update(id: string, data: Partial<NewConsultant>): Promise<Consultant | undefined> {
        const result = await db.update(consultants).set(data).where(eq(consultants.id, id)).returning();
        return result[0];
    },

    // Delete consultant (soft delete)
    async delete(id: string): Promise<boolean> {
        const result = await db.update(consultants).set({ isActive: false }).where(eq(consultants.id, id));
        return result.length > 0;
    },
};
