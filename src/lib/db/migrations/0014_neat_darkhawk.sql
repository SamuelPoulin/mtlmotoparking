CREATE TABLE "parking_favourites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"parking_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favourites_user_parking_unique" UNIQUE("user_id","parking_id")
);
--> statement-breakpoint
ALTER TABLE "parking_favourites" ADD CONSTRAINT "parking_favourites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_favourites" ADD CONSTRAINT "parking_favourites_parking_id_parkings_id_fk" FOREIGN KEY ("parking_id") REFERENCES "public"."parkings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favourites_user_id_idx" ON "parking_favourites" USING btree ("user_id");