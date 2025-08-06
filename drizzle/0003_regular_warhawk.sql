CREATE TABLE "documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"publicUrl" text NOT NULL,
	"key" text NOT NULL,
	"issuerApplicationId" integer
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_issuerApplicationId_application_id_fk" FOREIGN KEY ("issuerApplicationId") REFERENCES "public"."application"("id") ON DELETE no action ON UPDATE no action;