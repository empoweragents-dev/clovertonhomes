'use client'

import { useState } from 'react'

interface PropertyHeroProps {
    title: string
    address: string
    images?: string[]
}

export default function PropertyHero({ title, address, images = [] }: PropertyHeroProps) {
    // Default images if none provided
    const heroImages = images.length > 0 ? images : [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAoxj-t0sFEtdAmJlVdK_AS4KgRT7lQpZLLPN2TB90kkGGacXFuGkTQyX8mp_itZa06s9UoJrPLuHGE1WMUx5ZHuA0OSVaA33S0CU5pjaq7SYd-qwYNurHm6vYhHwDXzUxqBK4Ta_KodSKnPM_ceBo1UKU2rwFJpPIrzx6k4XP1OoL40nuIenmS7xJlLsNSdx-zinigUBq9WNUnen8DrZxe2JRJ_5qUrRX7Jdj_df8pmE0HUaQXcRWzbwkWRCjb8tGoWTsRVnT6xlrJ'
    ]

    return (
        <div className="space-y-8">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-brand-teal tracking-tight font-heading">{title}</h1>
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="material-symbols-outlined text-lg">location_on</span>
                        <p className="text-base font-display">{address}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition text-brand-charcoal">
                        <span className="material-symbols-outlined">ios_share</span>
                    </button>
                    <button className="h-10 px-5 flex items-center justify-center gap-2 rounded-full border border-gray-200 hover:bg-gray-50 transition text-brand-charcoal text-sm font-bold font-heading">
                        <span className="material-symbols-outlined">favorite</span>
                        Save
                    </button>
                </div>
            </div>

            {/* Hero Carousel */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden group">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('${heroImages[0]}')` }}
                ></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="flex gap-2">
                        <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium font-display">Facade</span>
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium font-display">Interior</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="h-10 w-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white text-brand-charcoal shadow-lg transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <button className="h-10 w-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white text-brand-charcoal shadow-lg transition-colors">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
