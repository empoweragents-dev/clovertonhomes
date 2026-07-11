import Image from 'next/image'

const considerations = [
    { title: 'Space that flows', text: 'Connected living zones, private retreats, and practical transitions between everyday tasks.' },
    { title: 'Storage where it matters', text: 'Places for school bags, linen, appliances, outdoor gear, and the things that usually create clutter.' },
    { title: 'Light and orientation', text: 'Room placement, windows, and outdoor connections considered alongside the shape of the block.' },
    { title: 'Room to make it yours', text: 'Facade, palette, fixture, and layout decisions that give the home a more personal direction.' },
]

export default function ExperienceGrid() {
    return (
        <section className="bg-[#fcfbf8] py-20 sm:py-28">
            <div className="home-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="lg:sticky lg:top-28">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#234d49]">Designed around daily life</p>
                    <h2 className="font-heading text-4xl font-semibold leading-none tracking-[-0.055em] text-[#202624] sm:text-6xl">
                        The best plans feel easy to live in.
                    </h2>
                    <p className="mt-6 max-w-xl text-base leading-8 text-[#68706b] sm:text-lg">
                        A home should make ordinary routines feel simpler, with thoughtful spaces that support the way each day naturally unfolds.
                    </p>
                    <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#d8d0c3]">
                        <Image
                            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85"
                            alt="Warm modern kitchen and living space with timber and stone finishes"
                            fill
                            sizes="(min-width: 1024px) 45vw, 100vw"
                            className="object-cover object-center transition duration-700 hover:scale-[1.02]"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {considerations.map((item, index) => (
                        <article key={item.title} className="rounded-[1.75rem] border border-[#dfddd6] bg-[#f7f3ec] p-6 sm:p-8">
                            <div className="mb-8 flex items-center justify-between border-b border-[#dfddd6] pb-5">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6f675d]">{String(index + 1).padStart(2, '0')}</span>
                                <span className="h-2 w-2 rounded-full bg-[#234d49]" aria-hidden="true" />
                            </div>
                            <h3 className="font-heading text-2xl font-semibold tracking-[-0.04em] text-[#202624]">{item.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-[#68706b]">{item.text}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
