'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardHeader, Field, TextInput, Select, useToast } from '@/components/ui'

/**
 * Create Tender — three steps only (client, project, template).
 *
 * Everything else is edited in the builder once the record exists, so a long form
 * can't lose work before there is anything to autosave into.
 */

interface TemplateOption { id: string; name: string; storeyType: string | null; isDefault: boolean; itemCount: number }

const STEPS = ['Client', 'Project', 'Template'] as const

export default function NewTenderPage() {
    const router = useRouter()
    const { push } = useToast()
    const [step, setStep] = useState(0)
    const [saving, setSaving] = useState(false)
    const [templates, setTemplates] = useState<TemplateOption[]>([])

    const [form, setForm] = useState({
        clientDisplayName: '', clientType: 'individual',
        primaryName: '', secondaryName: '', email: '', phone: '', currentAddress: '',
        projectAddress: '', lotNumber: '', suburb: '', state: 'NSW', postcode: '',
        constructionType: 'Single Storey', designNameSnapshot: '', facadeSnapshot: '',
        squares: '', bedrooms: '', bathrooms: '', garages: '',
        templateId: '', preparedByName: '', documentDate: new Date().toISOString().slice(0, 10),
    })

    const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

    useEffect(() => {
        fetch('/api/documents/templates', { credentials: 'include' })
            .then(r => r.json())
            .then(json => {
                if (json.success) {
                    setTemplates(json.data)
                    const def = json.data.find((t: TemplateOption) => t.isDefault) ?? json.data[0]
                    if (def) setForm(f => ({ ...f, templateId: def.id }))
                }
            })
    }, [])

    // Client name shown on the tender: built from the one or two owner names.
    const displayName = [form.primaryName, form.secondaryName].filter(Boolean).join(' & ')

    const canAdvance =
        step === 0 ? form.primaryName.trim().length > 0
            : step === 1 ? form.projectAddress.trim().length > 0
                : !!form.templateId

    const create = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...form,
                    clientDisplayName: displayName,
                    bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
                    bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
                    garages: form.garages ? Number(form.garages) : undefined,
                    squares: form.squares || undefined,
                    parties: [
                        { role: 'primary', fullName: form.primaryName, email: form.email, phone: form.phone, currentAddress: form.currentAddress },
                        ...(form.secondaryName ? [{ role: 'secondary', fullName: form.secondaryName, currentAddress: form.currentAddress }] : []),
                    ],
                }),
            })
            const json = await res.json()
            if (json.success) {
                push(`Created ${json.data.documentNumber}`)
                router.push(`/admin/documents/${json.data.id}`)
            } else {
                push(json.message || 'Could not create the tender', 'error')
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-3xl">
            <Link href="/admin/documents" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> All tenders
            </Link>

            <h1 className="text-3xl font-heading font-bold text-gray-900">New Tender</h1>
            <p className="text-gray-500 mt-1 mb-6">
                Three quick steps. Pricing and inclusions are edited next, with autosave.
            </p>

            <div className="flex items-center gap-2 mb-6">
                {STEPS.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${i === step ? 'bg-brand-teal text-white' : i < step ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
                            }`}>
                            <span className="material-symbols-outlined text-[16px]">{i < step ? 'check' : 'radio_button_unchecked'}</span>
                            {label}
                        </div>
                        {i < STEPS.length - 1 && <span className="w-6 h-px bg-gray-200" />}
                    </div>
                ))}
            </div>

            <Card>
                {step === 0 && (
                    <>
                        <CardHeader title="Client" description="Who the tender is addressed to. Multiple owners are supported." />
                        <div className="p-6 grid md:grid-cols-2 gap-6">
                            <Field label="Client type">
                                <Select value={form.clientType} onChange={e => set('clientType', e.target.value)}>
                                    <option value="individual">Individual</option>
                                    <option value="couple">Couple</option>
                                    <option value="company">Company</option>
                                </Select>
                            </Field>
                            <div />
                            <Field label="Primary client name" required>
                                <TextInput value={form.primaryName} onChange={e => set('primaryName', e.target.value)} placeholder="Mr S M Rahman" />
                            </Field>
                            <Field label="Second client name" hint="Leave blank for a single owner">
                                <TextInput value={form.secondaryName} onChange={e => set('secondaryName', e.target.value)} />
                            </Field>
                            <Field label="Email"><TextInput type="email" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
                            <Field label="Phone"><TextInput value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
                            <Field label="Current address" className="md:col-span-2">
                                <TextInput value={form.currentAddress} onChange={e => set('currentAddress', e.target.value)} placeholder="8 Cavan Pl, Airds NSW 2560" />
                            </Field>
                            {displayName && (
                                <p className="md:col-span-2 text-sm text-gray-500">
                                    Will appear on the tender as <strong className="text-gray-900">{displayName}</strong>
                                </p>
                            )}
                        </div>
                    </>
                )}

                {step === 1 && (
                    <>
                        <CardHeader title="Project" description="The construction site and the home being built." />
                        <div className="p-6 grid md:grid-cols-2 gap-6">
                            <Field label="Construction address" required className="md:col-span-2">
                                <TextInput value={form.projectAddress} onChange={e => set('projectAddress', e.target.value)} placeholder="60 Bryant Avenue, Claymore NSW 2559" />
                            </Field>
                            <Field label="Lot number"><TextInput value={form.lotNumber} onChange={e => set('lotNumber', e.target.value)} /></Field>
                            <Field label="Suburb"><TextInput value={form.suburb} onChange={e => set('suburb', e.target.value)} /></Field>
                            <Field label="State"><TextInput value={form.state} onChange={e => set('state', e.target.value)} /></Field>
                            <Field label="Postcode"><TextInput value={form.postcode} onChange={e => set('postcode', e.target.value)} /></Field>
                            <Field label="Construction type">
                                <Select value={form.constructionType} onChange={e => set('constructionType', e.target.value)}>
                                    {['Single Storey', 'Double Storey', 'Duplex', 'Granny Flat', 'Custom'].map(t => <option key={t}>{t}</option>)}
                                </Select>
                            </Field>
                            <Field label="House design"><TextInput value={form.designNameSnapshot} onChange={e => set('designNameSnapshot', e.target.value)} /></Field>
                            <Field label="Facade"><TextInput value={form.facadeSnapshot} onChange={e => set('facadeSnapshot', e.target.value)} placeholder="Builder choice standard" /></Field>
                            <Field label="Approx. squares"><TextInput value={form.squares} onChange={e => set('squares', e.target.value)} placeholder="22.0" /></Field>
                            <div className="grid grid-cols-3 gap-3 md:col-span-2">
                                <Field label="Bedrooms"><TextInput type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} /></Field>
                                <Field label="Bathrooms"><TextInput type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} /></Field>
                                <Field label="Garages"><TextInput type="number" value={form.garages} onChange={e => set('garages', e.target.value)} /></Field>
                            </div>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <CardHeader title="Template" description="The inclusions schedule this tender starts from. It is copied, not linked." />
                        <div className="p-6 space-y-4">
                            {templates.map(t => (
                                <label key={t.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.templateId === t.id ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    <input
                                        type="radio" name="template" value={t.id}
                                        checked={form.templateId === t.id}
                                        onChange={e => set('templateId', e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{t.name}</p>
                                        <p className="text-sm text-gray-500">{t.storeyType} · {t.itemCount} clauses</p>
                                    </div>
                                </label>
                            ))}
                            <div className="grid md:grid-cols-2 gap-6 pt-2">
                                <Field label="Tender date"><TextInput type="date" value={form.documentDate} onChange={e => set('documentDate', e.target.value)} /></Field>
                                <Field label="Prepared by"><TextInput value={form.preparedByName} onChange={e => set('preparedByName', e.target.value)} /></Field>
                            </div>
                        </div>
                    </>
                )}

                <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
                    <Button variant="secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                        Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                        <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance}>Continue</Button>
                    ) : (
                        <Button onClick={create} loading={saving} disabled={!canAdvance} icon="add">Create tender</Button>
                    )}
                </div>
            </Card>
        </div>
    )
}
