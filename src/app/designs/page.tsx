'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Design {
    id: string
    name: string
    slug: string
    description: string
    priceFrom: number
    bedrooms: number
    bathrooms: number
    garages: number
    storeys: string
    category: string
    squareMeters: number
    featuredImage: string
    badge: string
    isFeatured: boolean
}

const filters = ['All Designs', 'Single Storey', 'Double Storey', 'Dual Living', 'Acreage']

export default function DesignsPage() {
    const [designs, setDesigns] = useState<Design[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchDesigns()
    }, [])

    const fetchDesigns = async () => {
        try {
            const res = await fetch('/api/designs')
            const data = await res.json()
            if (data.success) {
                setDesigns(data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch designs:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter designs based on selected filter and search
    const filteredDesigns = designs.filter(design => {
        // Search filter
        if (searchQuery && !design.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false
        }

        // Category filter
        if (activeFilter === 0) return true // All
        if (activeFilter === 1) return design.storeys === 'single'
        if (activeFilter === 2) return design.storeys === 'double'
        if (activeFilter === 3) return design.category === 'dual_occupancy'
        if (activeFilter === 4) return design.category === 'acreage'
        return true
    })

    const formatPrice = (cents: number) => {
        return `From $${(cents / 100).toLocaleString()}`
    }

    return (
        <>
            <Header />
            <main className="pt-20 min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-deep-slate text-white py-16">
                    <div className="max-w-7xl mx-auto px-6">
                        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Home Designs</h1>
                        <p className="text-gray-300 text-lg max-w-2xl">
                            Explore our collection of thoughtfully designed homes. Each design can be customized to suit your lifestyle and block.
                        </p>
                    </div>
                </section>

                {/* Filters & Search */}
                <section className="bg-white border-b sticky top-20 z-30">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {filters.map((filter, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveFilter(index)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === index
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search designs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border rounded-full w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Designs Grid */}
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-6">
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading designs...</p>
                            </div>
                        ) : filteredDesigns.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">home</span>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">No designs found</h3>
                                <p className="text-gray-500">
                                    {searchQuery
                                        ? 'Try adjusting your search terms'
                                        : 'No designs are available at the moment'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredDesigns.map((design) => (
                                    <Link
                                        key={design.id}
                                        href={`/designs/${design.slug}`}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                            {design.featuredImage ? (
                                                <Image
                                                    src={design.featuredImage}
                                                    alt={design.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-6xl text-gray-300">home</span>
                                                </div>
                                            )}
                                            {design.badge && (
                                                <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                    {design.badge}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-brand-charcoal mb-1 group-hover:text-primary transition-colors">
                                                {design.name}
                                            </h3>
                                            <p className="text-brand-teal font-medium mb-4">
                                                {design.priceFrom ? formatPrice(design.priceFrom) : 'Price on application'}
                                            </p>

                                            {/* Specs */}
                                            <div className="flex gap-4 text-gray-500 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-lg">bed</span>
                                                    {design.bedrooms}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-lg">shower</span>
                                                    {design.bathrooms}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-lg">directions_car</span>
                                                    {design.garages}
                                                </span>
                                                {design.squareMeters && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-lg">square_foot</span>
                                                        {design.squareMeters}m²
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
