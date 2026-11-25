import { handleContact } from './_lib/handlers.js';
import { handleJsonPost } from './_lib/request.js';

export async function POST(request: Request): Promise<Response> {
  return handleJsonPost(request, (parsed) => handleContact(parsed, process.env));
}
