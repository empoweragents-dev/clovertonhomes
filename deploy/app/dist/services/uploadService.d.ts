import { STORAGE_BUCKETS } from "../config/supabase";
export interface UploadResult {
    url: string;
    path: string;
    bucket: string;
}
export declare const uploadService: {
    uploadImage(file: Buffer, filename: string, bucket: keyof typeof STORAGE_BUCKETS, folder?: string): Promise<UploadResult>;
    deleteImage(bucket: string, path: string): Promise<boolean>;
    getAllowedTypes(): string[];
    validateFile(file: {
        mimetype: string;
        size: number;
    }): {
        valid: boolean;
        error?: string;
    };
};
