import PropertyCard from '@/components/properties/PropertyCard'

// Function to fetch properties from API
async function getProperties(searchParams: any) {
    const params = new URLSearchParams(searchParams)
    // Avoid passing empty keys
    if (!searchParams.regionId) params.delete('regionId')

    // Add default limit if not present
    if (!params.has('limit')) params.set('limit', '12')

    try {
        const apiUrl = ''
        const res = await fetch(`${apiUrl}/properties?${params.toString()}`, {
            cache: 'no-store' // Ensure fresh data on each request for filters
        })

        if (!res.ok) {
            console.error(`Status: ${res.status}`)
            return { data: [], total: 0 }
        }

        return await res.json()
    } catch (error) {
        console.error("Error fetching properties:", error)
        return { data: [], total: 0 }
    }
}

export default async function PropertyList({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const { data: properties, total } = await getProperties(searchParams)

    return (
        <div className="max-w-[1440px] mx-auto">
            {/* Results Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-charcoal text-2xl font-bold">House & Land Packages</h1>
                <p className="text-gray-500 text-sm font-medium">
                    Showing <span className="text-charcoal font-bold">{properties?.length || 0}</span> of <span className="text-charcoal font-bold">{total || 0}</span> properties
                </p>
            </div>

            {/* Property Grid */}
            {properties && properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {properties.map((property: any) => (
                        <PropertyCard
                            key={property.id}
                            image={property.featuredImage || "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1000&q=80"}
                            title={property.title}
                            location={property.address || `${property.estate?.name}, ${property.region?.name}`}
                            beds={property.bedrooms}
                            baths={property.bathrooms}
                            cars={property.garages}
                            area={property.squareMeters || property.landArea || 0}
                            price={`$${(property.totalPrice / 100).toLocaleString()}`}
                            badge={property.badge}
                            slug={property.slug}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
                </div>
            )}

            {/* Load More (Pagination not fully implemented yet, just visual) */}
            {(total || 0) > (properties?.length || 0) && (
                <div className="flex justify-center mt-12 mb-8">
                    <button className="bg-white border border-gray-200 text-charcoal hover:border-deep-slate hover:text-deep-slate px-8 py-3 rounded-full font-medium transition-colors shadow-sm">
                        Load More Properties
                    </button>
                </div>
            )}
        </div>
    )
}
