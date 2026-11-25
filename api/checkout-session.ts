import { handleGetCheckoutSession } from './_lib/handlers.js';
import { toJsonResponse } from './_lib/request.js';

export async function GET(request: Request): Promise<Response> {
  const sessionId = (new URL(request.url).searchParams.get('session_id') || '').trim();
  return toJsonResponse(await handleGetCheckoutSession(sessionId, process.env));
}
