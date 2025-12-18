import { db } from "../config/database";
import { siteSettings, SiteSetting, NewSiteSetting } from "../db/schema";
import { eq } from "drizzle-orm";

export const settingsService = {
    // Get all settings
    async getAll(): Promise<SiteSetting[]> {
        return db.select().from(siteSettings);
    },

    // Get setting by key
    async get(key: string): Promise<string | null> {
        const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
        return result[0]?.value || null;
    },

    // Get setting with metadata
    async getWithMeta(key: string): Promise<SiteSetting | undefined> {
        const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
        return result[0];
    },

    // Set setting (upsert)
    async set(key: string, value: string, type = "text", description?: string): Promise<SiteSetting> {
        const existing = await this.getWithMeta(key);

        if (existing) {
            const result = await db.update(siteSettings)
                .set({ value, type, description, updatedAt: new Date() })
                .where(eq(siteSettings.key, key))
                .returning();
            return result[0];
        }

        const result = await db.insert(siteSettings)
            .values({ key, value, type, description })
            .returning();
        return result[0];
    },

    // Delete setting
    async delete(key: string): Promise<boolean> {
        const result = await db.delete(siteSettings).where(eq(siteSettings.key, key));
        return result.length > 0;
    },

    // Get multiple settings as object
    async getMultiple(keys: string[]): Promise<Record<string, string>> {
        const results: Record<string, string> = {};
        for (const key of keys) {
            const value = await this.get(key);
            if (value !== null) results[key] = value;
        }
        return results;
    },
};
