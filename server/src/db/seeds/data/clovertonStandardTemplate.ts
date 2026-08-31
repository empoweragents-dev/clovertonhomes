/**
 * Cloverton Standard — Single Storey: the default tender template.
 *
 * Transcribed from the reference tender supplied by Cloverton (60 Bryant Ave),
 * preserving the section structure, clause numbering and inclusion wording. The
 * originating builder's branding, client names, project addresses and package price
 * are deliberately NOT carried over — only the inclusions schedule itself.
 *
 * Body text uses the document mini-markup: blank line = new paragraph, a line
 * starting "- " = bullet, **bold**, *italic*. It is converted to HTML server-side.
 *
 * This is a starting point, not gospel: every clause is editable in the template
 * editor, and commercial rates in particular should be reviewed before first use.
 */

export interface SeedItem {
    clause: string;
    title: string;
    status: string;
    body: string;
}

export interface SeedSection {
    number: number;
    title: string;
    coverSummaryLabel?: string;
    showOnCoverSummary?: boolean;
    items: SeedItem[];
}

export const CLOVERTON_STANDARD_SLUG = "cloverton-standard-single-storey";

export const clovertonStandardSections: SeedSection[] = [
    {
        number: 1,
        title: "Fixed Price Site Costs",
        coverSummaryLabel: "Site costs",
        showOnCoverSummary: true,
        items: [
            {
                clause: "1.1", title: "Reports, approvals and site preparation", status: "included",
                body: [
                    "- Soil test / Geotech report",
                    "- Structural design by accredited engineer",
                    "- CC approval",
                    "- Home Warranty insurance",
                    "- Public liability insurance",
                    "- Work Cover insurance",
                    "- Temporary fence hire",
                    "- Portable toilet hire",
                    "- Sediment fence",
                    "- Site preparation and levelling including machine hire for cut, for standard concrete slab on ground construction for the new dwelling",
                    "- Up to 2.7m ceiling height",
                ].join("\n"),
            },
            {
                clause: "1.2", title: "Concrete slab", status: "included",
                body: [
                    "- Concrete pump hire for concrete slab",
                    "- Supply and install steel, steel mesh and waffle pods",
                ].join("\n"),
            },
            {
                clause: "1.3", title: "Under slab piering", status: "included",
                body: "Under slab piering and pump hire (up to 80 lineal metres).",
            },
            {
                clause: "1.4", title: "Sewer connection", status: "included",
                body: "Sewer connection to main.",
            },
            {
                clause: "1.5", title: "Electrical underground mains", status: "included",
                body: "Electrical underground mains to meter box point on house and the supply. Authority fees and telecommunications conduit run-in.",
            },
            {
                clause: "1.6", title: "Underground water service", status: "included",
                body: "Underground water service to house from existing water mains / near side water.",
            },
            {
                clause: "1.7", title: "Gas and NBN connection", status: "excluded",
                body: [
                    "Gas and telephone / NBN connection from the dwelling to the mains. These are to be arranged by the owner by contacting the service provider and opening an account in the owner's name.",
                    "The builder will assist with completing the application form.",
                ].join("\n\n"),
            },
            {
                clause: "1.8", title: "Excess soil removal", status: "included",
                body: "Remove excess soil from excavation and underground services (6 truck bogies only; removal beyond 6 bogies to be arranged by the owner).",
            },
            {
                clause: "1.9", title: "Storm water drainage", status: "included",
                body: "Storm water drainage.",
            },
            {
                clause: "1.10", title: "Water service", status: "included",
                body: "Water service (20mm copper pipe).",
            },
        ],
    },
    {
        number: 2,
        title: "Building",
        coverSummaryLabel: "Building",
        showOnCoverSummary: true,
        items: [
            {
                clause: "2.1", title: "Frames and trusses", status: "included",
                body: "Frames and trusses as per engineering and the relevant Australian Standards.",
            },
            {
                clause: "2.2", title: "Bricks", status: "included",
                body: [
                    "- Supply and install bricks as per plan",
                    "- Bricks chosen from the builder's standard range",
                    "- Brick mortar will be off-white colour",
                    "- Facade as per plan",
                ].join("\n"),
            },
            {
                clause: "2.3", title: "Windows", status: "included",
                body: [
                    "- Aluminium windows and sliding doors as per architectural plan and window schedule. Glass thickness as per Australian Standards, clear single glazed",
                    "- Window frame colour to be chosen by the customer (residential windows only)",
                    "- Keyed locks to all windows from the builder's range",
                ].join("\n"),
            },
            {
                clause: "2.4", title: "Pest control", status: "included",
                body: [
                    "- Pest control as per Australian Standards",
                    "- Certification provided as per standards requirements",
                ].join("\n"),
            },
            {
                clause: "2.5", title: "Roofing", status: "included",
                body: [
                    "- Colorbond roof (builder's choice)",
                    "- Colorbond fascia and gutter with round PVC downpipes as per plan",
                ].join("\n"),
            },
            {
                clause: "2.6", title: "Gyprock", status: "included",
                body: [
                    "- 10mm plasterboard to ceilings",
                    "- 10mm plasterboard to walls",
                    "- 10mm water shield to wet areas",
                    "- Standard 90mm cornice throughout",
                    "- Internal niches to shower walls",
                    "",
                    "Bulkheads and niches only as shown on the plans, and as per plan approval conditions.",
                ].join("\n"),
            },
            {
                clause: "2.7", title: "Plumbing", status: "included",
                body: [
                    "- General plumbing as per Australian Standards",
                    "- One gas point provided for heating",
                    "- All plumbing included as per the plan",
                    "- One tap (freshwater / recycled) at the front and one tap at the rear of the house",
                    "- Rainwater tank up to 2000L",
                    "- Instantaneous gas hot water system (26L or similar)",
                    "- All taps and showers to satisfy the energy star rating",
                    "- No allowance for sewer main extension",
                ].join("\n"),
            },
            {
                clause: "2.8", title: "Electrical", status: "included",
                body: [
                    "- All electrical work as per Australian Standards",
                    "- Designer lights not included",
                    "- 35 standard LED downlights in warm white or cool white",
                    "- 2 TV points",
                    "- 2 data cable points",
                    "- 3 sensor light provisions for outside",
                    "- 3-in-1 bathroom lights as per plan",
                    "- Main bedroom 2 power points, remaining bedrooms 1 power point each, including power points in bathroom, kitchen, garage, laundry and family area",
                    "- Up to 22 double power points in the whole construction including those mentioned above",
                    "- Standard switches",
                    "- Smoke alarms as per plan",
                ].join("\n"),
            },
            {
                clause: "2.9", title: "Garage doors", status: "included",
                body: [
                    "Remote operated Colorbond panel garage door with 2 remotes, from the builder's standard Colorbond colour range and the builder's choice of supplier.",
                ].join("\n"),
            },
            {
                clause: "2.10", title: "Doors, skirting and door jambs", status: "included",
                body: [
                    "- Main entrance door 820 x 2040 (or as per plan)",
                    "- 67mm x 18mm half splay profile pine undercoated skirting and architrave throughout, painted with gloss paint",
                    "- Laundry door (if required)",
                    "- All remaining internal doors standard, with standard locks and handles",
                    "",
                    "All internal and external doors, locks, hinges, handles and stoppers to be chosen from the builder's selected supplier and standard range only.",
                ].join("\n"),
            },
            {
                clause: "2.11", title: "Waterproofing", status: "included",
                body: "Waterproofing to all wet areas and balconies as per Australian Standards.",
            },
            {
                clause: "2.12", title: "Intercom and security", status: "included",
                body: "Video intercom and security alarm system from the builder's range.",
            },
            {
                clause: "2.13", title: "Kitchen benchtop", status: "included",
                body: [
                    "- 40mm edge thickness stone to the main kitchen benchtop",
                    "- Main kitchen splashback tiles from the builder's choice range",
                    "- 40mm edge thickness stone with shadow line finish and waterfall to the island benchtop, main kitchen only, builder's choice",
                    "",
                    "All stone from the builder's standard range. If legislative changes impact the use of the builder's choice stone, alternative products or materials may cost extra, payable by the owner as a variation.",
                ].join("\n"),
            },
            {
                clause: "2.14", title: "Kitchen doors", status: "included",
                body: [
                    "- Doors to the main kitchen only (colour to be chosen by the customer)",
                    "- Any plain colour to be nominated at the colour selection meeting",
                ].join("\n"),
            },
            {
                clause: "2.15", title: "Kitchen", status: "included",
                body: [
                    "- Stainless steel double bowl kitchen sink x 1",
                    "- Space for dishwasher x 1",
                    "- Fridge cavity with water connection x 1",
                    "- Power points in kitchen",
                    "- Vent pipe for range hood x 1",
                    "- Kitchen cupboards as per plan",
                    "- Shelving only in the walk-in pantry",
                    "- Main kitchen: 900mm cooktop, 900mm rangehood, 900mm oven",
                    "- 1 x dishwasher (builder's choice)",
                    "- 1 x pendant light (builder's choice)",
                    "",
                    "All appliances to be chosen from the builder's selected supplier and model range.",
                ].join("\n"),
            },
            {
                clause: "2.16", title: "Alfresco", status: "included",
                body: "Tiles to alfresco priced up to $25.00 per square metre including GST.",
            },
            {
                clause: "2.17", title: "Air conditioning", status: "included",
                body: "Ducted air conditioning — 3 zones with round ducts and 1 controller. Model from the builder's choice range.",
            },
            {
                clause: "2.18", title: "Blinds", status: "excluded",
                body: "Standard vertical blinds from the builder's choice supplier. All other window furnishing options selected by the owner are treated as upgrades and may incur additional costs payable by the owner.",
            },
            {
                clause: "2.19", title: "Bathroom and toilet", status: "included",
                body: [
                    "- All plumbing as per Australian Standards",
                    "- Wall tiles to ceiling height in all bathrooms",
                    "- Suitably sized frameless mirror above vanities",
                    "- Ceramic vanities and builder's chosen taps as per BASIX requirements",
                    "- Semi-frameless shower screens",
                    "- Waterproofing as per Australian Standards",
                    "- Dual flush ceramic toilet suite in white",
                    "- Toilet tissue holder and towel rail (builder's choice)",
                    "- Chrome push plugs to vanity basins",
                    "- One free standing bathtub",
                    "",
                    "Tapware, toilet seats, shower heads and arms, kitchen sinks, bathtub and laundry sinks are PC items to be chosen from the builder's selected supplier and range.",
                ].join("\n"),
            },
            {
                clause: "2.20", title: "Built-ins and wardrobes", status: "included",
                body: [
                    "Standard built-ins including mirror as per plan.",
                    "Walk-in wardrobes in standard white melamine with 1 set of drawers, shelves above and the remainder hanging. Sliding wardrobes with mirror sliding doors, white melamine, 1 set of drawers, shelving and the remainder hanging.",
                ].join("\n\n"),
            },
            {
                clause: "2.21", title: "Staircase", status: "excluded",
                body: [
                    "Not applicable to a single storey dwelling.",
                    "Where applicable: standard staircase as per plan with wrought iron balustrade; MDF staircase with carpet or laminate timber finish from the builder's standard range.",
                ].join("\n\n"),
            },
            {
                clause: "2.22", title: "Flooring", status: "included",
                body: [
                    "- Floorboards to open areas, floor tiling to bathrooms and laundry",
                    "- Laminate floorboards to bedrooms",
                    "",
                    "Tiles and laminate floorboards from the builder's choice supplier and standard range. Standard tile sizes up to 300x300, 300x450 and 600x600.",
                ].join("\n"),
            },
            {
                clause: "2.23", title: "Painting", status: "included",
                body: [
                    "- 1 x coat of undercoat",
                    "- 2 x coats of final coat in light cream",
                    "- Ceilings — 2 coats white",
                    "- Doors and skirting — gloss white",
                    "- Polished finish to main door only (colour to be chosen by the customer)",
                ].join("\n"),
            },
            {
                clause: "2.24", title: "Driveway", status: "included",
                body: "Concrete driveway with builder's standard material and specifications, up to 40 square metres.",
            },
            {
                clause: "2.25", title: "Laundry", status: "included",
                body: [
                    "- Space and services allocated for washing machine and dryer",
                    "- Standard freestanding sink with tap as per plan",
                    "- Tiles to floor and one row of skirting from the builder's standard range",
                    "- Waterproofing as per Australian Standards",
                ].join("\n"),
            },
            {
                clause: "2.26", title: "Fencing", status: "excluded",
                body: "Standard 1.8m high fencing is by the owner.",
            },
            {
                clause: "2.27", title: "Clothesline", status: "included",
                body: "Clothesline (builder's choice).",
            },
            {
                clause: "2.28", title: "Letter box", status: "included",
                body: "Standard letter box fixed adjacent to the driveway.",
            },
            {
                clause: "2.29", title: "Completion", status: "included",
                body: [
                    "- Post construction survey report",
                    "- 6 year structural warranty",
                ].join("\n"),
            },
            {
                clause: "2.30", title: "Occupation Certificate", status: "included",
                body: [
                    "The builder agrees to provide the Occupation Certificate for the property upon completion of the building works, subject to the following conditions.",
                    "The owner shall provide all necessary documentation and approvals, and fulfil all requirements mandated by the relevant authorities to obtain the Occupation Certificate, except for those items explicitly included in the builder's tender.",
                    "The builder shall not be responsible for any delays or additional costs arising from the owner's failure to provide the required documentation or meet the necessary conditions for the Occupation Certificate.",
                    "The builder's obligations under this clause are limited to the scope of work and inclusions specified in the tender. Any additional requirements outside the tender shall be the sole responsibility of the owner.",
                    "The owner acknowledges that the builder's ability to obtain the Occupation Certificate is contingent upon the owner's compliance with the above conditions and timely provision of all required materials and information.",
                    "In the event that the owner fails to fulfil their obligations under this clause, the builder shall not be held liable for any consequences, including but not limited to delays in obtaining the Occupation Certificate or additional costs incurred.",
                ].join("\n\n"),
            },
        ],
    },
    {
        number: 3,
        title: "Council & Statutory Authority Requirements",
        coverSummaryLabel: "Council & Statutory Authority requirements",
        showOnCoverSummary: true,
        items: [
            {
                clause: "3.1", title: "Development consent and council fees", status: "part_included",
                body: [
                    "Development consent fees and council fees are partly included. The following are **not** included:",
                    "Section 73, Section 94 and Section 94A contributions are payable by the owner. All government fees, long service levy, any other government levy, and council fees related to a secondary dwelling are payable by the owner before commencement of construction.",
                    "It is the owner's responsibility to determine the actual total fees and charges payable to the relevant authority. Arranging supply and connection of utilities, and their meters or sub-meters, and the associated costs are the owner's responsibility.",
                ].join("\n\n"),
            },
            {
                clause: "3.2", title: "Sediment control and site facilities", status: "included",
                body: [
                    "- Sediment control fencing including trade waste receptacle in accordance with Environmental Protection Authority requirements",
                    "- Temporary fencing",
                    "- On-site toilet hire",
                ].join("\n"),
            },
            {
                clause: "3.3", title: "Electrical compliance", status: "included",
                body: "AS/NZS 3000 electrical requirements. Safety switches, light circuit and isolation switch by a qualified electrician.",
            },
            {
                clause: "3.4", title: "PCA inspections", status: "included",
                body: [
                    "- PCA checks for all mandatory stages",
                    "- Roof guardrail allowance as required by the Work Cover authority",
                ].join("\n"),
            },
        ],
    },
    {
        number: 4,
        title: "Standard BASIX Inclusions",
        coverSummaryLabel: "Standard BASIX requirements",
        showOnCoverSummary: true,
        items: [
            {
                clause: "4.1", title: "Wall insulation", status: "included",
                body: "Provide R2.5 wall insulation to external walls.",
            },
            {
                clause: "4.2", title: "Ceiling insulation", status: "included",
                body: "Provide R3.5 ceiling insulation (as per the BASIX certificate and approved plan).",
            },
            {
                clause: "4.3", title: "Ceiling fan", status: "included",
                body: "1 x fan (builder's choice).",
            },
            {
                clause: "4.4", title: "Roof sarking", status: "included",
                body: "Roof sarking.",
            },
            {
                clause: "4.5", title: "Turf and basic landscaping", status: "excluded",
                body: "Landscaping is by the owner.",
            },
        ],
    },
    {
        number: 5,
        title: "Exclusions & Special Conditions",
        coverSummaryLabel: "Exclusions & special conditions",
        showOnCoverSummary: false,
        items: [
            {
                clause: "5.1", title: "Pathways and external concreting", status: "excluded",
                body: "Pathways and other concreting around the house can be provided at a rate from $150 plus GST per square metre.",
            },
            {
                clause: "5.2", title: "Piering", status: "as_per_engineering",
                body: [
                    "Piers will be as per the engineer's plan and specification (up to 80 lineal metres).",
                    "If there is a storm water basin, or the site was previously a dam, additional piering costs apply.",
                ].join("\n\n"),
            },
            {
                clause: "5.3", title: "Works outside the scope", status: "excluded",
                body: "Generally anything outside the scope of work. Any other item, upgrade, service or fee not specifically stated in the standard product inclusions schedule or special conditions.",
            },
            {
                clause: "5.4", title: "Gas connection", status: "excluded",
                body: "Gas connection from the dwelling to the mains is not included. Where gas is already on site, the owner is to contact the service provider and arrange for a new meter to be connected.",
            },
            {
                clause: "5.5", title: "Steps and landings", status: "included",
                body: "Steps and landings to external doorways or garage, should they be required as per plan.",
            },
            {
                clause: "5.6", title: "Deepened edge beams", status: "included",
                body: "Deepened edge beams (drop edge beams) if required as per engineering and architectural plans.",
            },
            {
                clause: "5.7", title: "Road opening fees and progress claims", status: "excluded",
                body: [
                    "Road opening fees paid to councils. Long service levy is payable by the owner.",
                    "Note: if a progress claim is delayed more than 3 working days, each day after the third will be charged at $200 plus GST per day. One rainy day amounts to three days of no work. Any changes made during construction will be charged at a $200 plus GST administration fee, plus the cost of labour and material.",
                ].join("\n\n"),
            },
            {
                clause: "5.8", title: "On-site detention system", status: "excluded",
                body: "Supply and/or installation of an on-site detention system.",
            },
            {
                clause: "5.9", title: "Drainage pits and stormwater detention", status: "excluded",
                body: [
                    "- Drainage pits, if required on site",
                    "- Storm water detention or retention system, if required by council",
                    "- Bond for construction of storm water connection",
                ].join("\n"),
            },
            {
                clause: "5.10", title: "Services outside the boundary", status: "excluded",
                body: "Connection of services outside the boundaries of the land, driveways and paths.",
            },
            {
                clause: "5.11", title: "Council and subdivision fees", status: "part_included",
                body: "Standard council fees are included, but subdivision fees and all other fees relating to subdivision — for example minor or major plumbing works for the water authority, water authority tap-in, second connection of electricity and second gas connection — are paid by the owner. Section 94 and 94A fees are payable by the owner. Section 73 fees are payable by the owner. Security deposits against damage to council assets are at the owner's cost.",
            },
            {
                clause: "5.12", title: "Plan alterations", status: "excluded",
                body: "Any fees to alter the existing plans or produce new plans, within reasonable means.",
            },
            {
                clause: "5.13", title: "Engineering and water authority approvals", status: "part_included",
                body: [
                    "Structural engineering drawings and fees — included.",
                    "Water authority approval or tap-in — included. If a water authority coordinator is required for approval of the water plans, all costs and labour relating to the coordinator are covered by the customer. Any encasement costs and labour are covered by the owner.",
                ].join("\n\n"),
            },
            {
                clause: "5.14", title: "Demolition, site clearing and reports", status: "excluded",
                body: [
                    "- Demolition, demolition related fencing, asbestos removal or any other contaminated soil removal",
                    "- Removal of any trees and existing underground pipes",
                    "- Any existing structure removal",
                    "- Any easement related work",
                    "- Any acoustic insulation related work",
                    "- Any flood requirements",
                    "- Services connection or disconnection related to a secondary dwelling or to demolition — owner's responsibility",
                    "- Bush fire report, flood report, acoustic report",
                    "- Site access constraints and traffic control, if required",
                    "- Energy authority fees, contributions and requirements, any design and approval fees, and any NBN requirements or fees. Developer's or any other authority's bond money",
                    "- Noise control",
                ].join("\n"),
            },
            {
                clause: "5.15", title: "Excavation, energy systems and material availability", status: "excluded",
                body: [
                    "- Rock excavation or removal, if required, shall be charged as a variation",
                    "- Solar PV system, home battery storage, induction cooktop, heat pump",
                    "- Overhead shading, alternative shading and overhead weather protection for windows and doors, if required, shall be charged as a variation",
                    "- Any excess soil to be removed from or imported to site shall be charged as a variation",
                    "- Interim or part Occupation Certificate",
                    "- Any materials unavailable because of legislative changes, government banned materials, or materials unavailable after the date the contract is signed",
                ].join("\n"),
            },
            {
                clause: "5.16", title: "General commercial conditions", status: "part_included",
                body: [
                    "- Variation amounts are to be paid at the time of the following progress claim",
                    "- Any price increase because of legislative changes must be paid by the owner",
                    "- If local or global supply and demand issues cause product or material shortages, the builder may choose alternative products or materials. If material costs increase by more than 10%, the additional cost is payable by the owner as a variation",
                    "- Owners must make full payment including variations (if any) before obtaining any Occupation Certificate and before gaining occupancy",
                    "- No allowance has been made for works outside the property boundary",
                    "- No allowance has been made for rendering works, decorative stones or decorative cladding",
                    "- For safety reasons the customer may not enter the construction site without the builder's prior arrangement",
                    "- The builder will submit house plans to comply with developer design guidelines using the builder's standard inclusions and standard facade. If additional requirements are enforced by the developer, these may attract extra costs for the owner",
                    "- Anything outside the builder's contracted works is the owner's responsibility",
                ].join("\n"),
            },
        ],
    },
];

/** 65 clauses across 5 sections — asserted by the seed so a transcription slip is caught. */
export const EXPECTED_ITEM_COUNT = 65;
