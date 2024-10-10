import type { VercelRequest, VercelResponse } from '@vercel/node';
 
export default function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }
}