import Link from 'next/link'

export default function PropertiesHeader() {
    return (
        <header className="bg-[#f9fafa] border-b border-solid border-b-[#eceeef] sticky top-0 z-50">
            <div className="flex items-center justify-between whitespace-nowrap px-6 lg:px-10 py-3 max-w-[1440px] mx-auto w-full">
                <div className="flex items-center gap-4 text-[#131516]">
                    <Link href="/" className="size-8 flex items-center justify-center text-deep-slate">
                        <span className="material-symbols-outlined text-3xl">home_work</span>
                    </Link>
                    <h2 className="text-deep-slate text-xl font-bold leading-tight tracking-tight">Premium Residential</h2>
                </div>
                <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
                    <div className="flex items-center gap-9">
                        <a className="text-charcoal text-sm font-medium hover:text-primary transition-colors" href="#">Designs</a>
                        <a className="text-charcoal text-sm font-medium hover:text-primary transition-colors" href="#">House & Land</a>
                        <a className="text-charcoal text-sm font-medium hover:text-primary transition-colors" href="#">Display Homes</a>
                        <a className="text-charcoal text-sm font-medium hover:text-primary transition-colors" href="#">Process</a>
                    </div>
                    <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-deep-slate hover:bg-[#1a323e] transition-colors text-[#f9fafa] text-sm font-bold tracking-wide">
                        <span className="truncate">Enquire</span>
                    </button>
                </div>
                {/* Mobile Menu Icon */}
                <div className="lg:hidden">
                    <span className="material-symbols-outlined text-charcoal cursor-pointer">menu</span>
                </div>
            </div>
        </header>
    )
}
