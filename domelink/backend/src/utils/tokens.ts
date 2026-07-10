import crypto from "crypto";

/**
 * Generates a cryptographically secure random token.
 * Returns the raw (unhashed) token — this is what goes in the email URL.
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hashes a token with SHA-256 for safe storage.
 * Only the hash is stored in the DB; the raw token is emailed to the user.
 * On verification, hash the incoming token and compare to the stored hash.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
