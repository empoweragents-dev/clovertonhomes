'use client'

import { useState, useEffect } from 'react'

interface Enquiry {
    id: string
    name: string
    email: string
    phone: string
    message: string
    type: string
    status: string
    createdAt: string
}

export default function AdminEnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'closed'>('all')

    useEffect(() => {
        fetchEnquiries()
    }, [])

    const fetchEnquiries = async () => {
        try {
            const res = await fetch('/api/enquiries')
            const data = await res.json()
            if (data.success) {
                setEnquiries(data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch enquiries:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-green-100 text-green-700'
            case 'contacted': return 'bg-blue-100 text-blue-700'
            case 'closed': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const filteredEnquiries = filter === 'all'
        ? enquiries
        : enquiries.filter(e => e.status === filter)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Enquiries</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage customer enquiries and contact requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`bg-white rounded-xl p-4 border text-left transition-all ${filter === 'all' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <p className="text-gray-500 text-sm">Total Enquiries</p>
                    <p className="text-2xl font-bold text-gray-800">{enquiries.length}</p>
                </button>
                <button
                    onClick={() => setFilter('new')}
                    className={`bg-white rounded-xl p-4 border text-left transition-all ${filter === 'new' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <p className="text-gray-500 text-sm">New</p>
                    <p className="text-2xl font-bold text-green-600">{enquiries.filter(e => e.status === 'new').length}</p>
                </button>
                <button
                    onClick={() => setFilter('contacted')}
                    className={`bg-white rounded-xl p-4 border text-left transition-all ${filter === 'contacted' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <p className="text-gray-500 text-sm">Contacted</p>
                    <p className="text-2xl font-bold text-blue-600">{enquiries.filter(e => e.status === 'contacted').length}</p>
                </button>
                <button
                    onClick={() => setFilter('closed')}
                    className={`bg-white rounded-xl p-4 border text-left transition-all ${filter === 'closed' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <p className="text-gray-500 text-sm">Closed</p>
                    <p className="text-2xl font-bold text-gray-600">{enquiries.filter(e => e.status === 'closed').length}</p>
                </button>
            </div>

            {/* Enquiries List */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading enquiries...</p>
                    </div>
                ) : filteredEnquiries.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inbox</span>
                        <h3 className="text-lg font-bold text-gray-600 mb-2">No Enquiries Found</h3>
                        <p className="text-gray-500">
                            {filter === 'all'
                                ? 'Enquiries from your contact forms will appear here.'
                                : `No ${filter} enquiries at the moment.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredEnquiries.map((enquiry) => (
                            <div key={enquiry.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900">{enquiry.name}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusColor(enquiry.status)}`}>
                                                {enquiry.status}
                                            </span>
                                            {enquiry.type && (
                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 capitalize">
                                                    {enquiry.type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">mail</span>
                                                {enquiry.email}
                                            </span>
                                            {enquiry.phone && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">call</span>
                                                    {enquiry.phone}
                                                </span>
                                            )}
                                        </div>
                                        {enquiry.message && (
                                            <p className="text-gray-600 text-sm line-clamp-2">{enquiry.message}</p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-gray-400">{enquiry.createdAt ? formatDate(enquiry.createdAt) : '-'}</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <button className="p-1 text-gray-400 hover:text-blue-500" title="View details">
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-green-500" title="Mark as contacted">
                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-red-500" title="Delete">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
