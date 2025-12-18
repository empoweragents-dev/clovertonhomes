'use client'

import './globals.css'
import { usePathname } from 'next/navigation'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isAdminRoute = pathname?.startsWith('/admin')

    return (
        <html lang="en" className="light" suppressHydrationWarning>
            <head>
                <title>Cloverton Homes - Premium Residential Builder</title>
                <meta name="description" content="Build with confidence. Certified and trusted residential builder." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-background-light dark:bg-background-dark font-display antialiased text-brand-charcoal overflow-x-hidden">
                {!isAdminRoute && <Header />}
                <main className={!isAdminRoute ? "min-h-screen pt-16 sm:pt-20" : ""}>
                    {children}
                </main>
                {!isAdminRoute && <Footer />}
            </body>
        </html>
    )
}

