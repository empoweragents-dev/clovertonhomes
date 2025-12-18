import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
// Supabase client for storage operations
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
// Storage bucket names
export const STORAGE_BUCKETS = {
    DESIGNS: "designs",
    PROPERTIES: "properties",
    TESTIMONIALS: "testimonials",
    AVATARS: "avatars",
    GENERAL: "general",
};
// Helper to get public URL for a file
export function getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
// Upload file to Supabase Storage
export async function uploadFile(bucket, path, file, contentType) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
        contentType,
        upsert: true,
    });
    if (error) {
        return { url: "", error: new Error(error.message) };
    }
    const url = getPublicUrl(bucket, data.path);
    return { url, error: null };
}
// Delete file from Supabase Storage
export async function deleteFile(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
}
