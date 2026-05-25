import prisma from '../dist/config/prisma.js';
import crypto from 'crypto';

const orderId = process.argv[2];
const paymentId = process.argv[3] || `pay_sim_${Date.now()}`;
if (!orderId) {
  console.error('Usage: node createWebhookEvent.mjs <orderId> [paymentId]');
  process.exit(2);
}

async function run() {
  const payload = { payment: { entity: { id: paymentId, order_id: orderId } } };
  const raw = JSON.stringify({ event: 'payment.captured', payload });
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const rec = await prisma.webhookEvent.create({ data: { provider: 'razorpay', event: 'payment.captured', payload, payloadHash: hash, signature: 'simulated' } });
  console.log('Created webhookEvent', rec.id);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
