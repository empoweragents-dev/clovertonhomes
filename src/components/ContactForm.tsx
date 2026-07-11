'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

const INTEREST_OPTIONS = ['Building a New Home', 'House & Land Packages', 'Knockdown Rebuild']

export default function ContactForm({ compact = false }: { compact?: boolean }) {
    const [form, setForm] = useState({
        interestType: INTEREST_OPTIONS[0],
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        company: '',
    })
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
    const [error, setError] = useState('')

    const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm({ ...form, [key]: e.target.value })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!form.firstName.trim() || !form.email.trim()) {
            setError('Please enter your first name and email.')
            return
        }
        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            setError('Please enter a valid email address.')
            return
        }

        setStatus('submitting')
        try {
            const res = await fetch('/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'general',
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    phone: form.phone,
                    message: form.message,
                    interestType: form.interestType,
                    source: 'contact-form',
                    company: form.company,
                }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Something went wrong. Please try again.')
            }
            setStatus('success')
        } catch (err: any) {
            setStatus('error')
            setError(err.message || 'Something went wrong. Please try again.')
        }
    }

    return (
        <section className={compact ? "bg-transparent text-[#202624]" : "bg-[#202624] py-20 text-white sm:py-28"}>
            <div className={compact ? "w-full" : "home-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"}>
                {!compact && <div>
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#aebfb7]">Next step</p>
                    <h2 className="font-heading text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-6xl">
                        Let us help you find the right place to begin.
                    </h2>
                    <p className="mt-6 max-w-xl text-base leading-8 text-white/[0.68] sm:text-lg">
                        Share what you are exploring and the team can point your enquiry toward home designs, house and land, or a custom build conversation.
                    </p>
                    <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
                        {['Design options', 'Land search', 'Build pathway'].map((item) => (
                            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-white/[0.82]">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>}

                <div className={`rounded-[2rem] bg-[#f8f5ef] p-4 text-[#202624] shadow-2xl shadow-black/20 sm:p-6 ${compact ? 'w-full' : ''}`}>
                    {status === 'success' ? (
                        <div className="rounded-[1.5rem] border border-[#dfddd6] bg-white p-8 text-center" role="status" aria-live="polite">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8eee9] text-[#234d49]">
                                <span className="material-symbols-outlined text-3xl" aria-hidden="true">check_circle</span>
                            </div>
                            <h3 className="font-heading text-3xl font-semibold tracking-[-0.04em]">Thank you</h3>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#68706b]">
                                Your enquiry has been received. We will review the details and follow up with the most useful next step.
                            </p>
                            <button
                                onClick={() => {
                                    setForm({ interestType: INTEREST_OPTIONS[0], firstName: '', lastName: '', email: '', phone: '', message: '', company: '' })
                                    setStatus('idle')
                                }}
                                className="focus-ring mt-8 inline-flex min-h-11 items-center rounded-2xl border border-[#dfddd6] px-5 text-sm font-bold text-[#234d49] transition hover:bg-[#e8eee9]"
                            >
                                Send another enquiry
                            </button>
                        </div>
                    ) : (
                        <form className="rounded-[1.5rem] border border-[#dfddd6] bg-white p-5 sm:p-7" onSubmit={handleSubmit} noValidate>
                            <fieldset>
                                <legend className="font-heading text-2xl font-semibold tracking-[-0.04em]">What are you exploring?</legend>
                                <div className={`mt-5 grid gap-3 ${compact ? 'xl:grid-cols-3' : 'sm:grid-cols-3'}`}>
                                    {INTEREST_OPTIONS.map((option) => (
                                        <label key={option} className={`cursor-pointer rounded-2xl border p-4 text-sm font-bold transition focus-within:ring-2 focus-within:ring-[#234d49] focus-within:ring-offset-2 ${form.interestType === option ? 'border-[#234d49] bg-[#e8eee9] text-[#234d49]' : 'border-[#dfddd6] bg-[#fcfbf8] text-[#68706b]'}`}>
                                            <input
                                                type="radio"
                                                name="interestType"
                                                value={option}
                                                checked={form.interestType === option}
                                                onChange={update('interestType')}
                                                className="sr-only"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div className={`mt-6 grid gap-4 ${compact ? 'xl:grid-cols-2' : 'sm:grid-cols-2'}`}>
                                <Field label="First name" required>
                                    <input className="w-full rounded-2xl border-[#dfddd6] bg-[#fcfbf8] px-4 py-3 text-sm focus:border-[#234d49] focus:ring-[#234d49]" placeholder="Jane" type="text" value={form.firstName} onChange={update('firstName')} required />
                                </Field>
                                <Field label="Last name">
                                    <input className="w-full rounded-2xl border-[#dfddd6] bg-[#fcfbf8] px-4 py-3 text-sm focus:border-[#234d49] focus:ring-[#234d49]" placeholder="Smith" type="text" value={form.lastName} onChange={update('lastName')} />
                                </Field>
                            </div>

                            <div className={`mt-4 grid gap-4 ${compact ? 'xl:grid-cols-2' : 'sm:grid-cols-2'}`}>
                                <Field label="Email" required>
                                    <input className="w-full rounded-2xl border-[#dfddd6] bg-[#fcfbf8] px-4 py-3 text-sm focus:border-[#234d49] focus:ring-[#234d49]" placeholder="jane@example.com" type="email" value={form.email} onChange={update('email')} required />
                                </Field>
                                <Field label="Phone">
                                    <input className="w-full rounded-2xl border-[#dfddd6] bg-[#fcfbf8] px-4 py-3 text-sm focus:border-[#234d49] focus:ring-[#234d49]" placeholder="0400 000 000" type="tel" value={form.phone} onChange={update('phone')} />
                                </Field>
                            </div>

                            <div className="mt-4">
                                <Field label="Tell us a little more">
                                    <textarea
                                        className="min-h-28 w-full resize-y rounded-2xl border-[#dfddd6] bg-[#fcfbf8] px-4 py-3 text-sm focus:border-[#234d49] focus:ring-[#234d49]"
                                        placeholder="Your preferred location, block details, home ideas, or questions"
                                        value={form.message}
                                        onChange={update('message')}
                                    />
                                </Field>
                            </div>

                            <input type="text" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={update('company')} className="hidden" aria-hidden="true" />

                            {error && <p className="mt-4 text-sm font-medium text-red-600" role="alert">{error}</p>}

                            <button className="focus-ring mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#234d49] px-6 text-sm font-bold text-white transition hover:bg-[#1d3f3c] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={status === 'submitting'}>
                                {status === 'submitting' ? 'Sending...' : 'Send my enquiry'}
                            </button>
                            <p className="mt-5 text-center text-xs leading-6 text-[#626a66]">
                                Your details are kept private. View our <a className="font-bold underline" href="/privacy">Privacy Policy</a>.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#68706b]">
                {label}{required && <span className="text-[#234d49]"> *</span>}
            </span>
            {children}
        </label>
    )
}
