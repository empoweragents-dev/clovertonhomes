'use client'

import { useState } from 'react'
import { Button, Card, Modal, Field, TextInput, TextArea, Select, useToast } from '@/components/ui'

/**
 * The inclusion editor (§10) — expandable sections of clauses with inline status
 * changes and a full edit dialog.
 *
 * Built against an endpoint adapter so the same component drives both the master
 * template and (later) a tender's own copy: only the URLs differ, the interactions
 * and the shape of the data are identical.
 */

export interface EditorItem {
    id: string
    clauseNumber: string | null
    displayClauseNumber?: string | null
    title: string
    bodyMarkup: string | null
    bodyHtml: string | null
    statusCode: string
    isClientVisible: boolean
    internalNote: string | null
    sortOrder: number
}

export interface EditorSection {
    id: string
    sectionNumber: number
    title: string
    showOnCoverSummary: boolean
    items: EditorItem[]
}

export interface ItemStatus {
    code: string
    label: string
    shortLabel: string
    pdfTreatment: string
}

/** Badge tone per status treatment. Meaning is carried by the word too, never colour alone. */
const TREATMENT_STYLES: Record<string, string> = {
    included: 'bg-green-100 text-green-800 border-green-200',
    excluded: 'bg-red-50 text-red-700 border-red-200',
    partial: 'bg-amber-100 text-amber-800 border-amber-200',
    money: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
}

