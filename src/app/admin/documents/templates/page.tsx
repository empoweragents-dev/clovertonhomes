'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'

/**
 * Master template list (§7). A tender copies one of these at creation; editing a
 * template never changes tenders that already exist.
 */

interface TemplateRow {
    id: string
    name: string
    slug: string
    description: string | null
    storeyType: string | null
    version: number
    isDefault: boolean
    isActive: boolean
    sectionCount: number
    itemCount: number
    updatedAt: string
}

export default function TemplatesPage() {
    const [rows, setRows] = useState<TemplateRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/documents/templates', { credentials: 'include' })
            .then(r => r.json())
            .then(json => { if (json.success) setRows(json.data) })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div>
            <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Tender Templates</h1>
                    <p className="text-gray-500 mt-1 max-w-2xl">
                        The master inclusions schedules. Each new tender takes its own copy, so editing a
                        template here never changes a tender that already exists.
                    </p>
                </div>
            </div>

            {loading && <div className="text-gray-400 py-16 text-center">Loading templates…</div>}

            {!loading && rows.length === 0 && (
                <Card className="p-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-200">file_copy</span>
                    <h3 className="font-heading font-bold text-gray-900 mt-3">No templates yet</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Run <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">npm run db:seed:documents -- --create</code> to
                        load the Cloverton Standard schedule.
                    </p>
                </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                {rows.map(t => (
                    <Card key={t.id} className="p-6 flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-heading font-bold text-lg text-gray-900">{t.name}</h3>
                                    {t.isDefault && (
                                        <span className="text-[10px] uppercase tracking-wide font-bold bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded">
                                            Default
                                        </span>
                                    )}
                                </div>
                                {t.storeyType && <p className="text-xs text-gray-400 mt-0.5">{t.storeyType}</p>}
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">v{t.version}</span>
                        </div>

                        {t.description && <p className="text-sm text-gray-500 mt-3 flex-1">{t.description}</p>}

                        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100 text-sm">
                            <span className="text-gray-500">
                                <strong className="text-gray-900">{t.sectionCount}</strong> sections
                            </span>
                            <span className="text-gray-500">
                                <strong className="text-gray-900">{t.itemCount}</strong> clauses
                            </span>
                            <Link href={`/admin/documents/templates/${t.id}`} className="ml-auto">
                                <Button variant="secondary" size="sm" icon="edit">Open</Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
