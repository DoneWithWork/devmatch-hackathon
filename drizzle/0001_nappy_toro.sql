ALTER TABLE "users" DROP CONSTRAINT "users_pubKey_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "userAddress" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "pubKey";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_userAddress_unique" UNIQUE("userAddress");