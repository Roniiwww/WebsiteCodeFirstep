import { handleCreateCheckoutSession } from './_lib/handlers.js';
import { handleJsonPost, resolveWebRequestOrigin } from './_lib/request.js';

export async function POST(request: Request): Promise<Response> {
  const origin = resolveWebRequestOrigin(request);
  return handleJsonPost(request, (parsed) =>
    handleCreateCheckoutSession(parsed, origin, process.env)
  );
}
