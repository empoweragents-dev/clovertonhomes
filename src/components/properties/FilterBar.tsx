
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function FilterBar() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State for filters
    const [regionId, setRegionId] = useState(searchParams.get('regionId') || '')
    const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '')
    const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '')
    const [garages, setGarages] = useState(searchParams.get('garages') || '')
    const [landReady, setLandReady] = useState(searchParams.get('isLandReady') === 'true')

    // State for data
    const [regions, setRegions] = useState<any[]>([])

    // Load regions on mount
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/regions`)
                const data = await res.json()
                setRegions(data.data || [])
            } catch (err) {
                console.error("Failed to load regions")
            }
        }
        fetchRegions()
    }, [])

    // Update state when URL changes (e.g. back button)
    useEffect(() => {
        setRegionId(searchParams.get('regionId') || '')
        setBedrooms(searchParams.get('bedrooms') || '')
        setBathrooms(searchParams.get('bathrooms') || '')
        setGarages(searchParams.get('garages') || '')
        setLandReady(searchParams.get('isLandReady') === 'true')
    }, [searchParams])

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (regionId) params.set('regionId', regionId)
        if (bedrooms) params.set('bedrooms', bedrooms)
        if (bathrooms) params.set('bathrooms', bathrooms)
        if (garages) params.set('garages', garages)
        if (landReady) params.set('isLandReady', 'true')

        router.push(`/properties?${params.toString()}`)
    }

    // Helper to update filter immediately
    const applyFilter = (key: string, value: any) => {
        // Determine the next state values
        const nextRegion = key === 'regionId' ? value : regionId
        const nextBeds = key === 'bedrooms' ? value : bedrooms
        const nextBaths = key === 'bathrooms' ? value : bathrooms
        const nextGarages = key === 'garages' ? value : garages
        const nextLand = key === 'isLandReady' ? value : landReady

        // Update local state
        if (key === 'regionId') setRegionId(value)
        if (key === 'bedrooms') setBedrooms(value)
        if (key === 'bathrooms') setBathrooms(value)
        if (key === 'garages') setGarages(value)
        if (key === 'isLandReady') setLandReady(value)

        // Push to URL
        const params = new URLSearchParams()
        if (nextRegion) params.set('regionId', nextRegion)
        if (nextBeds) params.set('bedrooms', nextBeds)
        if (nextBaths) params.set('bathrooms', nextBaths)
        if (nextGarages) params.set('garages', nextGarages)
        if (nextLand) params.set('isLandReady', 'true')

        router.push(`/properties?${params.toString()}`, { scroll: false })
    }

    return (
        <div className="sticky top-[64px] z-40 bg-white/95 backdrop-blur-md border-b border-[#eceeef] shadow-sm transition-all duration-300">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-4">
                <form
                    className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6"
                    onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                >
                    {/* Region Selector */}
                    <div className="relative min-w-[200px] flex-1">
                        <label className="sr-only">Region</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined text-xl">location_on</span>
                            <select
                                value={regionId}
                                onChange={(e) => applyFilter('regionId', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f4] border-transparent rounded-full text-sm font-medium text-charcoal focus:bg-white focus:border-primary focus:ring-0 transition-colors cursor-pointer appearance-none"
                            >
                                <option value="">All Regions</option>
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id}>
                                        {region.name}
                                    </option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-xl pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    {/* Filters Group */}
                    <div className="flex flex-wrap items-center gap-4 flex-[2]">
                        {/* Beds */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 hidden sm:block">Beds</span>
                            <div className="flex bg-[#eceeef] p-0.5 rounded-full">
                                {[3, 4, 5].map((num) => (
                                    <label key={num} className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all ${(num === 5 ? (bedrooms === '5' || bedrooms === '5+') : bedrooms === num.toString())
                                        ? 'bg-white text-deep-slate shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}>
                                        <input
                                            className="sr-only"
                                            name="bedrooms"
                                            type="radio"
                                            value={num}
                                            onChange={() => applyFilter('bedrooms', num.toString())}
                                            checked={num === 5 ? (bedrooms === '5' || bedrooms === '5+') : bedrooms === num.toString()}
                                        />
                                        {num === 5 ? '5+' : num}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Baths */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 hidden sm:block">Baths</span>
                            <div className="flex bg-[#eceeef] p-0.5 rounded-full">
                                {[2, 3].map((num) => (
                                    <label key={num} className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all ${(num === 3 ? (bathrooms === '3' || bathrooms === '3+') : bathrooms === num.toString())
                                        ? 'bg-white text-deep-slate shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}>
                                        <input
                                            className="sr-only"
                                            name="bathrooms"
                                            type="radio"
                                            value={num}
                                            onChange={() => applyFilter('bathrooms', num.toString())}
                                            checked={num === 3 ? (bathrooms === '3' || bathrooms === '3+') : bathrooms === num.toString()}
                                        />
                                        {num === 3 ? '3+' : num}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Cars */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 hidden sm:block">Cars</span>
                            <div className="flex bg-[#eceeef] p-0.5 rounded-full">
                                {[1, 2].map((num) => (
                                    <label key={num} className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all ${(num === 2 ? (garages === '2' || garages === '2+') : garages === num.toString())
                                        ? 'bg-white text-deep-slate shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}>
                                        <input
                                            className="sr-only"
                                            name="garages"
                                            type="radio"
                                            value={num}
                                            onChange={() => applyFilter('garages', num.toString())}
                                            checked={num === 2 ? (garages === '2' || garages === '2+') : garages === num.toString()}
                                        />
                                        {num === 2 ? '2+' : num}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Land Readiness */}
                        <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border transition-colors ${landReady ? 'bg-white border-gray-200' : 'bg-[#eceeef]/50 border-transparent hover:border-[#eceeef]'
                            }`}>
                            <span className="text-xs font-medium text-gray-600">Land Ready</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    className="sr-only peer"
                                    type="checkbox"
                                    checked={landReady}
                                    onChange={(e) => applyFilter('isLandReady', e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-deep-slate"></div>
                            </label>
                        </div>
                    </div>

                    {/* Search Button (Optional now, but good for robust feeling) */}
                    <button
                        type="submit"
                        className="bg-deep-slate hover:bg-[#1a323e] text-white rounded-full px-6 py-2.5 text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-full xl:w-auto"
                    >
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        <span>Update Results</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
