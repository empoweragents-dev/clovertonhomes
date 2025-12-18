'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface InteriorScheme {
    id: string
    name: string
    slug: string
    tagline: string
    description: string
    heroImage: string
    colorPalette: { name: string; hex: string }[]
    materials: { name: string; imageUrl: string; description?: string }[]
    rooms: { name: string; imageUrl: string; description?: string }[]
    features: string[]
}

const placeholderSchemes: InteriorScheme[] = [
    {
        id: '1',
        name: 'Coastal',
        slug: 'coastal',
        tagline: 'Relaxed beachside living',
        description: 'Inspired by the Australian coastline, our Coastal scheme brings the calm of the ocean into your home. Light timbers, soft blues, and natural textures create a serene sanctuary that feels like a permanent vacation. Perfect for families who love the beach lifestyle.',
        heroImage: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80',
        colorPalette: [
            { name: 'Ocean Blue', hex: '#5B9BD5' },
            { name: 'Sandy Beige', hex: '#E8DCC8' },
            { name: 'Driftwood', hex: '#A69076' },
            { name: 'Sea Foam', hex: '#B8D4CE' },
            { name: 'White Wash', hex: '#F5F5F5' },
        ],
        materials: [
            { name: 'Whitewashed Oak Flooring', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', description: 'Light oak timber flooring with a whitewashed finish' },
            { name: 'Natural Rattan', imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=400&q=80', description: 'Handwoven rattan accents and furniture' },
            { name: 'White Shaker Cabinetry', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80', description: 'Classic shaker-style cabinets in crisp white' },
            { name: 'Carrara Marble', imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', description: 'Elegant white marble with subtle grey veining' },
        ],
        rooms: [
            { name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=600&q=80', description: 'Open plan living with ocean-inspired tones' },
            { name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80', description: 'Light and airy kitchen with white cabinetry' },
            { name: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80', description: 'Tranquil master suite with coastal palette' },
        ],
        features: ['Light timber flooring', 'Natural textures', 'Soft blue accents', 'Shaker cabinetry', 'Marble benchtops', 'Rattan features'],
    },
    {
        id: '2',
        name: 'Modern Luxe',
        slug: 'modern-luxe',
        tagline: 'Contemporary sophistication',
        description: 'For those who appreciate the finer things, Modern Luxe delivers uncompromising elegance. Dark timbers, bold marble statements, and metallic accents create spaces that feel like a five-star hotel. Every detail is considered, every finish is premium.',
        heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        colorPalette: [
            { name: 'Charcoal', hex: '#2C3E50' },
            { name: 'Champagne Gold', hex: '#D4AF37' },
            { name: 'Pure White', hex: '#FFFFFF' },
            { name: 'Slate Grey', hex: '#708090' },
            { name: 'Black', hex: '#1A1A1A' },
        ],
        materials: [
            { name: 'Dark Walnut Flooring', imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=400&q=80', description: 'Rich dark walnut engineered timber' },
            { name: 'Nero Marquina Marble', imageUrl: 'https://images.unsplash.com/photo-1618221941244-2acb99e5be67?auto=format&fit=crop&w=400&q=80', description: 'Bold black marble with white veining' },
            { name: 'Brushed Brass', imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=400&q=80', description: 'Warm brass tapware and hardware' },
            { name: 'Polyurethane Cabinetry', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80', description: 'Sleek two-pack finish in charcoal' },
        ],
        rooms: [
            { name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80', description: 'Dramatic living space with statement finishes' },
            { name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80', description: 'Luxurious kitchen with marble island' },
            { name: 'Bathroom', imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80', description: 'Spa-like ensuite with brass accents' },
        ],
        features: ['Dark timber flooring', 'Marble statements', 'Brass accents', 'Designer lighting', 'Premium appliances', 'Custom joinery'],
    },
    {
        id: '3',
        name: 'Hamptons',
        slug: 'hamptons',
        tagline: 'Timeless American elegance',
        description: 'Inspired by the grand estates of New York Hamptons, this scheme brings refined coastal elegance to Australian shores. Crisp whites, navy blues, and classic details create spaces that are both comfortable and sophisticated. Perfect for those who love traditional style with a fresh twist.',
        heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        colorPalette: [
            { name: 'Navy Blue', hex: '#1E3A5F' },
            { name: 'Crisp White', hex: '#FFFFFF' },
            { name: 'French Grey', hex: '#B0B7BF' },
            { name: 'Pale Blue', hex: '#C5D5E4' },
            { name: 'Natural Linen', hex: '#E8E4DE' },
        ],
        materials: [
            { name: 'American Oak Flooring', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', description: 'Wide plank American oak in natural finish' },
            { name: 'Shaker Cabinetry', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=400&q=80', description: 'Classic shaker doors in white satin' },
            { name: 'Marble Herringbone', imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', description: 'White marble herringbone splashback' },
            { name: 'Polished Nickel', imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=400&q=80', description: 'Traditional nickel tapware and hardware' },
        ],
        rooms: [
            { name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', description: 'Grand living with coffered ceilings' },
            { name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80', description: 'Classic white kitchen with butler pantry' },
            { name: 'Bedroom', imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80', description: 'Elegant master with navy accents' },
        ],
        features: ['Wide plank oak floors', 'Shaker cabinetry', 'Marble benchtops', 'Coffered ceilings', 'Wainscoting', 'Nickel hardware'],
    },
    {
        id: '4',
        name: 'Industrial',
        slug: 'industrial',
        tagline: 'Urban warehouse aesthetic',
        description: 'Raw, authentic, and full of character. Our Industrial scheme celebrates exposed elements, reclaimed materials, and the beauty of imperfection. Concrete, steel, and reclaimed timber come together to create spaces with serious street cred.',
        heroImage: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
        colorPalette: [
            { name: 'Concrete Grey', hex: '#6B7280' },
            { name: 'Rust Orange', hex: '#B7410E' },
            { name: 'Matte Black', hex: '#1C1C1C' },
            { name: 'Raw Timber', hex: '#8B7355' },
            { name: 'Brick Red', hex: '#9B3D3D' },
        ],
        materials: [
            { name: 'Polished Concrete', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', description: 'Burnished concrete flooring with natural aggregate' },
            { name: 'Reclaimed Timber', imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=400&q=80', description: 'Salvaged timber with character marks' },
            { name: 'Black Steel', imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=400&q=80', description: 'Matte black steel frames and fixtures' },
            { name: 'Exposed Brick', imageUrl: 'https://images.unsplash.com/photo-1618221941244-2acb99e5be67?auto=format&fit=crop&w=400&q=80', description: 'Feature walls in raw brick' },
        ],
        rooms: [
            { name: 'Living Room', imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80', description: 'Loft-style living with exposed structure' },
            { name: 'Kitchen', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80', description: 'Industrial kitchen with concrete island' },
            { name: 'Bathroom', imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80', description: 'Raw bathroom with exposed plumbing' },
        ],
        features: ['Polished concrete floors', 'Exposed steel', 'Reclaimed timber', 'Edison lighting', 'Matte black fixtures', 'Raw textures'],
    },
]

export default function InteriorsPage() {
    const [schemes, setSchemes] = useState<InteriorScheme[]>(placeholderSchemes)
    const [selectedScheme, setSelectedScheme] = useState<InteriorScheme | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const apiUrl = '/api'
                const res = await fetch(`${apiUrl}/gallery/schemes`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.success && data.data.length > 0) {
                        setSchemes(data.data)
                    }
                }
            } catch (error) {
                console.error('Error fetching schemes:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSchemes()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="relative bg-deep-slate text-white pt-8 pb-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4">Interior Schemes</h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Discover our curated interior design schemes. Each collection has been carefully crafted by our design team to create cohesive, stunning interiors.
                    </p>
                </div>
            </section>

            {/* Scheme Cards */}
            <main className="max-w-7xl mx-auto px-6 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {schemes.map(scheme => (
                        <div
                            key={scheme.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                            onClick={() => setSelectedScheme(scheme)}
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={scheme.heroImage}
                                    alt={scheme.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <p className="text-primary font-medium text-sm mb-1">{scheme.tagline}</p>
                                    <h2 className="text-2xl font-bold text-white font-heading">{scheme.name}</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 line-clamp-2 mb-4">{scheme.description}</p>

                                {/* Color Palette Preview */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm text-gray-500">Colors:</span>
                                    <div className="flex gap-1">
                                        {scheme.colorPalette.slice(0, 5).map((color, i) => (
                                            <div
                                                key={i}
                                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        {scheme.features?.slice(0, 3).map((feature, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Explore
                                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Detail Modal */}
            {selectedScheme && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
                    onClick={() => setSelectedScheme(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Hero */}
                        <div className="relative h-72 sm:h-96">
                            <img
                                src={selectedScheme.heroImage}
                                alt={selectedScheme.name}
                                className="w-full h-full object-cover rounded-t-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-t-2xl" />
                            <button
                                onClick={() => setSelectedScheme(null)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-charcoal flex items-center justify-center hover:bg-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-primary font-medium mb-1">{selectedScheme.tagline}</p>
                                <h2 className="text-3xl font-bold text-white font-heading">{selectedScheme.name}</h2>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Description */}
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">{selectedScheme.description}</p>

                            {/* Color Palette */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-charcoal font-heading mb-4">Color Palette</h3>
                                <div className="flex flex-wrap gap-4">
                                    {selectedScheme.colorPalette.map((color, i) => (
                                        <div key={i} className="text-center">
                                            <div
                                                className="w-16 h-16 rounded-xl shadow-md mb-2"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <p className="text-xs text-gray-600">{color.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Materials */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-charcoal font-heading mb-4">Key Materials</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {selectedScheme.materials.map((material, i) => (
                                        <div key={i} className="bg-gray-50 rounded-xl overflow-hidden">
                                            <img
                                                src={material.imageUrl}
                                                alt={material.name}
                                                className="w-full h-24 object-cover"
                                            />
                                            <div className="p-3">
                                                <p className="text-sm font-medium text-charcoal">{material.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Room Inspiration */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-charcoal font-heading mb-4">Room Inspiration</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {selectedScheme.rooms.map((room, i) => (
                                        <div key={i} className="relative rounded-xl overflow-hidden group">
                                            <img
                                                src={room.imageUrl}
                                                alt={room.name}
                                                className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-3 left-3">
                                                <p className="text-white font-medium text-sm">{room.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-charcoal font-heading mb-4">Scheme Features</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {selectedScheme.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex gap-4">
                                <Link
                                    href="/studio"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Design Your Home
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Speak to a Designer
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <section className="bg-white py-20 px-6 mt-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold font-heading text-charcoal mb-4">Can't Decide?</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Book a consultation with our interior design team and we'll help you find the perfect scheme for your lifestyle.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-deep-slate text-white rounded-full font-bold hover:bg-charcoal transition-colors"
                    >
                        Book a Consultation
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>
            </section>
        </div>
    )
}
