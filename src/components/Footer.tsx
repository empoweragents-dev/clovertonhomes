'use client'

import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-deep-slate text-white pt-20 pb-10 font-display">
            <div className="max-w-[1440px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="inline-block mb-6">
                            <div className="flex items-center gap-3">
                                {/* Using the white logo we just set up */}
                                <img
                                    src="/images/logo-white.png"
                                    alt="Cloverton Homes"
                                    className="h-10 w-auto object-contain"
                                />
                            </div>
                        </Link>
                        <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
                            Building detailed, quality homes that stand the test of time. We believe in transparency, craftsmanship, and creating spaces where families thrive.
                        </p>
                        <div className="flex items-center gap-4">
                            {['facebook', 'instagram', 'linkedin', 'pinterest'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-white transition-all duration-300"
                                    aria-label={`Follow us on ${social}`}
                                >
                                    <img
                                        src={`https://cdn.simpleicons.org/${social}/white`}
                                        className="w-4 h-4 opacity-80"
                                        alt=""
                                    />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-lg mb-6 text-white font-heading">Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Our Story</Link></li>
                            <li><Link href="/process" className="text-gray-400 hover:text-white transition-colors">Our Process</Link></li>
                            <li><Link href="/team" className="text-gray-400 hover:text-white transition-colors">Meet the Team</Link></li>
                            <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-lg mb-6 text-white font-heading">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link href="/designs" className="text-gray-400 hover:text-white transition-colors">Home Designs</Link></li>
                            <li><Link href="/inclusions" className="text-gray-400 hover:text-white transition-colors">Inclusions</Link></li>
                            <li><Link href="/display-homes" className="text-gray-400 hover:text-white transition-colors">Display Homes</Link></li>
                            <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">News & Insights</Link></li>
                            <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-4">
                        <h4 className="font-bold text-lg mb-6 text-white font-heading">Stay Updated</h4>
                        <p className="text-gray-400 mb-6">
                            Subscribe to our newsletter for the latest design trends, construction updates, and exclusive offers.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                            <button
                                type="button"
                                className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-white hover:text-primary transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Cloverton Homes. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
                        <Link href="/sitemap" className="text-gray-500 hover:text-white text-sm transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
