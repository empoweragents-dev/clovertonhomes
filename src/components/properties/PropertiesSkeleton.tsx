export default function PropertiesSkeleton() {
    return (
        <div className="max-w-[1440px] mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-[#eceeef] dark:border-gray-700 shadow-sm flex flex-col h-full animate-pulse">
                        {/* Image Skeleton */}
                        <div className="relative aspect-[4/3] w-full bg-gray-200 dark:bg-gray-700"></div>

                        {/* Content Skeleton */}
                        <div className="p-6 flex flex-col flex-grow space-y-4">
                            {/* Title & Address */}
                            <div>
                                <div className="h-7 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>

                            {/* Specs */}
                            <div className="flex items-center gap-6 py-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className="flex flex-col items-center gap-1">
                                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Price & Action */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
