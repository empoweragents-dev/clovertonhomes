'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Design {
    id: string
    name: string
    slug: string
    priceFrom: number
    bedrooms: number
    bathrooms: number
    garages: number
    storeys: string
    category: string
    featuredImage: string
    badge: string
    isFeatured: boolean
    isActive: boolean
}

export default function AdminDesignsPage() {
    const [designs, setDesigns] = useState<Design[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDesigns()
    }, [])

    const fetchDesigns = async () => {
        try {
            const res = await fetch('/api/designs?limit=100')
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

    const formatPrice = (cents: number) => {
        return `$${(cents / 100).toLocaleString()}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Design Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your home designs catalog</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add Design
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-sm">Total Designs</p>
                    <p className="text-2xl font-bold text-gray-800">{designs.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-sm">Featured</p>
                    <p className="text-2xl font-bold text-gray-800">{designs.filter(d => d.isFeatured).length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-sm">Single Storey</p>
                    <p className="text-2xl font-bold text-gray-800">{designs.filter(d => d.storeys === 'single').length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-sm">Double Storey</p>
                    <p className="text-2xl font-bold text-gray-800">{designs.filter(d => d.storeys === 'double').length}</p>
                </div>
            </div>

            {/* Designs Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading designs...</p>
                    </div>
                ) : designs.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">home</span>
                        <h3 className="text-lg font-bold text-gray-600 mb-2">No Designs Found</h3>
                        <p className="text-gray-500 mb-4">Get started by adding your first home design.</p>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Add Design
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium">Design</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Specs</th>
                                <th className="px-6 py-4 font-medium">Price From</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {designs.map((design) => (
                                <tr key={design.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                {design.featuredImage ? (
                                                    <Image
                                                        src={design.featuredImage}
                                                        alt={design.name}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-gray-300">home</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{design.name}</p>
                                                <p className="text-gray-500 text-xs">{design.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="capitalize">{design.storeys} Storey</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">bed</span>
                                                {design.bedrooms}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">shower</span>
                                                {design.bathrooms}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">directions_car</span>
                                                {design.garages}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {design.priceFrom ? formatPrice(design.priceFrom) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {design.isFeatured && (
                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                                    Featured
                                                </span>
                                            )}
                                            {design.badge && (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                                    {design.badge}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1 text-gray-400 hover:text-blue-500">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-red-500">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
