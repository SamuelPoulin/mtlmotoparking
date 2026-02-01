ALTER TABLE "parkings" ALTER COLUMN "post_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "parkings" ADD COLUMN "rpa_description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ADD COLUMN "rac_description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ADD COLUMN "cat_description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ADD COLUMN "post_version" text NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ADD COLUMN "post_conception_date" text NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ADD COLUMN "sign_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ADD COLUMN "sign_rpa_id" text NOT NULL;