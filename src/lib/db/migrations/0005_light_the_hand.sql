CREATE TABLE "parking_addresses" (
	"id" integer PRIMARY KEY NOT NULL,
	"parking_id" integer,
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parking_addresses" ADD CONSTRAINT "parking_addresses_parking_id_parkings_id_fk" FOREIGN KEY ("parking_id") REFERENCES "public"."parkings"("id") ON DELETE no action ON UPDATE no action;