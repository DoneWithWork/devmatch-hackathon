CREATE TYPE "public"."institution" AS ENUM('university', 'college', 'school', 'online_center', 'gov_agency', 'research_institute', 'training_provider', 'non_profie');--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "domain" text NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "institution" "institution" DEFAULT 'university';--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_domain_unique" UNIQUE("domain");