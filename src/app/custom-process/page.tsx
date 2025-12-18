'use client'

export default function CustomProcessPage() {

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-gray-100 min-h-screen flex flex-col font-display">
            {/* Top Navigation */}
            {/* Sticky Progress Bar Section */}
            <div className="sticky top-20 z-40 w-full bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 py-4 hidden lg:block shadow-sm">

                {/* Sticky Progress Bar Section */}
                <div className="w-full bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 py-4 hidden lg:block shadow-sm">
                    <div className="max-w-[960px] mx-auto px-6">
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line Background */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full"></div>
                            {/* Active Progress Line (Simulated for this static view - roughly 35%) */}
                            <div className="absolute top-1/2 left-0 w-[35%] h-1 bg-brand-teal -z-0 rounded-full"></div>
                            {/* Steps */}
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-background-dark">01</div>
                                <span className="text-xs font-bold text-brand-teal dark:text-white">Brief</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-background-dark">02</div>
                                <span className="text-xs font-bold text-brand-teal dark:text-white">Concept</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-white border-2 border-brand-teal text-brand-teal flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-background-dark dark:bg-background-dark dark:text-white dark:border-white">03</div>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Approvals</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-background-dark dark:bg-gray-700 dark:text-gray-400">04</div>
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-600">Selections</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-background-dark dark:bg-gray-700 dark:text-gray-400">05</div>
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-600">Build</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-background-dark dark:bg-gray-700 dark:text-gray-400">06</div>
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-600">Handover</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-grow">
                {/* Hero / Page Title */}
                <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-charcoal dark:text-white mb-6">
                        Our Custom Build Process
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        A transparent, six-step journey from initial concept to your dream home handover. We believe in clarity at every stage of the build.
                    </p>
                </section>

                {/* Step 01: Client Brief & Planning */}
                <section className="py-16 md:py-24 relative overflow-hidden">
                    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            {/* Text Content */}
                            <div className="flex-1 order-2 md:order-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal mb-6">
                                    <span className="material-symbols-outlined text-[28px]">assignment</span>
                                </div>
                                <span className="block text-brand-teal font-bold tracking-widest text-sm uppercase mb-2">Step 01</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white mb-6">Client Brief & Planning</h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                    We begin by deeply understanding your lifestyle, budget, and vision. This crucial first phase involves detailed site analysis and preliminary discussions to ensure your dream is feasible and perfectly aligned with your financial goals.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-brand-teal mt-1">check_circle</span>
                                        <div>
                                            <h4 className="font-bold text-charcoal dark:text-white">Site Analysis</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive land evaluation</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-brand-teal mt-1">check_circle</span>
                                        <div>
                                            <h4 className="font-bold text-charcoal dark:text-white">Budget Planning</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Transparent cost estimation</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Image Content */}
                            <div className="flex-1 order-1 md:order-2 w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                                    <div className="absolute inset-0 bg-brand-teal/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                    <img
                                        alt="Architect reviewing blueprints and plans on a wooden table"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5v0l90AR_shJeFlzeE-BfejN4O4ugppXjVFlFKTVOvNnpfgJm6l_Sew3fMKxFTKLwUKY-bw9awo61ga_60hYChGDNSx_BRuKU7FWBMqiG6l4_ltEnWS66Ae0Uogr7w5BCY2QwuomITYnpXvOabAJgcH6h3NWAzsM6-cz61NdKSQR91lJbQw4XwkJWU_Yjgn15rhHaMRSj6vVgqJNHsYu1UXtH0IKbs7VeqNYUckrTMPb19lixCMItFSSv1bxyN81dOShFMSxAO2tc"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 02: Concept Design */}
                <section className="py-16 md:py-24 bg-white dark:bg-gray-900/50">
                    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            {/* Image Content */}
                            <div className="flex-1 w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                                    <div className="absolute inset-0 bg-brand-teal/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                    <img
                                        alt="Modern architectural 3D rendering of a luxury home interior"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfQUmRrIJJDUks7QEWPHyZl8azxIV-6Xy_YGGJ-pzmt7j0eIbSJrwtbBK78gf5vLeWS7wUO0OHyOWTPXHjm_ikfhO-C24qVy04gKsUBZTL4peLhLZZvekZDW5FHA3558uITv_aUvTitSsopJFMmet2--0Qn1CMbBzNVPYZ13VoVx0RKUbyi-pBwuWft18KDWpUfc1zLZSy-NMg8xEr-_LJF8lLVcPm4EqtLVTwa_hwh2dt0CRe-FVytCAnZghXSOnjRpNkLyr5N6Yc"
                                    />
                                </div>
                            </div>
                            {/* Text Content */}
                            <div className="flex-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal mb-6">
                                    <span className="material-symbols-outlined text-[28px]">architecture</span>
                                </div>
                                <span className="block text-brand-teal font-bold tracking-widest text-sm uppercase mb-2">Step 02</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white mb-6">Concept Design</h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                    Our design team translates your requirements into architectural concepts. We present 3D visualizations and floor plans, iterating until the design feels like home. This is where your vision starts to take physical form.
                                </p>
                                <button className="text-brand-teal font-bold hover:text-primary inline-flex items-center gap-2 group">
                                    View Design Examples
                                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 03: Approvals & Documentation */}
                <section className="py-16 md:py-24">
                    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            {/* Text Content */}
                            <div className="flex-1 order-2 md:order-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal mb-6">
                                    <span className="material-symbols-outlined text-[28px]">gavel</span>
                                </div>
                                <span className="block text-brand-teal font-bold tracking-widest text-sm uppercase mb-2">Step 03</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white mb-6">Approvals & Contracts</h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                    We handle the complexities of council approvals, engineering, and compliance documentation. Once approved, we prepare a plain-language building contract so you have complete peace of mind before construction begins.
                                </p>
                                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex gap-4 items-center">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                                            <span className="material-symbols-outlined">verified_user</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-charcoal dark:text-white">Fixed Price Guarantee</p>
                                            <p className="text-sm text-gray-500">No hidden costs after contract signing.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Image Content */}
                            <div className="flex-1 order-1 md:order-2 w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                                    <div className="absolute inset-0 bg-brand-teal/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                    <img
                                        alt="Close up of signing a contract document with a pen"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX-ASKOeveJXQDGVyGnyWSxUbc2H8sH1LSRw6AAQOftyMzD9i5FgcYDA_W1hApHjKntdIpypx42ceA2tHbad9iFMQQ92v5g31rNrGSmmf5QhHqLXaAQZKJYslv_fgUYQtL4uwX3yD2bKEkNNqcYeH0hfLFl3XG0Ivmepw0NtcpyCBvZD0S_lX4qEQQ7Ea4W_XWRaL4Imf72ofgb53z2YHb7xPZGl2nfjMsnNo4NNWuOMJ1a087CMAI0v290HlbfZyeX1JWI00nU1dl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 04: Interior Selections */}
                <section className="py-16 md:py-24 bg-white dark:bg-gray-900/50">
                    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            {/* Image Content */}
                            <div className="flex-1 w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                                    <div className="absolute inset-0 bg-brand-teal/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                    <img
                                        alt="Collection of interior design material samples like tiles, wood and stone"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhAtxNXmfHDUvtKTz1zHehSQb1UmWs39wQOg8icU_YPXfwdenj-HtFnMVK4AAqgvyAP_LUYSoaCWJSeCtwuNdVCsO_PkABletoTHzufzSwASk4hVdXNTdUTh-HmDnQX8TPeTNJ7oTmf2Mg59OoFPPJZu27fsC4V5ck1NhdbgV5aSf6HNYyidVu-ThPlVRJpOX-4W0KsN7OtGFh4vLlfGTp7rWm9XIYkzcSD5nYwy5aGptUJ3EjH6joWQJty59WGvM1Ku8Yhv3wEbuA"
                                    />
                                </div>
                            </div>
                            {/* Text Content */}
                            <div className="flex-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal mb-6">
                                    <span className="material-symbols-outlined text-[28px]">palette</span>
                                </div>
                                <span className="block text-brand-teal font-bold tracking-widest text-sm uppercase mb-2">Step 04</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white mb-6">Interior Selections</h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                    Meet with our interior designers to select your finishes, fixtures, and colors. From tapware to tiles, you'll touch and feel the materials that will define the character of your new home in our dedicated design studio.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">Premium Tapware</span>
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">Custom Joinery</span>
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">Smart Lighting</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 05: Construction Phase */}
                <section className="py-16 md:py-24">
                    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            {/* Text Content */}
                            <div className="flex-1 order-2 md:order-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-teal/10 text-brand-teal mb-6">
                                    <span className="material-symbols-outlined text-[28px]">construction</span>
                                </div>
                                <span className="block text-brand-teal font-bold tracking-widest text-sm uppercase mb-2">Step 05</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white mb-6">Construction Phase</h2>
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                                    See your home come to life. You'll receive regular updates via our client portal and scheduled site visits at key milestones like slab pour, frame stage, and lock-up. We prioritize clean sites and expert craftsmanship.
                                </p>
                            </div>
                            {/* Image Content */}
                            <div className="flex-1 order-1 md:order-2 w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                                    <div className="absolute inset-0 bg-brand-teal/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                    <img
                                        alt="Construction site with timber framing of a new house"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPOI6sXy70ntDLJzL0uZtg0S1xlGbMSMY7NM_oiMCDpHdAmk3-PmyIKhfVc4yy1PkwuKGaQWAbeHpb84f8rZ5NANG-tPkrvRkCegYY-UFjZveB2Y0qr9vaYvy3nlbRbW528Ipo642N7hwKuSWV8bwSJd0eTMI1uzSoqvozMwCF8rv2M2Am_LzD7y4YjqmhSGzUcoGfEzfFgkzxPyPKn02TJCPewerh9A9A5PnV1gp-5npCbkhDKMe2bN4tR44jbC41f6vGt3MuDL3E"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 06: Handover */}
                <section className="py-16 md:py-24 bg-brand-teal text-white relative overflow-hidden">
                    {/* Abstract background pattern */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path d="M45.7,-76.3C58.9,-69.3,69.1,-55.6,76.3,-41.3C83.5,-26.9,87.6,-11.9,85.6,2.3C83.6,16.5,75.4,30,66.1,42.1C56.8,54.2,46.3,64.9,33.7,71.2C21.1,77.5,6.3,79.4,-7.8,77.7C-21.9,76,-35.3,70.8,-47.2,62.8C-59.1,54.8,-69.5,44,-75.6,31.2C-81.7,18.4,-83.5,3.6,-80.6,-10.1C-77.7,-23.8,-70.1,-36.4,-59.6,-45.5C-49.1,-54.6,-35.7,-60.2,-22.6,-67.3C-9.5,-74.4,3.3,-83,16.6,-83.3C29.9,-83.6,43.7,-75.6,45.7,-76.3Z" fill="#FFFFFF" transform="translate(100 100)"></path>
                        </svg>
                    </div>
                    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                            {/* Image Content */}
                            <div className="flex-1 w-full order-2 md:order-1">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group border-4 border-white/20">
                                    <img
                                        alt="Happy couple receiving keys to their new modern home"
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLN2aDJdYwcQXCliSIX7nQcSU4ZgU3c8BZL4sRf1lzimSSQ4eliKfQ6U-fGzpc4Wmc_QJIDpSBxpOxkD64mc2o1ZHEsYYGyN67q6sEY7cxh6BiFteqaAgvCvKAskhEoypqnDNpEpJQLeKAecaRASOP-FUmPVBhInbyvdUy6GkIQtAC9keoSvFqcDyoi-uh-ipI42nm_Nmh5cvx4FgBSWrjxWOnqcMPy4_h6flA21LbOBIkVhBnjrs9fdxO0Bhu9xDnP7D8SaflJoWk"
                                    />
                                </div>
                            </div>
                            {/* Text Content */}
                            <div className="flex-1 order-1 md:order-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-white mb-6">
                                    <span className="material-symbols-outlined text-[28px]">key</span>
                                </div>
                                <span className="block text-white/80 font-bold tracking-widest text-sm uppercase mb-2">Step 06</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Handover & Maintenance</h2>
                                <p className="text-white/90 text-lg leading-relaxed mb-8">
                                    The moment you've been waiting for. We conduct a detailed final inspection and handover the keys to your new home. Our relationship continues with a maintenance period to ensure everything settles perfectly.
                                </p>
                                <button className="bg-white text-brand-teal hover:bg-gray-100 font-bold py-4 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-1">
                                    Start Your Build Journey
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>


        </div>
    )
}
