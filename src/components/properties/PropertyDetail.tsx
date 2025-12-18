import PropertyHero from './PropertyHero'
import PropertySpecs from './PropertySpecs'
import PropertyFloorplan from './PropertyFloorplan'
import PropertyLocation from './PropertyLocation'
import PropertySidebar from './PropertySidebar'
import PropertyInclusions from './PropertyInclusions'

export default function PropertyDetail() {
    return (
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-10 py-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-display">
                <a href="#" className="hover:text-primary transition-colors">Home</a>
                <span className="material-symbols-outlined text-base">chevron_right</span>
                <a href="#" className="hover:text-primary transition-colors">Designs</a>
                <span className="material-symbols-outlined text-base">chevron_right</span>
                <span className="text-brand-teal font-semibold">The Aspen 240</span>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
                {/* Left Column: Content */}
                <div className="lg:col-span-8 space-y-8 pb-20">
                    <PropertyHero
                        title="The Aspen 240"
                        address="Lot 42, Evergreen Estate, Deep Creek, VIC 3999"
                    />

                    <PropertySpecs />

                    {/* About Section */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-brand-teal font-heading">About The Aspen</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-display">
                            The Aspen 240 redefines family living with its clever zoning and open-plan design. The heart of the home features a gourmet kitchen with a butler's pantry, overlooking the spacious meals and family area that spills out to the alfresco. A dedicated theatre room provides a perfect retreat, while the master suite offers a luxurious sanctuary at the front of the home.
                        </p>
                    </div>

                    <PropertyFloorplan />

                    {/* Inclusions - Dynamic Component */}
                    <PropertyInclusions />

                    <PropertyLocation />
                </div>

                {/* Right Column: Sticky Sidebar */}
                <PropertySidebar />
            </div>
        </main>
    )
}
