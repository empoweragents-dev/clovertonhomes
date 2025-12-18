import { Suspense } from 'react'
import FilterBar from '@/components/properties/FilterBar'
import PropertyList from '@/components/properties/PropertyList'
import PropertiesSkeleton from '@/components/properties/PropertiesSkeleton'

export default async function PropertiesPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal min-h-screen flex flex-col font-display">
            <FilterBar />

            <main className="flex-grow bg-background-light px-4 lg:px-10 py-8">
                <Suspense fallback={<PropertiesSkeleton />}>
                    <PropertyList searchParams={searchParams} />
                </Suspense>
            </main>
        </div>
    )
}
