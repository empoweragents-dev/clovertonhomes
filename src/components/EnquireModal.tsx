'use client'

import { useState, useEffect } from 'react'

export default function EnquireModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState(1)
    const [isVisible, setIsVisible] = useState(false)
    const [formData, setFormData] = useState({
        homeType: '',
        designType: 'existing', // 'existing' or 'custom'
        name: '',
        phone: '',
        email: ''
    })

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isVisible && !isOpen) return null

    const handleNext = () => {
        if (step < 2) setStep(step + 1)
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically send data to an API
        console.log('Form submitted:', formData)

        // Simulating success/closing
        setTimeout(() => {
            onClose()
            setStep(1) // Reset for next time
            setFormData({
                homeType: '',
                designType: 'existing', // default
                name: '',
                phone: '',
                email: ''
            })
        }, 1000)
    }

    const isStep1Valid = formData.homeType !== ''
    const isStep2Valid = formData.name !== '' && formData.phone !== '' && formData.email !== ''

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 text-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all duration-300 font-display ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                            Start Your Journey
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Step {step} of 2
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors focus:outline-none"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-brand-teal transition-all duration-500 ease-out"
                        style={{ width: step === 1 ? '50%' : '100%' }}
                    />
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Preferences */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                    What type of home are you looking to build?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Single Storey', 'Double Storey', 'Acreage', 'Dual Occupancy'].map((type) => (
                                        <div key={type}
                                            onClick={() => setFormData({ ...formData, homeType: type })}
                                            className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center transition-all ${formData.homeType === type
                                                    ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold'
                                                    : 'border-gray-200 hover:border-brand-teal/50 text-gray-600'
                                                }`}
                                        >
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                    Do you have a design in mind?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setFormData({ ...formData, designType: 'existing' })}
                                        className={`cursor-pointer rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all ${formData.designType === 'existing'
                                                ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold'
                                                : 'border-gray-200 hover:border-brand-teal/50 text-gray-600'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">home_work</span>
                                        Existing Design
                                    </div>
                                    <div
                                        onClick={() => setFormData({ ...formData, designType: 'custom' })}
                                        className={`cursor-pointer rounded-xl border-2 px-4 py-3 flex items-center gap-3 transition-all ${formData.designType === 'custom'
                                                ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold'
                                                : 'border-gray-200 hover:border-brand-teal/50 text-gray-600'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">edit_square</span>
                                        Custom Design
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Details */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in-up">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-brand-teal focus:ring-brand-teal focus:outline-none transition-shadow"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-brand-teal focus:ring-brand-teal focus:outline-none transition-shadow"
                                    placeholder="0400 000 000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-brand-teal focus:ring-brand-teal focus:outline-none transition-shadow"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-10 flex gap-3">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!isStep1Valid}
                                className="w-full rounded-full bg-brand-teal px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-teal/20 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!isStep2Valid}
                                className="flex-[2] rounded-full bg-brand-teal px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-teal/20 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Submit Enquiry
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
