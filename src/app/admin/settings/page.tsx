'use client'

import { useState } from 'react'

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'seo'>('general')

    const handleSave = async () => {
        setSaving(true)
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
        alert('Settings saved successfully!')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure your website settings</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'general'
                                ? 'text-primary border-primary'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'contact'
                                ? 'text-primary border-primary'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        Contact Info
                    </button>
                    <button
                        onClick={() => setActiveTab('seo')}
                        className={`pb-4 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'seo'
                                ? 'text-primary border-primary'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        SEO
                    </button>
                </nav>
            </div>

            {/* Settings Content */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">General Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    defaultValue="Cloverton Homes"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                                <input
                                    type="text"
                                    defaultValue="Premium Residential Builder"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">About Company</label>
                            <textarea
                                rows={4}
                                defaultValue="Building detailed, quality homes that stand the test of time."
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    defaultValue="1300 000 000"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    defaultValue="info@cloverton.com.au"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Office Address</label>
                            <textarea
                                rows={2}
                                defaultValue="123 Builder Street, Sydney NSW 2000"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        <h3 className="text-md font-bold text-gray-800 mt-8 mb-4">Social Media Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                                <input
                                    type="url"
                                    placeholder="https://facebook.com/yourpage"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                                <input
                                    type="url"
                                    placeholder="https://instagram.com/yourpage"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">SEO Settings</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                            <input
                                type="text"
                                defaultValue="Cloverton Homes - Premium Residential Builder"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <p className="text-xs text-gray-400 mt-1">Recommended: 50-60 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                            <textarea
                                rows={3}
                                defaultValue="Build with confidence. Certified and trusted residential builder creating quality homes in Australia."
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <p className="text-xs text-gray-400 mt-1">Recommended: 150-160 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                            <input
                                type="text"
                                defaultValue="home builder, new homes, house and land, custom homes"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <p className="text-xs text-gray-400 mt-1">Separate keywords with commas</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
