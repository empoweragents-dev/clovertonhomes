
import PropertyDetail from '@/components/properties/PropertyDetail'

// For static export - return empty array since we can't pre-generate all property pages
export function generateStaticParams() {
    return []
}

export default async function PropertyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display text-brand-charcoal dark:text-gray-100">
            <PropertyDetail />
        </div>
    )
}
