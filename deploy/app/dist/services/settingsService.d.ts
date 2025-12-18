import { SiteSetting } from "../db/schema";
export declare const settingsService: {
    getAll(): Promise<SiteSetting[]>;
    get(key: string): Promise<string | null>;
    getWithMeta(key: string): Promise<SiteSetting | undefined>;
    set(key: string, value: string, type?: string, description?: string): Promise<SiteSetting>;
    delete(key: string): Promise<boolean>;
    getMultiple(keys: string[]): Promise<Record<string, string>>;
};
