ALTER TABLE "certs" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "certs" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "single_cert" ADD COLUMN "id" integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "single_cert_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "single_cert" ADD COLUMN "user_email" text;--> statement-breakpoint
ALTER TABLE "single_cert" ADD COLUMN "certificate_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "certs" ADD CONSTRAINT "certs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "single_cert" ADD CONSTRAINT "single_cert_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "single_cert" ADD CONSTRAINT "single_cert_certificate_id_certs_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certs"("id") ON DELETE no action ON UPDATE no action;