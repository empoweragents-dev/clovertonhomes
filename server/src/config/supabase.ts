import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Supabase Storage client.
 *
 * Created LAZILY on first use, never at import time. `createClient` throws
 * "Invalid supabaseUrl" on a malformed value, and the deploy script seeds .env from
 * .env.example, whose placeholder is `https://[YOUR-PROJECT-REF].supabase.co` — a
 * malformed URL. Constructing at module load therefore crashed the whole server on
 * startup before it could listen, taking the site down rather than degrading the one
 * feature that needs storage.
 *
 * Note: the project this pointed at no longer exists (its host does not resolve), so
 * uploads are currently non-functional regardless. That is a separate issue; the
 * point here is that it must not prevent the server from booting.
 */

let client: SupabaseClient | null = null;
let initialised = false;

function isConfigured(): boolean {
    const url = env.SUPABASE_URL ?? "";
    const key = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (!url || !key) return false;
    // Reject the .env.example placeholder and anything else not a valid URL.
    try {
        const parsed = new URL(url);
        return parsed.protocol.startsWith("http") && !url.includes("[");
    } catch {
        return false;
    }
}

/** Returns the client, or null when storage is not configured. Never throws. */
export function getSupabase(): SupabaseClient | null {
    if (initialised) return client;
    initialised = true;

    if (!isConfigured()) {
        console.warn("Supabase storage is not configured — file uploads are disabled.");
        client = null;
        return null;
    }

    try {
        client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    } catch (err) {
        console.error("Supabase client could not be created:", (err as Error).message);
        client = null;
    }
    return client;
}

// Storage bucket names
export const STORAGE_BUCKETS = {
    DESIGNS: "designs",
    PROPERTIES: "properties",
    TESTIMONIALS: "testimonials",
    AVATARS: "avatars",
    GENERAL: "general",
} as const;

const NOT_CONFIGURED = "File storage is not configured on this server.";

// Helper to get public URL for a file
export function getPublicUrl(bucket: string, path: string): string {
    const supabase = getSupabase();
    if (!supabase) return "";
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

// Upload file to Supabase Storage
export async function uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string
): Promise<{ url: string; error: Error | null }> {
    const supabase = getSupabase();
    if (!supabase) return { url: "", error: new Error(NOT_CONFIGURED) };

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
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
}