export function StatusBadge({ status, statuses }: { status: string; statuses: ItemStatus[] }) {
    const def = statuses.find(s => s.code === status)
    const tone = TREATMENT_STYLES[def?.pdfTreatment ?? 'neutral'] ?? TREATMENT_STYLES.neutral
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-bold tracking-wide whitespace-nowrap ${tone}`}>
            {def?.shortLabel ?? status.toUpperCase()}
        </span>
    )
}

export interface EditorEndpoints {
    updateItem: (itemId: string) => string
    deleteItem: (itemId: string) => string
    addItem: (sectionId: string) => string
}

export default function InclusionEditor({
    sections, statuses, endpoints, readOnly = false, onChanged,
}: {
    sections: EditorSection[]
    statuses: ItemStatus[]
    endpoints: EditorEndpoints
    readOnly?: boolean
    onChanged: () => void | Promise<void>
}) {
    const { push } = useToast()
    // First section open by default — 65 clauses expanded at once is unreadable.
    const [open, setOpen] = useState<Set<string>>(new Set(sections[0] ? [sections[0].id] : []))
    const [editing, setEditing] = useState<EditorItem | null>(null)
    const [draft, setDraft] = useState<Partial<EditorItem>>({})
    const [saving, setSaving] = useState(false)

    const toggle = (id: string) =>
        setOpen(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    const openEditor = (item: EditorItem) => {
        setEditing(item)
        setDraft({
            title: item.title,
            bodyMarkup: item.bodyMarkup ?? '',
            statusCode: item.statusCode,
            isClientVisible: item.isClientVisible,
            internalNote: item.internalNote ?? '',
        })
    }

    const saveItem = async () => {
        if (!editing) return
        setSaving(true)
        try {
            const res = await fetch(endpoints.updateItem(editing.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(draft),
            })
            const json = await res.json()
            if (json.success) {
                push('Clause updated')
                setEditing(null)
                await onChanged()
            } else {
                push(json.message || 'Could not save clause', 'error')
            }
        } finally {
            setSaving(false)
        }
    }

    /** Inline status change from the row — the most common edit by far. */
    const changeStatus = async (item: EditorItem, statusCode: string) => {
        const res = await fetch(endpoints.updateItem(item.id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ statusCode }),
        })
        const json = await res.json()
        if (json.success) { push(`${item.clauseNumber} → ${statusCode.replace(/_/g, ' ')}`); await onChanged() }
        else push(json.message || 'Could not change status', 'error')
    }

    const removeItem = async (item: EditorItem) => {
        if (!confirm(`Delete clause ${item.clauseNumber} "${item.title}"?\n\nRemaining clauses are renumbered automatically.`)) return
        const res = await fetch(endpoints.deleteItem(item.id), { method: 'DELETE', credentials: 'include' })
        const json = await res.json()
        if (json.success) { push('Clause deleted'); await onChanged() }
        else push(json.message || 'Could not delete clause', 'error')
    }

    const addItem = async (sectionId: string) => {
        const res = await fetch(endpoints.addItem(sectionId), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title: 'New clause', bodyMarkup: '', statusCode: 'included' }),
        })
        const json = await res.json()
        if (json.success) { push('Clause added'); await onChanged(); openEditor(json.data) }
        else push(json.message || 'Could not add clause', 'error')
    }

    const totalItems = sections.reduce((n, s) => n + s.items.length, 0)

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                    {sections.length} sections · {totalItems} clauses
                </p>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon="unfold_more" onClick={() => setOpen(new Set(sections.map(s => s.id)))}>
                        Expand all
                    </Button>
                    <Button variant="ghost" size="sm" icon="expand_less" onClick={() => setOpen(new Set())}>
                        Collapse all
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {sections.map(section => {
                    const isOpen = open.has(section.id)
                    const tally = section.items.reduce<Record<string, number>>((acc, i) => {
                        acc[i.statusCode] = (acc[i.statusCode] || 0) + 1
                        return acc
                    }, {})

                    return (
                        <Card key={section.id} className="overflow-hidden">
                            <button
                                onClick={() => toggle(section.id)}
                                className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                                <span className={`material-symbols-outlined text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                                <span className="font-heading font-bold text-gray-900">
                                    {section.sectionNumber}. {section.title}
                                </span>
                                <span className="text-xs text-gray-400">{section.items.length} clauses</span>
                                <span className="ml-auto flex items-center gap-1.5">
                                    {Object.entries(tally).map(([code, count]) => (
                                        <span key={code} className="text-[11px] text-gray-500">
                                            {count}&nbsp;{code.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </span>
                            </button>

                            {isOpen && (
                                <div className="divide-y divide-gray-100">
                                    {section.items.map(item => (
                                        <div key={item.id} className="group px-5 py-4 hover:bg-gray-50/60 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <span className="font-mono text-xs text-gray-400 pt-1 w-10 shrink-0">
                                                    {item.clauseNumber}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                                                        <StatusBadge status={item.statusCode} statuses={statuses} />
                                                        {!item.isClientVisible && (
                                                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                                                <span className="material-symbols-outlined text-[14px]">visibility_off</span>
                                                                hidden from PDF
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.bodyHtml && (
                                                        <div
                                                            className="text-sm text-gray-500 mt-1 line-clamp-2 [&_ul]:list-disc [&_ul]:pl-4 [&_p]:inline"
                                                            dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                                                        />
                                                    )}
                                                </div>

                                                {!readOnly && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                                                        <select
                                                            value={item.statusCode}
                                                            onChange={e => changeStatus(item, e.target.value)}
                                                            className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                                                            aria-label={`Status for clause ${item.clauseNumber}`}
                                                        >
                                                            {statuses.map(s => (
                                                                <option key={s.code} value={s.code}>{s.label}</option>
                                                            ))}
                                                        </select>
                                                        <button onClick={() => openEditor(item)} className="p-1.5 text-gray-400 hover:text-brand-teal" title="Edit clause">
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </button>
                                                        <button onClick={() => removeItem(item)} className="p-1.5 text-gray-400 hover:text-red-600" title="Delete clause">
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {!readOnly && (
                                        <div className="px-5 py-3 bg-gray-50/50">
                                            <Button variant="ghost" size="sm" icon="add" onClick={() => addItem(section.id)}>
                                                Add clause to {section.title}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>

            <Modal
                open={!!editing}
                onClose={() => setEditing(null)}
                title={`Edit clause ${editing?.clauseNumber ?? ''}`}
                description="Clause numbers are assigned automatically from the section order."
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button onClick={saveItem} loading={saving} icon="save">Save clause</Button>
                    </>
                }
            >
                <div className="space-y-5">
                    <Field label="Title" required>
                        <TextInput value={draft.title ?? ''} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
                    </Field>

                    <Field label="Status">
                        <Select value={draft.statusCode ?? ''} onChange={e => setDraft(d => ({ ...d, statusCode: e.target.value }))}>
                            {statuses.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
                        </Select>
                    </Field>

                    <Field
                        label="Body"
                        hint="Blank line = new paragraph · line starting with “- ” = bullet · **bold** · *italic*"
                    >
                        <TextArea
                            rows={12}
                            value={draft.bodyMarkup ?? ''}
                            onChange={e => setDraft(d => ({ ...d, bodyMarkup: e.target.value }))}
                            className="font-mono text-xs"
                        />
                    </Field>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={draft.isClientVisible ?? true}
                            onChange={e => setDraft(d => ({ ...d, isClientVisible: e.target.checked }))}
                            className="rounded border-gray-300"
                        />
                        Show this clause in the client PDF
                    </label>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <Field label="Internal note" hint="Never printed in the client PDF.">
                            <TextArea
                                rows={2}
                                value={draft.internalNote ?? ''}
                                onChange={e => setDraft(d => ({ ...d, internalNote: e.target.value }))}
                            />
                        </Field>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
