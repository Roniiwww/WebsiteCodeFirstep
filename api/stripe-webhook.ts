import { handleStripeWebhook } from './_lib/handlers.js';
import { toJsonResponse } from './_lib/request.js';

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature') || '';
  return toJsonResponse(await handleStripeWebhook(rawBody, sig, process.env));
}
