'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PropertyHero from './PropertyHero'
import PropertySpecs from './PropertySpecs'
import PropertyFloorplan from './PropertyFloorplan'
import PropertyLocation from './PropertyLocation'
import PropertySidebar from './PropertySidebar'
import PropertyInclusions from './PropertyInclusions'

interface PropertyData {
    id: string
    title: string
    address?: string
    description?: string
    bedrooms: number
    bathrooms: number
    garages: number
    squareMeters?: number
    housePrice?: number
    landPrice?: number
    totalPrice?: number
    landWidth?: string
    landDepth?: string
    titlesExpected?: string
    featuredImage?: string
}

export default function PropertyDetail({ slug }: { slug: string }) {
    const [data, setData] = useState<{ property: PropertyData; images: { imageUrl: string }[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/properties/${slug}`)
                const json = await res.json()
                if (res.ok && json.success && json.data?.property) {
                    setData(json.data)
                } else {
                    setNotFound(true)
                }
            } catch {
                setNotFound(true)
            } finally {
                setLoading(false)
            }
        }
        fetchProperty()
    }, [slug])

    if (loading) {
        return (
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-20 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-teal" />
            </main>
        )
    }

    if (notFound || !data) {
        return (
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-24 text-center">
                <h1 className="text-3xl font-bold font-heading text-brand-teal mb-3">Property not found</h1>
                <p className="text-gray-500 mb-8">This property may have been removed or the link is incorrect.</p>
                <Link href="/properties" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors">
                    Browse all properties
                </Link>
            </main>
        )
    }

    const p = data.property
    const images = (data.images || []).map(i => i.imageUrl).filter(Boolean)
    if (p.featuredImage) images.unshift(p.featuredImage)

    return (
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-display">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="material-symbols-outlined text-base">chevron_right</span>
                <Link href="/properties" className="hover:text-primary transition-colors">House &amp; Land</Link>
                <span className="material-symbols-outlined text-base">chevron_right</span>
                <span className="text-brand-teal font-semibold">{p.title}</span>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
                {/* Left Column: Content */}
                <div className="lg:col-span-8 space-y-8 pb-20">
                    <PropertyHero
                        title={p.title}
                        address={p.address || ''}
                        images={images}
                    />

                    <PropertySpecs
                        bedrooms={p.bedrooms}
                        bathrooms={p.bathrooms}
                        garages={p.garages}
                        squareMeters={p.squareMeters}
                    />

                    {/* About Section */}
                    {p.description && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-brand-teal font-heading">About {p.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-display whitespace-pre-line">
                                {p.description}
                            </p>
                        </div>
                    )}

                    <PropertyFloorplan />

                    {/* Inclusions - Dynamic Component */}
                    <PropertyInclusions />

                    <PropertyLocation address={p.address} />
                </div>

                {/* Right Column: Sticky Sidebar */}
                <PropertySidebar
                    title={p.title}
                    totalPrice={p.totalPrice}
                    housePrice={p.housePrice}
                    landPrice={p.landPrice}
                    landWidth={p.landWidth}
                    landDepth={p.landDepth}
                    titlesExpected={p.titlesExpected}
                />
            </div>
        </main>
    )
}
