'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FloorPlan {
    id: string
    name: string
    slug: string
    type: 'single' | 'double'
    bedrooms: number
    bathrooms: number
    garages: number
    squareMeters: number
    imageUrl: string
    floorPlanImage: string
    description: string
    features: string[]
    sortOrder: number
    isActive: boolean
}

interface Facade {
    id: string
    name: string
    slug: string
    type: 'single' | 'double'
    style: string
    imageUrl: string
    description: string
    features: string[]
    sortOrder: number
    isActive: boolean
}

interface Submission {
    submission: {
        id: string
        customerName: string
        customerEmail: string
        customerPhone: string
        landAddress: string
        comments: string
        inclusionTier: string
        status: string
        createdAt: string
    }
    floorPlan: FloorPlan | null
    facade: Facade | null
}

type Tab = 'floor-plans' | 'facades' | 'submissions'

export default function AdminStudioPage() {
    const [activeTab, setActiveTab] = useState<Tab>('floor-plans')
    const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
    const [facades, setFacades] = useState<Facade[]>([])
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editItem, setEditItem] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})

    const apiUrl = ''

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (activeTab === 'floor-plans') {
                const res = await fetch(`${apiUrl}/studio/floor-plans`)
                const data = await res.json()
                if (data.success) setFloorPlans(data.data)
            } else if (activeTab === 'facades') {
                const res = await fetch(`${apiUrl}/studio/facades`)
                const data = await res.json()
                if (data.success) setFacades(data.data)
            } else if (activeTab === 'submissions') {
                const res = await fetch(`${apiUrl}/studio/admin/submissions`, { credentials: 'include' })
                const data = await res.json()
                if (data.success) setSubmissions(data.data)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditItem(null)
        if (activeTab === 'floor-plans') {
            setFormData({
                name: '',
                slug: '',
                type: 'single',
                bedrooms: 4,
                bathrooms: 2,
                garages: 2,
                squareMeters: 250,
                imageUrl: '',
                floorPlanImage: '',
                description: '',
                features: [],
                sortOrder: 0,
                isActive: true,
            })
        } else if (activeTab === 'facades') {
            setFormData({
                name: '',
                slug: '',
                type: 'single',
                style: 'modern',
                imageUrl: '',
                description: '',
                features: [],
                sortOrder: 0,
                isActive: true,
            })
        }
        setShowModal(true)
    }

    const handleEdit = (item: any) => {
        setEditItem(item)
        setFormData({ ...item })
        setShowModal(true)
    }

    const handleSave = async () => {
        try {
            const endpoint = activeTab === 'floor-plans' ? 'floor-plans' : 'facades'
            const method = editItem ? 'PUT' : 'POST'
            const url = editItem
                ? `${apiUrl}/studio/admin/${endpoint}/${editItem.id}`
                : `${apiUrl}/studio/admin/${endpoint}`

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                setShowModal(false)
                fetchData()
            } else {
                alert('Failed to save')
            }
        } catch (error) {
            console.error('Error saving:', error)
            alert('Failed to save')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            const endpoint = activeTab === 'floor-plans' ? 'floor-plans' : 'facades'
            const res = await fetch(`${apiUrl}/studio/admin/${endpoint}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            if (res.ok) {
                fetchData()
            } else {
                alert('Failed to delete')
            }
        } catch (error) {
            console.error('Error deleting:', error)
            alert('Failed to delete')
        }
    }

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const res = await fetch(`${apiUrl}/studio/admin/submissions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status }),
            })

            if (res.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="text-gray-500 text-sm hover:text-primary">← Back to Admin</Link>
                        <h1 className="text-2xl font-bold text-charcoal font-heading mt-1">Design Studio Management</h1>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {(['floor-plans', 'facades', 'submissions'] as Tab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'floor-plans' ? 'Floor Plans' : tab === 'facades' ? 'Facades' : 'Submissions'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Floor Plans Tab */}
                {activeTab === 'floor-plans' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">Manage floor plans for the Design Studio</p>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add Floor Plan
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : floorPlans.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">floor_lamp</span>
                                <p className="text-gray-500">No floor plans yet. Add your first one!</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Image</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Specs</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {floorPlans.map(fp => (
                                            <tr key={fp.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    {fp.imageUrl ? (
                                                        <img src={fp.imageUrl} alt={fp.name} className="w-16 h-12 object-cover rounded-lg" />
                                                    ) : (
                                                        <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-gray-400">image</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-charcoal">{fp.name}</p>
                                                    <p className="text-sm text-gray-500">{fp.squareMeters}m²</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${fp.type === 'single' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {fp.type === 'single' ? 'Single' : 'Double'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {fp.bedrooms} bed • {fp.bathrooms} bath • {fp.garages} car
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${fp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {fp.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleEdit(fp)}
                                                        className="text-gray-400 hover:text-primary mx-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(fp.id)}
                                                        className="text-gray-400 hover:text-red-500 mx-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Facades Tab */}
                {activeTab === 'facades' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">Manage facade options for the Design Studio</p>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add Facade
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : facades.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">apartment</span>
                                <p className="text-gray-500">No facades yet. Add your first one!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {facades.map(facade => (
                                    <div key={facade.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                                        <div className="relative h-40">
                                            {facade.imageUrl ? (
                                                <img src={facade.imageUrl} alt={facade.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-gray-400 text-4xl">image</span>
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${facade.type === 'single' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {facade.type}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-charcoal capitalize">
                                                    {facade.style}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-charcoal">{facade.name}</h3>
                                                    <p className={`text-xs ${facade.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {facade.isActive ? '● Active' : '○ Inactive'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(facade)}
                                                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-primary hover:bg-gray-200 flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(facade.id)}
                                                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Submissions Tab */}
                {activeTab === 'submissions' && (
                    <div>
                        <div className="mb-6">
                            <p className="text-gray-600">View and manage customer design submissions</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inbox</span>
                                <p className="text-gray-500">No submissions yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map(({ submission, floorPlan, facade }) => (
                                    <div key={submission.id} className="bg-white rounded-xl p-6 shadow-sm">
                                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                            {/* Customer Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary">person</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-charcoal">{submission.customerName}</h3>
                                                        <p className="text-sm text-gray-500">{submission.customerEmail}</p>
                                                    </div>
                                                </div>
                                                {submission.customerPhone && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">call</span>
                                                        {submission.customerPhone}
                                                    </p>
                                                )}
                                                {submission.landAddress && (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">location_on</span>
                                                        {submission.landAddress}
                                                    </p>
                                                )}
                                                {submission.comments && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-600">{submission.comments}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selections */}
                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Floor Plan</p>
                                                    <p className="font-medium text-charcoal">{floorPlan?.name || 'Not selected'}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Facade</p>
                                                    <p className="font-medium text-charcoal">{facade?.name || 'Not selected'}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Inclusion Tier</p>
                                                    <p className="font-medium text-charcoal capitalize">{submission.inclusionTier || 'Not selected'}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <p className="text-xs text-gray-500 mb-1">Submitted</p>
                                                    <p className="font-medium text-charcoal">
                                                        {new Date(submission.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="lg:w-40">
                                                <select
                                                    value={submission.status}
                                                    onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                                                    className={`w-full px-3 py-2 rounded-lg border font-medium text-sm ${submission.status === 'pending' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                                                        submission.status === 'contacted' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                                                            submission.status === 'converted' ? 'border-green-300 bg-green-50 text-green-700' :
                                                                'border-gray-300 bg-gray-50 text-gray-600'
                                                        }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="converted">Converted</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-charcoal font-heading">
                                {editItem ? 'Edit' : 'Add'} {activeTab === 'floor-plans' ? 'Floor Plan' : 'Facade'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug || ''}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={formData.type || 'single'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    >
                                        <option value="single">Single Storey</option>
                                        <option value="double">Double Storey</option>
                                    </select>
                                </div>
                                {activeTab === 'facades' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                                        <select
                                            value={formData.style || 'modern'}
                                            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        >
                                            <option value="modern">Modern</option>
                                            <option value="traditional">Traditional</option>
                                            <option value="coastal">Coastal</option>
                                            <option value="contemporary">Contemporary</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {activeTab === 'floor-plans' && (
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                        <input
                                            type="number"
                                            value={formData.bedrooms || 4}
                                            onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                                        <input
                                            type="number"
                                            value={formData.bathrooms || 2}
                                            onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Garages</label>
                                        <input
                                            type="number"
                                            value={formData.garages || 2}
                                            onChange={(e) => setFormData({ ...formData, garages: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Size (m²)</label>
                                        <input
                                            type="number"
                                            value={formData.squareMeters || 250}
                                            onChange={(e) => setFormData({ ...formData, squareMeters: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={formData.imageUrl || ''}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive !== false}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible to users)</label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
                            >
                                {editItem ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
