import { db } from "../config/database.js";
import { consultants, Consultant, NewConsultant } from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { insertReturning, updateReturning } from "../db/helpers.js";

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
        return insertReturning<Consultant>(consultants, data);
    },

    // Update consultant
    async update(id: string, data: Partial<NewConsultant>): Promise<Consultant | undefined> {
        return updateReturning<Consultant>(consultants, id, data);
    },

    // Delete consultant (soft delete)
    async delete(id: string): Promise<boolean> {
        const result: any = await db.update(consultants).set({ isActive: false }).where(eq(consultants.id, id));
        return result[0].affectedRows > 0;
    },
};
