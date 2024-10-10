import { isValidHandle } from "@atproto/syntax";
import { createClient } from "../_utils/client";
import { getIronSession } from "iron-session";
import { Session } from "../_utils/types";

export async function GET(request: Request) {
  const response = new Response("👍", { status: 204 });
  const session = await getIronSession<Session>(request, response, {
    cookieName: "sid",
    password: process.env.COOKIE_SECRET!,
  });
  session.destroy();
  return response
}
