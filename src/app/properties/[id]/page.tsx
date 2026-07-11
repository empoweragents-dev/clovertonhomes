import PropertyDetail from '@/components/properties/PropertyDetail'

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-display text-brand-charcoal dark:text-gray-100">
            <PropertyDetail slug={id} />
        </div>
    )
}
