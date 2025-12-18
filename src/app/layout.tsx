import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Cloverton Homes - Premium Residential Builder',
    description: 'Build with confidence.Certified and trusted residential builder.',
}

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="light" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="bg-background-light dark:bg-background-dark font-display antialiased text-brand-charcoal overflow-x-hidden">
                <Header />
                <main className="min-h-screen pt-16 sm:pt-20">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    )
}
