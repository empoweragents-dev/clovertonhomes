'use client'

import React from 'react'

export default function BuildPathways() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-[1440px] mx-auto px-6">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-charcoal font-heading mb-6">
                        Build with Confidence
                    </h2>
                    <p className="text-gray-500 leading-relaxed text-lg">
                        At the heart of every great home is a sense of certainty – the confidence that your
                        space reflects who you are and how you live. That's why, with over 25 years of
                        experience, we've reimagined the homebuilding journey to put you in control –
                        offering clarity, choice, and craftsmanship at every step.
                    </p>
                </div>

                {/* Primary Pathways (2 Column) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Home Only */}
                    <div className="group cursor-pointer">
                        <h3 className="text-2xl font-bold text-charcoal font-heading mb-4 group-hover:text-primary transition-colors">Home only</h3>
                        <div className="overflow-hidden rounded-2xl aspect-[4/3] relative">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCLVPtCBunfIXjgP-9BKOzODkF3f94aeqxF24az44J9hzwPaV7bUyMQ0tB-8rcOntceZ1Mi0Aq9PyFPh0bqStoc8APBtZhl3U5pGs6hPnQx1s-bM4apBiJuquHnQhyrP4FmGtlIZ_tiFSVNaFqLcU7YN_4VQBaYyU2HGpXOnJ2hfbnTCIvF1puHtxhF9Zjlp3tRkKH2ietPspRCIUIVw6Q0dwwteTkNi5rKXmSjB3YJxljSCdlSw9DIALzpYbLSbEoiWc99bMRh5e8Z')" }}
                            ></div>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                    </div>

                    {/* House and Land */}
                    <div className="group cursor-pointer">
                        <h3 className="text-2xl font-bold text-charcoal font-heading mb-4 group-hover:text-primary transition-colors">House and land</h3>
                        <div className="overflow-hidden rounded-2xl aspect-[4/3] relative">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1ZqYpbdlWW5OBvlXHbHtzKkDdAoIMpZ6ZCOrDki3mW6p9CALmxsLWRqI6g0kEJoFHYTTXxpGupjWgMgMOymbFQAl8J6czUOPTUBDAjwNqmwdt4lgj3eq0IIRR9TB_d4uYvJMKrR0HJzrYyERxLB5hxHl_zQ3GYc7B5y_E5IcKZx-uqGkGxOrbxsZQsGSMDSEgkXkYVFSkT7XuV4PUBIFznM7s-cZSIcKI-XP-VH_GW8VqZZyoIoR99QIGEXco9Zzb8bZQD9o5AdVj')" }}
                            ></div>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                    </div>
                </div>

                {/* Secondary Pathways (4 Column) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-gray-100 pt-16">
                    {/* Vacant Land */}
                    <div>
                        <h4 className="text-xl font-bold text-charcoal font-heading mb-3">Vacant land</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Own a block of land? Choose from our four series – Advantage, Lifestyle, and Prestige –
                            and build a home that reflects your style and needs. We'll guide you through every step.
                        </p>
                    </div>

                    {/* Knockdown Rebuild */}
                    <div>
                        <h4 className="text-xl font-bold text-charcoal font-heading mb-3">Knockdown rebuild</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Love your location but not your current home? Choose from our award-winning home designs
                            and enjoy a streamlined process supported by local expertise and a focus on quality, timing, and budget.
                        </p>
                    </div>

                    {/* Off-the-plan */}
                    <div>
                        <h4 className="text-xl font-bold text-charcoal font-heading mb-3">Off-the-plan</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Secure a complete home and land package in one of our partner estates. We'll guide you
                            through the process and keep you informed every step of the way until your home is completed.
                        </p>
                    </div>

                    {/* Newly Built */}
                    <div>
                        <h4 className="text-xl font-bold text-charcoal font-heading mb-3">Newly built</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Our Connect Homes are newly built or near completion, offering Luxe Builders quality
                            with the convenience of a finished home. Landscaping, driveways, and inclusions are all taken care of.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
