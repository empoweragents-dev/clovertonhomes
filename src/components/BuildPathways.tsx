import Image from 'next/image'
import Link from 'next/link'

const pathways = [
    {
        eyebrow: '01',
        title: 'You already have land',
        text: 'Start by comparing layouts, frontage options, orientation, and the everyday spaces your household needs most.',
        href: '/designs',
        cta: 'Browse designs',
        image: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1100&q=80',
    },
    {
        eyebrow: '02',
        title: 'You want the home and place together',
        text: 'Look at available house and land options by location, home size, and the kind of lifestyle you are planning for.',
        href: '/properties',
        cta: 'View packages',
        image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1100&q=80',
    },
    {
        eyebrow: '03',
        title: 'You are rethinking an existing property',
        text: 'Use your current location as the starting point and explore what a better-planned home could make possible.',
        href: '/custom-process',
        cta: 'Understand the path',
        image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=80',
    },
]

export default function BuildPathways() {
    return (
        <section className="bg-[#f4f1ea] py-20 sm:py-28">
            <div className="home-container">
                <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                    <div>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#234d49]">Choose a starting point</p>
                        <h2 className="font-heading text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#202624] sm:text-6xl">
                            Start with what you know.
                        </h2>
                    </div>
                    <p className="max-w-2xl text-base leading-8 text-[#68706b] sm:text-lg lg:justify-self-end">
                        The right first step depends on what you already have: a block, a preferred location, an existing home, or simply a clear picture of how you want to live.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 lg:grid-cols-3">
                    {pathways.map((path) => (
                        <Link key={path.title} href={path.href} className="focus-ring group overflow-hidden rounded-[2rem] border border-[#ded9ce] bg-[#fcfbf8] transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#202624]/10">
                            <div className="relative aspect-[4/3] overflow-hidden bg-[#d8d0c3]">
                                <Image
                                    src={path.image}
                                    alt=""
                                    fill
                                    sizes="(min-width: 1024px) 33vw, 100vw"
                                    className="object-cover object-center transition duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-[0.18em] text-[#234d49] backdrop-blur">
                                    {path.eyebrow}
                                </span>
                            </div>
                            <div className="p-6 sm:p-7">
                                <h3 className="font-heading text-2xl font-semibold tracking-[-0.04em] text-[#202624]">{path.title}</h3>
                                <p className="mt-4 text-sm leading-7 text-[#68706b]">{path.text}</p>
                                <span className="mt-6 inline-flex items-center text-sm font-bold text-[#234d49]">
                                    {path.cta}
                                    <span className="material-symbols-outlined ml-1 text-[18px] transition group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
