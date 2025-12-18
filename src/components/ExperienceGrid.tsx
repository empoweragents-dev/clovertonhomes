'use client'

const features = [
    { icon: 'verified', title: 'Lifetime Structural' },
    { icon: 'calendar_month', title: 'Fixed Build Time' },
    { icon: 'price_check', title: 'Fixed Price' },
    { icon: 'design_services', title: 'Custom Design' },
]

export default function ExperienceGrid() {
    return (
        <section className="py-16 px-5 bg-white">
            <div className="max-w-md mx-auto">
                <h2 className="font-heading text-3xl font-bold text-brand-charcoal mb-8 text-center">
                    Exceptional Experience
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-5 rounded-2xl bg-background-light text-center border border-transparent hover:border-brand-teal/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-4xl text-brand-teal mb-3">
                                {feature.icon}
                            </span>
                            <h3 className="font-bold text-brand-charcoal text-sm">{feature.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
