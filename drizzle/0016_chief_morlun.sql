-- Clear all tables that have foreign key references to users
TRUNCATE TABLE "audit_logs" CASCADE;--> statement-breakpoint
TRUNCATE TABLE "certificates" CASCADE;--> statement-breakpoint
TRUNCATE TABLE "application" CASCADE;--> statement-breakpoint
TRUNCATE TABLE "documents" CASCADE;--> statement-breakpoint
TRUNCATE TABLE "issuers" CASCADE;--> statement-breakpoint
TRUNCATE TABLE "notifications" CASCADE;--> statement-breakpoint
TRUNCATE TABLE "users" CASCADE;--> statement-breakpoint
-- Change users table to UUID primary key
ALTER TABLE "users" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "id" UUID NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ADD PRIMARY KEY ("id");--> statement-breakpoint
-- Now update all foreign key columns to UUID
ALTER TABLE "audit_logs" ALTER COLUMN "user_id" SET DATA TYPE UUID;--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "revoked_by" SET DATA TYPE UUID;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "applicant_id" SET DATA TYPE UUID;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "reviewed_by" SET DATA TYPE UUID;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "user_id" SET DATA TYPE UUID;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "verified_by" SET DATA TYPE UUID;--> statement-breakpoint
ALTER TABLE "issuers" ALTER COLUMN "user_id" SET DATA TYPE UUID;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_id" SET DATA TYPE UUID;