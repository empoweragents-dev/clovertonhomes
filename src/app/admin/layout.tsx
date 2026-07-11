
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { getSession } from '@/lib/authClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

    useEffect(() => {
        // Skip check for login page
        if (pathname === '/admin/login') {
            setAuthState('authorized')
            return
        }

        // Verify a real better-auth session with an admin role.
        let cancelled = false
        const checkAuth = async () => {
            try {
                const { data } = await getSession()
                const role = (data?.user as { role?: string } | undefined)?.role
                if (!cancelled) {
                    if (data?.user && role === 'admin') {
                        setAuthState('authorized')
                    } else {
                        setAuthState('unauthorized')
                        router.push('/admin/login')
                    }
                }
            } catch {
                if (!cancelled) {
                    setAuthState('unauthorized')
                    router.push('/admin/login')
                }
            }
        }
        checkAuth()
        return () => { cancelled = true }
    }, [pathname, router])

    // Show loading state while checking auth - prevents flash of content
    if (authState === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        )
    }

    // Don't render anything while redirecting
    if (authState === 'unauthorized') {
        return null
    }

    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}

