import { createClient } from "./_utils/client";

export async function GET(request: Request) {
  const client = await createClient();
  return Response.json(client.clientMetadata);
}
