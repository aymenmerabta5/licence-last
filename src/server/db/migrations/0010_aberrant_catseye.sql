ALTER TABLE "document" ADD COLUMN "verification_code" text;--> statement-breakpoint
CREATE UNIQUE INDEX "document_verification_code_uidx" ON "document" USING btree ("verification_code");