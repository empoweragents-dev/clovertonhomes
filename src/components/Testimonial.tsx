'use client'

import Image from 'next/image'

export default function Testimonial() {
    return (
        <section className="py-16 px-5 bg-background-light">
            <div className="max-w-md mx-auto">
                <h2 className="font-heading text-3xl font-bold text-brand-charcoal mb-8 text-center">
                    Our Stories
                </h2>
                <div className="rounded-3xl overflow-hidden shadow-xl">
                    <div className="h-64 w-full relative">
                        <Image
                            alt="Happy Homeowners"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIZWVaB2dY2Z6qRepQaUnI0N3rOYN1ic_85vISxnp5IBwGaFrDUKtQgkC2xqO0DLODImKTw7kz1_l-8f_tRu2w-mOT8JDddQ0IKLcJjXBhRShwhYymY6p1WDnG462FDMR1cgOuryIOn083niF_QX6QJtjndpaHtJuzy9yRzYlCjSDqzuHveK9Skgd5499KDfpq0G84YeNLzmHyLD0dqoEkuCSbCU-duhN9En2C_G6xTv3TSsX1-7ig3AFfdEzRk1lIKu2ZK0bezSL8"
                            fill
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-teal uppercase tracking-wide shadow-sm">
                            The Mitchell Family
                        </div>
                    </div>
                    <div className="bg-brand-charcoal p-8 text-white relative">
                        <span className="material-symbols-outlined text-brand-teal text-6xl mb-4 opacity-20 absolute top-4 right-4">
                            format_quote
                        </span>
                        <p className="text-lg leading-relaxed font-light mb-6 relative z-10 italic">
                            "Building with Cloverton was seamless. We felt supported at every stage, and the finish
                            quality of our new home exceeded all our expectations."
                        </p>
                        <div className="flex items-center gap-1 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-sm">star</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-2 mt-8">
                    <div className="h-2 w-8 rounded-full bg-brand-teal transition-all"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                </div>
            </div>
        </section>
    )
}
