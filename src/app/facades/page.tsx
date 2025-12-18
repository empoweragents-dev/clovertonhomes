'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Facade {
    id: string
    name: string
    slug: string
    type: 'single' | 'double'
    style: string
    imageUrl: string
    description: string
    features: string[]
}

const placeholderFacades: Facade[] = [
    { id: '1', name: 'Contemporary', slug: 'contemporary', type: 'single', style: 'modern', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', description: 'Clean lines, minimal ornamentation, and a focus on functionality define our Contemporary facade. Featuring rendered walls, large format windows, and flat roof elements.', features: ['Flat roof design', 'Large windows', 'Rendered finish', 'Feature entry door'] },
    { id: '2', name: 'Classic', slug: 'classic', type: 'single', style: 'traditional', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', description: 'Timeless elegance with traditional proportions. Our Classic facade features pitched rooflines, portico entries, and brick veneer finishes that never go out of style.', features: ['Pitched roof', 'Portico entry', 'Brick veneer', 'Feature chimney'] },
    { id: '3', name: 'Hamptons', slug: 'hamptons', type: 'single', style: 'coastal', imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', description: 'Coastal charm meets refined elegance. The Hamptons facade brings beach house vibes with weatherboard cladding, wrap-around verandahs, and crisp white trim.', features: ['Weatherboard cladding', 'Wrap-around verandah', 'White trim', 'Gabled roof'] },
    { id: '4', name: 'Urban Edge', slug: 'urban-edge', type: 'single', style: 'modern', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', description: 'Industrial-inspired design with bold geometric forms. Metal cladding accents, dramatic entry features, and a strong street presence define this modern facade.', features: ['Metal cladding', 'Feature entry', 'Bold colors', 'Geometric forms'] },
    { id: '5', name: 'Provincial', slug: 'provincial', type: 'single', style: 'traditional', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', description: 'French country elegance with romantic details. Arched windows, stone accents, and terracotta roof tiles create a warm, Mediterranean-inspired facade.', features: ['Arched windows', 'Stone accents', 'Terracotta roof', 'French doors'] },
    { id: '6', name: 'Modern Luxe', slug: 'modern-luxe', type: 'double', style: 'modern', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', description: 'The pinnacle of contemporary luxury. Floor-to-ceiling glass, floating roof elements, and premium finishes create a statement-making double storey facade.', features: ['Floor to ceiling glass', 'Floating roof', 'Designer entry', 'Feature lighting'] },
    { id: '7', name: 'Heritage', slug: 'heritage', type: 'double', style: 'traditional', imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', description: 'Victorian-inspired grandeur for the modern family. Lacework detailing, bullnose verandahs, and federation color palettes honor Australia heritage.', features: ['Lacework detailing', 'Bullnose verandah', 'Federation colors', 'Period features'] },
    { id: '8', name: 'Coastal Modern', slug: 'coastal-modern', type: 'double', style: 'coastal', imageUrl: 'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&q=80', description: 'Beach house luxury meets contemporary design. Timber cladding, expansive balconies, and louvered screens capture ocean breezes and stunning views.', features: ['Timber cladding', 'Large balcony', 'Louvered screens', 'Open design'] },
    { id: '9', name: 'Prestige', slug: 'prestige', type: 'double', style: 'modern', imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80', description: 'A statement of success and style. Double-height entries, dramatic lighting features, and premium rendered finishes create an unforgettable first impression.', features: ['Double height entry', 'Feature lighting', 'Premium render', 'Grand proportions'] },
    { id: '10', name: 'Malibu', slug: 'malibu', type: 'double', style: 'coastal', imageUrl: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=800&q=80', description: 'California dreaming brought to life. White rendered walls, blue accent features, and resort-style landscaping create the ultimate lifestyle facade.', features: ['White render', 'Blue accents', 'Palm landscaping', 'California style'] },
]

export default function FacadesPage() {
    const [facades, setFacades] = useState<Facade[]>(placeholderFacades)
    const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'double'>('all')
    const [styleFilter, setStyleFilter] = useState<'all' | 'modern' | 'traditional' | 'coastal'>('all')
    const [selectedFacade, setSelectedFacade] = useState<Facade | null>(null)

    useEffect(() => {
        const fetchFacades = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
                const res = await fetch(`${apiUrl}/studio/facades`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.success && data.data.length > 0) {
                        setFacades(data.data)
                    }
                }
            } catch (error) {
                console.error('Error fetching facades:', error)
            }
        }
        fetchFacades()
    }, [])

    const filteredFacades = facades.filter(f => {
        const typeMatch = typeFilter === 'all' || f.type === typeFilter
        const styleMatch = styleFilter === 'all' || f.style === styleFilter
        return typeMatch && styleMatch
    })

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="relative bg-deep-slate text-white pt-8 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4">Façade Gallery</h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Explore our stunning range of architectural facades. From contemporary to classic, find the perfect exterior style for your dream home.
                    </p>
                </div>
            </section>

            {/* Filters */}
            <section className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <span className="text-sm text-gray-500 self-center mr-2">Type:</span>
                            {(['all', 'single', 'double'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setTypeFilter(filter)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === filter
                                        ? 'bg-charcoal text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {filter === 'all' ? 'All' : filter === 'single' ? 'Single Storey' : 'Double Storey'}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <span className="text-sm text-gray-500 self-center mr-2">Style:</span>
                            {(['all', 'modern', 'traditional', 'coastal'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setStyleFilter(filter)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${styleFilter === filter
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {filter === 'all' ? 'All Styles' : filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredFacades.map(facade => (
                        <div
                            key={facade.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                            onClick={() => setSelectedFacade(facade)}
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={facade.imageUrl}
                                    alt={facade.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${facade.type === 'single' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {facade.type === 'single' ? 'Single' : 'Double'}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-charcoal capitalize">
                                        {facade.style}
                                    </span>
                                </div>
                                <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                                </button>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-charcoal font-heading mb-2">{facade.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{facade.description}</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {facade.features?.slice(0, 3).map((feature, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredFacades.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No facades found matching your filters.</p>
                    </div>
                )}
            </main>

            {/* Modal */}
            {selectedFacade && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setSelectedFacade(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-64 sm:h-80">
                            <img
                                src={selectedFacade.imageUrl}
                                alt={selectedFacade.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelectedFacade(null)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-charcoal flex items-center justify-center hover:bg-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="flex gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedFacade.type === 'single' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {selectedFacade.type === 'single' ? 'Single Storey' : 'Double Storey'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-charcoal capitalize">
                                    {selectedFacade.style}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-charcoal font-heading mb-4">{selectedFacade.name}</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">{selectedFacade.description}</p>

                            <h3 className="text-sm font-bold text-charcoal uppercase tracking-wide mb-3">Key Features</h3>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {selectedFacade.features?.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/studio"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors"
                            >
                                Design Your Home
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <section className="bg-deep-slate text-white py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4">Ready to Design Your Dream Facade?</h2>
                    <p className="text-gray-300 mb-8">Use our Design Studio to combine your favorite facade with a floor plan and inclusions.</p>
                    <Link
                        href="/studio"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors"
                    >
                        Start Designing
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>
            </section>
        </div>
    )
}
