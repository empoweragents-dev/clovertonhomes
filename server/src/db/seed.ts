
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";
import {
    regions, estates, homeDesigns, properties,
    designImages, designFloorplans, propertyImages,
    user, account
} from "./schema";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

const main = async () => {
    console.log("🌱 Starting seed...");

    try {
        // 1. Clear existing data
        console.log("Cleaning database...");
        await db.delete(propertyImages);
        await db.delete(properties);
        await db.delete(designImages);
        await db.delete(designFloorplans);
        await db.delete(homeDesigns);
        await db.delete(estates);
        await db.delete(regions);
        await db.delete(account);
        await db.delete(user);

        // 2. Insert Admin User
        console.log("Inserting admin user...");
        const adminUser = await db.insert(user).values({
            id: uuidv4(),
            name: "Admin User",
            email: "admin@clovertonhomes.com.au",
            emailVerified: true,
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Note: Password hashing is usually handled by Better Auth internally or via a separate auth seed. 
        // For now, we will assume the initial login flow or a separate set-password mechanism will be used,
        // or we manually insert a known hashed password if Better Auth requires it for email/password.
        // Since we are using Better Auth, we might need to register the user via API or helper, 
        // but for seeding raw DB we insert the user record.
        // *Correction*: Better Auth stores password hash in 'account' table usually for email-password provider.

        // Simulating a dummy account record (In real app, use auth API to register)
        await db.insert(account).values({
            id: uuidv4(),
            userId: adminUser[0].id,
            accountId: adminUser[0].id, // usually same as user id for internal
            providerId: "credential", // or 'email-password'
            password: "password123", // WARNING: In production this MUST be hashed. For dev/seed we'll leave plain text if using a custom local auth or replace with valid hash.
            // If using standard Better Auth, you'd typically run a script that uses the auth library to create the user properly.
            // For this task, we'll placeholder this. The user might need to 'Sign Up' first time or we use a known hash.
        });


        // 3. Insert Regions (Including Sydney South West)
        console.log("Inserting regions...");
        const regionData = [
            { name: "Sydney South West", state: "NSW" }, // New requested region
            { name: "North West", state: "VIC" },
            { name: "South East", state: "VIC" },
            { name: "Western Suburbs", state: "VIC" },
        ];

        const insertedRegions = await db.insert(regions).values(
            regionData.map(r => ({
                name: r.name,
                slug: slugify(r.name, { lower: true }),
                state: r.state
            }))
        ).returning();

        // 4. Insert Estates (Including Sydney SW estates)
        console.log("Inserting estates...");
        const estateData = [
            // Sydney SW
            { name: "Oran Park", regionName: "Sydney South West", description: "A thriving community in Sydney's South West." },
            { name: "Leppington Living", regionName: "Sydney South West", description: "Connected living in the heart of growth." },
            { name: "Gregory Hills", regionName: "Sydney South West", description: "Established community with views." },
            { name: "Edmondson Park", regionName: "Sydney South West", description: "Close to train station and town centre." },
            // VIC
            { name: "Cloverton Estate", regionName: "North West", description: "A masterplanned community in Kalkallo." },
            { name: "Woodlea", regionName: "Western Suburbs", description: "A modern community in Aintree." },
        ];

        const insertedEstates = [];
        for (const est of estateData) {
            const region = insertedRegions.find(r => r.name === est.regionName);
            if (region) {
                const [inserted] = await db.insert(estates).values({
                    name: est.name,
                    slug: slugify(est.name, { lower: true }),
                    regionId: region.id,
                    description: est.description
                }).returning();
                insertedEstates.push(inserted);
            }
        }

        // 5. Insert Home Designs
        console.log("Inserting home designs...");
        const designData = [
            { name: "Ascot 28", priceFrom: 35000000, bedrooms: 4, bathrooms: 2, garages: 2, storeys: "single", category: "popular", squareMeters: 260, landWidth: "12.50", landDepth: "28.00", featuredImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=1000&q=80" },
            { name: "Windsor 36", priceFrom: 48000000, bedrooms: 5, bathrooms: 3, garages: 2, storeys: "double", category: "double_storey", squareMeters: 334, landWidth: "14.00", landDepth: "30.00", featuredImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80" },
            { name: "Hampton 24", priceFrom: 29500000, bedrooms: 3, bathrooms: 2, garages: 2, storeys: "single", category: "single_storey", squareMeters: 220, landWidth: "10.50", landDepth: "25.00", featuredImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80" },
            // Add a few more designs to add variety
            { name: "Bronte 30", priceFrom: 38000000, bedrooms: 4, bathrooms: 2, garages: 2, storeys: "single", category: "popular", squareMeters: 280, landWidth: "14.00", landDepth: "28.00", featuredImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80" },
            { name: "Avalon 42", priceFrom: 55000000, bedrooms: 5, bathrooms: 4, garages: 2, storeys: "double", category: "double_storey", squareMeters: 390, landWidth: "16.00", landDepth: "32.00", featuredImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80" },
        ];

        const insertedDesigns = [];
        for (const des of designData) {
            const [inserted] = await db.insert(homeDesigns).values({
                ...des,
                slug: slugify(des.name, { lower: true }),
                storeys: des.storeys as any,
                category: des.category as any,
                description: `Beautiful ${des.category} home design.`
            }).returning();
            insertedDesigns.push(inserted);

            await db.insert(designImages).values([
                { designId: inserted.id, imageUrl: des.featuredImage, altText: "Facade" },
                { designId: inserted.id, imageUrl: "https://images.unsplash.com/photo-1556912173-3db9963f638f?auto=format&fit=crop&w=1000&q=80", altText: "Interior" }
            ]);
        }

        // ============================================
        // 5b. Insert Inclusions Data
        // ============================================
        console.log("Inserting inclusion data...");
        // 1. Tiers
        const tiers = [
            { name: "Standard", slug: "standard", description: "Essential quality for every home.", sortOrder: 1 },
            { name: "Designer", slug: "designer", description: "Elevated features for modern living.", sortOrder: 2 },
            { name: "Premium", slug: "premium", description: "Luxury inclusions for the ultimate lifestyle.", sortOrder: 3 },
        ];

        const insertedTiers = await db.insert(schema.inclusionTiers).values(tiers).returning();

        // 2. Categories & Items (Adapted from src/data/inclusions.ts)
        const inclusionCategoriesData = [
            {
                name: "Kitchen & Culinary",
                headline: "Culinary Excellence",
                sortOrder: 1,
                items: {
                    standard: {
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
                name: "Bathroom & Ensuite",
                headline: "Sanctuary",
                sortOrder: 2,
                items: {
                    standard: {
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
                name: "Structural & Exterior",
                headline: "Built to Last",
                sortOrder: 3,
                items: {
                    standard: {
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
                name: "Living & Lifestyle",
                headline: "Modern Living",
                sortOrder: 4,
                items: {
                    standard: {
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
                name: "Climate & Technology",
                headline: "Smart Home",
                sortOrder: 5,
                items: {
                    standard: {
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

        for (const catData of inclusionCategoriesData) {
            // Insert Category
            const [category] = await db.insert(schema.inclusionCategories).values({
                name: catData.name,
                slug: slugify(catData.name, { lower: true }),
                headline: catData.headline,
                sortOrder: catData.sortOrder
            }).returning();

            // Insert Items for each Tier
            for (const tierName of Object.keys(catData.items)) {
                const tierSlug = tierName;
                const tier = insertedTiers.find(t => t.slug === tierSlug);

                if (tier) {
                    // @ts-ignore
                    const itemData = catData.items[tierName];
                    await db.insert(schema.inclusionItems).values({
                        tierId: tier.id,
                        categoryId: category.id,
                        title: itemData.title,
                        description: itemData.description,
                        badge: itemData.badge,
                        imageUrl: itemData.image,
                        features: itemData.features,
                        sortOrder: catData.sortOrder
                    });
                }
            }
        }


        // 6. Insert 10 Properties in Sydney SW
        console.log("Inserting 10 properties in Sydney South West...");

        const sydneyEstates = insertedEstates.filter(e =>
            ["Oran Park", "Leppington Living", "Gregory Hills", "Edmondson Park"].includes(e.name)
        );

        const propertyConfigs = [
            { lot: "101", estateIdx: 0, designIdx: 0, priceAdj: 0 },
            { lot: "304", estateIdx: 1, designIdx: 1, priceAdj: 5000000 },
            { lot: "22", estateIdx: 2, designIdx: 2, priceAdj: -2000000 },
            { lot: "55", estateIdx: 3, designIdx: 3, priceAdj: 1000000 },
            { lot: "108", estateIdx: 0, designIdx: 4, priceAdj: 8000000 },
            { lot: "44", estateIdx: 1, designIdx: 0, priceAdj: 1500000 },
            { lot: "77", estateIdx: 2, designIdx: 3, priceAdj: 2500000 },
            { lot: "12", estateIdx: 3, designIdx: 1, priceAdj: 4000000 },
            { lot: "99", estateIdx: 0, designIdx: 2, priceAdj: -1000000 },
            { lot: "202", estateIdx: 1, designIdx: 4, priceAdj: 9000000 },
        ];

        for (const [idx, config] of propertyConfigs.entries()) {
            const estate = sydneyEstates[config.estateIdx % sydneyEstates.length];
            const design = insertedDesigns[config.designIdx % insertedDesigns.length];
            const region = insertedRegions.find(r => r.id === estate.regionId)!;

            const landPrice = 45000000 + config.priceAdj; // Base land price ~450k

            await db.insert(properties).values({
                title: `${design.name} at ${estate.name}`,
                slug: slugify(`${design.name} at ${estate.name} Lot ${config.lot}`, { lower: true }),
                designId: design.id,
                estateId: estate.id,
                regionId: region.id,
                housePrice: design.priceFrom,
                landPrice: landPrice,
                totalPrice: (design.priceFrom || 0) + landPrice,
                bedrooms: design.bedrooms,
                bathrooms: design.bathrooms,
                garages: design.garages,
                landWidth: design.landWidth,
                landDepth: design.landDepth,
                address: `Lot ${config.lot} Future Street, ${estate.name}, NSW`,
                lotNumber: config.lot,
                featuredImage: design.featuredImage,
                isLandReady: idx % 2 === 0, // Alternate readiness
                badge: idx % 3 === 0 ? "new" : (idx % 3 === 1 ? "fixed" : undefined)
            });
        }

        console.log("✅ Seed completed successfully!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    }
};

main();
