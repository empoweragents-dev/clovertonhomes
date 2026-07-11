'use client'

import ContactForm from '@/components/ContactForm'

const STEPS = [
    { icon: 'mark_email_read', title: 'Your enquiry is received', text: 'The details you submit help identify the topic and building path you are exploring.' },
    { icon: 'fact_check', title: 'The details are reviewed', text: 'Block information, preferred locations, home ideas, and questions help make the follow-up more useful.' },
    { icon: 'forum', title: 'The conversation continues', text: 'You can discuss relevant designs, house and land options, inclusions, or custom building questions.' },
]

const USEFUL_DETAILS = ['Preferred locations', 'Block dimensions if available', 'Approximate budget', 'Rooms and features that matter most']

export default function ContactPage() {
    return (
        <div className="bg-background-light min-h-screen">
            {/* Header Section */}
            <section className="bg-deep-slate text-white py-20 px-6">
                <div className="max-w-[1440px] mx-auto text-center">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Get In Touch</span>
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">Let&apos;s Start Your Journey</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Tell us about your project using the form below and our team will be in touch. It only takes a minute.
                    </p>
                </div>
            </section>

            <div className="max-w-[1280px] mx-auto px-6 -mt-10 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* The form is the single point of contact */}
                    <div className="lg:col-span-1">
                        <ContactForm compact />
                    </div>

                    {/* What happens next + office hours (no phone/email/address) */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 lg:mt-16">
                        <h3 className="text-2xl font-bold font-heading text-deep-slate mb-6">What happens next?</h3>
                        <div className="space-y-6 mb-10">
                            {STEPS.map((s, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-11 h-11 shrink-0 rounded-full bg-background-light text-deep-slate flex items-center justify-center">
                            <span className="material-symbols-outlined" aria-hidden="true">{s.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-deep-slate mb-1">{s.title}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed">{s.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="mb-4 font-heading text-lg font-bold text-deep-slate">Useful details to include</h3>
                        <ul className="space-y-1">
                            {USEFUL_DETAILS.map((detail) => (
                                <li key={detail} className="flex items-center gap-3 border-b border-gray-100 py-3 text-sm font-medium text-gray-700 last:border-0">
                                    <span className="h-2 w-2 rounded-full bg-brand-teal" aria-hidden="true" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
