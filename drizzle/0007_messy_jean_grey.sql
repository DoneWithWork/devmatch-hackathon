ALTER TABLE "application" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "update_at" timestamp;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "deleted_at" timestamp;