'use client'

import Link from 'next/link'

interface PropertySidebarProps {
    title: string
    totalPrice?: number
    housePrice?: number
    landPrice?: number
    landWidth?: string
    landDepth?: string
    titlesExpected?: string
}

// Prices are stored in cents.
function money(cents?: number): string {
    if (cents == null) return 'POA'
    return `$${Math.round(cents / 100).toLocaleString()}`
}

function formatTitles(date?: string): string | null {
    if (!date) return null
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
}

export default function PropertySidebar({ title, totalPrice, housePrice, landPrice, landWidth, landDepth, titlesExpected }: PropertySidebarProps) {
    const titles = formatTitles(titlesExpected)
    const landSize = landWidth && landDepth ? `${parseFloat(landWidth)}m x ${parseFloat(landDepth)}m` : null

    return (
        <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
                {/* Price Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1 font-heading">House &amp; Land Package</p>
                        <h2 className="text-4xl font-black text-brand-teal tracking-tight font-heading">{money(totalPrice)}*</h2>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-display">House Price</span>
                            <span className="font-bold text-brand-charcoal dark:text-white font-heading">{money(housePrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-display">Land Price</span>
                            <span className="font-bold text-brand-charcoal dark:text-white font-heading">{money(landPrice)}</span>
                        </div>
                    </div>
                    {(titles || landSize) && (
                        <div className="flex flex-wrap gap-2">
                            {titles && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 font-heading">
                                    <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                                    Titles Expected {titles}
                                </span>
                            )}
                            {landSize && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 font-heading">
                                    {landSize}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Enquiry CTA (form-only, no phone/email shown) */}
                <div className="bg-brand-teal text-white rounded-2xl shadow-lg p-6 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>

                    <div className="relative flex items-center gap-4 border-b border-white/10 pb-6">
                        <div className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center bg-brand-charcoal">
                            <span className="material-symbols-outlined text-2xl">support_agent</span>
                        </div>
                        <div>
                            <p className="text-xs text-primary-light font-medium uppercase tracking-wider opacity-80 font-heading">Sales Team</p>
                            <p className="font-bold text-lg font-heading">Cloverton Homes</p>
                            <p className="text-sm opacity-80 font-display">Here to help with your build</p>
                        </div>
                    </div>

                    <div className="relative space-y-4">
                        <p className="text-sm opacity-90 font-display leading-relaxed">
                            Interested in {title}? Get in touch with our team to find out more about this package.
                        </p>

                        <Link
                            href="/contact"
                            className="block text-center w-full bg-primary hover:bg-[#4a6472] text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 font-heading">
                            Enquire Now
                        </Link>

                        <p className="text-xs text-center opacity-60 mt-2 font-display">
                            By enquiring you agree to our <Link href="/terms" className="underline hover:text-white">Terms</Link> &amp; <Link href="/privacy" className="underline hover:text-white">Privacy</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
