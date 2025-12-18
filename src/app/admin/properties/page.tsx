
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminProperties() {
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/properties?limit=100`)
                const data = await res.json()
                setProperties(data.data || [])
            } catch (err) {
                console.error('Failed to fetch properties')
            } finally {
                setLoading(false)
            }
        }
        fetchProperties()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/properties/${id}`, {
                method: 'DELETE',
                // Add headers for auth if needed later
            })
            if (res.ok) {
                setProperties(properties.filter(p => p.id !== id))
            }
        } catch (err) {
            console.error('Failed to delete property')
        }
    }

    if (loading) return <div>Loading properties...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Properties</h1>
                    <p className="text-gray-500 mt-1">Manage all house & land packages</p>
                </div>
                <Link
                    href="/admin/properties/new"
                    className="bg-brand-teal text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add Property
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estate / Region</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {properties.map((property) => (
                            <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={property.featuredImage || '/placeholder.jpg'}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {property.title}
                                    <div className="text-xs text-gray-400 font-normal mt-0.5">{property.address}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    ${(property.totalPrice / 100).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-sm">
                                    <span className="block">{property.estate?.name}</span>
                                    <span className="text-xs text-gray-400">{property.region?.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${property.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {property.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 text-gray-400 hover:text-brand-teal transition-colors">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(property.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {properties.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No properties found. Click "Add Property" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
