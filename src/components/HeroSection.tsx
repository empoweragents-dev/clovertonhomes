'use client'

export default function HeroSection() {
    return (
        <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center bg-deep-slate">
            {/* Background Image acting as video poster */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsM8Z92VwelpliPVZgS4089S2nb83fO7QB_KT9zRc3KKPkni7mBqG_k5Lmi-GNoGgH6xm30YlqoGaVdpg0NdR_hD3kjtYj1JOVAllg-0mPCNQyFPK1jXxUkYXFlC7ezXSHRog_eyB8HXvGr8_MhovY98-aMDptw6cwWoKIy5JvrI9evyp4DRWPNrQb3NISh6xVgZpyASkPGptYk-cydgG7qfFwaoUAJypn3sNn6lnsd0Wx1HwdGdzG_XGwAgd9zgC0xrGpBjPLGadx')"
                }}
                role="img"
                aria-label="Luxurious modern living room interior with floor to ceiling windows overlooking a pool"
            ></div>

            {/* Dark Overlay for Menu Focus */}
            <div className="absolute inset-0 bg-deep-slate/40 backdrop-blur-[2px]"></div>

            {/* Hero Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                <span className="inline-block py-1 px-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase mb-6 animate-fade-in-up">
                    Experience Luxury
                </span>
                <h2 className="text-5xl md:text-7xl font-bold text-white font-heading leading-tight mb-6 drop-shadow-lg animate-fade-in-up delay-100">
                    Designed for <br />
                    <span className="italic text-gray-200 font-display font-light">The Way You Live</span>
                </h2>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 animate-fade-in-up delay-200">
                    <button className="h-12 px-8 rounded-full bg-white text-deep-slate font-bold hover:bg-gray-100 transition-colors">
                        Explore Collections
                    </button>
                    <button className="h-12 w-12 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white hover:text-deep-slate transition-all group">
                        <span className="material-symbols-outlined fill-current">play_arrow</span>
                    </button>
                </div>
            </div>
        </section>
    )
}
