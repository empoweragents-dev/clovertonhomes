import { db } from "../config/database";
import { enquiries, Enquiry, NewEnquiry, properties, homeDesigns, consultants } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface EnquiryFilters {
    type?: string;
    status?: string;
    assignedTo?: string;
    limit?: number;
    offset?: number;
}

export const enquiryService = {
    // Get all enquiries with filters (admin)
    async getAll(filters: EnquiryFilters = {}): Promise<{ enquiries: Enquiry[]; total: number }> {
        const conditions: any[] = [];

        if (filters.type) {
            conditions.push(eq(enquiries.type, filters.type as any));
        }
        if (filters.status) {
            conditions.push(eq(enquiries.status, filters.status as any));
        }
        if (filters.assignedTo) {
            conditions.push(eq(enquiries.assignedTo, filters.assignedTo));
        }

        const limit = filters.limit || 20;
        const offset = filters.offset || 0;

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const result = await db.select()
            .from(enquiries)
            .where(whereClause)
            .orderBy(desc(enquiries.createdAt))
            .limit(limit)
            .offset(offset);

        const allResults = await db.select({ id: enquiries.id })
            .from(enquiries)
            .where(whereClause);

        return { enquiries: result, total: allResults.length };
    },

    // Get enquiry by ID with related entities
    async getById(id: string): Promise<{
        enquiry: Enquiry;
        property?: any;
        design?: any;
        consultant?: any;
    } | null> {
        const result = await db.select().from(enquiries).where(eq(enquiries.id, id));
        if (!result[0]) return null;

        const enquiry = result[0];
        let property, design, consultant;

        if (enquiry.propertyId) {
            const propResult = await db.select().from(properties).where(eq(properties.id, enquiry.propertyId));
            property = propResult[0];
        }
        if (enquiry.designId) {
            const designResult = await db.select().from(homeDesigns).where(eq(homeDesigns.id, enquiry.designId));
            design = designResult[0];
        }
        if (enquiry.consultantId) {
            const consultantResult = await db.select().from(consultants).where(eq(consultants.id, enquiry.consultantId));
            consultant = consultantResult[0];
        }

        return { enquiry, property, design, consultant };
    },

    // Create enquiry (public)
    async create(data: Omit<NewEnquiry, "id" | "createdAt" | "updatedAt">): Promise<Enquiry> {
        const result = await db.insert(enquiries).values({ ...data, status: "new" }).returning();
        return result[0];
    },

    // Update enquiry status (admin)
    async updateStatus(id: string, status: string, notes?: string): Promise<Enquiry | undefined> {
        const result = await db.update(enquiries)
            .set({ status: status as any, notes, updatedAt: new Date() })
            .where(eq(enquiries.id, id))
            .returning();
        return result[0];
    },

    // Assign enquiry to user
    async assign(id: string, userId: string): Promise<Enquiry | undefined> {
        const result = await db.update(enquiries)
            .set({ assignedTo: userId, updatedAt: new Date() })
            .where(eq(enquiries.id, id))
            .returning();
        return result[0];
    },

    // Delete enquiry
    async delete(id: string): Promise<boolean> {
        const result = await db.delete(enquiries).where(eq(enquiries.id, id));
        return result.length > 0;
    },

    // Get new enquiries count (for dashboard)
    async getNewCount(): Promise<number> {
        const result = await db.select({ id: enquiries.id })
            .from(enquiries)
            .where(eq(enquiries.status, "new"));
        return result.length;
    },
};
