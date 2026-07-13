import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/api'],
        },
        sitemap: 'https://clovertonhomes.com.au/sitemap.xml',
        host: 'https://clovertonhomes.com.au',
    }
}
