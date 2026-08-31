'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ToastProvider } from '@/components/ui'

/**
 * Shell for the Documents module: sub-navigation plus the toast provider, which is
 * scoped here so the rest of the admin keeps its existing alert()-based behaviour.
 */

const TABS = [
    { label: 'Tenders', href: '/admin/documents', icon: 'description' },
    { label: 'Templates', href: '/admin/documents/templates', icon: 'file_copy' },
    { label: 'Terms & Conditions', href: '/admin/documents/terms', icon: 'gavel' },
    { label: 'Branding', href: '/admin/documents/settings', icon: 'palette' },
]

// Phase 2 — shown so the roadmap is visible, but not linkable.
const COMING_SOON = ['Build Contracts']

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const isActive = (href: string) =>
        href === '/admin/documents' ? pathname === href : pathname.startsWith(href)

    return (
        <ToastProvider>
            <div>
                <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-gray-200 pb-4">
                    {TABS.map(tab => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive(tab.href)
                                ? 'bg-brand-teal text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </Link>
                    ))}
                    {COMING_SOON.map(label => (
                        <span
                            key={label}
                            title="Planned for phase 2"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[18px]">business_center</span>
                            {label}
                            <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>
                        </span>
                    ))}
                </div>
                {children}
            </div>
        </ToastProvider>
    )
}
