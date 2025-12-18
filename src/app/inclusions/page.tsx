'use client'

import { useState, useEffect } from 'react'
import InclusionsToggle from "@/components/inclusions/InclusionsToggle"
import VisualBlock from "@/components/inclusions/VisualBlock"

export default function InclusionsPage() {
    const [tiers, setTiers] = useState<any[]>([])
    const [activeTier, setActiveTier] = useState<string>('')
    const [categories, setCategories] = useState<any[]>([])
    const [tiersLoading, setTiersLoading] = useState(true)

    useEffect(() => {
        // Fetch Tiers on mount
        const fetchTiers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/inclusions/tiers`)
                const data = await res.json()
                if (data.success && data.data.length > 0) {
                    setTiers(data.data)
                    // Set default tier if not set, usually 'designer' or first
                    const defaultTier = data.data.find((t: any) => t.slug === 'designer') || data.data[0]
                    setActiveTier(defaultTier.slug)
                }
            } catch (error) {
                console.error("Failed to fetch tiers:", error)
            } finally {
                setTiersLoading(false)
            }
        }
        fetchTiers()
    }, [])


    const [contentLoading, setContentLoading] = useState(true)

    useEffect(() => {
        if (!activeTier) return

        const fetchData = async () => {
            setContentLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/inclusions/tiers/${activeTier}`)
                const data = await res.json()
                if (data.success) {
                    setCategories(data.data.categories)
                }
            } catch (error) {
                console.error("Failed to fetch inclusion data:", error)
            } finally {
                setContentLoading(false)
            }
        }
        fetchData()
    }, [activeTier])



    return (
        <div className="bg-background-light dark:bg-background-dark text-brand-charcoal dark:text-gray-100 font-display min-h-screen pb-20">

            {/* Hero Header */}
            <section className="relative pt-24 pb-16 px-6 text-center bg-[#f4f6f8] dark:bg-[#1a1c1e]">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-brand-charcoal dark:text-white leading-tight">
                        Crafted for Your Lifestyle
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Compare our tiers of excellence. From the solid foundations of our Classic Series to the complete luxury of Elegance.
                    </p>
                </div>
            </section>

            {/* Sticky Toggle Bar */}
            <div className="sticky top-[64px] z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm py-4 transition-all">
                <div className="max-w-7xl mx-auto px-6 flex justify-center items-center">
                    <InclusionsToggle
                        tiers={tiers}
                        currentTier={activeTier}
                        onChange={setActiveTier}
                    />
                </div>
            </div>

            {/* Visual Blocks Grid */}
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
                {contentLoading || tiersLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-6 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="space-y-2 pt-2">
                                        <div className="h-3 bg-gray-100 rounded"></div>
                                        <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                                        <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category) => (
                            category.items?.map((item: any) => (
                                <div key={item.id} className="h-full">
                                    <VisualBlock item={item} />
                                </div>
                            ))
                        ))}
                    </div>
                )}

                {categories.length === 0 && !contentLoading && !tiersLoading && (
                    <div className="text-center py-20 text-gray-500">
                        No inclusions found for this tier.
                    </div>
                )}
            </main>

            {/* CTA Footer */}
            <section className="bg-brand-charcoal text-white py-20 px-6 mt-12 text-center">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold">
                        Found your perfect match?
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Download the full specifications brochure or speak to a consultant today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-deep-slate hover:bg-[#345b6f] text-white px-8 py-3 rounded-full font-bold transition-transform hover:-translate-y-1 shadow-lg">
                            Get Full Price List
                        </button>
                        <button className="border border-white/20 hover:bg-white hover:text-brand-charcoal text-white px-8 py-3 rounded-full font-bold transition-all">
                            Book Consultation
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}
