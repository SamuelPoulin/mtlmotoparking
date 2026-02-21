CREATE TABLE "parking_spot_contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"parking_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"cloudinary_public_id" text NOT NULL,
	"cloudinary_url" text NOT NULL,
	"fullness" integer NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parking_spot_contributions" ADD CONSTRAINT "parking_spot_contributions_parking_id_parkings_id_fk" FOREIGN KEY ("parking_id") REFERENCES "public"."parkings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_spot_contributions" ADD CONSTRAINT "parking_spot_contributions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contributions_parking_id_idx" ON "parking_spot_contributions" USING btree ("parking_id");--> statement-breakpoint
CREATE INDEX "contributions_user_id_idx" ON "parking_spot_contributions" USING btree ("user_id");