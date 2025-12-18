'use client'

import { useState, useEffect } from 'react'

interface Tier {
    id: string
    name: string
    slug: string
    sortOrder: number
}

interface Category {
    id: string
    name: string
    items: {
        id: string
        title: string
        features: string[]
    }[]
}

export default function PropertyInclusions() {
    const [tiers, setTiers] = useState<Tier[]>([])
    const [activeTier, setActiveTier] = useState<string>('')
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/inclusions/tiers`)
                const data = await res.json()
                if (data.success && data.data.length > 0) {
                    setTiers(data.data)
                    // Default to 'designer' or first tier
                    const defaultTier = data.data.find((t: Tier) => t.slug === 'designer') || data.data[0]
                    setActiveTier(defaultTier.slug)
                }
            } catch (error) {
                console.error("Failed to fetch tiers:", error)
            }
        }
        fetchTiers()
    }, [])

    useEffect(() => {
        if (!activeTier) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/inclusions/tiers/${activeTier}`)
                const data = await res.json()
                if (data.success) {
                    setCategories(data.data.categories)
                }
            } catch (error) {
                console.error("Failed to fetch inclusion data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [activeTier])

    const activeTierData = tiers.find(t => t.slug === activeTier)

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-brand-teal font-heading">Inclusions</h3>

            {/* Tier Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-max">
                {tiers.map(tier => (
                    <button
                        key={tier.id}
                        onClick={() => setActiveTier(tier.slug)}
                        className={`px-5 py-2 rounded-md font-medium text-sm transition-all ${activeTier === tier.slug
                                ? 'bg-white dark:bg-gray-700 text-brand-charcoal dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        {tier.name}
                    </button>
                ))}
            </div>

            {/* Inclusions List */}
            {loading ? (
                <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-teal"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {categories.map(category => (
                        <div key={category.id}>
                            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                {category.name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {category.items?.map(item => (
                                    <div key={item.id} className="space-y-1">
                                        {item.features?.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No inclusions found for this tier.</p>
                    )}

                    {/* Download Brochure Button */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a
                            href={`/brochures/${activeTier}-inclusions.pdf`}
                            download
                            className="inline-flex items-center gap-2 bg-brand-charcoal hover:bg-black text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                        >
                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            Download {activeTierData?.name || 'Inclusions'} Brochure
                        </a>
                        <p className="text-xs text-gray-400 mt-2">
                            PDF brochure with full specifications
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
