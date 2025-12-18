'use client'

import Image from 'next/image'

export default function AboutPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative py-24 px-6 bg-background-light overflow-hidden">
                <div className="max-w-[1440px] mx-auto text-center relative z-10">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block animate-fade-in">About Us</span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-deep-slate mb-6 animate-slide-up">
                        Building Dreams,<br />Crafting Legacies.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-delayed">
                        For over two decades, Cloverton Homes has been defining the standard for luxury residential construction, turning visions into enduring realities.
                    </p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-brand-teal blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary blur-3xl"></div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold font-heading text-deep-slate mb-6">Our Story</h2>
                        <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                            <p>
                                Founded on the principles of integrity and innovation, Cloverton Homes started as a boutique builder with a simple mission: to build homes that we would be proud to live in ourselves.
                            </p>
                            <p>
                                What began as a small team of dedicated craftsmen has grown into a premier residential construction firm, renowned for our attention to detail and personalized approach. We believe that a home is more than just bricks and mortar; it's the backdrop for life's most cherished memories.
                            </p>
                            <p>
                                Today, we continue to push the boundaries of design and sustainability, ensuring that every Cloverton Home is not only beautiful but built for the future.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-100">
                            <div>
                                <span className="block text-4xl font-bold text-brand-teal mb-1">20+</span>
                                <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">Years Experience</span>
                            </div>
                            <div>
                                <span className="block text-4xl font-bold text-brand-teal mb-1">500+</span>
                                <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">Homes Built</span>
                            </div>
                            <div>
                                <span className="block text-4xl font-bold text-brand-teal mb-1">50+</span>
                                <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">Design Awards</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-6 bg-deep-slate text-white">
                <div className="max-w-[1280px] mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Why Choose Us</span>
                        <h2 className="text-3xl md:text-5xl font-bold font-heading">Our Core Values</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Quality First', desc: 'We never compromise on materials or craftsmanship. Excellence is our baseline.', icon: 'diamond' },
                            { title: 'Transparent Process', desc: 'Clear communication at every stage. No hidden costs, no surprises.', icon: 'visibility' },
                            { title: 'Sustainable Design', desc: 'Building energy-efficient homes that are kind to the planet and your wallet.', icon: 'eco' }
                        ].map((value, i) => (
                            <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined">{value.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold font-heading mb-4">{value.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
