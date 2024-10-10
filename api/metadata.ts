import { createClient } from "../_utils/client";

export async function GET(request: Request) {
  const client = await createClient();
  return new Response(JSON.stringify(client.clientMetadata), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
