import Link from 'next/link'

interface PropertyCardProps {
    image: string
    title: string
    location: string
    beds: number
    baths: number
    cars: number
    area: number
    price: string
    badge?: 'new' | 'fixed' | string | null
    slug: string
}

export default function PropertyCard({ image, title, location, beds, baths, cars, area, price, badge, slug }: PropertyCardProps) {
    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#eceeef]">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Link href={`/properties/${slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 block cursor-pointer"
                        src={image}
                    />
                </Link>
                {badge && (
                    <div className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md ${badge === 'new' ? 'bg-deep-slate' : 'bg-primary'}`}>
                        {badge === 'new' ? 'New Release' : (badge === 'fixed' ? 'Fixed Price' : badge)}
                    </div>
                )}
                <button className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors backdrop-blur-sm">
                    <span className="material-symbols-outlined block text-[20px]">favorite</span>
                </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
                <div>
                    <Link href={`/properties/${slug}`} className="hover:no-underline">
                        <h3 className="text-xl font-bold text-charcoal mb-1 group-hover:text-primary transition-colors cursor-pointer">{title}</h3>
                    </Link>
                    <div className="flex items-center text-gray-500 text-sm">
                        <span className="material-symbols-outlined text-[18px] mr-1">location_on</span>
                        {location}
                    </div>
                </div>
                {/* Specs Strip */}
                <div className="flex items-center justify-between border-t border-b border-gray-100 py-3">
                    <div className="flex flex-col items-center gap-0.5 w-1/4 border-r border-gray-100 last:border-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">bed</span>
                        <span className="text-xs font-medium text-gray-600">{beds} Bed</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 w-1/4 border-r border-gray-100 last:border-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">bathtub</span>
                        <span className="text-xs font-medium text-gray-600">{baths} Bath</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 w-1/4 border-r border-gray-100 last:border-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">directions_car</span>
                        <span className="text-xs font-medium text-gray-600">{cars} Car</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 w-1/4">
                        <span className="material-symbols-outlined text-primary text-[20px]">square_foot</span>
                        <span className="text-xs font-medium text-gray-600">{area}m²</span>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">From</p>
                        <p className="text-2xl font-bold text-charcoal">{price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link className="text-sm font-semibold text-deep-slate hover:underline underline-offset-4 decoration-2" href={`/properties/${slug}`}>View</Link>
                        <button className="bg-deep-slate hover:bg-[#1a323e] text-white text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-sm">
                            Enquire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
