import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-[#171b1a] text-white">
            <div className="absolute inset-0" aria-hidden="true">
                <Image
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="scale-[1.03] object-cover object-center motion-safe:animate-[reveal-soft_900ms_ease-out_both]"
                />
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(35, 77, 73, 0.82)' }}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(8, 20, 19, 0.3) 0%, rgba(8, 20, 19, 0.08) 45%, rgba(8, 20, 19, 0.45) 100%)' }}
                />
            </div>

            <div className="home-container relative z-10 flex min-h-[calc(100dvh-4rem)] items-center justify-center py-20 text-center sm:min-h-[calc(100dvh-5rem)]">
                <div className="max-w-4xl">
                    <h1
                        className="reveal-soft font-heading font-semibold text-white"
                        style={{
                            fontSize: 'clamp(3.25rem, 8vw, 6.75rem)',
                            lineHeight: 0.9,
                            letterSpacing: '-0.065em',
                            textShadow: '0 3px 18px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        Designed around the way you live.
                    </h1>
                    <p
                        className="reveal-soft mx-auto mt-6 max-w-xl text-base leading-7 sm:text-lg"
                        style={{ color: 'rgba(255, 255, 255, 0.94)', textShadow: '0 2px 8px rgba(0, 0, 0, 0.55)', animationDelay: '100ms' }}
                    >
                        Explore homes, land, and design possibilities in one place.
                    </p>
                    <div className="reveal-soft mt-8 flex flex-col justify-center gap-3 sm:flex-row [animation-delay:180ms]">
                        <Link href="/designs" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-[#202624] transition hover:bg-[#f4f1ea]">
                            Explore home designs
                        </Link>
                        <Link href="/properties" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-[#202624]">
                            Find house &amp; land
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
