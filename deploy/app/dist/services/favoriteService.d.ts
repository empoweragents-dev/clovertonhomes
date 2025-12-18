import { Favorite } from "../db/schema";
export declare const favoriteService: {
    getUserFavorites(userId: string): Promise<{
        properties: any[];
        designs: any[];
    }>;
    addFavorite(userId: string, propertyId?: string, designId?: string): Promise<Favorite>;
    removeFavorite(id: string, userId: string): Promise<boolean>;
    isFavorited(userId: string, propertyId?: string, designId?: string): Promise<boolean>;
};
