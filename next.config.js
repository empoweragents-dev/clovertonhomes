/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'clovertonhomes.com' },
            { protocol: 'https', hostname: 'www.clovertonhomes.com' },
            { protocol: 'http', hostname: 'localhost' },
        ],
    },
    turbopack: {
        root: __dirname,
    },
};

module.exports = nextConfig
