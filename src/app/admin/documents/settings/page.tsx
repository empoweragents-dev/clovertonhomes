'use client'

import { useEffect, useState } from 'react'
import { Button, Card, CardHeader, Field, TextInput, TextArea, Select, useToast } from '@/components/ui'

/**
 * Document Settings (§15) — the builder identity and appearance every generated PDF
 * reads from. Nothing here is hard-coded in the PDF renderer.
 */

interface BrandSettings {
    legalName: string | null
    tradingName: string | null
    abn: string | null
    acn: string | null
    builderLicence: string | null
    addressLine1: string | null
    addressLine2: string | null
    suburb: string | null
    state: string | null
    postcode: string | null
    poBox: string | null
    phone: string | null
    email: string | null
    website: string | null
    primaryColor: string | null
    secondaryColor: string | null
    accentColor: string | null
    footerText: string | null
    ownerInitialLabel: string | null
    builderInitialLabel: string | null
    defaultValidityDays: number
    gstRateBp: number
    defaultGstMode: 'inclusive' | 'exclusive'
}

export default function DocumentSettingsPage() {
    const { push } = useToast()
    const [form, setForm] = useState<BrandSettings | null>(null)
    const [missing, setMissing] = useState<string[]>([])
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/documents/settings', { credentials: 'include' })
            .then(r => r.json())
            .then(json => {
                if (json.success) {
                    setForm(json.data)
                    setMissing(json.missingRequired ?? [])
                }
            })
    }, [])

    const set = <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) =>
        setForm(prev => (prev ? { ...prev, [key]: value } : prev))

    const save = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form) return
        setSaving(true)
        try {
            const res = await fetch('/api/documents/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            })
            const json = await res.json()
            if (json.success) {
                setForm(json.data)
                setMissing(json.missingRequired ?? [])
                push('Document settings saved')
            } else {
                push(json.message || 'Could not save settings', 'error')
            }
        } catch {
            push('Could not reach the server', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (!form) {
        return <div className="text-gray-400 py-16 text-center">Loading settings…</div>
    }

    return (
        <form onSubmit={save} className="max-w-4xl space-y-6 pb-24">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Document Branding</h1>
                <p className="text-gray-500 mt-1">
                    These details print on every tender — the page header, the cover and the footer.
                </p>
            </div>

            {missing.length > 0 && (
                <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="material-symbols-outlined text-amber-500">warning</span>
                    <div className="text-sm">
                        <p className="font-bold text-amber-900">Required before a tender can be issued</p>
                        <p className="text-amber-800 mt-0.5">{missing.join(' · ')}</p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader title="Builder identity" description="Printed in the header of every page." />
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    <Field label="Legal name" required hint="e.g. Cloverton Homes Pty Ltd">
                        <TextInput value={form.legalName ?? ''} onChange={e => set('legalName', e.target.value)} placeholder="Cloverton Homes Pty Ltd" />
                    </Field>
                    <Field label="Trading name">
                        <TextInput value={form.tradingName ?? ''} onChange={e => set('tradingName', e.target.value)} placeholder="Cloverton Homes" />
                    </Field>
                    <Field label="ABN" required>
                        <TextInput value={form.abn ?? ''} onChange={e => set('abn', e.target.value)} placeholder="00 000 000 000" />
                    </Field>
                    <Field label="ACN">
                        <TextInput value={form.acn ?? ''} onChange={e => set('acn', e.target.value)} />
                    </Field>
                    <Field label="Builder licence number" required className="md:col-span-2">
                        <TextInput value={form.builderLicence ?? ''} onChange={e => set('builderLicence', e.target.value)} placeholder="000000C" />
                    </Field>
                </div>
            </Card>

            <Card>
                <CardHeader title="Contact details" />
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    <Field label="Address line 1"><TextInput value={form.addressLine1 ?? ''} onChange={e => set('addressLine1', e.target.value)} /></Field>
                    <Field label="Address line 2"><TextInput value={form.addressLine2 ?? ''} onChange={e => set('addressLine2', e.target.value)} /></Field>
                    <Field label="Suburb"><TextInput value={form.suburb ?? ''} onChange={e => set('suburb', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="State"><TextInput value={form.state ?? ''} onChange={e => set('state', e.target.value)} placeholder="NSW" /></Field>
                        <Field label="Postcode"><TextInput value={form.postcode ?? ''} onChange={e => set('postcode', e.target.value)} /></Field>
                    </div>
                    <Field label="PO Box"><TextInput value={form.poBox ?? ''} onChange={e => set('poBox', e.target.value)} /></Field>
                    <Field label="Phone" required><TextInput value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} /></Field>
                    <Field label="Email" required><TextInput type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} /></Field>
                    <Field label="Website"><TextInput value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="clovertonhomes.com.au" /></Field>
                </div>
            </Card>

            <Card>
                <CardHeader title="Appearance" description="Colours are used for section headings, the price card and status badges." />
                <div className="p-6 grid md:grid-cols-3 gap-6">
                    {([
                        ['primaryColor', 'Primary colour'],
                        ['secondaryColor', 'Secondary colour'],
                        ['accentColor', 'Accent colour'],
                    ] as const).map(([key, label]) => (
                        <Field key={key} label={label}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={form[key] ?? '#234252'}
                                    onChange={e => set(key, e.target.value)}
                                    className="h-10 w-12 rounded border border-gray-300 cursor-pointer"
                                />
                                <TextInput value={form[key] ?? ''} onChange={e => set(key, e.target.value)} />
                            </div>
                        </Field>
                    ))}
                    <Field label="Footer text" className="md:col-span-3">
                        <TextArea rows={2} value={form.footerText ?? ''} onChange={e => set('footerText', e.target.value)} />
                    </Field>
                    <Field label="Owner initial label" hint="Printed on every page footer">
                        <TextInput value={form.ownerInitialLabel ?? ''} onChange={e => set('ownerInitialLabel', e.target.value)} />
                    </Field>
                    <Field label="Builder initial label">
                        <TextInput value={form.builderInitialLabel ?? ''} onChange={e => set('builderInitialLabel', e.target.value)} />
                    </Field>
                </div>
            </Card>

            <Card>
                <CardHeader title="Commercial defaults" description="Copied onto each new tender; can be changed per tender." />
                <div className="p-6 grid md:grid-cols-3 gap-6">
                    <Field label="Tender validity (days)" hint="Your current tenders say 30 days">
                        <TextInput
                            type="number" min={1} max={365}
                            value={form.defaultValidityDays ?? 30}
                            onChange={e => set('defaultValidityDays', Number(e.target.value))}
                        />
                    </Field>
                    <Field label="GST rate (%)" hint="Stored as basis points, so 10% is exact">
                        <TextInput
                            type="number" step="0.01" min={0}
                            value={(form.gstRateBp ?? 1000) / 100}
                            onChange={e => set('gstRateBp', Math.round(Number(e.target.value) * 100))}
                        />
                    </Field>
                    <Field label="Default GST mode">
                        <Select value={form.defaultGstMode} onChange={e => set('defaultGstMode', e.target.value as BrandSettings['defaultGstMode'])}>
                            <option value="inclusive">Prices include GST</option>
                            <option value="exclusive">Prices exclude GST</option>
                        </Select>
                    </Field>
                </div>
            </Card>

            <div className="fixed bottom-0 left-64 right-0 bg-white/90 backdrop-blur border-t border-gray-200 px-8 py-4 flex justify-end gap-3">
                <Button type="submit" loading={saving} icon="save">Save settings</Button>
            </div>
        </form>
    )
}
