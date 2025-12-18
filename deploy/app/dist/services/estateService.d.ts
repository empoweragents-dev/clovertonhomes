import { Estate, NewEstate } from "../db/schema";
export declare const estateService: {
    getAll(): Promise<Estate[]>;
    getByRegion(regionId: string): Promise<Estate[]>;
    getById(id: string): Promise<Estate | undefined>;
    getBySlug(slug: string): Promise<Estate | undefined>;
    create(data: Omit<NewEstate, "id" | "slug" | "createdAt">): Promise<Estate>;
    update(id: string, data: Partial<NewEstate>): Promise<Estate | undefined>;
    delete(id: string): Promise<boolean>;
};
