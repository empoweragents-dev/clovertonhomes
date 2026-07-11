import type { ReactNode } from 'react'

export interface LegalSection {
    heading: string
    body: ReactNode
}

export default function LegalPage({
    title,
    intro,
    updated,
    sections,
}: {
    title: string
    intro: string
    updated: string
    sections: LegalSection[]
}) {
    return (
        <div className="bg-background-light min-h-screen">
            <section className="bg-deep-slate text-white py-16 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">{title}</h1>
                    <p className="text-gray-400 text-sm">Last updated: {updated}</p>
                </div>
            </section>

            <div className="max-w-3xl mx-auto px-6 py-14">
                <p className="text-lg text-gray-600 leading-relaxed mb-10">{intro}</p>

                <div className="space-y-10">
                    {sections.map((s, i) => (
                        <section key={i}>
                            <h2 className="text-xl md:text-2xl font-bold font-heading text-deep-slate mb-3">
                                {i + 1}. {s.heading}
                            </h2>
                            <div className="text-gray-600 leading-relaxed space-y-3 [&_a]:text-brand-teal [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
                                {s.body}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-14 pt-8 border-t border-gray-200 text-gray-500 text-sm">
                    Questions about this page? <a href="/contact" className="text-brand-teal underline">Get in touch via our contact form</a>.
                </div>
            </div>
        </div>
    )
}
