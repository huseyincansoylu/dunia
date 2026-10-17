ALTER TABLE "visits" ADD COLUMN "status" text DEFAULT 'visited' NOT NULL;--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "year" smallint;--> statement-breakpoint
ALTER TABLE "visits" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_status" CHECK ("visits"."status" in ('visited', 'want', 'lived'));--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_year_range" CHECK ("visits"."year" between 1900 and 2100);--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_note_length" CHECK (char_length("visits"."note") <= 500);