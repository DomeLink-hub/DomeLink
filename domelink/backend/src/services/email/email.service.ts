import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { renderTransactionalEmail } from './templates/transactional.js';

const apiKey = env.RESEND_API_KEY;
const fromAddress = env.EMAIL_FROM || 'DomeLink <noreply@domelink.ai>';

const resend = apiKey ? new Resend(apiKey) : null;

export type EmailTemplateInput = {
  subject: string;
  title: string;
  summary: string;
  ctaText?: string;
  ctaUrl?: string;
};

export const sendTransactionalEmail = async (to: string, payload: EmailTemplateInput) => {
  if (!resend) {
    return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  return resend.emails.send({
    from: fromAddress,
    to,
    subject: payload.subject,
    html: renderTransactionalEmail(payload.title, payload.summary, payload.ctaText, payload.ctaUrl),
  });
};

export const emailEvents = {
  welcomeOnboarding: (to: string, name: string) =>
    sendTransactionalEmail(to, {
      subject: 'Welcome to DomeLink',
      title: `Welcome, ${name}`,
      summary: 'Your architectural workspace is ready. Explore projects, consultations, and curated discovery.',
      ctaText: 'Open DomeLink',
      ctaUrl: env.FRONTEND_URL || 'http://localhost:8080',
    }),
  paymentSuccess: (to: string, summary: string, ctaUrl?: string) =>
    sendTransactionalEmail(to, {
      subject: 'Payment confirmed',
      title: 'Payment successful',
      summary,
      ctaText: 'Review payment',
      ctaUrl,
    }),
  subscriptionUpgrade: (to: string, tier: string) =>
    sendTransactionalEmail(to, {
      subject: 'Subscription upgraded',
      title: `You are now on ${tier}`,
      summary: 'Your profile visibility, analytics, and premium features have been upgraded.',
    }),
  verifyEmail: (to: string, rawToken: string) => {
    const url = `${env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${rawToken}`;
    return sendTransactionalEmail(to, {
      subject: 'Verify your DomeLink email address',
      title: 'Confirm your email',
      summary: 'Click the button below to verify your email address. This link expires in 24 hours.',
      ctaText: 'Verify Email',
      ctaUrl: url,
    });
  },
  resetPassword: (to: string, rawToken: string) => {
    const url = `${env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${rawToken}`;
    return sendTransactionalEmail(to, {
      subject: 'Reset your DomeLink password',
      title: 'Reset your password',
      summary: 'Someone requested a password reset for your account. Click below to set a new password. This link expires in 1 hour. If you did not request this, you can safely ignore this email.',
      ctaText: 'Reset Password',
      ctaUrl: url,
    });
  },
};
