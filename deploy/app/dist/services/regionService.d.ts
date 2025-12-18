import { Region, NewRegion } from "../db/schema";
export declare const regionService: {
    getAll(): Promise<Region[]>;
    getById(id: string): Promise<Region | undefined>;
    getBySlug(slug: string): Promise<Region | undefined>;
    create(data: Omit<NewRegion, "id" | "slug" | "createdAt">): Promise<Region>;
    update(id: string, data: Partial<NewRegion>): Promise<Region | undefined>;
    delete(id: string): Promise<boolean>;
};
