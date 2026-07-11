'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQS = [
    {
        q: 'Where does Cloverton Homes build?',
        a: 'We build across our serviced regions including Sydney’s South West and selected Victorian growth corridors. The best way to confirm availability for your block is to send us an enquiry with your location.',
    },
    {
        q: 'Do you build on my own land or knockdown rebuilds?',
        a: 'Yes. We build on vacant land, within house & land packages, and on knockdown-rebuild sites. Our consultants will assess your site and guide you through the options.',
    },
    {
        q: 'What’s included in your homes?',
        a: 'Every home comes with a generous standard specification, and you can step up through our Designer and Premium inclusion tiers. You can compare exactly what’s included on our Inclusions page.',
    },
    {
        q: 'How much does it cost to build?',
        a: 'Pricing depends on your design, inclusions, site conditions and selections. The “from” prices shown on our designs are a starting guide — we’ll prepare a tailored estimate after understanding your needs.',
    },
    {
        q: 'How long does the build take?',
        a: 'Timelines vary with design, approvals and site works. Once your contract and selections are finalised, your consultant will give you an indicative construction schedule.',
    },
    {
        q: 'How do I get started?',
        a: 'Simply submit an enquiry through our contact form. One of our building consultants will be in touch to talk through your goals — there’s no obligation.',
    },
]

function Item({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open}
            >
                <span className="font-bold text-deep-slate">{q}</span>
                <span className={`material-symbols-outlined text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>
            {open && (
                <div className="px-6 pb-5 -mt-1 text-gray-600 leading-relaxed">{a}</div>
            )}
        </div>
    )
}

export default function FaqPage() {
    return (
        <div className="bg-background-light min-h-screen">
            <section className="bg-deep-slate text-white py-16 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Help Centre</span>
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Frequently Asked Questions</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to know about building with Cloverton Homes.</p>
                </div>
            </section>

            <div className="max-w-3xl mx-auto px-6 py-14">
                <div className="space-y-4">
                    {FAQS.map((f, i) => <Item key={i} {...f} />)}
                </div>

                <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold font-heading text-deep-slate mb-2">Still have questions?</h2>
                    <p className="text-gray-500 mb-6">Our team is happy to help. Send us a message and we’ll get back to you.</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    )
}
