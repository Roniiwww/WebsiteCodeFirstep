import { defineConfig, loadEnv } from 'vite';
import type { Connect } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  handleSendCode,
  handleContact,
  handleDonation,
  handleCreateCheckoutSession,
  handleGetCheckoutSession,
  handleStripeWebhook,
  type HandlerResult
} from './api/_lib/handlers.js';

function sendJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    req.on('data', (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buf.length;
      if (totalBytes > 1_000_000) {
        reject(new Error('Request payload too large'));
        return;
      }
      chunks.push(buf);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, any>> {
  const raw = (await readRawBody(req)).toString('utf8');
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Invalid JSON payload');
  }
}

function resolveRequestOrigin(req: IncomingMessage): string {
  const originHeader = String(req.headers.origin || '').trim();
  if (originHeader) return originHeader.replace(/\/+$/, '');
  const host = String(req.headers.host || '127.0.0.1:4173').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
  return `${proto}://${host}`;
}

function registerJsonPostRoute(
  middlewares: Connect.Server,
  path: string,
  handler: (parsed: Record<string, any>, req: IncomingMessage) => Promise<HandlerResult>
) {
  middlewares.use(path, async (req, res) => {
    if (req.method !== 'POST') {
      sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
      return;
    }

    try {
      const parsed = await readJsonBody(req);
      const result = await handler(parsed, req);
      sendJson(res, result.status, result.body);
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: err?.message || 'Invalid JSON payload' });
    }
  });
}

function attachEmailApiMiddlewares(middlewares: Connect.Server, env: Record<string, string>) {
  registerJsonPostRoute(middlewares, '/api/send-code', (parsed) => handleSendCode(parsed, env));
  registerJsonPostRoute(middlewares, '/api/contact', (parsed) => handleContact(parsed, env));
  registerJsonPostRoute(middlewares, '/api/donation', (parsed) => handleDonation(parsed, env));
  registerJsonPostRoute(middlewares, '/api/create-checkout-session', (parsed, req) =>
    handleCreateCheckoutSession(parsed, resolveRequestOrigin(req), env)
  );

  middlewares.use('/api/checkout-session', async (req, res) => {
    if (req.method !== 'GET') {
      sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
      return;
    }

    const urlObj = new URL(req.url || '/', 'http://localhost');
    const sessionId = (urlObj.searchParams.get('session_id') || '').trim();
    const result = await handleGetCheckoutSession(sessionId, env);
    sendJson(res, result.status, result.body);
  });

  middlewares.use('/api/stripe-webhook', async (req, res) => {
    if (req.method !== 'POST') {
      sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
      return;
    }

    try {
      const rawBody = await readRawBody(req);
      const sig = String(req.headers['stripe-signature'] || '');
      const result = await handleStripeWebhook(rawBody, sig, env);
      sendJson(res, result.status, result.body);
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: err?.message || 'Invalid webhook payload' });
    }
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'email-sender-api',
        configureServer(server) {
          attachEmailApiMiddlewares(server.middlewares, env);
        },
        configurePreviewServer(server) {
          attachEmailApiMiddlewares(server.middlewares, env);
        }
      }
    ]
  };
});
