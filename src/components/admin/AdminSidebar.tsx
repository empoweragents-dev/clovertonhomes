
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
        { label: 'Properties', href: '/admin/properties', icon: 'real_estate_agent' },
        { label: 'Inclusions', href: '/admin/inclusions', icon: 'list' },
        { label: 'Designs', href: '/admin/designs', icon: 'architecture' },
        { label: 'Studio', href: '/admin/studio', icon: 'design_services' },
        { label: 'Enquiries', href: '/admin/enquiries', icon: 'mail' },
        { label: 'Settings', href: '/admin/settings', icon: 'settings' },
    ]

    const handleLogout = () => {
        localStorage.removeItem('admin_session')
        router.push('/admin/login')
    }

    return (
        <aside className="w-64 bg-brand-charcoal text-white min-h-screen fixed left-0 top-0 overflow-y-auto z-50">
            <div className="p-6">
                <h2 className="text-2xl font-bold font-heading">Cloverton<br /><span className="text-brand-teal">Admin</span></h2>
            </div>

            <nav className="px-4 space-y-2 mt-4">
                {navItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === item.href
                            ? 'bg-brand-teal text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/20">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full text-left text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
