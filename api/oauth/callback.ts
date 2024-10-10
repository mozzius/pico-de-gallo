import { getIronSession } from "iron-session";
import { createClient } from "../_utils/client";
import { Session } from "../_utils/types";

export async function GET(request: Request) {
  const params = new URLSearchParams(request.url.split("?")[1]);
  const response = new Response('👍', { status: 200 });
  try {
    const oauthClient = await createClient();
    const { session } = await oauthClient.callback(params);
    const clientSession = await getIronSession<Session>(request,response, {
      cookieName: "sid",
      password: process.env.COOKIE_SECRET!,
    });
    if (clientSession.did) throw new Error("session already exists");
    clientSession.did = session.did;
    await clientSession.save();
  } catch (err) {
    console.error("oauth callback failed", err);
    return new Response("oauth callback failed", { status: 500 });
  }
  return response
}
