ALTER TABLE "inclusion_items" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "inclusion_items" ADD COLUMN "badge" varchar(50);--> statement-breakpoint
ALTER TABLE "inclusion_items" ADD COLUMN "features" json DEFAULT '[]'::json;