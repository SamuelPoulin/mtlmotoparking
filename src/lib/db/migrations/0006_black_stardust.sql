ALTER TABLE "coordinates_addresses" RENAME TO "locations";--> statement-breakpoint
ALTER TABLE "locations" DROP CONSTRAINT "coordinates_addresses_coord_key_unique";--> statement-breakpoint
ALTER TABLE "parkings" DROP CONSTRAINT "parkings_location_id_coordinates_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "parkings" ADD CONSTRAINT "parkings_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_coord_key_unique" UNIQUE("coord_key");