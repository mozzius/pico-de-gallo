import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '../_utils/client';
 
export default async function (request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    response.status(405).send('Method Not Allowed');
    return;
  }
  const client = await createClient()
  return response.json(client.clientMetadata)
}