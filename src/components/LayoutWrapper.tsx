'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Before mounting, render a consistent structure to avoid hydration mismatch
    // Use the pathname to determine what to render, defaulting to non-admin for SSR
    const isAdminRoute = pathname?.startsWith('/admin')

    // On server and initial render, render based on pathname
    // This ensures consistent output between server and client
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

