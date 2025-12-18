export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const STORAGE_BUCKETS: {
    readonly DESIGNS: "designs";
    readonly PROPERTIES: "properties";
    readonly TESTIMONIALS: "testimonials";
    readonly AVATARS: "avatars";
    readonly GENERAL: "general";
};
export declare function getPublicUrl(bucket: string, path: string): string;
export declare function uploadFile(bucket: string, path: string, file: Buffer, contentType: string): Promise<{
    url: string;
    error: Error | null;
}>;
export declare function deleteFile(bucket: string, path: string): Promise<boolean>;
