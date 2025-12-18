'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const filters = ['Most Popular', 'Single Storey', 'Double Storey', 'Dual Living']

export default function DesignCarousel() {
    const [activeFilter, setActiveFilter] = useState(0)
    const [designs, setDesigns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const res = await fetch(`/api/designs`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()

                // Map API response to component format
                const mappedDesigns = (data.data || []).map((d: any) => ({
                    name: d.name,
                    price: `From $${(d.priceFrom / 100).toLocaleString()}`,
                    image: d.featuredImage || '/placeholder.jpg',
                    badge: d.badge,
                    bed: d.bedrooms,
                    bath: d.bathrooms,
                    car: d.garages,
                    category: d.category
                }))
                setDesigns(mappedDesigns)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchDesigns()
    }, [])

    const filteredDesigns = designs.filter(d => {
        if (activeFilter === 0) return true // Popular
        // Simple mapping for demo; ideally match exact category slugs
        if (activeFilter === 1) return d.category === 'single_storey'
        if (activeFilter === 2) return d.category === 'double_storey'
        if (activeFilter === 3) return d.category === 'dual_occupancy'
        return true
    })

    return (
        <section className="py-16 bg-brand-charcoal text-white overflow-hidden">
            <div className="pl-5 mb-8">
                <h2 className="font-heading text-3xl font-bold mb-4">Distinct Designs</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pr-5 pb-2">
                    {filters.map((filter, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveFilter(index)}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === index
                                ? 'bg-brand-teal text-white font-bold shadow-lg'
                                : 'border border-white/20 hover:bg-white/10 text-white'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex overflow-x-auto gap-5 px-5 no-scrollbar snap-x snap-mandatory pb-8">
                {loading ? (
                    <div className="text-white text-center w-full py-10">Loading designs...</div>
                ) : (
                    filteredDesigns.map((design, index) => (
                        <div key={index} className="min-w-[85vw] md:min-w-[320px] snap-center">
                            <div className="bg-white rounded-3xl overflow-hidden shadow-lg h-full flex flex-col">
                                <div className="relative aspect-[4/3] shrink-0">
                                    <Image
                                        alt={design.name}
                                        className="w-full h-full object-cover"
                                        src={design.image}
                                        fill
                                    />
                                    {design.badge && (
                                        <div className="absolute bottom-3 left-3 bg-brand-charcoal/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            {design.badge}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-heading font-bold text-brand-charcoal mb-1">
                                        {design.name}
                                    </h3>
                                    <p className="text-brand-teal font-medium mb-4">{design.price}</p>
                                    <div className="flex gap-4 text-gray-500 text-sm mt-auto">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">bed</span> {design.bed}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">shower</span> {design.bath}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">directions_car</span> {design.car}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}
