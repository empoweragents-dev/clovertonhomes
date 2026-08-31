/**
 * Replaces the demo house-and-land listings with the real Wilton package.
 *
 * Dry run by default (the app talks to the live Hostinger MySQL). Pass --commit
 * to apply. Property images cascade on delete, so they are removed with the rows.
 *
 *   node server/scripts/resetListings.mjs            show the plan
 *   node server/scripts/resetListings.mjs --commit   apply
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(serverRoot, ".env") });

const commit = process.argv.includes("--commit");

// Sydney South West — Wilton sits in the Wollondilly Shire, south-west of Sydney.
const REGION_ID = "1f35a7fc-cef8-45a0-a6b3-35af5ebedc56";

const DESCRIPTION = `Cloverton Homes proudly presents this exceptional house and land package in Wilton. Designed with modern elegance and practical family living in mind, this home brings together style, functionality and comfort in one of the South West's fastest-growing communities.

SOPHISTICATED DESIGN & PREMIUM INCLUSIONS
• Stylish façade with modern architectural accents
• Luxurious ensuite and high-end finishes throughout
• Feature chandeliers to the bedrooms, living and dining spaces
• Shadowline ceilings for a sleek, contemporary finish
• Quality appliances and premium tapware

SPACIOUS BEDROOMS & DESIGNER BATHROOMS
• Master suite with private ensuite and built-in wardrobe
• Three additional bedrooms with built-in robes and plush carpet
• Bathrooms with LED lighting, floor-to-ceiling tiles and premium vanities

GOURMET KITCHEN & ELEGANT LIVING
• Open-plan kitchen with walk-in pantry, modern appliances, dishwasher and soft-close cabinetry
• Statement pendant lighting adding warmth and character
• Expansive living and dining areas with high ceilings and seamless indoor-outdoor flow

MODERN COMFORT & SMART SECURITY
• Ducted heating and cooling for year-round comfort
• Video intercom and security alarm for peace of mind
• Energy-efficient LED downlights throughout
• Gas hot water system

OUTDOOR LIVING
• Low-maintenance landscaping to the front and rear
• Generous outdoor area, ideal for relaxing and family gatherings

EVERYTHING CLOSE BY
Wilton Shopping Centre, Wilton Public School, St Anthony's Catholic Primary School, Bingara Gorge Academy and Picton High School are all within easy reach, along with Little Elves Child Care Centre, Bingara Gorge Early Learning Centre, Anytime Fitness Wilton, Bingara Gorge Gym, Picton Mall and Picton Train Station.

Enquire today to make this stunning home yours and become part of a thriving community.

Enquiries: info@clovertonhomes.com.au

Disclaimer: All information contained herein is gathered from sources we believe to be reliable. However, we cannot guarantee its accuracy and interested parties should rely on their own enquiries.`;

const LISTING = {
    title: "4 Bedroom Home & Land Package at Wilton",
    slug: "4-bedroom-home-land-package-wilton",
    regionId: REGION_ID,
    estateId: null,
    description: DESCRIPTION,
    address: "Wilton NSW 2571",
    lotNumber: null,
    // Money is stored in cents throughout this schema.
    housePrice: null,
    landPrice: null,
    totalPrice: 89000000,
    bedrooms: 4,
    bathrooms: 2,
    garages: 1,
    squareMeters: null,
    featuredImage: "/images/listings/wilton-4-bed-facade.jpg",
    badge: "new",
    isLandReady: 1,
    isActive: 1,
};

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
const [[{ db }]] = await conn.query("SELECT DATABASE() AS db");

const [existing] = await conn.query("SELECT id, title FROM properties");
const [[{ n: imageCount }]] = await conn.query("SELECT COUNT(*) AS n FROM property_images");

console.log(`Database : ${db}`);
console.log(`\nWill DELETE ${existing.length} listings (and ${imageCount} property images):`);
for (const row of existing) console.log(`  - ${row.title}`);
console.log(`\nWill CREATE:`);
console.log(`  + ${LISTING.title}`);
console.log(`    ${LISTING.address} · ${LISTING.bedrooms} bed / ${LISTING.bathrooms} bath / ${LISTING.garages} garage`);
console.log(`    $${(LISTING.totalPrice / 100).toLocaleString("en-AU")} · image ${LISTING.featuredImage}`);

if (!commit) {
    console.log("\nDRY RUN — nothing changed. Re-run with --commit to apply.");
    await conn.end();
    process.exit(0);
}

// Enquiries reference properties, so clear that link before removing the rows
// rather than letting the delete fail on the foreign key.
await conn.execute("UPDATE enquiries SET property_id = NULL WHERE property_id IS NOT NULL");
await conn.execute("DELETE FROM property_images");
const [del] = await conn.execute("DELETE FROM properties");
console.log(`\nDeleted ${del.affectedRows} listings.`);

const id = randomUUID();
await conn.execute(
    `INSERT INTO properties
       (id, title, slug, design_id, estate_id, region_id, description, address, lot_number,
        house_price, land_price, total_price, bedrooms, bathrooms, garages, square_meters,
        featured_image, badge, is_land_ready, is_active, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
    [
        id, LISTING.title, LISTING.slug, null, LISTING.estateId, LISTING.regionId,
        LISTING.description, LISTING.address, LISTING.lotNumber,
        LISTING.housePrice, LISTING.landPrice, LISTING.totalPrice,
        LISTING.bedrooms, LISTING.bathrooms, LISTING.garages, LISTING.squareMeters,
        LISTING.featuredImage, LISTING.badge, LISTING.isLandReady, LISTING.isActive,
    ],
);

// Gallery row so the detail page has an image beyond the featured one.
await conn.execute(
    "INSERT INTO property_images (id, property_id, image_url, alt_text, sort_order) VALUES (?,?,?,?,?)",
    [randomUUID(), id, LISTING.featuredImage, "Front façade of the Wilton four bedroom home", 0],
);

console.log(`Created listing ${id}`);
await conn.end();
