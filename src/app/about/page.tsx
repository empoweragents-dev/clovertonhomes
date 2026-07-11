import Image from 'next/image'
import Link from 'next/link'

const principles = [
    {
        number: '01',
        title: 'Clarity before complexity',
        text: 'Home building comes with many decisions. We organise the options so visitors can understand what matters now and what can wait.',
    },
    {
        number: '02',
        title: 'Designed for daily life',
        text: 'Good design starts with routines: how people gather, move through the home, find privacy, store things, and connect with outdoor spaces.',
    },
    {
        number: '03',
        title: 'Choices with purpose',
        text: 'Layouts, facades, finishes, and inclusions should support a clear direction rather than add unnecessary noise to the process.',
    },
]

const pathways = [
    { title: 'Home designs', text: 'Compare layouts, room counts, storeys, and different ways of organising a home.', href: '/designs' },
    { title: 'House and land', text: 'Explore a home and location together through available property opportunities.', href: '/properties' },
    { title: 'Custom building', text: 'Begin with your block, priorities, and ideas when a more tailored direction is needed.', href: '/custom-process' },
    { title: 'Interiors and inclusions', text: 'Bring materials, colours, fixtures, and practical details into the same conversation.', href: '/interiors' },
]

export default function AboutPage() {
    return (
        <div className="bg-[#fcfbf8]">
            <section className="bg-[#f4f1ea] py-20 sm:py-28">
                <div className="home-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#234d49]">About Cloverton Homes</p>
                        <h1 className="mt-5 max-w-4xl font-heading text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-[#202624] sm:text-7xl lg:text-8xl">
                            A clearer way to shape your home.
                        </h1>
                    </div>
                    <p className="max-w-2xl text-base leading-8 text-[#626a66] sm:text-xl lg:justify-self-end">
                        Cloverton Homes brings designs, locations, building pathways, and interior choices together so you can explore what suits your life before deciding what comes next.
                    </p>
                </div>
            </section>

            <section className="py-20 sm:py-28">
                <div className="home-container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#d8d0c3] sm:min-h-[620px]">
                        <Image
                            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1500&q=85"
                            alt="Contemporary interior with warm timber and natural light"
                            fill
                            priority
                            sizes="(min-width: 1024px) 55vw, 100vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="lg:pl-8">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#234d49]">What we are here to do</p>
                        <h2 className="mt-5 font-heading text-4xl font-semibold leading-none tracking-[-0.055em] text-[#202624] sm:text-6xl">
                            Make the early decisions feel more manageable.
                        </h2>
                        <div className="mt-7 space-y-5 text-base leading-8 text-[#626a66]">
                            <p>
                                Choosing a home is rarely one decision. It is a series of connected questions about land, layout, room sizes, lifestyle, budget, finishes, and the details that make a space feel personal.
                            </p>
                            <p>
                                Our role is to give those questions a useful structure. You can compare established home designs, explore house and land opportunities, understand a custom path, and develop an interior direction without being pushed toward a single answer too early.
                            </p>
                            <p>
                                The aim is simple: help you arrive at the next conversation with a clearer sense of what you need and what you want to explore further.
                            </p>
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link href="/designs" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#234d49] px-6 text-sm font-bold text-white transition hover:bg-[#1d3f3c]">
                                Explore home designs
                            </Link>
                            <Link href="/contact" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#cfc9bd] px-6 text-sm font-bold text-[#234d49] transition hover:bg-[#e8eee9]">
                                Ask a question
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#202624] py-20 text-white sm:py-28">
                <div className="home-container">
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#aebfb7]">What guides the experience</p>
                        <h2 className="mt-5 font-heading text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-6xl">
                            Less noise. More useful direction.
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 lg:grid-cols-3">
                        {principles.map((principle) => (
                            <article key={principle.number} className="bg-[#202624] p-7 sm:p-9">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#aebfb7]">{principle.number}</span>
                                <h3 className="mt-12 font-heading text-2xl font-semibold tracking-[-0.04em]">{principle.title}</h3>
                                <p className="mt-4 text-sm leading-7 text-white/65">{principle.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#f4f1ea] py-20 sm:py-28">
                <div className="home-container">
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#234d49]">Ways to begin</p>
                            <h2 className="mt-5 font-heading text-4xl font-semibold leading-none tracking-[-0.055em] text-[#202624] sm:text-6xl">
                                Start with the part you know.
                            </h2>
                        </div>
                        <p className="max-w-xl text-base leading-8 text-[#626a66] sm:text-lg lg:justify-self-end">
                            You do not need every answer before you start exploring. Choose the pathway closest to your current situation.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-4 sm:grid-cols-2">
                        {pathways.map((pathway) => (
                            <Link key={pathway.title} href={pathway.href} className="focus-ring group rounded-[1.75rem] border border-[#ded9ce] bg-[#fcfbf8] p-6 transition hover:-translate-y-1 hover:border-[#234d49]/30 hover:shadow-xl hover:shadow-black/5 sm:p-8">
                                <div className="flex items-start justify-between gap-5">
                                    <div>
                                        <h3 className="font-heading text-2xl font-semibold tracking-[-0.04em] text-[#202624]">{pathway.title}</h3>
                                        <p className="mt-3 max-w-xl text-sm leading-7 text-[#626a66]">{pathway.text}</p>
                                    </div>
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#ded9ce] text-[#234d49] transition group-hover:bg-[#234d49] group-hover:text-white">
                                        <span className="material-symbols-outlined text-[19px]" aria-hidden="true">arrow_outward</span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
