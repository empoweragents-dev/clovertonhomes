'use client'

import { useState, useEffect } from 'react'

// Define interfaces matching the API response
interface Tier {
    id: string
    name: string
    slug: string
    sortOrder: number
}

interface Category {
    id: string
    name: string
    headline: string
    icon: string
    sortOrder: number
    items?: Item[] // Optional because global fetch might not have it, but Tier fetch does
}

interface Item {
    id: string
    tierId: string
    categoryId: string
    title: string
    description: string
    imageUrl: string
    badge: string
    features: string[]
    sortOrder: number
}

interface InclusionsManagementProps {
    initialCategories: any[]
}

export default function InclusionsManagement({ initialCategories }: InclusionsManagementProps) {
    const [view, setView] = useState<'content' | 'categories' | 'tiers'>('content')
    const [tiers, setTiers] = useState<Tier[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    // Content View State
    const [activeTierId, setActiveTierId] = useState<string>('')
    const [tierData, setTierData] = useState<Category[]>([]) // Categories with items for the active tier

    // Loading State
    const [loading, setLoading] = useState(true)

    // Modal State
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState<'item' | 'category' | 'tier'>('item')
    const [editData, setEditData] = useState<any>(null)

    // Form States (for Item, Category, or Tier)
    const [itemForm, setItemForm] = useState<Partial<Item> & { name?: string; headline?: string; icon?: string }>({
        features: []
    })

    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchAllData()
    }, [])

    useEffect(() => {
        if (activeTierId) {
            fetchTierData(activeTierId)
        } else if (tiers.length > 0) {
            setActiveTierId(tiers[0].id)
        }
    }, [tiers, activeTierId])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [tiersRes, catsRes] = await Promise.all([
                fetch(`/api/inclusions/tiers`),
                fetch(`/api/inclusions/categories`)
            ])

            const tiersData = await tiersRes.json()
            const catsData = await catsRes.json()

            if (tiersData.success) {
                setTiers(tiersData.data)
                if (tiersData.data.length > 0 && !activeTierId) {
                    setActiveTierId(tiersData.data[0].id)
                }
            }
            if (catsData.success) setCategories(catsData.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchTierData = async (tierId: string) => {
        // Find slug
        const tier = tiers.find(t => t.id === tierId)
        if (!tier) return

        try {
            const res = await fetch(`/api/inclusions/tiers/${tier.slug}`)
            const data = await res.json()
            if (data.success) {
                setTierData(data.data.categories)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        try {
            const res = await fetch(`/api/upload?bucket=GENERAL&folder=inclusions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_session')}` },
                body: formData
            })
            const data = await res.json()
            if (data.success) {
                // Update form
                setItemForm(prev => ({ ...prev, imageUrl: data.data.publicUrl }))
            } else {
                alert('Upload failed: ' + data.message)
            }
        } catch (err) {
            console.error(err)
            alert('Upload error')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem('admin_session')

        try {
            let url = `/api/inclusions/`
            let method = editData ? 'PUT' : 'POST'
            let body = {}

            if (modalType === 'item') {
                url += `items${editData ? '/' + editData.id : ''}`
                body = {
                    ...itemForm,
                    tierId: activeTierId, // Ensure tier is set
                    categoryId: itemForm.categoryId // Ensure category is set
                }
            } else if (modalType === 'category') {
                url += `categories${editData ? '/' + editData.id : ''}`
                body = itemForm // Reusing state, but should separate if complex
            } else if (modalType === 'tier') {
                url += `tiers${editData ? '/' + editData.id : ''}`
                body = itemForm
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            })

            const data = await res.json()
            if (data.success) {
                setShowModal(false)
                // Refresh data
                fetchAllData()
                if (activeTierId) fetchTierData(activeTierId)
            } else {
                alert('Error: ' + data.message)
            }

        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async (id: string, type: 'items' | 'categories' | 'tiers') => {
        if (!confirm('Are you sure?')) return
        const token = localStorage.getItem('admin_session')
        try {
            const res = await fetch(`/api/inclusions/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                fetchAllData()
                if (activeTierId) fetchTierData(activeTierId)
            }
        } catch (err) { console.error(err) }
    }

    const openItemModal = (category: Category, item?: Item) => {
        setModalType('item')
        setEditData(item || null)
        setItemForm(item ? { ...item } : {
            categoryId: category.id,
            tierId: activeTierId,
            features: [],
            title: '',
            description: '',
            imageUrl: '',
            badge: ''
        })
        setShowModal(true)
    }

    // Modal Component
    const Modal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 capitalize">
                    {editData ? 'Edit' : 'Add'} {modalType}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Common Fields */}
                    {(modalType === 'item' || modalType === 'category' || modalType === 'tier') && (
                        <div>
                            <label className="block text-sm font-bold mb-1">Name / Title</label>
                            <input
                                className="w-full border rounded p-2"
                                type="text"
                                value={itemForm.title || itemForm.name || ''}
                                onChange={e => setItemForm(prev => ({
                                    ...prev,
                                    [modalType === 'item' ? 'title' : 'name']: e.target.value
                                }))}
                                required
                            />
                        </div>
                    )}

                    {/* Category Specific */}
                    {modalType === 'category' && (
                        <div>
                            <label className="block text-sm font-bold mb-1">Headline</label>
                            <input
                                className="w-full border rounded p-2"
                                type="text"
                                value={itemForm.headline || ''}
                                onChange={e => setItemForm(prev => ({ ...prev, headline: e.target.value }))}
                            />
                        </div>
                    )}

                    {/* Item Specific */}
                    {modalType === 'item' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded p-2 h-24"
                                    value={itemForm.description || ''}
                                    onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold mb-1">Badge (Optional)</label>
                                    <input
                                        className="w-full border rounded p-2"
                                        type="text"
                                        placeholder="e.g. New Release"
                                        value={itemForm.badge || ''}
                                        onChange={e => setItemForm(prev => ({ ...prev, badge: e.target.value }))}
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-sm font-bold mb-1">Order</label>
                                    <input
                                        className="w-full border rounded p-2"
                                        type="number"
                                        value={itemForm.sortOrder || 0}
                                        onChange={e => setItemForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Features (One per line)</label>
                                <textarea
                                    className="w-full border rounded p-2 h-32 bg-gray-50 font-mono text-sm"
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                    value={Array.isArray(itemForm.features) ? itemForm.features.join('\n') : ''}
                                    onChange={e => setItemForm(prev => ({ ...prev, features: e.target.value.split('\n') }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Image</label>
                                <div className="flex items-start gap-4">
                                    {itemForm.imageUrl && (
                                        <img src={itemForm.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded border" />
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-brand-charcoal file:text-white
                                                hover:file:bg-black"
                                        />
                                        {uploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                                        <input
                                            type="hidden"
                                            value={itemForm.imageUrl || ''}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-brand-charcoal text-white rounded font-bold hover:bg-black transition-transform active:scale-95">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )

    if (loading && tiers.length === 0) return <div className="p-8 text-center text-gray-500">Loading inclusions data...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Inclusions Management</h1>
                <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                    <button
                        onClick={() => setView('content')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'content' ? 'bg-brand-charcoal text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Content
                    </button>
                    <button
                        onClick={() => setView('categories')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'categories' ? 'bg-brand-charcoal text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Categories
                    </button>
                    <button
                        onClick={() => setView('tiers')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'tiers' ? 'bg-brand-charcoal text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Tiers
                    </button>
                </div>
            </div>

            {/* Content View */}
            {view === 'content' && (
                <div className="space-y-6">
                    {/* Tier Tabs */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-max">
                        {tiers.map(tier => (
                            <button
                                key={tier.id}
                                onClick={() => setActiveTierId(tier.id)}
                                className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${activeTierId === tier.id
                                    ? 'bg-white text-brand-charcoal shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tier.name}
                            </button>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="grid gap-8">
                        {tierData.map(cat => (
                            <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-brand-charcoal">{cat.name}</h3>
                                    <button
                                        onClick={() => openItemModal(cat)}
                                        className="text-xs font-bold text-brand-teal uppercase tracking-wider flex items-center gap-1 hover:text-teal-700"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span> Add Item
                                    </button>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cat.items?.map(item => (
                                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group">
                                            {/* Actions */}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded shadow-sm">
                                                <button onClick={() => openItemModal(cat, item)} className="p-1 hover:text-blue-500"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                <button onClick={() => handleDelete(item.id, 'items')} className="p-1 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                {item.imageUrl && (
                                                    <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded bg-gray-100" />
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                                                    {item.badge && <span className="text-[10px] font-bold bg-brand-charcoal text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
                                                </div>
                                            </div>
                                            <ul className="mt-3 space-y-1">
                                                {item.features?.slice(0, 3).map((f, i) => (
                                                    <li key={i} className="text-xs text-gray-500 flex items-start gap-1">
                                                        <span className="text-brand-teal text-[10px] mt-0.5">●</span> {f}
                                                    </li>
                                                ))}
                                                {(item.features?.length || 0) > 3 && (
                                                    <li className="text-xs text-gray-400 italic">+{item.features.length - 3} more...</li>
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                    {(!cat.items || cat.items.length === 0) && (
                                        <div className="col-span-full py-8 text-center text-gray-400 text-sm italic border-dashed border-2 border-gray-100 rounded-lg">
                                            No items in this category for this tier.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories View */}
            {view === 'categories' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold">All Categories</h3>
                        <button
                            onClick={() => { setModalType('category'); setEditData(null); setItemForm({}); setShowModal(true); }}
                            className="btn-primary text-sm px-4 py-2"
                        >
                            New Category
                        </button>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Headline</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{cat.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{cat.headline}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setModalType('category'); setEditData(cat); setItemForm(cat); setShowModal(true); }}
                                                className="p-1 text-gray-400 hover:text-blue-500"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id, 'categories')}
                                                className="p-1 text-gray-400 hover:text-red-500"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && <Modal />}
        </div>
    )
}
