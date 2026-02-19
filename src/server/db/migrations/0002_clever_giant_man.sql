CREATE TYPE "public"."internship_type" AS ENUM('pfe', 'immersion', 'summer', 'practical');--> statement-breakpoint
ALTER TABLE "university_domain" DROP CONSTRAINT "university_domain_reviewed_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "internship_offer" ALTER COLUMN "internship_type" SET DATA TYPE "public"."internship_type" USING "internship_type"::"public"."internship_type";--> statement-breakpoint
ALTER TABLE "placement" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "placement" ALTER COLUMN "end_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "university_domain" ALTER COLUMN "status" SET DEFAULT 'approved';--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "contact_email" text;--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "representative_name" text;--> statement-breakpoint
ALTER TABLE "internship_offer" ADD COLUMN "duration_weeks" integer;--> statement-breakpoint
ALTER TABLE "internship_offer" ADD COLUMN "max_positions" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "abbreviation" text;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "wilaya_code" integer;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "department_name" text;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "dean_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_domain" DROP COLUMN "requested_by_email";--> statement-breakpoint
ALTER TABLE "university_domain" DROP COLUMN "requested_at";--> statement-breakpoint
ALTER TABLE "university_domain" DROP COLUMN "request_note";--> statement-breakpoint
ALTER TABLE "university_domain" DROP COLUMN "reviewed_by_user_id";--> statement-breakpoint
ALTER TABLE "university_domain" DROP COLUMN "reviewed_at";--> statement-breakpoint
ALTER TABLE "university_domain" DROP COLUMN "review_reason";