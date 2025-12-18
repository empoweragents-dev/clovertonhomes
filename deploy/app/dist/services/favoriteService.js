import { db } from "../config/database";
import { favorites, properties, homeDesigns } from "../db/schema";
import { eq, and } from "drizzle-orm";
export const favoriteService = {
    // Get user's favorites
    async getUserFavorites(userId) {
        const userFavorites = await db.select().from(favorites).where(eq(favorites.userId, userId));
        const propertyIds = userFavorites.filter(f => f.propertyId).map(f => f.propertyId);
        const designIds = userFavorites.filter(f => f.designId).map(f => f.designId);
        let favoriteProperties = [];
        let favoriteDesigns = [];
        if (propertyIds.length > 0) {
            for (const id of propertyIds) {
                const prop = await db.select().from(properties).where(eq(properties.id, id));
                if (prop[0])
                    favoriteProperties.push(prop[0]);
            }
        }
        if (designIds.length > 0) {
            for (const id of designIds) {
                const design = await db.select().from(homeDesigns).where(eq(homeDesigns.id, id));
                if (design[0])
                    favoriteDesigns.push(design[0]);
            }
        }
        return { properties: favoriteProperties, designs: favoriteDesigns };
    },
    // Add favorite
    async addFavorite(userId, propertyId, designId) {
        const result = await db.insert(favorites)
            .values({ userId, propertyId, designId })
            .returning();
        return result[0];
    },
    // Remove favorite
    async removeFavorite(id, userId) {
        const result = await db.delete(favorites)
            .where(and(eq(favorites.id, id), eq(favorites.userId, userId)));
        return result.length > 0;
    },
    // Check if item is favorited
    async isFavorited(userId, propertyId, designId) {
        const conditions = [eq(favorites.userId, userId)];
        if (propertyId)
            conditions.push(eq(favorites.propertyId, propertyId));
        if (designId)
            conditions.push(eq(favorites.designId, designId));
        const result = await db.select({ id: favorites.id })
            .from(favorites)
            .where(and(...conditions));
        return result.length > 0;
    },
};
