DROP INDEX "document_placement_type_uidx";--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "border_style" text DEFAULT 'classic' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "document_placement_variant_uidx" ON "document" USING btree ("placement_id","type","locale","border_style");--> statement-breakpoint
CREATE INDEX "document_locale_idx" ON "document" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "document_borderStyle_idx" ON "document" USING btree ("border_style");--> statement-breakpoint
UPDATE "document" SET "border_style" = 'agreement' WHERE "type" = 'agreement';
