-- Add optional metadata JSON column to Notification table.
-- Used to store structured data like { architectId, architectSlug } for lead_interest notifications.
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
