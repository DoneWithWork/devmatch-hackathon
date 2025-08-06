CREATE TYPE "public"."applicationStatus" AS ENUM('pending', 'success', 'rejected');--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "status" "applicationStatus" DEFAULT 'pending';