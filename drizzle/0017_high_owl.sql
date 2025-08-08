ALTER TABLE "application" ALTER COLUMN "institution" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "institution" SET DEFAULT 'university'::text;--> statement-breakpoint
DROP TYPE "public"."institution";--> statement-breakpoint
CREATE TYPE "public"."institution" AS ENUM('university', 'college', 'school', 'online_center', 'gov_agency', 'research_institute', 'training_provider', 'non_profit');--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "institution" SET DEFAULT 'university'::"public"."institution";--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "institution" SET DATA TYPE "public"."institution" USING "institution"::"public"."institution";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "single_cert" ADD COLUMN "update_at" timestamp;--> statement-breakpoint
ALTER TABLE "single_cert" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "single_cert" ADD COLUMN "deleted_at" timestamp;