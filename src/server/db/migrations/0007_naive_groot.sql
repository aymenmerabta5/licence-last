ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
CREATE INDEX "application_offerId_status_idx" ON "application" USING btree ("offer_id","status");--> statement-breakpoint
CREATE INDEX "application_studentUserId_status_idx" ON "application" USING btree ("student_user_id","status");