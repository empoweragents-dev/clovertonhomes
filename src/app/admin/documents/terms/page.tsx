'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Modal, Field, TextInput, TextArea, useToast } from '@/components/ui'

/**
 * Terms & Conditions library (§12) with version history (§13).
 *
 * Editing a clause never overwrites its text — it appends a version. Tenders pin the
 * version they were issued with, so changing legal wording here can never alter a
 * document that has already gone out.
 */

interface ClauseVersion {
    id: string
    versionNumber: number
    bodyMarkup: string
    changeNote: string | null
    createdByEmail: string | null
    createdAt: string
}

interface Clause {
    id: string
    code: string
    name: string
    category: string | null
    isDefaultEnabled: boolean
    isRequired: boolean
    isActive: boolean
    versionCount: number
    currentVersion?: ClauseVersion
}

const CATEGORIES = [
    'Tender validity', 'Site conditions', 'Authority fees', 'Owner responsibilities',
    'Variations', 'Supply and materials', 'Payments', 'Exclusions', 'General',
]

export default function TermsLibraryPage() {
    const { push } = useToast()
    const [clauses, setClauses] = useState<Clause[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Clause | null>(null)
    const [creating, setCreating] = useState(false)
    const [history, setHistory] = useState<{ clause: Clause; versions: ClauseVersion[] } | null>(null)
    const [saving, setSaving] = useState(false)
    const [draft, setDraft] = useState({ name: '', category: '', bodyMarkup: '', changeNote: '', isDefaultEnabled: false, isRequired: false })

    const load = useCallback(async () => {
        const res = await fetch('/api/documents/clauses', { credentials: 'include' })
        const json = await res.json()
        if (json.success) setClauses(json.data)
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const openCreate = () => {
        setDraft({ name: '', category: '', bodyMarkup: '', changeNote: '', isDefaultEnabled: false, isRequired: false })
        setCreating(true)
    }

    const openEdit = (c: Clause) => {
        setDraft({
            name: c.name, category: c.category ?? '',
            bodyMarkup: c.currentVersion?.bodyMarkup ?? '',
            changeNote: '', isDefaultEnabled: c.isDefaultEnabled, isRequired: c.isRequired,
        })
        setEditing(c)
    }

    const save = async () => {
        setSaving(true)
        try {
            const isNew = creating
            const res = await fetch(isNew ? '/api/documents/clauses' : `/api/documents/clauses/${editing!.id}`, {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(draft),
            })
            const json = await res.json()
            if (json.success) {
                push(isNew ? 'Clause created' : `Saved as version ${json.data.currentVersion?.versionNumber ?? ''}`)
                setCreating(false); setEditing(null)
                await load()
            } else {
                push(json.message || 'Could not save the clause', 'error')
            }
        } finally { setSaving(false) }
    }

    const showHistory = async (c: Clause) => {
        const res = await fetch(`/api/documents/clauses/${c.id}/versions`, { credentials: 'include' })
        const json = await res.json()
        if (json.success) setHistory({ clause: c, versions: json.data })
    }

    const deactivate = async (c: Clause) => {
        if (!confirm(`Deactivate "${c.name}"?\n\nIt stays in the library and existing tenders keep the version they were issued with.`)) return
        const res = await fetch(`/api/documents/clauses/${c.id}`, { method: 'DELETE', credentials: 'include' })
        const json = await res.json()
        if (json.success) { push('Clause deactivated'); await load() }
        else push(json.message || 'Could not deactivate', 'error')
    }

    return (
        <div>
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Terms &amp; Conditions</h1>
                    <p className="text-gray-500 mt-1 max-w-2xl">
                        Reusable clauses you can drop into a tender. Every edit creates a new version, and
                        tenders keep the exact wording they were issued with.
                    </p>
                </div>
                <Button icon="add" onClick={openCreate}>New clause</Button>
            </div>

            {loading && <div className="text-gray-400 py-16 text-center">Loading clauses…</div>}

            {!loading && clauses.length === 0 && (
                <Card className="p-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-200">gavel</span>
                    <h3 className="font-heading font-bold text-gray-900 mt-3">No clauses yet</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                        Add the terms you repeat on every tender — validity, site conditions, authority fees,
                        owner responsibilities, variations.
                    </p>
                    <Button className="mt-4" icon="add" onClick={openCreate}>Add your first clause</Button>
                </Card>
            )}

            <div className="space-y-3">
                {clauses.map(c => (
                    <Card key={c.id} className="p-5">
                        <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                                    {c.category && (
                                        <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.category}</span>
                                    )}
                                    {c.isRequired && (
                                        <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-medium">Required</span>
                                    )}
                                    {c.isDefaultEnabled && (
                                        <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">Added by default</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2 whitespace-pre-line">
                                    {c.currentVersion?.bodyMarkup}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Version {c.currentVersion?.versionNumber ?? 1}
                                    {c.versionCount > 1 && ` · ${c.versionCount} versions`}
                                    {c.currentVersion?.createdAt && ` · updated ${new Date(c.currentVersion.createdAt).toLocaleDateString('en-AU')}`}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {c.versionCount > 1 && (
                                    <button onClick={() => showHistory(c)} className="p-2 text-gray-400 hover:text-brand-teal" title="Version history">
                                        <span className="material-symbols-outlined text-[18px]">history</span>
                                    </button>
                                )}
                                <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-brand-teal" title="Edit clause">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button onClick={() => deactivate(c)} className="p-2 text-gray-400 hover:text-red-600" title="Deactivate">
                                    <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                open={creating || !!editing}
                onClose={() => { setCreating(false); setEditing(null) }}
                title={creating ? 'New clause' : `Edit “${editing?.name}”`}
                description={creating ? undefined : 'Saving creates a new version — the previous wording is kept.'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setCreating(false); setEditing(null) }}>Cancel</Button>
                        <Button onClick={save} loading={saving} icon="save" disabled={!draft.name.trim() || !draft.bodyMarkup.trim()}>
                            {creating ? 'Create clause' : 'Save new version'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-5">
                    <Field label="Clause name" required>
                        <TextInput value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Tender validity" />
                    </Field>
                    <Field label="Category">
                        <TextInput
                            value={draft.category} list="clause-categories"
                            onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                        />
                        <datalist id="clause-categories">
                            {CATEGORIES.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </Field>
                    <Field label="Clause text" required hint="Blank line = new paragraph · “- ” = bullet · **bold**">
                        <TextArea
                            rows={10} className="font-mono text-xs"
                            value={draft.bodyMarkup}
                            onChange={e => setDraft(d => ({ ...d, bodyMarkup: e.target.value }))}
                        />
                    </Field>
                    {!creating && (
                        <Field label="What changed?" hint="Recorded against this version in the history">
                            <TextInput value={draft.changeNote} onChange={e => setDraft(d => ({ ...d, changeNote: e.target.value }))} />
                        </Field>
                    )}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="rounded border-gray-300"
                                checked={draft.isDefaultEnabled}
                                onChange={e => setDraft(d => ({ ...d, isDefaultEnabled: e.target.checked }))} />
                            Add to every new tender automatically
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="rounded border-gray-300"
                                checked={draft.isRequired}
                                onChange={e => setDraft(d => ({ ...d, isRequired: e.target.checked }))} />
                            Required — a tender cannot be issued without it
                        </label>
                    </div>
                </div>
            </Modal>

            <Modal
                open={!!history}
                onClose={() => setHistory(null)}
                title={`Version history — ${history?.clause.name ?? ''}`}
                description="Issued tenders keep the version that was current when they were generated."
                size="lg"
            >
                <div className="space-y-4">
                    {history?.versions.map(v => (
                        <div key={v.id} className="border-l-2 border-gray-200 pl-4">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900">Version {v.versionNumber}</span>
                                {v.id === history.clause.currentVersion?.id && (
                                    <span className="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Current</span>
                                )}
                                <span className="text-xs text-gray-400">
                                    {new Date(v.createdAt).toLocaleString('en-AU')}
                                    {v.createdByEmail && ` · ${v.createdByEmail}`}
                                </span>
                            </div>
                            {v.changeNote && <p className="text-xs text-gray-500 mt-0.5">{v.changeNote}</p>}
                            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line bg-gray-50 rounded p-3">{v.bodyMarkup}</p>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    )
}
