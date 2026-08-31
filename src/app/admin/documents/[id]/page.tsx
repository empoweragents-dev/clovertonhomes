'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    Button, Card, CardHeader, Field, TextInput, TextArea, Select, Modal,
    StatusPill, formatMoney, useToast,
} from '@/components/ui'
import InclusionEditor, { EditorSection, ItemStatus } from '@/components/admin/documents/InclusionEditor'

/**
 * Tender builder (§42): tabbed editing with a sticky summary and action bar.
 *
 * Tabs are local state rather than routes so unsaved edits and validation state
 * survive switching between them.
 */

const TABS = ['Client', 'Project', 'Pricing', 'Inclusions', 'Preview', 'Revisions'] as const
type Tab = typeof TABS[number]

const TREATMENTS = [
    ['include_in_total', 'Included in total'],
    ['display_and_include', 'Displayed and included'],
    ['display_separately', 'Displayed separately'],
    ['optional', 'Optional'],
    ['allowance', 'Allowance'],
    ['provisional_sum', 'Provisional sum'],
    ['excluded', 'Excluded'],
    ['client_supplied', 'Client supplied'],
    ['owner_responsibility', 'Owner responsibility'],
] as const

interface PricingLine {
    id?: string
    category: string
    label: string
    amountCents: number
    treatment: string
}

