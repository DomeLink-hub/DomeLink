-- Migration: add_auth_verification_fields
-- Adds email verification and password reset token fields to the User table.
-- These are nullable so existing rows are unaffected (all default to false/NULL).

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "emailVerified"            BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailVerificationToken"   TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerificationExpires" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "passwordResetToken"       TEXT,
  ADD COLUMN IF NOT EXISTS "passwordResetExpires"     TIMESTAMP(3);
