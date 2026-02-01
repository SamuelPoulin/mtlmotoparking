ALTER TABLE "parkings" ALTER COLUMN "latitude" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "longitude" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "rpa_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "rpa_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "rep_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "rac_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "cat_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "post_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "post_version" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "post_conception_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "sign_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "sign_rpa_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parkings" ALTER COLUMN "borough" DROP NOT NULL;