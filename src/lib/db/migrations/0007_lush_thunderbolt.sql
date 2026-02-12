ALTER TABLE "locations" DROP CONSTRAINT "locations_coord_key_unique";--> statement-breakpoint
ALTER TABLE "locations" DROP COLUMN "coord_key";--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_lat_lon_unique" UNIQUE("latitude","longitude");