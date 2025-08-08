ALTER TABLE "certs" ADD COLUMN "update_at" timestamp;--> statement-breakpoint
ALTER TABLE "certs" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "certs" ADD COLUMN "deleted_at" timestamp;