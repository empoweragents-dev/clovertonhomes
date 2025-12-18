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
}

// Placeholder data - will be replaced with API data
// Using architectural floor plan style images
const placeholderFloorPlans: FloorPlan[] = [
    { id: '1', name: 'The Aspen 240', slug: 'aspen-240', type: 'single', bedrooms: 4, bathrooms: 2, garages: 2, squareMeters: 240, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Modern single storey family home', features: ['Open plan living', 'Theatre room', 'Walk-in pantry'] },
    { id: '2', name: 'The Birch 280', slug: 'birch-280', type: 'single', bedrooms: 4, bathrooms: 2, garages: 2, squareMeters: 280, imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Spacious single storey with alfresco', features: ['Alfresco dining', 'Butler pantry', 'Master retreat'] },
    { id: '3', name: 'The Cedar 320', slug: 'cedar-320', type: 'single', bedrooms: 5, bathrooms: 2, garages: 2, squareMeters: 320, imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Large single storey with study', features: ['Home office', '5th bedroom', 'Double garage'] },
    { id: '4', name: 'The Maple 260', slug: 'maple-260', type: 'single', bedrooms: 4, bathrooms: 2, garages: 2, squareMeters: 260, imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Elegant single storey design', features: ['Formal lounge', 'Games room', 'Covered alfresco'] },
    { id: '5', name: 'The Oak 300', slug: 'oak-300', type: 'single', bedrooms: 4, bathrooms: 3, garages: 2, squareMeters: 300, imageUrl: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Premium single storey with ensuite', features: ['Master ensuite', 'Powder room', 'Triple garage option'] },
    { id: '6', name: 'The Everest 380', slug: 'everest-380', type: 'double', bedrooms: 5, bathrooms: 3, garages: 2, squareMeters: 380, imageUrl: 'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Grand double storey family home', features: ['Upstairs retreat', 'Double master', 'Void to entry'] },
    { id: '7', name: 'The Summit 420', slug: 'summit-420', type: 'double', bedrooms: 5, bathrooms: 4, garages: 2, squareMeters: 420, imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Luxury double storey estate', features: ['Guest suite', 'Rumpus room', 'Study nook'] },
    { id: '8', name: 'The Alpine 360', slug: 'alpine-360', type: 'double', bedrooms: 4, bathrooms: 3, garages: 2, squareMeters: 360, imageUrl: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Contemporary double storey', features: ['Balcony', 'Kids activity area', 'Butlers pantry'] },
    { id: '9', name: 'The Pinnacle 450', slug: 'pinnacle-450', type: 'double', bedrooms: 6, bathrooms: 4, garages: 3, squareMeters: 450, imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Ultimate double storey mansion', features: ['6 bedrooms', 'Triple garage', 'Home theatre'] },
    { id: '10', name: 'The Vista 340', slug: 'vista-340', type: 'double', bedrooms: 4, bathrooms: 2, garages: 2, squareMeters: 340, imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80', floorPlanImage: '', description: 'Smart double storey design', features: ['Upstairs living', 'Ground floor master', 'Covered porch'] },
]

const placeholderFacades: Facade[] = [
    { id: '1', name: 'Contemporary', slug: 'contemporary', type: 'single', style: 'modern', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', description: 'Clean lines and modern finishes', features: ['Flat roof', 'Large windows', 'Rendered finish'] },
    { id: '2', name: 'Classic', slug: 'classic', type: 'single', style: 'traditional', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', description: 'Timeless elegance', features: ['Pitched roof', 'Portico entry', 'Brick veneer'] },
    { id: '3', name: 'Hamptons', slug: 'hamptons', type: 'single', style: 'coastal', imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', description: 'Coastal charm', features: ['Weatherboard', 'Wrap-around verandah', 'White trim'] },
    { id: '4', name: 'Urban Edge', slug: 'urban-edge', type: 'single', style: 'modern', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', description: 'Industrial inspired', features: ['Metal cladding', 'Feature entry', 'Bold colors'] },
    { id: '5', name: 'Provincial', slug: 'provincial', type: 'single', style: 'traditional', imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', description: 'French country', features: ['Arched windows', 'Stone accents', 'Terracotta roof'] },
    { id: '6', name: 'Modern Luxe', slug: 'modern-luxe', type: 'double', style: 'modern', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', description: 'Premium finishes', features: ['Floor to ceiling glass', 'Floating roof', 'Designer entry'] },
    { id: '7', name: 'Heritage', slug: 'heritage', type: 'double', style: 'traditional', imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', description: 'Victorian inspired', features: ['Lacework detailing', 'Bullnose verandah', 'Federation colors'] },
    { id: '8', name: 'Coastal Modern', slug: 'coastal-modern', type: 'double', style: 'coastal', imageUrl: 'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&q=80', description: 'Beach house luxury', features: ['Timber cladding', 'Large balcony', 'Louvered screens'] },
    { id: '9', name: 'Prestige', slug: 'prestige', type: 'double', style: 'modern', imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80', description: 'Statement design', features: ['Double height entry', 'Feature lighting', 'Premium render'] },
    { id: '10', name: 'Malibu', slug: 'malibu', type: 'double', style: 'coastal', imageUrl: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=800&q=80', description: 'California dreaming', features: ['White render', 'Blue accents', 'Palm landscaping'] },
]

const inclusionTiers = [
    { id: 'standard', name: 'Standard', description: 'Quality essentials for comfortable living', color: 'bg-gray-100' },
    { id: 'designer', name: 'Designer', description: 'Elevated finishes for stylish homes', color: 'bg-blue-100' },
    { id: 'premium', name: 'Premium', description: 'Luxurious upgrades for exceptional living', color: 'bg-amber-100' },
]

export default function DesignStudioPage() {
    const [step, setStep] = useState(1)
    const [floorPlans, setFloorPlans] = useState<FloorPlan[]>(placeholderFloorPlans)
    const [facades, setFacades] = useState<Facade[]>(placeholderFacades)
    const [floorPlanFilter, setFloorPlanFilter] = useState<'all' | 'single' | 'double'>('all')
    const [facadeFilter, setFacadeFilter] = useState<'all' | 'single' | 'double'>('all')

    const [selectedFloorPlan, setSelectedFloorPlan] = useState<FloorPlan | null>(null)
    const [selectedFacade, setSelectedFacade] = useState<Facade | null>(null)
    const [selectedTier, setSelectedTier] = useState<string>('designer')
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        email: '',
        phone: '',
        landAddress: '',
        comments: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = '/api'

                const [floorPlanRes, facadeRes] = await Promise.all([
                    fetch(`${apiUrl}/studio/floor-plans`),
                    fetch(`${apiUrl}/studio/facades`),
                ])

                if (floorPlanRes.ok) {
                    const fpData = await floorPlanRes.json()
                    if (fpData.success && fpData.data.length > 0) {
                        setFloorPlans(fpData.data)
                    }
                }

                if (facadeRes.ok) {
                    const fcData = await facadeRes.json()
                    if (fcData.success && fcData.data.length > 0) {
                        setFacades(fcData.data)
                    }
                }
            } catch (error) {
                console.error('Error fetching studio data:', error)
                // Keep placeholder data on error
            }
        }
        fetchData()
    }, [])

    const filteredFloorPlans = floorPlanFilter === 'all'
        ? floorPlans
        : floorPlans.filter(fp => fp.type === floorPlanFilter)

    const filteredFacades = facadeFilter === 'all'
        ? facades
        : facades.filter(f => f.type === facadeFilter)

    // Handler for floor plan selection - auto advances to next step
    const handleFloorPlanSelect = (fp: FloorPlan) => {
        setSelectedFloorPlan(fp)
        setTimeout(() => setStep(2), 300) // Small delay for visual feedback
    }

    // Handler for facade selection - auto advances to next step
    const handleFacadeSelect = (facade: Facade) => {
        setSelectedFacade(facade)
        setTimeout(() => setStep(3), 300)
    }

    // Handler for inclusion tier selection - auto advances to next step
    const handleTierSelect = (tierId: string) => {
        setSelectedTier(tierId)
        setTimeout(() => setStep(4), 300)
    }

    const handleSubmit = async () => {
        if (!customerDetails.name || !customerDetails.email) {
            alert('Please fill in your name and email')
            return
        }

        setIsSubmitting(true)

        try {
            const apiUrl = '/api'
            const res = await fetch(`${apiUrl}/studio/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    floorPlanId: selectedFloorPlan?.id,
                    facadeId: selectedFacade?.id,
                    inclusionTier: selectedTier,
                    customerName: customerDetails.name,
                    customerEmail: customerDetails.email,
                    customerPhone: customerDetails.phone,
                    landAddress: customerDetails.landAddress,
                    comments: customerDetails.comments,
                }),
            })

            if (res.ok) {
                setIsSubmitted(true)
                // Generate PDF
                generatePDF()
            } else {
                alert('Failed to submit. Please try again.')
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Failed to submit. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const generatePDF = async () => {
        // Dynamic import for client-side only
        const { jsPDF } = await import('jspdf')

        const doc = new jsPDF()

        // Header
        doc.setFontSize(24)
        doc.setTextColor(40, 62, 80)
        doc.text('CLOVERTON HOMES', 105, 30, { align: 'center' })

        doc.setFontSize(12)
        doc.setTextColor(100)
        doc.text('Your Custom Home Design', 105, 40, { align: 'center' })

        // Line
        doc.setDrawColor(229, 115, 16)
        doc.setLineWidth(2)
        doc.line(20, 50, 190, 50)

        // Customer Details
        doc.setFontSize(14)
        doc.setTextColor(40, 62, 80)
        doc.text('Customer Details', 20, 65)

        doc.setFontSize(11)
        doc.setTextColor(60)
        doc.text(`Name: ${customerDetails.name}`, 20, 75)
        doc.text(`Email: ${customerDetails.email}`, 20, 82)
        doc.text(`Phone: ${customerDetails.phone || 'Not provided'}`, 20, 89)
        doc.text(`Land Address: ${customerDetails.landAddress || 'Not provided'}`, 20, 96)

        // Floor Plan
        doc.setFontSize(14)
        doc.setTextColor(40, 62, 80)
        doc.text('Selected Floor Plan', 20, 115)

        doc.setFontSize(11)
        doc.setTextColor(60)
        if (selectedFloorPlan) {
            doc.text(`${selectedFloorPlan.name}`, 20, 125)
            doc.text(`Type: ${selectedFloorPlan.type === 'single' ? 'Single Storey' : 'Double Storey'}`, 20, 132)
            doc.text(`Size: ${selectedFloorPlan.squareMeters}m² | ${selectedFloorPlan.bedrooms} Bed | ${selectedFloorPlan.bathrooms} Bath | ${selectedFloorPlan.garages} Garage`, 20, 139)
        }

        // Facade
        doc.setFontSize(14)
        doc.setTextColor(40, 62, 80)
        doc.text('Selected Facade', 20, 158)

        doc.setFontSize(11)
        doc.setTextColor(60)
        if (selectedFacade) {
            doc.text(`${selectedFacade.name}`, 20, 168)
            doc.text(`Style: ${selectedFacade.style}`, 20, 175)
        }

        // Inclusion Tier
        doc.setFontSize(14)
        doc.setTextColor(40, 62, 80)
        doc.text('Inclusion Tier', 20, 194)

        doc.setFontSize(11)
        doc.setTextColor(60)
        const tierName = inclusionTiers.find(t => t.id === selectedTier)?.name || selectedTier
        doc.text(`${tierName}`, 20, 204)

        // Comments
        if (customerDetails.comments) {
            doc.setFontSize(14)
            doc.setTextColor(40, 62, 80)
            doc.text('Additional Comments', 20, 223)

            doc.setFontSize(10)
            doc.setTextColor(60)
            const splitComments = doc.splitTextToSize(customerDetails.comments, 170)
            doc.text(splitComments, 20, 233)
        }

        // Footer
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text('Cloverton Homes | 1300 000 000 | info@cloverton.com.au', 105, 280, { align: 'center' })
        doc.text('www.clovertonhomes.com.au', 105, 287, { align: 'center' })

        // Save
        doc.save('cloverton-home-design.pdf')
    }

    const steps = [
        { num: 1, title: 'Floor Plan' },
        { num: 2, title: 'Facade' },
        { num: 3, title: 'Inclusions' },
        { num: 4, title: 'Details' },
        { num: 5, title: 'Review' },
    ]

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-lg text-center bg-white rounded-2xl p-10 shadow-xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
                    </div>
                    <h1 className="text-3xl font-bold text-charcoal font-heading mb-4">Thank You!</h1>
                    <p className="text-gray-600 mb-6">
                        Your custom home design has been submitted successfully. Our team will contact you within 24 hours.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        Your brochure has been downloaded automatically.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors">
                        <span>Back to Home</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-deep-slate text-white pt-8 pb-12 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4">Design Studio</h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Create your dream home by selecting from our range of floor plans, facades, and inclusions.
                    </p>
                </div>
            </section>

            {/* Progress Steps */}
            <div className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex items-center">
                                <button
                                    onClick={() => s.num < step && setStep(s.num)}
                                    className={`flex items-center gap-2 ${s.num <= step ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    disabled={s.num > step}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${s.num === step ? 'bg-primary text-white' :
                                        s.num < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        {s.num < step ? <span className="material-symbols-outlined text-[18px]">check</span> : s.num}
                                    </div>
                                    <span className={`hidden sm:block text-sm font-medium ${s.num === step ? 'text-charcoal' : 'text-gray-400'
                                        }`}>{s.title}</span>
                                </button>
                                {i < steps.length - 1 && (
                                    <div className={`w-8 sm:w-16 h-0.5 mx-2 ${s.num < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Step 1: Floor Plan */}
                {step === 1 && (
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal font-heading">Choose Your Floor Plan</h2>
                                <p className="text-gray-500 mt-1">Select from our range of single and double storey designs</p>
                            </div>
                            <div className="flex gap-2">
                                {(['all', 'single', 'double'] as const).map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setFloorPlanFilter(filter)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${floorPlanFilter === filter
                                            ? 'bg-charcoal text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All' : filter === 'single' ? 'Single Storey' : 'Double Storey'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFloorPlans.map(fp => (
                                <div
                                    key={fp.id}
                                    onClick={() => handleFloorPlanSelect(fp)}
                                    className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${selectedFloorPlan?.id === fp.id ? 'ring-4 ring-primary shadow-lg' : 'shadow-sm'
                                        }`}
                                >
                                    <div className="relative h-48">
                                        <img src={fp.imageUrl} alt={fp.name} className="w-full h-full object-cover" />
                                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${fp.type === 'single' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {fp.type === 'single' ? 'Single Storey' : 'Double Storey'}
                                        </span>
                                        {selectedFloorPlan?.id === fp.id && (
                                            <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-[18px]">check</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-charcoal font-heading">{fp.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{fp.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">bed</span>
                                                {fp.bedrooms}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">shower</span>
                                                {fp.bathrooms}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">garage_home</span>
                                                {fp.garages}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">square_foot</span>
                                                {fp.squareMeters}m²
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">touch_app</span>
                                Click on a floor plan to select and continue
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Facade */}
                {step === 2 && (
                    <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal font-heading">Choose Your Facade</h2>
                                <p className="text-gray-500 mt-1">Select the exterior style that suits your taste</p>
                            </div>
                            <div className="flex gap-2">
                                {(['all', 'single', 'double'] as const).map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setFacadeFilter(filter)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${facadeFilter === filter
                                            ? 'bg-charcoal text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All' : filter === 'single' ? 'Single' : 'Double'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredFacades.map(facade => (
                                <div
                                    key={facade.id}
                                    onClick={() => handleFacadeSelect(facade)}
                                    className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${selectedFacade?.id === facade.id ? 'ring-4 ring-primary shadow-lg' : 'shadow-sm'
                                        }`}
                                >
                                    <div className="relative h-40">
                                        <img src={facade.imageUrl} alt={facade.name} className="w-full h-full object-cover" />
                                        {selectedFacade?.id === facade.id && (
                                            <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-[18px]">check</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-charcoal font-heading">{facade.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">{facade.style}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back
                            </button>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">touch_app</span>
                                Click to select and continue
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 3: Inclusions */}
                {step === 3 && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-charcoal font-heading">Choose Your Inclusion Tier</h2>
                            <p className="text-gray-500 mt-1">Select the level of finishes and features for your home</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {inclusionTiers.map(tier => (
                                <div
                                    key={tier.id}
                                    onClick={() => handleTierSelect(tier.id)}
                                    className={`bg-white rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg ${selectedTier === tier.id ? 'ring-4 ring-primary shadow-lg' : 'shadow-sm'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl ${tier.color} flex items-center justify-center mb-4`}>
                                        <span className="material-symbols-outlined text-2xl text-charcoal">
                                            {tier.id === 'standard' ? 'home' : tier.id === 'designer' ? 'design_services' : 'diamond'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-charcoal font-heading">{tier.name}</h3>
                                    <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
                                    <Link href="/inclusions" className="text-primary text-sm font-medium mt-4 inline-flex items-center gap-1 hover:underline">
                                        View full inclusions <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back
                            </button>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">touch_app</span>
                                Click to select and continue
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 4: Details */}
                {step === 4 && (
                    <div className="space-y-8 max-w-2xl mx-auto">
                        <div>
                            <h2 className="text-2xl font-bold text-charcoal font-heading">Your Details</h2>
                            <p className="text-gray-500 mt-1">Tell us about yourself so we can get in touch</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        value={customerDetails.name}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="John Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        value={customerDetails.email}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={customerDetails.phone}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="0400 000 000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Land Address (if known)</label>
                                    <input
                                        type="text"
                                        value={customerDetails.landAddress}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, landAddress: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        placeholder="123 Example St, Suburb"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments or Requirements</label>
                                <textarea
                                    value={customerDetails.comments}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, comments: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                                    placeholder="Tell us about any specific requirements or questions..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(3)}
                                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back
                            </button>
                            <button
                                onClick={() => setStep(5)}
                                disabled={!customerDetails.name || !customerDetails.email}
                                className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                            >
                                Review Your Design
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        <div>
                            <h2 className="text-2xl font-bold text-charcoal font-heading">Review Your Design</h2>
                            <p className="text-gray-500 mt-1">Confirm your selections before submitting</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            {/* Floor Plan */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start gap-6">
                                    {selectedFloorPlan && (
                                        <>
                                            <img src={selectedFloorPlan.imageUrl} alt={selectedFloorPlan.name} className="w-32 h-24 object-cover rounded-xl" />
                                            <div className="flex-1">
                                                <p className="text-xs text-primary font-medium uppercase tracking-wide">Floor Plan</p>
                                                <h3 className="text-lg font-bold text-charcoal font-heading mt-1">{selectedFloorPlan.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {selectedFloorPlan.type === 'single' ? 'Single Storey' : 'Double Storey'} •
                                                    {selectedFloorPlan.squareMeters}m² •
                                                    {selectedFloorPlan.bedrooms} Bed •
                                                    {selectedFloorPlan.bathrooms} Bath •
                                                    {selectedFloorPlan.garages} Garage
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Facade */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start gap-6">
                                    {selectedFacade && (
                                        <>
                                            <img src={selectedFacade.imageUrl} alt={selectedFacade.name} className="w-32 h-24 object-cover rounded-xl" />
                                            <div className="flex-1">
                                                <p className="text-xs text-primary font-medium uppercase tracking-wide">Facade</p>
                                                <h3 className="text-lg font-bold text-charcoal font-heading mt-1">{selectedFacade.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1 capitalize">{selectedFacade.style} style</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Inclusion Tier */}
                            <div className="p-6 border-b border-gray-100">
                                <p className="text-xs text-primary font-medium uppercase tracking-wide">Inclusion Tier</p>
                                <h3 className="text-lg font-bold text-charcoal font-heading mt-1">
                                    {inclusionTiers.find(t => t.id === selectedTier)?.name}
                                </h3>
                            </div>

                            {/* Customer Details */}
                            <div className="p-6 bg-gray-50">
                                <p className="text-xs text-primary font-medium uppercase tracking-wide">Your Details</p>
                                <div className="mt-3 space-y-2 text-sm">
                                    <p><span className="text-gray-500">Name:</span> {customerDetails.name}</p>
                                    <p><span className="text-gray-500">Email:</span> {customerDetails.email}</p>
                                    {customerDetails.phone && <p><span className="text-gray-500">Phone:</span> {customerDetails.phone}</p>}
                                    {customerDetails.landAddress && <p><span className="text-gray-500">Land:</span> {customerDetails.landAddress}</p>}
                                    {customerDetails.comments && <p><span className="text-gray-500">Comments:</span> {customerDetails.comments}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(4)}
                                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-10 py-3 bg-green-600 text-white rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit & Download Brochure
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
