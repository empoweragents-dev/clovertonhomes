import type { MetadataRoute } from 'next'
import { query } from '@/lib/db'

const BASE = 'https://clovertonhomes.com.au'

const STATIC_PATHS = [
    '', '/designs', '/properties', '/inclusions', '/interiors', '/facades',
    '/gallery', '/custom-process', '/studio', '/about', '/contact', '/faq',
    '/privacy', '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date()
    const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
        url: `${BASE}${p}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: p === '' ? 1 : 0.7,
    }))

    // Add live property detail pages (best-effort; don't fail the sitemap if DB is down).
    try {
        const props = await query<{ slug: string }>(
            'SELECT slug FROM properties WHERE is_active = 1'
        )
        for (const p of props) {
            entries.push({
                url: `${BASE}/properties/${p.slug}`,
                lastModified: now,
                changeFrequency: 'weekly',
                priority: 0.8,
            })
        }
    } catch {
        // ignore — return the static entries
    }

    return entries
}
