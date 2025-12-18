import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
// Site Settings table (for CMS content)
export const siteSettings = pgTable("site_settings", {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 100 }).notNull().unique(),
    value: text("value"),
    type: varchar("type", { length: 20 }).default("text"), // text, json, html
    description: varchar("description", { length: 255 }), // For admin UI
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Common settings keys as constants
export const SETTING_KEYS = {
    // Company Info
    COMPANY_NAME: "company_name",
    COMPANY_PHONE: "company_phone",
    COMPANY_EMAIL: "company_email",
    COMPANY_ADDRESS: "company_address",
    // Social
    SOCIAL_FACEBOOK: "social_facebook",
    SOCIAL_INSTAGRAM: "social_instagram",
    SOCIAL_LINKEDIN: "social_linkedin",
    SOCIAL_YOUTUBE: "social_youtube",
    // About Page
    ABOUT_STORY: "about_story",
    ABOUT_STATS: "about_stats", // JSON
    ABOUT_VALUES: "about_values", // JSON
    // Homepage
    HERO_TITLE: "hero_title",
    HERO_SUBTITLE: "hero_subtitle",
    HERO_IMAGE: "hero_image",
    // SEO
    META_TITLE: "meta_title",
    META_DESCRIPTION: "meta_description",
};
