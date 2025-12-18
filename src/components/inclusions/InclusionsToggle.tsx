// 'use client'

interface InclusionsToggleProps {
    tiers: { name: string, slug: string }[]
    currentTier: string
    onChange: (tierSlug: string) => void
}

export default function InclusionsToggle({ tiers, currentTier, onChange }: InclusionsToggleProps) {
    if (!tiers || tiers.length === 0) return null

    return (
        <div className="inline-flex bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
            {tiers.map((tier) => (
                <button
                    key={tier.slug}
                    onClick={() => onChange(tier.slug)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${currentTier === tier.slug
                        ? 'bg-deep-slate text-white shadow-md transform scale-105'
                        : 'text-gray-500 hover:text-deep-slate'
                        }`}
                >
                    {tier.name}
                </button>
            ))}
        </div>
    )
}
