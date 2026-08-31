'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Card, StatusPill, formatMoney, TextInput, Select } from '@/components/ui'

/**
 * Tender dashboard (§2). Lists every tender with search and filters, and shows the
 * counters that come from real data rather than placeholders.
 */

interface TenderRow {
    id: string
    documentNumber: string
    currentRevisionNumber: number
    status: string
    clientDisplayName: string | null
    projectAddress: string | null
    suburb: string | null
    totalCents: number
    documentDate: string | null
    expiryDate: string | null
    createdAt: string
    updatedAt: string
    preparedByName: string | null
    latestPdfFileId?: string | null
}

const STATUS_OPTIONS = [
    'draft', 'internal_review', 'ready_to_send', 'sent',
    'accepted', 'declined', 'expired', 'superseded', 'converted',
]

function formatDate(value: string | null) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TenderDashboard() {
    const [rows, setRows] = useState<TenderRow[]>([])
    const [stats, setStats] = useState<Record<string, number> | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search.trim()) params.set('q', search.trim())
            if (status) params.set('status', status)

            const [listRes, statsRes] = await Promise.all([
                fetch(`/api/documents?${params.toString()}`, { credentials: 'include' }),
                fetch('/api/documents/stats', { credentials: 'include' }),
            ])
            const list = await listRes.json()
            const statsJson = await statsRes.json()
            if (list.success) setRows(list.data)
            if (statsJson.success) setStats(statsJson.data)
        } finally {
            setLoading(false)
        }
    }, [search, status])

    // Debounced so typing in the search box doesn't fire a request per keystroke.
    useEffect(() => {
        const timer = setTimeout(load, 250)
        return () => clearTimeout(timer)
    }, [load])

    return (
        <div>
            <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Tenders</h1>
                    <p className="text-gray-500 mt-1">Build a priced inclusions schedule and generate a branded PDF.</p>
                </div>
                <Link href="/admin/documents/new"><Button icon="add">New Tender</Button></Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'All tenders', value: stats?.total ?? 0, icon: 'description' },
                    { label: 'Drafts', value: stats?.draft ?? 0, icon: 'edit_square' },
                    { label: 'Sent', value: stats?.sent ?? 0, icon: 'mark_email_read' },
                    { label: 'Accepted', value: stats?.accepted ?? 0, icon: 'check_circle' },
                ].map(card => (
                    <Card key={card.label} className="p-5">
                        <div className="flex items-center justify-between">
                            <span className="material-symbols-outlined text-gray-300">{card.icon}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">{card.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                    </Card>
                ))}
            </div>

            <Card className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
                    <div className="relative flex-1 min-w-[220px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                        <TextInput
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search number, client, address, lot…"
                            className="pl-10"
                        />
                    </div>
                    <Select value={status} onChange={e => setStatus(e.target.value)} className="w-auto min-w-[160px]">
                        <option value="">All statuses</option>
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>
                        ))}
                    </Select>
                    {(search || status) && (
                        <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus('') }}>Clear</Button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Tender', 'Client', 'Project', 'Value', 'Rev', 'Status', 'Updated', ''].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && (
                                <tr><td colSpan={8} className="px-6 py-16 text-center text-gray-400">Loading…</td></tr>
                            )}

                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16">
                                        <div className="text-center max-w-md mx-auto">
                                            <span className="material-symbols-outlined text-5xl text-gray-200">description</span>
                                            <h3 className="font-heading font-bold text-gray-900 mt-3">
                                                {search || status ? 'No tenders match those filters' : 'No tenders yet'}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {search || status
                                                    ? 'Try clearing the search or status filter.'
                                                    : 'Start by filling in your builder details, then create your first tender from the Cloverton Standard template.'}
                                            </p>
                                            {!search && !status && (
                                                <Link href="/admin/documents/settings" className="inline-block mt-4">
                                                    <Button variant="secondary" icon="palette">Set up builder details</Button>
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm font-semibold text-gray-900">{row.documentNumber}</span>
                                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(row.documentDate)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{row.clientDisplayName || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {row.projectAddress || '—'}
                                        {row.suburb && <p className="text-xs text-gray-400">{row.suburb}</p>}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatMoney(row.totalCents)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">R{row.currentRevisionNumber}</td>
                                    <td className="px-6 py-4"><StatusPill status={row.status} /></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(row.updatedAt)}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {row.latestPdfFileId && (
                                            <a
                                                href={`/api/documents/${row.id}/files/${row.latestPdfFileId}?download=1`}
                                                title="Download the issued PDF"
                                                className="inline-flex items-center text-gray-400 hover:text-brand-teal mr-4 align-middle"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">download</span>
                                            </a>
                                        )}
                                        <Link href={`/admin/documents/${row.id}`} className="text-brand-teal text-sm font-semibold hover:underline">
                                            Open
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
