'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdminRoute = pathname?.startsWith('/admin')

    if (isAdminRoute) {
        // Admin routes: no header/footer, no padding
        return <>{children}</>
    }

    // Regular routes: include header and footer
    return (
        <>
            <Header />
            <main className="min-h-screen pt-16 sm:pt-20">
                {children}
            </main>
            <Footer />
        </>
    )
}
