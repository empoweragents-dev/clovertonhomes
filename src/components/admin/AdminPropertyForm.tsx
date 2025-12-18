
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminPropertyFormProps {
    initialData?: any
    isEditing?: boolean
    id?: string
}

export default function AdminPropertyForm({ initialData, isEditing = false, id }: AdminPropertyFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false) // Component loading state if needed
    const [saving, setSaving] = useState(false)

    // Initial State matching schema
    const [formData, setFormData] = useState({
        title: '',
        designId: '',
        estateId: '',
        regionId: '',
        housePrice: '',
        landPrice: '',
        bedrooms: '',
        bathrooms: '',
        garages: '',
        houseSize: '', // Not in previous but usually needed
        landWidth: '',
        landDepth: '',
        address: '',
        lotNumber: '',
        featuredImage: '',
        description: '',
        isActive: true,
        isLandReady: false,
        badge: ''
    })

    const [designs, setDesigns] = useState<any[]>([])

    // Load initial data if provided
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                designId: initialData.designId || '',
                estateId: initialData.estateId || '',
                regionId: initialData.regionId || '',
                housePrice: (initialData.housePrice / 100).toString(),
                landPrice: (initialData.landPrice / 100).toString(),
                bedrooms: initialData.bedrooms?.toString() || '',
                bathrooms: initialData.bathrooms?.toString() || '',
                garages: initialData.garages?.toString() || '',
                houseSize: initialData.squareMeters?.toString() || '',
                landWidth: initialData.landWidth || '',
                landDepth: initialData.landDepth || '',
                address: initialData.address || '',
                lotNumber: initialData.lotNumber || '',
                featuredImage: initialData.featuredImage || '',
                description: initialData.description || '',
                isActive: initialData.isActive ?? true,
                isLandReady: initialData.isLandReady ?? false,
                badge: initialData.badge || ''
            })
        }
    }, [initialData])

    // Fetch Designs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const desRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/designs?limit=100`)
                const desData = await desRes.json()
                setDesigns(desData.data || [])
            } catch (e) {
                console.error("Error loading form data", e)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            // Transform data for API
            const payload = {
                ...formData,
                housePrice: Math.round(parseFloat(formData.housePrice || '0') * 100),
                landPrice: Math.round(parseFloat(formData.landPrice || '0') * 100),
                totalPrice: Math.round((parseFloat(formData.housePrice || '0') + parseFloat(formData.landPrice || '0')) * 100),
                bedrooms: parseInt(formData.bedrooms || '0'),
                bathrooms: parseInt(formData.bathrooms || '0'),
                garages: parseInt(formData.garages || '0'),
                squareMeters: parseInt(formData.houseSize || '0')
            }

            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/properties/${id}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/properties`

            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error('Failed to save')

            router.push('/admin/properties')
            router.refresh()
        } catch (err) {
            console.error(err)
            alert('Failed to save property')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/properties" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-3xl font-heading font-bold text-gray-900">
                    {isEditing ? 'Edit Property' : 'Add Property'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">

                {/* Basic Info */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full form-input rounded-lg border-gray-300" placeholder="e.g. Ascot 28 at Cloverton" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">House Design</label>
                            <select required value={formData.designId} onChange={e => setFormData({ ...formData, designId: e.target.value })} className="w-full form-select rounded-lg border-gray-300">
                                <option value="">Select Design...</option>
                                {designs.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Region ID (UUID)</label>
                            <input type="text" required value={formData.regionId} onChange={e => setFormData({ ...formData, regionId: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Estate ID (UUID)</label>
                            <input type="text" value={formData.estateId} onChange={e => setFormData({ ...formData, estateId: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                            <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full form-textarea rounded-lg border-gray-300" />
                        </div>
                    </div>
                </section>

                {/* Pricing & land */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Pricing & Land</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">House Price ($)</label>
                            <input type="number" required value={formData.housePrice} onChange={e => setFormData({ ...formData, housePrice: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Land Price ($)</label>
                            <input type="number" required value={formData.landPrice} onChange={e => setFormData({ ...formData, landPrice: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Total Price (Auto-calc)</label>
                            <div className="py-2 px-3 bg-gray-50 rounded-lg text-gray-600">
                                ${((parseFloat(formData.housePrice || '0') + parseFloat(formData.landPrice || '0'))).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Lot Number</label>
                            <input type="text" value={formData.lotNumber} onChange={e => setFormData({ ...formData, lotNumber: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                            <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Land Ready?</label>
                            <div className="flex items-center mt-2">
                                <input type="checkbox" checked={formData.isLandReady} onChange={e => setFormData({ ...formData, isLandReady: e.target.checked })} className="form-checkbox h-5 w-5 text-brand-teal rounded" />
                                <span className="ml-2 text-gray-600">Yes, ready to build</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Specs */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Specifications</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Bedrooms</label>
                            <input type="number" required value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Bathrooms</label>
                            <input type="number" required value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Garages</label>
                            <input type="number" required value={formData.garages} onChange={e => setFormData({ ...formData, garages: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">House Size (m²)</label>
                            <input type="number" value={formData.houseSize} onChange={e => setFormData({ ...formData, houseSize: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Land Width (m)</label>
                            <input type="number" step="0.01" value={formData.landWidth} onChange={e => setFormData({ ...formData, landWidth: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Land Depth (m)</label>
                            <input type="number" step="0.01" value={formData.landDepth} onChange={e => setFormData({ ...formData, landDepth: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Media & Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Featured Image URL</label>
                            <input type="text" value={formData.featuredImage} onChange={e => setFormData({ ...formData, featuredImage: e.target.value })} className="w-full form-input rounded-lg border-gray-300" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                            <select value={formData.isActive ? 'active' : 'draft'} onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })} className="w-full form-select rounded-lg border-gray-300">
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="pt-4 flex justify-end gap-3">
                    <Link href="/admin/properties" className="px-6 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50">Cancel</Link>
                    <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-brand-teal text-white font-bold hover:opacity-90 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Property'}
                    </button>
                </div>

            </form>
        </div>
    )
}
