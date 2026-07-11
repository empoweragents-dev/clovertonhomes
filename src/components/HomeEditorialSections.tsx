import Image from 'next/image'
import Link from 'next/link'

const processSteps = [
    {
        number: '01',
        title: 'Explore your options',
        text: 'Compare home designs, locations, inclusions, facades, and interior directions at your own pace.',
    },
    {
        number: '02',
        title: 'Define what matters',
        text: 'Bring together the rooms, routines, budget considerations, and block details that will guide your decisions.',
    },
    {
        number: '03',
        title: 'Shape a direction',
        text: 'Use a conversation with the team to understand which design or building path best fits your priorities.',
    },
    {
        number: '04',
        title: 'Plan the next step',
        text: 'Leave with clearer questions, useful options, and a practical direction for moving forward.',
    },
]

const gallery = [
    {
        label: 'Living spaces',
        image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1100&q=85',
        className: 'md:col-span-7 md:row-span-2',
    },
    {
        label: 'Kitchen ideas',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=85',
        className: 'md:col-span-5',
    },
    {
        label: 'Material palettes',
        image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=85',
        className: 'md:col-span-5',
    },
]

const faqs = [
    {
        question: 'Where should I begin if I already own land?',
        answer: 'Start with the block details you already have, including width, depth, orientation, slope, and any planning information. These details make it easier to compare suitable home designs.',
    },
    {
        question: 'Can I explore homes before making an enquiry?',
        answer: 'Yes. Browse the home design, house and land, inclusions, facade, and interiors pages first. An enquiry is most useful when you are ready to ask about a specific direction.',
    },
    {
        question: 'What should I compare between home designs?',
        answer: 'Look beyond bedroom counts. Consider how living zones connect, where storage sits, access between the garage and kitchen, outdoor connections, privacy, and how the plan relates to your block.',
    },
    {
        question: 'How do house and land options work?',
        answer: 'They bring a home design and a block of land into one starting point. Availability, pricing, site requirements, and inclusions can vary, so check the details of each opportunity before deciding.',
    },
    {
        question: 'What information helps with an initial conversation?',
        answer: 'Bring your preferred locations, approximate budget, block information if available, household needs, favourite layouts, and any features you consider essential.',
    },
]

export default function HomeEditorialSections() {
    return (
        <>
            <HouseAndLandSection />
            <InteriorDirectionSection />
            <ProcessSection />
            <GallerySection />
            <FaqSection />
        </>
    )
}

