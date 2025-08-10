ALTER TYPE "public"."applicationStatus" ADD VALUE 'success' BEFORE 'approved';--> statement-breakpoint
ALTER TABLE "certificates" ALTER COLUMN "revoked_by" SET DATA TYPE integer USING revoked_by::integer;--> statement-breakpoint
ALTER TABLE "gas_balance_history" ALTER COLUMN "balance_in_sui" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "contact_email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "from_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "to_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "amount" DROP NOT NULL;