ALTER TABLE "company" ADD COLUMN "verification_document_key" text;
ALTER TABLE "company" ADD COLUMN "verification_document_name" text;
ALTER TABLE "company" ADD COLUMN "verification_document_mime_type" text;
ALTER TABLE "company" ADD COLUMN "verification_document_size_bytes" integer;
ALTER TABLE "company" ADD COLUMN "verification_document_uploaded_at" timestamp;
