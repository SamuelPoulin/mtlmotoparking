ALTER TABLE "parking_addresses" RENAME TO "coordinates_addresses";--> statement-breakpoint
ALTER TABLE "coordinates_addresses" DROP CONSTRAINT "parking_addresses_parking_id_unique";--> statement-breakpoint
ALTER TABLE "coordinates_addresses" DROP CONSTRAINT "parking_addresses_parking_id_parkings_id_fk";
--> statement-breakpoint
ALTER TABLE "coordinates_addresses" ADD COLUMN "coord_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "coordinates_addresses" ADD COLUMN "latitude" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "coordinates_addresses" ADD COLUMN "longitude" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_location_id_coordinates_addresses_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."coordinates_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coordinates_addresses" DROP COLUMN "parking_id";--> statement-breakpoint
ALTER TABLE "parkings" DROP COLUMN "latitude";--> statement-breakpoint
ALTER TABLE "parkings" DROP COLUMN "longitude";--> statement-breakpoint
ALTER TABLE "coordinates_addresses" ADD CONSTRAINT "coordinates_addresses_coord_key_unique" UNIQUE("coord_key");