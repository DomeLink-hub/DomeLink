import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface Props {
  user?: { emailVerified?: boolean } | null;
}

/**
 * Informational email verification nudge.
 * Dismissible, non-blocking — does NOT gate any functionality.
 * Used on both Homeowner and Architect dashboards.
 */
const EmailVerificationBanner = ({ user }: Props) => {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Only render if user exists and email is NOT verified
  if (!user || user.emailVerified !== false || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await api.resendVerification();
      setSent(true);
    } catch {
      // Silently ignore — non-critical
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-3 mb-6 text-sm"
    >
      <p className="text-muted-foreground">
        {sent
          ? "Verification email sent — check your inbox."
          : "Please verify your email address to complete your account setup."}
      </p>
      <div className="flex items-center gap-3 shrink-0">
        {!sent && (
          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="text-foreground link-underline disabled:opacity-50"
          >
            {sending ? "Sending…" : "Resend email"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export default EmailVerificationBanner;
