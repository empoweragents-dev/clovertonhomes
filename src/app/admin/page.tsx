
'use client'

import { useState, useEffect } from 'react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        properties: 0,
        designs: 0,
        enquiries: 0 // Placeholder
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real app we'd have a specific stats endpoint or fetch counts in parallel
                // Just fetching one endpoint for demo of connectivity
                const res = await fetch(`/api/properties`)
                const data = await res.json()

                // Also fetch designs
                const desRes = await fetch(`/api/designs`)
                const desData = await desRes.json()

                setStats({
                    properties: data.total || 0,
                    designs: desData.total || 0,
                    enquiries: 12 // Mock data
                })
            } catch (err) {
                console.error('Failed to fetch stats')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <div>Loading dashboard...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-900">Dashboard Overview</h1>
                <div className="text-sm text-gray-500">
                    Welcome back, Admin
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <span className="material-symbols-outlined text-2xl">real_estate_agent</span>
                        </div>
                        <span className="text-gray-400 text-sm">Total Properties</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.properties}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">+2 added this week</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <span className="material-symbols-outlined text-2xl">architecture</span>
                        </div>
                        <span className="text-gray-400 text-sm">Home Designs</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.designs}</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">Active designs</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <span className="material-symbols-outlined text-2xl">mail</span>
                        </div>
                        <span className="text-gray-400 text-sm">New Enquiries</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.enquiries}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">+5 since yesterday</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center py-20">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400">
                    <span className="material-symbols-outlined text-3xl">bar_chart</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Analytics Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                    Detailed analytics and reporting features will be available in the next update.
                </p>
            </div>
        </div>
    )
}
