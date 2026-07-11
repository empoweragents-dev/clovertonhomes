import Link from 'next/link'

const companyLinks = [
    { label: 'About', href: '/about' },
    { label: 'Custom build', href: '/custom-process' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
]

const exploreLinks = [
    { label: 'Home designs', href: '/designs' },
    { label: 'House & land', href: '/properties' },
    { label: 'Inclusions', href: '/inclusions' },
    { label: 'Interiors', href: '/interiors' },
    { label: 'Facades', href: '/facades' },
]

export default function Footer() {
    return (
        <footer className="bg-[#171b1a] pb-8 pt-20 text-white">
            <div className="home-container">
                <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.2fr_0.55fr_0.55fr_1fr]">
                    <div>
                        <Link href="/" className="focus-ring inline-block rounded-lg">
                            <img src="/images/logo-white.png" alt="Cloverton Homes" className="h-11 w-auto object-contain" />
                        </Link>
                        <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
                            Explore home designs, house and land opportunities, interior directions, and a building path shaped around what matters to you.
                        </p>
                    </div>

                    <FooterLinks title="Company" links={companyLinks} />
                    <FooterLinks title="Explore" links={exploreLinks} />

                    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#aebfb7]">Have a question?</p>
                        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-[-0.04em]">Find the right place to begin.</h2>
                        <p className="mt-3 text-sm leading-7 text-white/55">Share what you are exploring and we can direct your enquiry.</p>
                        <Link href="/contact" className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#f4f1ea] px-5 text-sm font-bold text-[#234d49] transition hover:bg-white">
                            Start an enquiry
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-5 pt-7 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} Cloverton Homes. All rights reserved.</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
                        <Link href="/terms" className="transition hover:text-white">Terms</Link>
                        <Link href="/faq" className="transition hover:text-white">FAQ</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div>
            <h2 className="font-heading text-lg font-semibold">{title}</h2>
            <ul className="mt-5 space-y-3">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="text-sm text-white/55 transition hover:text-white">{link.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
