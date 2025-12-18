import { uploadFile, deleteFile, STORAGE_BUCKETS, getPublicUrl } from "../config/supabase";
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
    url: string;
    path: string;
    bucket: string;
}

export const uploadService = {
    // Upload image to appropriate bucket
    async uploadImage(
        file: Buffer,
        filename: string,
        bucket: keyof typeof STORAGE_BUCKETS,
        folder?: string
    ): Promise<UploadResult> {
        const bucketName = STORAGE_BUCKETS[bucket];
        const ext = filename.split(".").pop() || "jpg";
        const uniqueName = `${uuidv4()}.${ext}`;
        const path = folder ? `${folder}/${uniqueName}` : uniqueName;

        const { url, error } = await uploadFile(bucketName, path, file, `image/${ext}`);

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        return { url, path, bucket: bucketName };
    },

    // Delete image
    async deleteImage(bucket: string, path: string): Promise<boolean> {
        return deleteFile(bucket, path);
    },

    // Get allowed file types
    getAllowedTypes(): string[] {
        return ["image/jpeg", "image/png", "image/webp", "image/gif"];
    },

    // Validate file
    validateFile(file: { mimetype: string; size: number }): { valid: boolean; error?: string } {
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!this.getAllowedTypes().includes(file.mimetype)) {
            return { valid: false, error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" };
        }

        if (file.size > maxSize) {
            return { valid: false, error: "File too large. Maximum size: 5MB" };
        }

        return { valid: true };
    },
};
