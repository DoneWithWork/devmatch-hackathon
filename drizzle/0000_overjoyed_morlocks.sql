CREATE TYPE "public"."applicationStatus" AS ENUM('pending', 'success', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."institution" AS ENUM('university', 'college', 'school', 'online_center', 'gov_agency', 'research_institute', 'training_provider', 'non_profit');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'issuer');--> statement-breakpoint
CREATE TABLE "certificate_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issuer_id" uuid NOT NULL,
	"template_url" text NOT NULL,
	"metadata" jsonb,
	"update_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "certs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "certs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"colour" varchar(100) DEFAULT '#000000' NOT NULL,
	"update_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "single_cert" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "single_cert_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"minted" boolean DEFAULT false,
	"user_email" text,
	"certificate_id" integer NOT NULL,
	"imageUrl" text NOT NULL,
	"update_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "application_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"domain" text NOT NULL,
	"institution" "institution" DEFAULT 'university',
	"status" "applicationStatus" DEFAULT 'pending',
	"reason" text,
	"update_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "application_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"publicUrl" text NOT NULL,
	"key" text NOT NULL,
	"user_id" integer NOT NULL,
	"issuerApplicationId" integer,
	"update_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "issuers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issuer_key" text NOT NULL,
	"name" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "issuers_issuer_key_unique" UNIQUE("issuer_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"username" varchar(255),
	"isIssuer" boolean DEFAULT false,
	"role" "role" DEFAULT 'user',
	"update_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"randomness" text NOT NULL,
	"userAddress" text[] NOT NULL,
	"privateKey" text NOT NULL,
	"maxEpoch" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_randomness_unique" UNIQUE("randomness"),
	CONSTRAINT "users_privateKey_unique" UNIQUE("privateKey")
);
--> statement-breakpoint
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_issuer_id_issuers_id_fk" FOREIGN KEY ("issuer_id") REFERENCES "public"."issuers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certs" ADD CONSTRAINT "certs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "single_cert" ADD CONSTRAINT "single_cert_certificate_id_certs_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_issuerApplicationId_application_id_fk" FOREIGN KEY ("issuerApplicationId") REFERENCES "public"."application"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issuers" ADD CONSTRAINT "issuers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;