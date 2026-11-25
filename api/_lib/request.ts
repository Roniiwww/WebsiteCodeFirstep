import type { HandlerResult } from './handlers.js';

export async function readWebJson(request: Request): Promise<Record<string, any> | null> {
  const raw = await request.text();
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function toJsonResponse(result: HandlerResult): Response {
  return Response.json(result.body, { status: result.status });
}

export async function handleJsonPost(
  request: Request,
  handler: (parsed: Record<string, any>) => Promise<HandlerResult>
): Promise<Response> {
  const parsed = await readWebJson(request);
  if (parsed === null) {
    return Response.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
  }
  return toJsonResponse(await handler(parsed));
}

export function resolveWebRequestOrigin(request: Request): string {
  const originHeader = (request.headers.get('origin') || '').trim();
  if (originHeader) return originHeader.replace(/\/+$/, '');
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').trim();
  const url = new URL(request.url);
  const proto = (request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https')
    .split(',')[0]
    .trim();
  return host ? `${proto}://${host}` : url.origin;
}
