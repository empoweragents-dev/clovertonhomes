'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const filters = [
    { label: 'All designs', value: 'all' },
    { label: 'Single storey', value: 'single' },
    { label: 'Double storey', value: 'double' },
    { label: 'Dual living', value: 'dual' },
]

const fallbackImage = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80'

export default function DesignCarousel() {
    const [activeFilter, setActiveFilter] = useState('all')
    const [designs, setDesigns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const res = await fetch(`/api/designs`)
                if (!res.ok) throw new Error('Failed to fetch designs')
                const data = await res.json()

                const mappedDesigns = (data.data || []).map((d: any) => ({
                    id: d.id,
                    slug: d.slug,
                    name: d.name,
                    price: d.priceFrom ? `From $${(d.priceFrom / 100).toLocaleString()}` : '',
                    image: d.featuredImage || fallbackImage,
                    badge: d.badge,
                    bed: d.bedrooms,
                    bath: d.bathrooms,
                    car: d.garages,
                    storeys: d.storeys,
                    category: d.category,
                }))
                setDesigns(mappedDesigns)
            } catch (err) {
                console.error(err)
                setError('Designs are not available right now. You can still explore the full design collection.')
            } finally {
                setLoading(false)
            }
        }
        fetchDesigns()
    }, [])

    const filteredDesigns = designs.filter((d) => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'dual') return d.category === 'dual_occupancy'
        return d.storeys === activeFilter
    })

    return (
        <section className="overflow-hidden bg-[#202624] py-20 text-white sm:py-28">
            <div className="home-container">
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                    <div>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#aebfb7]">Home designs</p>
                        <h2 className="font-heading text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-6xl">
                            Homes worth exploring.
                        </h2>
                    </div>
                    <div className="lg:justify-self-end">
                        <p className="max-w-xl text-base leading-8 text-white/[0.68] sm:text-lg">
                            Compare layouts, room counts, and design styles before deciding what direction fits your block, location, and way of living.
                        </p>
                        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {filters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setActiveFilter(filter.value)}
                                    aria-pressed={activeFilter === filter.value}
                                    className={`focus-ring min-h-11 whitespace-nowrap rounded-full px-5 text-sm font-bold transition ${activeFilter === filter.value
                                        ? 'bg-white text-[#202624]'
                                        : 'border border-white/[0.16] bg-white/5 text-white/[0.78] hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-4 no-scrollbar lg:grid lg:grid-cols-3 lg:overflow-visible">
                    {loading && [0, 1, 2].map((item) => (
                        <div key={item} className="min-w-[82vw] snap-center rounded-[2rem] border border-white/10 bg-white/[0.08] p-4 md:min-w-[360px] lg:min-w-0">
                            <div className="aspect-[4/3] animate-pulse rounded-[1.5rem] bg-white/10" />
                            <div className="mt-5 h-6 w-2/3 animate-pulse rounded-full bg-white/10" />
                            <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
                        </div>
                    ))}

                    {!loading && !error && filteredDesigns.length === 0 && (
                        <div className="min-w-full rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 text-white/70">
                            No designs match this filter yet. Try another category or browse the full collection.
                        </div>
                    )}

                    {!loading && !error && filteredDesigns.slice(0, 6).map((design, index) => (
                        <Link
                            key={design.id || design.name}
                            href="/designs"
                            className={`focus-ring group min-w-[82vw] snap-center overflow-hidden rounded-[2rem] bg-[#f8f5ef] text-[#202624] transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 md:min-w-[360px] lg:min-w-0 ${index === 0 ? 'lg:col-span-1' : ''}`}
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-[#d8d0c3]">
                                <Image
                                    alt={`${design.name} home design`}
                                    className="object-cover transition duration-700 group-hover:scale-105"
                                    src={design.image}
                                    fill
                                    sizes="(min-width: 1024px) 33vw, 82vw"
                                />
                                {design.badge && (
                                    <span className="absolute left-4 top-4 rounded-full bg-[#202624]/[0.85] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                                        {design.badge}
                                    </span>
                                )}
                            </div>
                            <div className="p-6 sm:p-7">
                                <div className="flex items-start justify-between gap-5">
                                    <div>
                                        <h3 className="font-heading text-2xl font-semibold tracking-[-0.04em]">{design.name}</h3>
                                        {design.price && <p className="mt-2 text-sm font-bold text-[#234d49]">{design.price}</p>}
                                    </div>
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dfddd6] text-[#234d49] transition group-hover:bg-[#234d49] group-hover:text-white">
                                        <span className="material-symbols-outlined text-[19px]" aria-hidden="true">arrow_outward</span>
                                    </span>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#68706b]">
                                    <span className="rounded-full bg-white px-3 py-2">{design.bed || '-'} bed</span>
                                    <span className="rounded-full bg-white px-3 py-2">{design.bath || '-'} bath</span>
                                    <span className="rounded-full bg-white px-3 py-2">{design.car || '-'} car</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {!loading && error && (
                        <div className="min-w-full rounded-[2rem] border border-white/10 bg-white/[0.08] p-8">
                            <p className="text-white/[0.76]">{error}</p>
                            <Link href="/designs" className="focus-ring mt-5 inline-flex min-h-11 items-center rounded-2xl bg-white px-5 text-sm font-bold text-[#202624]">
                                Browse designs
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <Link href="/designs" className="focus-ring inline-flex min-h-12 items-center rounded-2xl border border-white/[0.18] px-5 text-sm font-bold text-white/[0.86] transition hover:bg-white hover:text-[#202624]">
                        View all designs
                    </Link>
                </div>
            </div>
        </section>
    )
}
