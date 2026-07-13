import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

// Text fonts (swap: content shows immediately in a system fallback, then swaps).
const TEXT_FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap'

// Material Symbols, subset to ONLY the icons this site uses (huge size cut vs the
// full ~1.1MB font) and display=block so icons never flash as ligature text.
const ICON_NAMES = 'add,apartment,architecture,arrow_back,arrow_forward,arrow_outward,assignment,bar_chart,bathtub,bed,call,chair,chat_bubble,check,check_circle,chevron_left,chevron_right,close,construction,countertops,dashboard,delete,design_services,directions_car,domain,download,edit,edit_square,expand_more,fact_check,favorite,flip,floor_lamp,forum,garage_home,gavel,grid_view,home,home_work,image,image_not_supported,inbox,ios_share,key,landscape,list,location_on,logout,mail,mark_email_read,menu,palette,person,photo_library,picture_as_pdf,progress_activity,real_estate_agent,save,school,search,settings,shower,square_foot,star,support_agent,terrain,touch_app,verified_user,visibility,weekend,zoom_in'
const ICON_FONT = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${ICON_NAMES}&display=block`

export const metadata: Metadata = {
    metadataBase: new URL('https://clovertonhomes.com.au'),
    title: {
        default: 'Cloverton Homes | Home Designs, House & Land and Custom Builds',
        template: '%s | Cloverton Homes',
    },
    description: 'Explore home designs, house and land opportunities, interiors, inclusions, and custom building pathways with Cloverton Homes.',
    keywords: ['home builder', 'house and land', 'home designs', 'custom homes', 'knockdown rebuild', 'new home builder Australia'],
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        siteName: 'Cloverton Homes',
        title: 'Cloverton Homes | Home Designs, House & Land and Custom Builds',
        description: 'Explore home designs, house and land opportunities, interiors, inclusions, and custom building pathways.',
        url: 'https://clovertonhomes.com.au',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cloverton Homes',
        description: 'Home designs, house and land, and custom building pathways.',
    },
    robots: { index: true, follow: true },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="light" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                {/* Load fonts WITHOUT blocking first paint: fetch as print (non-render-blocking),
                    then flip to all on load. Page renders instantly with system fallbacks. */}
                <link rel="preload" as="style" href={TEXT_FONTS} />
                <link rel="preload" as="style" href={ICON_FONT} />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){var u=[${JSON.stringify(TEXT_FONTS)},${JSON.stringify(ICON_FONT)}];for(var i=0;i<u.length;i++){(function(h){var l=document.createElement('link');l.rel='stylesheet';l.href=h;l.media='print';l.onload=function(){this.media='all'};document.head.appendChild(l);})(u[i]);}})();`,
                    }}
                />
                <noscript>
                    <link rel="stylesheet" href={TEXT_FONTS} />
                    <link rel="stylesheet" href={ICON_FONT} />
                </noscript>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'Cloverton Homes',
                            url: 'https://clovertonhomes.com.au',
                            logo: 'https://clovertonhomes.com.au/images/logo-white.png',
                            description: 'Home designs, house and land opportunities, and custom building pathways.',
                            areaServed: 'AU',
                            sameAs: [],
                        }),
                    }}
                />
            </head>
            <body className="bg-background-light dark:bg-background-dark font-display antialiased text-brand-charcoal overflow-x-hidden">
                <LayoutWrapper>
                    {children}
                </LayoutWrapper>
            </body>
        </html>
    )
}
