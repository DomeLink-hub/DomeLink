import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env.js';

const key_id = env.RAZORPAY_KEY_ID;
const key_secret = env.RAZORPAY_KEY_SECRET;

export const razorpay = key_id && key_secret
  ? new Razorpay({ key_id, key_secret })
  : null;

export const SUBSCRIPTION_PLANS = {
  free: { id: 'free', name: 'Free', price: 0, features: ['Limited visibility', 'Limited portfolio uploads', 'Limited consultations'] },
  pro: { id: 'pro', name: 'Pro', price: 4999, features: ['Better visibility', 'Unlimited portfolios', 'Analytics access', 'AI insights'] },
  studio: { id: 'studio', name: 'Studio', price: 14999, features: ['Team collaboration', 'Featured ranking boost', 'Advanced analytics', 'Premium AI insights', 'Priority recommendations'] },
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

export const createRazorpayOrder = async (amountPaise: number, currency = 'INR', receipt?: string) => {
  if (!razorpay) {
    return { skipped: true, reason: 'RAZORPAY_KEY_ID/SECRET not configured' };
  }

  try {
    return await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: receipt || `domelink_${Date.now()}`,
    });
  } catch (err: any) {
    console.error("========== RAZORPAY ERROR ==========");
    console.error(err);
    console.error("status:", err?.statusCode);
    console.error("error:", err?.error);
    console.error("description:", err?.error?.description);
    console.error("response:", err?.response);
    console.error("====================================");
    throw err;
  }
};

export const verifyWebhookSignature = (payload: string | Buffer, signature: string, secret = key_secret || '') => {
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
};

export const resolveWebhookSecret = () => env.RAZORPAY_WEBHOOK_SECRET || key_secret || '';

export const buildLeadScore = (input: { verified?: boolean; featured?: boolean; rating?: number; trustScore?: number; subscriptionTier?: string }) => {
  let score = 20;
  if (input.verified) score += 20;
  if (input.featured) score += 20;
  score += Math.min(20, Math.round((input.rating || 0) * 4));
  score += Math.min(20, Math.round((input.trustScore || 0) / 5));
  if (input.subscriptionTier === 'pro') score += 10;
  if (input.subscriptionTier === 'studio') score += 15;
  return Math.min(100, score);
};
