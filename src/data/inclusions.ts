
export type InclusionTier = 'standard' | 'designer' | 'premium';

export interface InclusionItem {
    id: string;
    tier: InclusionTier;
    title: string;
    description: string;
    badge: string;
    features: string[];
    image?: string;
    imageUrl?: string;
}

export interface InclusionCategory {
    id: string;
    title: string;
    items: Record<InclusionTier, InclusionItem | null>;
}

export const inclusionsData: InclusionCategory[] = [
    {
        id: 'kitchen',
        title: 'Kitchen & Culinary',
        items: {
            standard: {
                id: 'kitchen-standard',
                tier: 'standard',
                title: 'Kitchen Essentials',
                description: 'Functional, durable, and ready for family meals. High-quality finishes that stand the test of time.',
                badge: 'Classic Series',
                features: [
                    'Technika 900mm Stainless Steel Upright Cooker',
                    'Technika 900mm Stainless Steel Rangehood',
                    'Laminate cabinetry with tight-radius edges',
                    'Chrome mixer tapware',
                    'Generous pantry storage'
                ],
                image: 'https://images.unsplash.com/photo-1556912173-3db9963f638f?auto=format&fit=crop&w=1200&q=80'
            },
            designer: {
                id: 'kitchen-designer',
                tier: 'designer',
                title: 'Chef\'s Design Kitchen',
                description: 'European styling meets ergonomic performance. upgraded finishes and smarter storage solutions.',
                badge: 'Designer Specifications',
                features: [
                    'European Designed 900mm Stainless Steel Appliances',
                    '20mm Stone Benchtops (Caesarstone)',
                    'Custom cabinetry with soft-close drawers',
                    'Dishwasher provision and connections',
                    'Microwave provision with pot drawer'
                ],
                image: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=1200&q=80'
            },
            premium: {
                id: 'kitchen-premium',
                tier: 'premium',
                title: 'Gourmet Entertaining Hub',
                description: 'The ultimate culinary workspace with premium finishes, designed for the serious entertainer.',
                badge: 'Elegance Inclusions',
                features: [
                    'Smeg 900mm Premium Appliance Package',
                    '40mm Stone Benchtops with Waterfall Ends',
                    'Undermount double bowl stainless steel sink',
                    'Polytec sheen or matte cabinetry finishes',
                    'Glass splashback feature'
                ],
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
            }
        }
    },
    {
        id: 'bathroom',
        title: 'Bathroom & Ensuite',
        items: {
            standard: {
                id: 'bath-standard',
                tier: 'standard',
                title: 'Family Sanctuary',
                description: 'Clean, bright, and practical spaces designed for daily durability.',
                badge: 'Classic Series',
                features: [
                    'Freestanding Bath to Main Bathroom',
                    'Chrome Tapware & Accessories',
                    'Polished edge mirrors',
                    'Ceramic tiling to wet areas',
                    'Semi-frameless shower screens'
                ],
                image: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'
            },
            designer: {
                id: 'bath-designer',
                tier: 'designer',
                title: 'Designer Retreat',
                description: 'Elevated aesthetics with custom joinery and refined fixtures.',
                badge: 'Designer Specifications',
                features: [
                    'Custom made vanity cabinetry',
                    'Designer vitreous china basins',
                    'Upgraded tapware ranges',
                    'Tiled shower niches',
                    'Heat/Fan/Light units'
                ],
                image: 'https://images.unsplash.com/photo-1620626012053-1c1cae5e354d?auto=format&fit=crop&w=1200&q=80'
            },
            premium: {
                id: 'bath-premium',
                tier: 'premium',
                title: 'Luxury Day Spa',
                description: 'A hotel-inspired experience in your own home with floor-to-ceiling elegance.',
                badge: 'Elegance Inclusions',
                features: [
                    'Floor to ceiling tiling options',
                    'Frameless shower screens',
                    'Twin vanities to Master Ensuite (design specific)',
                    'Smart mirrors with LED lighting',
                    'Rain shower heads'
                ],
                image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80'
            }
        }
    },
    {
        id: 'structural',
        title: 'Structural & Exterior',
        items: {
            standard: {
                id: 'struct-standard',
                tier: 'standard',
                title: 'Solid Foundations',
                description: 'Engineered for strength and longevity with superior core materials.',
                badge: 'Classic Series',
                features: [
                    'TRUECORE® Steel House Frame',
                    'COLORBOND® Sheet Metal Roof',
                    'Sectional Overhead Garage Door',
                    'Powder coated aluminium windows',
                    'Termite protection system'
                ],
                image: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=1200&q=80'
            },
            designer: {
                id: 'struct-designer',
                tier: 'designer',
                title: 'Traditional Strength',
                description: 'Enhanced street appeal with texture and substance.',
                badge: 'Designer Specifications',
                features: [
                    'T2 Termite Resistant Structural Timber Frame',
                    'Classic Profile Concrete Roof Tiles',
                    'Brick infills above windows',
                    'Stained timber front entry door',
                    'Upgraded facade render options'
                ],
                image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80'
            },
            premium: {
                id: 'struct-premium',
                tier: 'premium',
                title: 'Engineered Certainty',
                description: 'Maximum peace of mind with upgraded foundation engineering to handle difficult sites.',
                badge: 'Elegance Inclusions',
                features: [
                    'Upgraded "M" Class Slab Engineering',
                    '3-Phase Power Connection',
                    'Higher 2590mm Ceilings',
                    'Grand entry door with digital lock',
                    'Wide eaves for thermal efficiency'
                ],
                image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
            }
        }
    },
    {
        id: 'living',
        title: 'Living & Lifestyle',
        items: {
            standard: {
                id: 'living-standard',
                tier: 'standard',
                title: 'Comfortable Living',
                description: 'Bright, open spaces designed for modern family life.',
                badge: 'Classic Series',
                features: [
                    'Open plan living areas',
                    'Standard sliding doors to alfresco',
                    'Quality internal painting (2 coats)',
                    'Roller blinds to bedroom windows',
                    'Flyscreens to all opening windows'
                ],
                image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
            },
            designer: {
                id: 'living-designer',
                tier: 'designer',
                title: 'Indoor-Outdoor Flow',
                description: 'Seamlessly connecting your living areas with the outdoors.',
                badge: 'Designer Specifications',
                features: [
                    'Aluminium Stacker or Biparting Sliding Doors',
                    'Timber-look laminate flooring to main areas',
                    'Upgraded carpet with quality underlay',
                    'Tri-lock lever handling to entry',
                    'Decorative cornices'
                ],
                image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
            },
            premium: {
                id: 'living-premium',
                tier: 'premium',
                title: 'Grand Interiors',
                description: 'Statement features that create a wow factor from the moment you enter.',
                badge: 'Elegance Inclusions',
                features: [
                    'Statement Staircase with Timber Handrail (Double Storey)',
                    'Dulux Wash&Wear Premium Paint System',
                    'Large format 600x600 porcelain tiling options',
                    'Feature wall capability',
                    'Sound insulation batts to internal walls'
                ],
                image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80'
            }
        }
    },
    {
        id: 'climate',
        title: 'Climate & Technology',
        items: {
            standard: {
                id: 'tech-standard',
                tier: 'standard',
                title: 'Efficient Basics',
                description: 'Core energy efficiency features to keep bills down.',
                badge: 'Classic Series',
                features: [
                    'Gas ducted heating',
                    'Solar hot water system',
                    'R4.0 Ceiling Batts',
                    'Keyed window locks',
                    'Safety switches and smoke detectors'
                ],
                image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80'
            },
            designer: {
                id: 'tech-designer',
                tier: 'designer',
                title: 'Connected Living',
                description: 'Modern connectivity features for the digital family.',
                badge: 'Designer Specifications',
                features: [
                    'NBN Provisions',
                    'LED Downlights to Living Areas',
                    'TV points to Living and Master',
                    'Evaporative Cooling Unit',
                    'External power points'
                ],
                image: 'https://images.unsplash.com/photo-1558002038-10917738179d?auto=format&fit=crop&w=1200&q=80'
            },
            premium: {
                id: 'tech-premium',
                tier: 'premium',
                title: 'Total Climate Control',
                description: 'Premium smart home climate solutions for typical comfort.',
                badge: 'Elegance Inclusions',
                features: [
                    'Daikin Inverter Ducted Reverse Cycle Air Conditioning',
                    'MyAir Smart Controller / Airbase App',
                    'Alarm System with Sensors',
                    'VIDEO Intercom System',
                    'Electric Car Charging Provision'
                ],
                image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=80'
            }
        }
    }
];
