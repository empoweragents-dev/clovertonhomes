// API configuration - use relative URLs for production compatibility
export const API_BASE_URL = '';

// Helper to construct API URLs
export function apiUrl(path: string): string {
    return `/api${path.startsWith('/') ? path : `/${path}`}`;
}
