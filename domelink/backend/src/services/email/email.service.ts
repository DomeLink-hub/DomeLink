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
};
