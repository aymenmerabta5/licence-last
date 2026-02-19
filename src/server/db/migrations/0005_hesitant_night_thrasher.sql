CREATE TABLE "rate_limit_bucket" (
	"bucket_key" text NOT NULL,
	"window_ms" integer NOT NULL,
	"window_start" timestamp NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rate_limit_bucket_pk" PRIMARY KEY("bucket_key","window_ms","window_start")
);
--> statement-breakpoint
CREATE INDEX "rate_limit_bucket_updated_at_idx" ON "rate_limit_bucket" USING btree ("updated_at");
