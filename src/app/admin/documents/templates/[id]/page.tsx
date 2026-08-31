'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import InclusionEditor, { EditorSection, ItemStatus } from '@/components/admin/documents/InclusionEditor'

/**
 * Template editor. Uses the same InclusionEditor a tender will use, pointed at the
 * template endpoints — one editor, two data sources.
 */

interface TemplateHeader {
    id: string
    name: string
    description: string | null
    storeyType: string | null
    version: number
    isDefault: boolean
    defaultValidityDays: number | null
    defaultGstMode: string | null
}

export default function TemplateEditorPage() {
    const params = useParams<{ id: string }>()
    const templateId = params.id

    const [template, setTemplate] = useState<TemplateHeader | null>(null)
    const [sections, setSections] = useState<EditorSection[]>([])
    const [statuses, setStatuses] = useState<ItemStatus[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        const [treeRes, statusRes] = await Promise.all([
            fetch(`/api/documents/templates/${templateId}`, { credentials: 'include' }),
            fetch('/api/documents/statuses', { credentials: 'include' }),
        ])
        const tree = await treeRes.json()
        const statusJson = await statusRes.json()
        if (tree.success) {
            setTemplate(tree.data.template)
            setSections(tree.data.sections)
        }
        if (statusJson.success) setStatuses(statusJson.data)
        setLoading(false)
    }, [templateId])

    useEffect(() => { load() }, [load])

    if (loading) return <div className="text-gray-400 py-16 text-center">Loading template…</div>
    if (!template) return <div className="text-gray-500 py-16 text-center">Template not found.</div>

    const clauseCount = sections.reduce((n, s) => n + s.items.length, 0)

    return (
        <div className="pb-16">
            <Link href="/admin/documents/templates" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                All templates
            </Link>

            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-3xl font-heading font-bold text-gray-900">{template.name}</h1>
                        {template.isDefault && (
                            <span className="text-[10px] uppercase tracking-wide font-bold bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded">
                                Default
                            </span>
                        )}
                        <span className="text-xs text-gray-400">v{template.version}</span>
                    </div>
                    {template.description && <p className="text-gray-500 mt-1 max-w-2xl">{template.description}</p>}
                </div>
                <Button icon="add" disabled title="Available once the tender wizard lands">
                    New tender from this
                </Button>
            </div>

            <Card className="p-4 mb-6 flex items-start gap-3 bg-blue-50/50 border-blue-100">
                <span className="material-symbols-outlined text-blue-400">info</span>
                <p className="text-sm text-blue-900">
                    This is the master schedule. Every tender takes its own copy at creation, so changes
                    here apply to <strong>future</strong> tenders only — documents already created keep the
                    wording they were built with.
                </p>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Sections', value: sections.length },
                    { label: 'Clauses', value: clauseCount },
                    { label: 'Validity', value: `${template.defaultValidityDays ?? 30} days` },
                    { label: 'GST', value: template.defaultGstMode === 'exclusive' ? 'Excl.' : 'Incl.' },
                ].map(stat => (
                    <Card key={stat.label} className="p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </Card>
                ))}
            </div>

            <InclusionEditor
                sections={sections}
                statuses={statuses}
                onChanged={load}
                endpoints={{
                    updateItem: id => `/api/documents/templates/items/${id}`,
                    deleteItem: id => `/api/documents/templates/items/${id}`,
                    addItem: sectionId => `/api/documents/templates/${templateId}/sections/${sectionId}/items`,
                }}
            />
        </div>
    )
}
