interface PropertySpecsProps {
    bedrooms: number
    bathrooms: number
    garages: number
    squareMeters?: number
}

export default function PropertySpecs({ bedrooms, bathrooms, garages, squareMeters }: PropertySpecsProps) {
    const specs = [
        { icon: 'bed', label: `${bedrooms} Bed` },
        { icon: 'bathtub', label: `${bathrooms} Bath` },
        { icon: 'directions_car', label: `${garages} Car` },
        ...(squareMeters ? [{ icon: 'square_foot', label: `${squareMeters}m²` }] : []),
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {specs.map((s) => (
                <div key={s.icon} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#d8dcde] bg-white dark:bg-gray-800 text-center hover:border-brand-teal/30 transition-colors">
                    <span className="material-symbols-outlined text-brand-teal text-3xl mb-1">{s.icon}</span>
                    <span className="font-bold text-brand-charcoal dark:text-white font-heading">{s.label}</span>
                </div>
            ))}
        </div>
    )
}
