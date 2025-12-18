'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import EnquireModal from './EnquireModal'

export default function Header() {
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
    const [isEnquireModalOpen, setIsEnquireModalOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null)

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false)
                setMobileSubmenuOpen(null)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isMobileMenuOpen])

    const mobileNavLinks = [
        { name: 'Home Designs', href: '/designs', hasSubmenu: true },
        { name: 'Custom Design Build', href: '/custom-process' },
        { name: 'Home & Land Packages', href: '/properties' },
        { name: 'Inclusions', href: '/inclusions' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
    ]

    const designSubmenuItems = [
        { name: 'Popular Designs', href: '/designs', icon: 'home' },
        { name: 'Inclusions', href: '/inclusions', icon: 'check_circle' },
        { name: 'Façades', href: '/facades', icon: 'dashboard' },
        { name: 'Design Studio', href: '/studio', icon: 'design_services' },
        { name: 'Interior Schemes', href: '/interiors', icon: 'palette' },
        { name: 'Image Gallery', href: '/gallery', icon: 'photo_library' },
    ]

    return (
        <header className="fixed top-0 left-0 w-full z-50 font-heading">
            {/* Main Navigation Bar */}
            <div className="bg-deep-slate text-white relative z-50 border-b border-white/10">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 select-none cursor-pointer">
                        <img
                            src="/images/logo-white.png"
                            alt="Cloverton Homes"
                            className="h-10 sm:h-12 w-auto object-contain"
                        />
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <nav className="hidden lg:flex items-center h-full">
                        <ul className="flex items-center gap-1">
                            {/* Active Mega Menu Trigger */}
                            <li
                                className="h-20 flex items-center relative group"
                                onMouseEnter={() => setIsMegaMenuOpen(true)}
                                onMouseLeave={() => setIsMegaMenuOpen(false)}
                            >
                                <a className="px-5 text-sm font-medium tracking-wide text-white transition-colors flex items-center gap-1 h-full border-b-4 border-primary bg-white/5" href="#">
                                    Home Designs
                                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                </a>
                            </li>
                            <li className="h-20 flex items-center"><Link href="/custom-process" className="px-5 text-sm font-medium tracking-wide text-gray-300 hover:text-white transition-colors opacity-80 hover:opacity-100">Custom Design Build</Link></li>
                            <li className="h-20 flex items-center"><Link href="/properties" className="px-5 text-sm font-medium tracking-wide text-gray-300 hover:text-white transition-colors opacity-80 hover:opacity-100">Home & Land Packages</Link></li>
                            <li className="h-20 flex items-center"><Link href="/inclusions" className="px-5 text-sm font-medium tracking-wide text-gray-300 hover:text-white transition-colors opacity-80 hover:opacity-100">Inclusions</Link></li>
                            <li className="h-20 flex items-center"><Link href="/about" className="px-5 text-sm font-medium tracking-wide text-gray-300 hover:text-white transition-colors opacity-80 hover:opacity-100">About Us</Link></li>
                            <li className="h-20 flex items-center"><Link href="/contact" className="px-5 text-sm font-medium tracking-wide text-gray-300 hover:text-white transition-colors opacity-80 hover:opacity-100">Contact Us</Link></li>
                        </ul>
                    </nav>

                    {/* Utility Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Search (Icon Only for clean look) */}
                        <button aria-label="Search" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                        {/* Contact Button - Desktop */}
                        <button
                            onClick={() => setIsEnquireModalOpen(true)}
                            className="hidden sm:flex items-center gap-2 h-10 px-6 rounded-full bg-white hover:bg-gray-100 text-primary text-sm font-bold tracking-wide transition-all shadow-lg shadow-black/5"
                        >
                            <span>Enquire</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                        {/* Hamburger Menu - Mobile */}
                        <button
                            aria-label="Menu"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-[24px]">
                                {isMobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <div
                className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Drawer Panel */}
                <div
                    className={`absolute top-16 sm:top-20 right-0 w-full max-w-sm h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-white shadow-2xl transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="h-full overflow-y-auto">
                        {/* Nav Links */}
                        <nav className="py-4">
                            {mobileNavLinks.map((link) => (
                                <div key={link.name}>
                                    {link.hasSubmenu ? (
                                        <>
                                            <button
                                                onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === link.name ? null : link.name)}
                                                className="w-full flex items-center justify-between px-6 py-4 text-charcoal hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-base font-bold">{link.name}</span>
                                                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${mobileSubmenuOpen === link.name ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </button>
                                            {/* Submenu */}
                                            <div className={`overflow-hidden transition-all duration-300 bg-gray-50 ${mobileSubmenuOpen === link.name ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="py-2 px-4">
                                                    {designSubmenuItems.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-white hover:text-primary transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-primary/60">{item.icon}</span>
                                                            <span className="font-medium">{item.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-6 py-4 text-base font-bold text-charcoal hover:bg-gray-50 hover:text-primary transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* CTA Section */}
                        <div className="px-6 py-6 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false)
                                    setIsEnquireModalOpen(true)
                                }}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-base transition-all shadow-lg"
                            >
                                <span>Get a Quote</span>
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3">
                                Free consultation • No obligation
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[20px]">call</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Call us</p>
                                    <a href="tel:1300000000" className="text-charcoal font-bold hover:text-primary transition-colors">1300 000 000</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email us</p>
                                    <a href="mailto:info@cloverton.com.au" className="text-charcoal font-bold hover:text-primary transition-colors">info@cloverton.com.au</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mega Menu Container - Desktop */}
            <div
                className={`absolute top-full left-0 w-full bg-white text-charcoal shadow-2xl border-t border-gray-100 z-40 transition-all duration-300 ease-in-out hidden lg:block ${isMegaMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
                    }`}
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
                <div className="max-w-[1440px] mx-auto px-6 py-10">
                    <div className="grid grid-cols-12 gap-8 lg:gap-12">
                        {/* Left Column: Title and CTA */}
                        <div className="col-span-12 md:col-span-3 lg:col-span-3">
                            <h2 className="text-2xl font-bold text-charcoal font-heading mb-4">Home designs</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                Do you have vacant land or considering a knockdown rebuild? Search our four series of home designs.
                            </p>
                            <Link
                                href="/designs"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg"
                            >
                                View designs
                            </Link>
                        </div>

                        {/* Right Column: 2x3 Grid of Items */}
                        <div className="col-span-12 md:col-span-9 lg:col-span-9">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Popular Designs */}
                                <Link href="/designs" className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <img
                                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80"
                                            alt="Popular designs"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal font-heading group-hover:text-primary transition-colors">Popular designs</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Explore and compare our most popular home designs.</p>
                                    </div>
                                </Link>

                                {/* Inclusions */}
                                <Link href="/inclusions" className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <img
                                            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=200&q=80"
                                            alt="Inclusions"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal font-heading group-hover:text-primary transition-colors">Inclusions</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Discover what we include in our series of home designs.</p>
                                    </div>
                                </Link>

                                {/* Façades */}
                                <Link href="/facades" className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <img
                                            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80"
                                            alt="Facades"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal font-heading group-hover:text-primary transition-colors">Façades</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">View our façade options to transform your home's exterior.</p>
                                    </div>
                                </Link>

                                {/* Design Studio */}
                                <Link href="/studio" className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <img
                                            src="https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=200&q=80"
                                            alt="Design Studio"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal font-heading group-hover:text-primary transition-colors">Design Studio</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Preview our design studio, the place to personalise your home.</p>
                                    </div>
                                </Link>

                                {/* Interior Schemes */}
                                <Link href="/interiors" className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <img
                                            src="https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=200&q=80"
                                            alt="Interior schemes"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal font-heading group-hover:text-primary transition-colors">Interior schemes</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Browse our curated internal material and colour schemes.</p>
                                    </div>
                                </Link>

                                {/* Image Gallery */}
                                <Link href="/gallery" className="group flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                        <img
                                            src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=200&q=80"
                                            alt="Image gallery"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal font-heading group-hover:text-primary transition-colors">Image gallery</h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Browse photos showcasing our architecture and interior design.</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <EnquireModal isOpen={isEnquireModalOpen} onClose={() => setIsEnquireModalOpen(false)} />
        </header>
    )
}
