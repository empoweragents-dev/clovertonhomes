'use client'

const pathways = [
    {
        icon: 'home',
        title: 'Home Only',
        description: 'I have land, I need a builder',
    },
    {
        icon: 'landscape',
        title: 'House & Land',
        description: 'Package deals in top estates',
    },
    {
        icon: 'domain',
        title: 'Knockdown Rebuild',
        description: 'Replace your existing home',
    },
    {
        icon: 'terrain',
        title: 'Vacant Land',
        description: 'Secure your block first',
    },
]

export default function PathwayCards() {
    return (
        <section className="py-16 px-5 bg-background-light">
            <div className="max-w-md mx-auto">
                <h2 className="font-heading text-3xl font-bold text-brand-charcoal mb-2">Find Your Path</h2>
                <p className="text-gray-600 mb-8 text-sm">Select the option that best describes your needs.</p>
                <div className="flex flex-col gap-4">
                    {pathways.map((pathway, index) => (
                        <a
                            key={index}
                            className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform group"
                            href="#"
                        >
                            <div className="h-12 w-12 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal mr-4 shrink-0 group-hover:bg-brand-teal group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">{pathway.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-lg text-brand-charcoal">{pathway.title}</h3>
                                <p className="text-xs text-gray-500">{pathway.description}</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-gray-300">chevron_right</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    )
}
