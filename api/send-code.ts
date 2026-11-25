import { handleSendCode } from './_lib/handlers.js';
import { handleJsonPost } from './_lib/request.js';

export async function POST(request: Request): Promise<Response> {
  return handleJsonPost(request, (parsed) => handleSendCode(parsed, process.env));
}
