'use client'

import { useState } from 'react'

export default function PropertyFloorplan() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-brand-teal font-heading">Floorplan</h3>
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                    <button className="px-4 py-1.5 rounded-full bg-white dark:bg-gray-700 shadow-sm text-sm font-semibold text-brand-teal dark:text-white transition-all font-heading">Ground</button>
                    <button className="px-4 py-1.5 rounded-full hover:bg-white/50 text-sm font-medium text-gray-500 transition-all font-heading">First</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 relative">
                {/* Controls */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                    <button className="flex items-center gap-2 bg-white dark:bg-gray-700 shadow border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-brand-charcoal font-heading">
                        <span className="material-symbols-outlined text-brand-teal text-lg">flip</span>
                        Flip Plan
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white shadow border border-transparent px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors font-heading">
                        <span className="material-symbols-outlined text-lg">chair</span>
                        Furniture
                    </button>
                </div>
                {/* Floorplan Image */}
                <div
                    className="w-full aspect-[4/3] bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGeTKIBI7UAPlXCeCjYh8FezvPEZOuMmqjrz8kME9KfboSWviSmkfgyGT4ItT91hOYNRGt9JeQCoseqhFQw8LVHXiNtaEMotiZY_yjig2lncwKYlHqNUoRm5h1CcQ5QQTVkoh6Z6Io4CiAxMJD3Ctvmi0Ot-FlwrXQESBGewqBnOwRgONKqMoU56ek0LzqN-pvNSZBR0uzhFO928RjTQMWtH9VPbX_WdAoFKJY1Ko2pwHB7yXEq_6GR7uworsZIfaW5N7bs4DnkEUe')" }}
                ></div>
            </div>
        </div>
    )
}
