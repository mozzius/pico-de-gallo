import { isValidHandle } from "@atproto/syntax";
import { createClient } from "../_utils/client";

export async function POST(request: Request) {
  const body = await request.json();
  const handle = body?.handle;
  if (typeof handle !== "string" || !isValidHandle(handle)) {
    return new Response("invalid handle", { status: 400 });
  }

  try {
    const oauthClient = await createClient();
    const url = await oauthClient.authorize(handle, {
      scope: "atproto transition:generic",
    });
    return Response.redirect(url.toString());
  } catch (err) {
    console.error("oauth login failed", err);
    return new Response("oauth login failed", { status: 500 });
  }
}
