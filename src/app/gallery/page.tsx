'use client'

import { useState, useEffect } from 'react'

interface GalleryImage {
    id: string
    title: string
    imageUrl: string
    thumbnailUrl?: string
    category: string
    tags?: string[]
    altText?: string
    projectName?: string
    location?: string
}

const categories = [
    { id: 'all', name: 'All', icon: 'grid_view' },
    { id: 'exterior', name: 'Exterior', icon: 'home' },
    { id: 'interior', name: 'Interior', icon: 'chair' },
    { id: 'kitchen', name: 'Kitchen', icon: 'countertops' },
    { id: 'bathroom', name: 'Bathroom', icon: 'bathtub' },
    { id: 'living', name: 'Living', icon: 'weekend' },
    { id: 'bedroom', name: 'Bedroom', icon: 'bed' },
    { id: 'facade', name: 'Façades', icon: 'apartment' },
]

const placeholderImages: GalleryImage[] = [
    { id: '1', title: 'Modern Facade', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', category: 'exterior', projectName: 'The Aspen', location: 'Melbourne' },
    { id: '2', title: 'Contemporary Living', imageUrl: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80', category: 'living', projectName: 'The Birch', location: 'Sydney' },
    { id: '3', title: 'Designer Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80', category: 'kitchen', projectName: 'The Cedar', location: 'Brisbane' },
    { id: '4', title: 'Luxury Bathroom', imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', category: 'bathroom', projectName: 'The Maple', location: 'Perth' },
    { id: '5', title: 'Master Bedroom', imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', category: 'bedroom', projectName: 'The Oak', location: 'Adelaide' },
    { id: '6', title: 'Double Storey', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', category: 'facade', projectName: 'The Everest', location: 'Melbourne' },
    { id: '7', title: 'Open Plan Interior', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', category: 'interior', projectName: 'The Summit', location: 'Sydney' },
    { id: '8', title: 'Hamptons Kitchen', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', category: 'kitchen', projectName: 'The Alpine', location: 'Brisbane' },
    { id: '9', title: 'Coastal Exterior', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', category: 'exterior', projectName: 'The Pinnacle', location: 'Gold Coast' },
    { id: '10', title: 'Minimalist Living', imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80', category: 'living', projectName: 'The Vista', location: 'Melbourne' },
    { id: '11', title: 'Spa Bathroom', imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', category: 'bathroom', projectName: 'The Horizon', location: 'Sydney' },
    { id: '12', title: 'Kids Bedroom', imageUrl: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=800&q=80', category: 'bedroom', projectName: 'The Cascade', location: 'Perth' },
    { id: '13', title: 'Evening Facade', imageUrl: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=800&q=80', category: 'facade', projectName: 'The Aurora', location: 'Melbourne' },
    { id: '14', title: 'Dining Room', imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80', category: 'interior', projectName: 'The Zenith', location: 'Brisbane' },
    { id: '15', title: 'Poolside View', imageUrl: 'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=800&q=80', category: 'exterior', projectName: 'The Oasis', location: 'Gold Coast' },
    { id: '16', title: 'Gourmet Kitchen', imageUrl: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?auto=format&fit=crop&w=800&q=80', category: 'kitchen', projectName: 'The Luxe', location: 'Sydney' },
]

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>(placeholderImages)
    const [activeCategory, setActiveCategory] = useState('all')
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const apiUrl = '/api'
                const res = await fetch(`${apiUrl}/gallery/images`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.success && data.data.length > 0) {
                        setImages(data.data)
                    }
                }
            } catch (error) {
                console.error('Error fetching gallery:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchImages()
    }, [])

    const filteredImages = activeCategory === 'all'
        ? images
        : images.filter(img => img.category === activeCategory)

    const handlePrev = () => {
        if (!selectedImage) return
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1
        setSelectedImage(filteredImages[prevIndex])
    }

    const handleNext = () => {
        if (!selectedImage) return
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id)
        const nextIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0
        setSelectedImage(filteredImages[nextIndex])
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="relative bg-deep-slate text-white pt-8 pb-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4">Image Gallery</h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Browse our collection of stunning homes, interiors, and architectural inspiration.
                    </p>
                </div>
            </section>

            {/* Category Filters */}
            <section className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                    {filteredImages.map((img, index) => (
                        <div
                            key={img.id}
                            className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                            onClick={() => setSelectedImage(img)}
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={img.imageUrl}
                                    alt={img.altText || img.title}
                                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${index % 5 === 0 ? 'h-80' : index % 3 === 0 ? 'h-64' : 'h-48'
                                        }`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                    <p className="text-white font-medium">{img.title}</p>
                                    {img.projectName && (
                                        <p className="text-white/70 text-sm">{img.projectName}</p>
                                    )}
                                </div>
                                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                                    <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredImages.length === 0 && (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">image_not_supported</span>
                        <p className="text-gray-500">No images found in this category.</p>
                    </div>
                )}
            </main>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>

                    {/* Prev Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                    </button>

                    {/* Image */}
                    <div
                        className="max-w-5xl max-h-[85vh] px-16"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.altText || selectedImage.title}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="text-center mt-4">
                            <h3 className="text-white text-xl font-medium">{selectedImage.title}</h3>
                            {(selectedImage.projectName || selectedImage.location) && (
                                <p className="text-white/60 text-sm mt-1">
                                    {selectedImage.projectName}{selectedImage.location && ` • ${selectedImage.location}`}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                        {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
                    </div>
                </div>
            )}
        </div>
    )
}