function HouseAndLandSection() {
    return (
        <section className="bg-[#f4f1ea] py-20 sm:py-28">
            <div className="home-container overflow-hidden rounded-[2rem] bg-[#234d49] text-white sm:rounded-[2.5rem]">
                <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="relative min-h-[360px] lg:min-h-[620px]">
                        <Image
                            src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85"
                            alt="Contemporary home surrounded by landscaped greenery"
                            fill
                            sizes="(min-width: 1024px) 55vw, 100vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />
                        <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#234d49] sm:bottom-7 sm:left-7">
                            Home + place
                        </span>
                    </div>
                    <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-14">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c5d5cd]">House and land</p>
                        <h2 className="mt-5 font-heading text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-6xl">
                            Find the home and the place together.
                        </h2>
                        <p className="mt-6 text-base leading-8 text-white/[0.72] sm:text-lg">
                            Explore opportunities by location, home size, and the kind of everyday life you want the property to support.
                        </p>
                        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {['Compare locations', 'Review home layouts', 'Check key property details', 'Save useful options'].map((item) => (
                                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/[0.14] bg-white/[0.06] p-4 text-sm font-semibold text-white/[0.86]">
                                    <span className="h-2 w-2 rounded-full bg-[#d5c4ad]" aria-hidden="true" />
                                    {item}
                                </div>
                            ))}
                        </div>
                        <Link href="/properties" className="focus-ring mt-8 inline-flex min-h-12 w-fit items-center rounded-2xl bg-white px-6 text-sm font-bold text-[#234d49] transition hover:bg-[#f4f1ea]">
                            Explore house &amp; land
                            <span className="material-symbols-outlined ml-2 text-[19px]" aria-hidden="true">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

function InteriorDirectionSection() {
    const palettes = [
        { name: 'Coastal', colors: ['#e8dcc8', '#b8d4ce', '#a69076'] },
        { name: 'Modern', colors: ['#2c3e50', '#d4af37', '#f3f1ec'] },
        { name: 'Hamptons', colors: ['#1e3a5f', '#c5d5e4', '#e8e4de'] },
    ]

    return (
        <section className="bg-[#fcfbf8] py-20 sm:py-28">
            <div className="home-container grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#234d49]">Interiors and inclusions</p>
                    <h2 className="mt-5 font-heading text-4xl font-semibold leading-none tracking-[-0.055em] text-[#202624] sm:text-6xl">
                        Details shape how a home feels.
                    </h2>
                    <p className="mt-6 max-w-xl text-base leading-8 text-[#68706b] sm:text-lg">
                        Explore palettes, materials, fixtures, and practical inclusions together, so the visual direction and everyday function feel connected.
                    </p>
                    <div className="mt-8 space-y-3">
                        {palettes.map((palette) => (
                            <div key={palette.name} className="flex items-center justify-between rounded-2xl border border-[#dfddd6] bg-[#f7f3ec] p-4">
                                <span className="font-heading text-lg font-semibold text-[#202624]">{palette.name}</span>
                                <span className="flex" aria-label={`${palette.name} colour palette`}>
                                    {palette.colors.map((color) => (
                                        <span key={color} className="-ml-1 h-8 w-8 rounded-full border-2 border-[#f7f3ec]" style={{ backgroundColor: color }} />
                                    ))}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link href="/interiors" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#234d49] px-6 text-sm font-bold text-white transition hover:bg-[#1d3f3c]">
                            Explore interiors
                        </Link>
                        <Link href="/inclusions" className="focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#cfc9bd] px-6 text-sm font-bold text-[#234d49] transition hover:bg-[#e8eee9]">
                            View inclusions
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[2rem] bg-[#d8d0c3]">
                        <Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1300&q=85" alt="Warm living room with natural materials" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                    </div>
                    <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[#d8d0c3]">
                        <Image src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=85" alt="Stone surface detail" fill sizes="(min-width: 1024px) 27vw, 50vw" className="object-cover" />
                    </div>
                    <Link href="/facades" className="focus-ring group flex aspect-square flex-col justify-between rounded-[1.5rem] bg-[#e8eee9] p-5 text-[#234d49] sm:p-7">
                        <span className="material-symbols-outlined text-3xl" aria-hidden="true">architecture</span>
                        <span>
                            <span className="block font-heading text-2xl font-semibold tracking-[-0.04em]">Facade ideas</span>
                            <span className="mt-2 inline-flex items-center text-sm font-bold">Explore <span className="material-symbols-outlined ml-1 text-[18px] transition group-hover:translate-x-1" aria-hidden="true">arrow_forward</span></span>
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    )
}

function ProcessSection() {
    return (
        <section className="bg-[#f4f1ea] py-20 sm:py-28">
            <div className="home-container">
                <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#234d49]">A clearer way forward</p>
                    <h2 className="mt-5 font-heading text-4xl font-semibold leading-none tracking-[-0.055em] text-[#202624] sm:text-6xl">
                        Move from browsing to a useful next step.
                    </h2>
                </div>
                <ol className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-[#ded9ce] bg-[#ded9ce] lg:grid-cols-4">
                    {processSteps.map((step) => (
                        <li key={step.number} className="bg-[#fcfbf8] p-6 sm:p-8">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f675d]">{step.number}</span>
                            <h3 className="mt-12 font-heading text-2xl font-semibold tracking-[-0.04em] text-[#202624]">{step.title}</h3>
                            <p className="mt-4 text-sm leading-7 text-[#68706b]">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

function GallerySection() {
    return (
        <section className="bg-[#202624] py-20 text-white sm:py-28">
            <div className="home-container">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#aebfb7]">Inspiration</p>
                        <h2 className="mt-5 font-heading text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-6xl">Ideas for every corner of home.</h2>
                    </div>
                    <Link href="/gallery" className="focus-ring inline-flex min-h-12 w-fit items-center rounded-2xl border border-white/20 px-5 text-sm font-bold transition hover:bg-white hover:text-[#202624]">
                        View the gallery
                    </Link>
                </div>
                <div className="mt-12 grid gap-4 md:grid-cols-12 md:grid-rows-2">
                    {gallery.map((item) => (
                        <Link key={item.label} href="/gallery" className={`focus-ring group relative min-h-[280px] overflow-hidden rounded-[1.75rem] bg-[#313735] ${item.className}`}>
                            <Image src={item.image} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" aria-hidden="true" />
                            <span className="absolute bottom-5 left-5 font-heading text-2xl font-semibold tracking-[-0.04em] sm:bottom-7 sm:left-7">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

function FaqSection() {
    return (
        <section className="bg-[#fcfbf8] py-20 sm:py-28">
            <div className="home-container grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#234d49]">Useful questions</p>
                    <h2 className="mt-5 font-heading text-4xl font-semibold leading-none tracking-[-0.055em] text-[#202624] sm:text-6xl">Know what to ask before you begin.</h2>
                    <Link href="/contact" className="focus-ring mt-8 inline-flex min-h-12 items-center rounded-2xl bg-[#234d49] px-6 text-sm font-bold text-white transition hover:bg-[#1d3f3c]">
                        Ask another question
                    </Link>
                </div>
                <div className="divide-y divide-[#dfddd6] border-y border-[#dfddd6]">
                    {faqs.map((item) => (
                        <details key={item.question} className="group py-1">
                            <summary className="focus-ring flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 rounded-xl py-5 font-heading text-xl font-semibold tracking-[-0.03em] text-[#202624] marker:content-none">
                                {item.question}
                                <span className="material-symbols-outlined shrink-0 text-[#234d49] transition group-open:rotate-45" aria-hidden="true">add</span>
                            </summary>
                            <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-[#68706b]">{item.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
