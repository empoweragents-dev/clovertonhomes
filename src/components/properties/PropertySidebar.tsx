'use client'

export default function PropertySidebar() {
    return (
        <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
                {/* Price Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1 font-heading">House & Land Package</p>
                        <h2 className="text-4xl font-black text-brand-teal tracking-tight font-heading">$854,900*</h2>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-display">House Price</span>
                            <span className="font-bold text-brand-charcoal dark:text-white font-heading">$420,500</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 font-display">Land Price</span>
                            <span className="font-bold text-brand-charcoal dark:text-white font-heading">$434,400</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 font-heading">
                            <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                            Titles Expected Dec 2024
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 font-heading">
                            12.5m x 32m
                        </span>
                    </div>
                </div>

                {/* Consultant & Form */}
                <div className="bg-brand-teal text-white rounded-2xl shadow-lg p-6 space-y-6 relative overflow-hidden">
                    {/* Abstract Pattern Background */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>

                    {/* Generic Contact Info */}
                    <div className="relative flex items-center gap-4 border-b border-white/10 pb-6">
                        <div className="w-14 h-14 rounded-full border-2 border-white/20 flex items-center justify-center bg-brand-charcoal">
                            <span className="material-symbols-outlined text-2xl">support_agent</span>
                        </div>
                        <div>
                            <p className="text-xs text-primary-light font-medium uppercase tracking-wider opacity-80 font-heading">Sales Team</p>
                            <p className="font-bold text-lg font-heading">Cloverton Homes</p>
                            <a href="tel:1300000000" className="text-sm opacity-80 font-display hover:text-white transition-colors">1300 000 000</a>
                        </div>
                    </div>

                    {/* Enquire Button - Triggers Global Modal */}
                    <div className="relative space-y-4">
                        <p className="text-sm opacity-90 font-display leading-relaxed">
                            Interested in this package? Get in touch with our team to find out more about this property.
                        </p>

                        <button
                            // Assuming openEnquireModal is available via context or passed prop (need to check implementation, 
                            // for now we'll simulate click or use a window event if specific context isn't used yet in this file)
                            onClick={() => document.getElementById('enquire-modal-trigger')?.click()}
                            className="w-full bg-primary hover:bg-[#4a6472] text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:-translate-y-0.5 font-heading">
                            Enquire Now
                        </button>

                        <p className="text-xs text-center opacity-60 mt-2 font-display">
                            By enquiring you agree to our <a href="#" className="underline hover:text-white">Terms</a> & <a href="#" className="underline hover:text-white">Privacy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