export default function TenderBuilderPage() {
    const params = useParams<{ id: string }>()
    const id = params.id
    const { push } = useToast()

    const [tab, setTab] = useState<Tab>('Client')
    const [tree, setTree] = useState<any>(null)
    const [statuses, setStatuses] = useState<ItemStatus[]>([])
    const [validation, setValidation] = useState<any>(null)
    const [lines, setLines] = useState<PricingLine[]>([])
    const [saving, setSaving] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewing, setPreviewing] = useState(false)
    const [diff, setDiff] = useState<any>(null)
    const [dupOpen, setDupOpen] = useState(false)
    const [dup, setDup] = useState({ clientDisplayName: '', projectAddress: '', suburb: '', postcode: '', copyPricing: true, copyInclusions: true })

    const load = useCallback(async () => {
        const [fullRes, statusRes, valRes] = await Promise.all([
            fetch(`/api/documents/${id}/full`, { credentials: 'include' }),
            fetch('/api/documents/statuses', { credentials: 'include' }),
            fetch(`/api/documents/${id}/validate`, { credentials: 'include' }),
        ])
        const full = await fullRes.json()
        const st = await statusRes.json()
        const val = await valRes.json()
        if (full.success) {
            setTree(full.data)
            setLines(full.data.pricingLines.map((l: any) => ({
                id: l.id, category: l.category, label: l.label,
                amountCents: l.amountCents, treatment: l.treatment,
            })))
        }
        if (st.success) setStatuses(st.data)
        if (val.success) setValidation(val.data)
    }, [id])

    useEffect(() => { load() }, [load])

    if (!tree) return <div className="text-gray-400 py-16 text-center">Loading tender…</div>

    const doc = tree.document
    const locked = !['draft', 'internal_review'].includes(doc.status)

    const saveField = async (patch: Record<string, unknown>) => {
        setSaving(true)
        try {
            const res = await fetch(`/api/documents/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(patch),
            })
            const json = await res.json()
            if (json.success) { push('Saved'); await load() }
            else push(json.message || 'Could not save', 'error')
        } finally { setSaving(false) }
    }

    const savePricing = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/documents/${id}/pricing`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ lines }),
            })
            const json = await res.json()
            if (json.success) { push('Pricing saved'); await load() }
            else push(json.message || 'Could not save pricing', 'error')
        } finally { setSaving(false) }
    }

    const openPreview = async () => {
        setPreviewing(true)
        try {
            const res = await fetch(`/api/documents/${id}/preview`, { method: 'POST', credentials: 'include' })
            if (!res.ok) { push('Could not generate the preview', 'error'); return }
            const blob = await res.blob()
            if (previewUrl) URL.revokeObjectURL(previewUrl)
            setPreviewUrl(URL.createObjectURL(blob))
            setTab('Preview')
        } finally { setPreviewing(false) }
    }

    const issue = async () => {
        if (!confirm('Generate the final PDF and lock this revision?\n\nAfter issuing, changes require a new revision.')) return
        setSaving(true)
        try {
            const res = await fetch(`/api/documents/${id}/issue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({}),
            })
            const json = await res.json()
            if (json.success) { push('Tender issued'); await load(); setTab('Revisions') }
            else push(json.message || 'Could not issue', 'error')
        } finally { setSaving(false) }
    }

    const newRevision = async () => {
        const note = prompt('What changed in this revision?') ?? undefined
        const res = await fetch(`/api/documents/${id}/revisions`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ note }),
        })
        const json = await res.json()
        if (json.success) { push(`Revision R${json.data.currentRevisionNumber} opened`); await load() }
        else push(json.message || 'Could not create revision', 'error')
    }

    const compare = async (from: number, to: number) => {
        const res = await fetch(`/api/documents/${id}/compare?from=${from}&to=${to}`, { credentials: 'include' })
        const json = await res.json()
        if (json.success) setDiff(json.data)
        else push(json.message || 'Could not compare revisions', 'error')
    }

    const duplicate = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/documents/${id}/duplicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...dup,
                    parties: [{ role: 'primary', fullName: dup.clientDisplayName }],
                }),
            })
            const json = await res.json()
            if (json.success) {
                push(`Created ${json.data.documentNumber}`)
                window.location.href = `/admin/documents/${json.data.id}`
            } else push(json.message || 'Could not duplicate', 'error')
        } finally { setSaving(false) }
    }

    /** The generated PDF for a revision, if one has been issued. */
    const pdfFor = (revisionId: string) =>
        (tree.files ?? []).find((f: any) => f.revisionId === revisionId && f.kind === 'final_pdf' && f.isCurrent)

    /** Most recent issued PDF across all revisions — what the sticky bar offers. */
    const latestPdf = () => {
        const issued = (tree.files ?? []).filter((f: any) => f.kind === 'final_pdf' && f.isCurrent)
        return issued[issued.length - 1]
    }

    const updateLine = (i: number, patch: Partial<PricingLine>) =>
        setLines(ls => ls.map((l, x) => (x === i ? { ...l, ...patch } : l)))

    return (
        <div className="pb-28">
            <Link href="/admin/documents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> All tenders
            </Link>

            <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-heading font-bold text-gray-900 font-mono">{doc.documentNumber}</h1>
                        <StatusPill status={doc.status} />
                        <span className="text-sm text-gray-400">Revision R{doc.currentRevisionNumber}</span>
                        {saving && <span className="text-xs text-gray-400">Saving…</span>}
                    </div>
                    <p className="text-gray-500 mt-1">{doc.clientDisplayName} · {doc.projectAddress}</p>
                </div>
                <div className="flex items-start gap-3">
                    <Button variant="secondary" size="sm" icon="content_copy" onClick={() => setDupOpen(true)}>
                        Duplicate
                    </Button>
                <Card className="p-4 min-w-[200px]">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Tender total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatMoney(doc.totalCents)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {doc.gstMode === 'inclusive' ? 'incl.' : 'plus'} GST {formatMoney(doc.gstCents)}
                    </p>
                </Card>
                </div>
            </div>

            {locked && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
                    <span className="material-symbols-outlined text-amber-500">lock</span>
                    <div className="text-sm flex-1">
                        <p className="font-bold text-amber-900">Revision R{doc.currentRevisionNumber} has been issued</p>
                        <p className="text-amber-800 mt-0.5">This tender is locked. Create a revision to make further changes.</p>
                    </div>
                    <Button size="sm" variant="secondary" icon="history" onClick={newRevision}>Create revision</Button>
                </div>
            )}

            {validation && validation.errors.length > 0 && (
                <Card className="p-4 mb-6 border-red-100 bg-red-50/50">
                    <p className="font-bold text-red-900 text-sm mb-2">
                        Cannot be issued yet — {validation.errors.length} item{validation.errors.length > 1 ? 's' : ''} to fix
                    </p>
                    <ul className="space-y-1">
                        {validation.errors.map((e: any, i: number) => (
                            <li key={i} className="text-sm text-red-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">error</span>
                                {e.message}
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === t ? 'border-brand-teal text-brand-teal' : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        {t}
                        {t === 'Inclusions' && <span className="ml-1.5 text-xs text-gray-400">
                            {tree.sections.reduce((n: number, s: any) => n + s.items.length, 0)}
                        </span>}
                    </button>
                ))}
            </div>

            {tab === 'Client' && (
                <Card className="max-w-3xl">
                    <CardHeader title="Client details" />
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                        <Field label="Client name (as printed)" className="md:col-span-2">
                            <TextInput
                                defaultValue={doc.clientDisplayName ?? ''}
                                disabled={locked}
                                onBlur={e => e.target.value !== doc.clientDisplayName && saveField({ clientDisplayName: e.target.value })}
                            />
                        </Field>
                        {tree.parties.map((p: any) => (
                            <div key={p.id} className="md:col-span-2 p-4 rounded-lg bg-gray-50 text-sm">
                                <p className="font-semibold text-gray-900 capitalize">{p.role}: {p.fullName}</p>
                                <p className="text-gray-500">{[p.email, p.phone, p.currentAddress].filter(Boolean).join(' · ') || 'No contact details'}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {tab === 'Project' && (
                <Card className="max-w-3xl">
                    <CardHeader title="Project details" />
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                        {([
                            ['projectAddress', 'Construction address', 'md:col-span-2'],
                            ['lotNumber', 'Lot number', ''], ['suburb', 'Suburb', ''],
                            ['state', 'State', ''], ['postcode', 'Postcode', ''],
                            ['constructionType', 'Construction type', ''], ['designNameSnapshot', 'House design', ''],
                            ['facadeSnapshot', 'Facade', ''], ['squares', 'Approx. squares', ''],
                            ['council', 'Council', ''], ['developmentRef', 'Development reference', ''],
                        ] as const).map(([key, label, cls]) => (
                            <Field key={key} label={label} className={cls}>
                                <TextInput
                                    defaultValue={doc[key] ?? ''}
                                    disabled={locked}
                                    onBlur={e => e.target.value !== (doc[key] ?? '') && saveField({ [key]: e.target.value })}
                                />
                            </Field>
                        ))}
                        <Field label="Tender date">
                            <TextInput type="date" defaultValue={(doc.documentDate ?? '').slice(0, 10)} disabled={locked}
                                onBlur={e => saveField({ documentDate: e.target.value })} />
                        </Field>
                        <Field label="Validity (days)" hint={`Expires ${(doc.expiryDate ?? '').slice(0, 10) || '—'}`}>
                            <TextInput type="number" defaultValue={doc.validityDays ?? 30} disabled={locked}
                                onBlur={e => saveField({ validityDays: Number(e.target.value) })} />
                        </Field>
                        <Field label="Internal notes" hint="Never printed in the client PDF" className="md:col-span-2">
                            <TextArea rows={2} defaultValue={doc.internalNotes ?? ''} disabled={locked}
                                onBlur={e => saveField({ internalNotes: e.target.value })} />
                        </Field>
                    </div>
                </Card>
            )}

            {tab === 'Pricing' && (
                <Card>
                    <CardHeader
                        title="Pricing"
                        description="Only certain treatments roll into the tender total. Totals are always recalculated on the server."
                        action={<Select
                            value={doc.gstMode} disabled={locked}
                            onChange={e => saveField({ gstMode: e.target.value })}
                            className="w-auto"
                        >
                            <option value="inclusive">Prices include GST</option>
                            <option value="exclusive">Prices exclude GST</option>
                        </Select>}
                    />
                    <div className="p-6">
                        <table className="w-full mb-4">
                            <thead>
                                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="pb-2">Description</th>
                                    <th className="pb-2 w-56">Treatment</th>
                                    <th className="pb-2 w-40 text-right">Amount</th>
                                    <th className="w-10" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lines.map((line, i) => (
                                    <tr key={i}>
                                        <td className="py-2 pr-3">
                                            <TextInput value={line.label} disabled={locked}
                                                onChange={e => updateLine(i, { label: e.target.value })} />
                                        </td>
                                        <td className="py-2 pr-3">
                                            <Select value={line.treatment} disabled={locked}
                                                onChange={e => updateLine(i, { treatment: e.target.value })}>
                                                {TREATMENTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                            </Select>
                                        </td>
                                        <td className="py-2">
                                            <TextInput
                                                type="number" step="0.01" disabled={locked}
                                                className="text-right"
                                                value={(line.amountCents / 100).toString()}
                                                onChange={e => updateLine(i, { amountCents: Math.round(Number(e.target.value) * 100) })}
                                            />
                                        </td>
                                        <td className="text-center">
                                            {!locked && (
                                                <button onClick={() => setLines(ls => ls.filter((_, x) => x !== i))}
                                                    className="text-gray-300 hover:text-red-600">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!locked && (
                            <Button variant="ghost" size="sm" icon="add"
                                onClick={() => setLines(ls => [...ls, { category: 'other', label: '', amountCents: 0, treatment: 'include_in_total' }])}>
                                Add line
                            </Button>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                            <div className="w-72 space-y-1 text-sm">
                                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatMoney(doc.subtotalCents)}</span></div>
                                <div className="flex justify-between text-gray-500"><span>GST</span><span>{formatMoney(doc.gstCents)}</span></div>
                                <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                                    <span>Total</span><span>{formatMoney(doc.totalCents)}</span>
                                </div>
                                {doc.optionalTotalCents > 0 && (
                                    <div className="flex justify-between text-gray-400 text-xs pt-1">
                                        <span>Optional (not in total)</span><span>{formatMoney(doc.optionalTotalCents)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!locked && (
                            <div className="mt-4 flex justify-end">
                                <Button onClick={savePricing} loading={saving} icon="save">Save pricing</Button>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {tab === 'Inclusions' && (
                <InclusionEditor
                    sections={tree.sections as EditorSection[]}
                    statuses={statuses}
                    readOnly={locked}
                    onChanged={load}
                    endpoints={{
                        updateItem: itemId => `/api/documents/${id}/items/${itemId}`,
                        deleteItem: itemId => `/api/documents/${id}/items/${itemId}`,
                        addItem: sectionId => `/api/documents/${id}/sections/${sectionId}/items`,
                    }}
                />
            )}

            {tab === 'Preview' && (
                <Card className="overflow-hidden">
                    <CardHeader
                        title="PDF preview"
                        description="This is the real PDF, generated by the same code that produces the final document."
                        action={<Button size="sm" variant="secondary" icon="refresh" onClick={openPreview} loading={previewing}>Refresh</Button>}
                    />
                    {previewUrl ? (
                        <iframe src={previewUrl} className="w-full h-[80vh] border-0" title="Tender preview" />
                    ) : (
                        <div className="p-16 text-center">
                            <span className="material-symbols-outlined text-5xl text-gray-200">picture_as_pdf</span>
                            <p className="text-gray-500 mt-2">Generate a preview to see the tender exactly as the client will.</p>
                            <Button className="mt-4" onClick={openPreview} loading={previewing} icon="visibility">Generate preview</Button>
                        </div>
                    )}
                </Card>
            )}

            {tab === 'Revisions' && (
                <Card>
                    <CardHeader title="Revisions" description="Issued revisions are frozen — their PDF and content can never change." />
                    <div className="divide-y divide-gray-100">
                        {tree.revisions.map((r: any) => (
                            <div key={r.id} className="px-6 py-4 flex items-center gap-4">
                                <span className="font-mono text-sm font-semibold text-gray-900 w-16">R{r.revisionNumber}</span>
                                <StatusPill status={r.status === 'issued' ? 'accepted' : r.status === 'superseded' ? 'superseded' : 'draft'} label={r.status} />
                                <span className="text-sm text-gray-500 flex-1">
                                    {r.issuedAt ? new Date(r.issuedAt).toLocaleString('en-AU') : 'Not issued'}
                                    {r.changeSummary && ` · ${r.changeSummary}`}
                                </span>
                                {r.totalCents != null && <span className="text-sm font-semibold">{formatMoney(r.totalCents)}</span>}
                                {r.snapshotHash && (
                                    <span className="text-[11px] font-mono text-gray-300" title="Snapshot checksum">
                                        {r.snapshotHash.slice(0, 8)}
                                    </span>
                                )}
                                {pdfFor(r.id) && (
                                    <>
                                        <a href={`/api/documents/${id}/files/${pdfFor(r.id).id}`} target="_blank" rel="noreferrer">
                                            <Button size="sm" variant="ghost" icon="visibility">View</Button>
                                        </a>
                                        <a href={`/api/documents/${id}/files/${pdfFor(r.id).id}?download=1`}>
                                            <Button size="sm" variant="secondary" icon="download">Download PDF</Button>
                                        </a>
                                    </>
                                )}
                                {r.revisionNumber > 0 && (
                                    <Button size="sm" variant="ghost" icon="difference"
                                        onClick={() => compare(r.revisionNumber - 1, r.revisionNumber)}>
                                        Compare with R{r.revisionNumber - 1}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Modal
                open={!!diff}
                onClose={() => setDiff(null)}
                title={diff ? `${diff.from.label} \u2192 ${diff.to.label}` : ''}
                description="Compared against the frozen snapshot of each revision."
                size="xl"
            >
                {diff && (
                    <div>
                        <div className="flex items-center gap-6 mb-5 pb-4 border-b border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatMoney(diff.from.totalCents)}
                                    <span className="text-gray-300 mx-2">&rarr;</span>
                                    {formatMoney(diff.to.totalCents)}
                                </p>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-500">
                                {Object.entries(diff.summary as Record<string, number>)
                                    .filter(([, n]) => n > 0)
                                    .map(([k, n]) => <span key={k}><strong className="text-gray-900">{n}</strong> {k}</span>)}
                            </div>
                        </div>

                        {diff.changes.length === 0 ? (
                            <p className="text-gray-500 text-sm py-8 text-center">No differences between these revisions.</p>
                        ) : (
                            <div className="space-y-3">
                                {diff.changes.map((c: any, i: number) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <span className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-bold uppercase h-fit ${c.kind === 'added' ? 'bg-green-100 text-green-800'
                                            : c.kind === 'removed' ? 'bg-red-100 text-red-700'
                                                : c.kind === 'price' ? 'bg-blue-100 text-blue-800'
                                                    : c.kind === 'status' ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-gray-100 text-gray-600'}`}>
                                            {c.kind}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900">
                                                {c.clause && <span className="font-mono text-xs text-gray-400 mr-1.5">{c.clause}</span>}
                                                {c.label}
                                                {c.section && <span className="text-gray-400 font-normal text-xs ml-2">{c.section}</span>}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5 break-words">
                                                <span className="line-through opacity-70">{c.before ?? '\u2014'}</span>
                                                <span className="mx-2 text-gray-300">&rarr;</span>
                                                <span className="text-gray-800">{c.after ?? '\u2014'}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                open={dupOpen}
                onClose={() => setDupOpen(false)}
                title="Duplicate tender"
                description="Creates an independent copy. Changing it will never affect this tender."
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDupOpen(false)}>Cancel</Button>
                        <Button onClick={duplicate} loading={saving} icon="content_copy"
                            disabled={!dup.clientDisplayName.trim() || !dup.projectAddress.trim()}>
                            Create duplicate
                        </Button>
                    </>
                }
            >
                <div className="space-y-5">
                    <Field label="New client name" required>
                        <TextInput value={dup.clientDisplayName}
                            onChange={e => setDup(d => ({ ...d, clientDisplayName: e.target.value }))} />
                    </Field>
                    <Field label="New project address" required>
                        <TextInput value={dup.projectAddress}
                            onChange={e => setDup(d => ({ ...d, projectAddress: e.target.value }))} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Suburb"><TextInput value={dup.suburb} onChange={e => setDup(d => ({ ...d, suburb: e.target.value }))} /></Field>
                        <Field label="Postcode"><TextInput value={dup.postcode} onChange={e => setDup(d => ({ ...d, postcode: e.target.value }))} /></Field>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="rounded border-gray-300" checked={dup.copyInclusions}
                                onChange={e => setDup(d => ({ ...d, copyInclusions: e.target.checked }))} />
                            Copy inclusions ({tree.sections.reduce((n: number, s: any) => n + s.items.length, 0)} clauses)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="rounded border-gray-300" checked={dup.copyPricing}
                                onChange={e => setDup(d => ({ ...d, copyPricing: e.target.checked }))} />
                            Copy pricing ({formatMoney(doc.totalCents)})
                        </label>
                    </div>
                </div>
            </Modal>

            <div className="fixed bottom-0 left-64 right-0 bg-white/95 backdrop-blur border-t border-gray-200 px-8 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    {validation?.canIssue
                        ? <span className="text-green-700 font-medium">Ready to issue</span>
                        : `${validation?.errors?.length ?? 0} issue(s) to resolve`}
                </span>
                <div className="flex gap-3">
                    {latestPdf() && (
                        <a href={`/api/documents/${id}/files/${latestPdf().id}?download=1`}>
                            <Button variant="secondary" icon="download">Download PDF</Button>
                        </a>
                    )}
                    <Button variant="secondary" icon="visibility" onClick={openPreview} loading={previewing}>Preview PDF</Button>
                    {locked
                        ? <Button icon="history" onClick={newRevision}>Create revision</Button>
                        : <Button icon="picture_as_pdf" onClick={issue} disabled={!validation?.canIssue} loading={saving}>
                            Generate tender
                        </Button>}
                </div>
            </div>
        </div>
    )
}
