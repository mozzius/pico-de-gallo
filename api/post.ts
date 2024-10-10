import { getIronSession } from "iron-session";
import { Session } from "./_utils/types";

export async function GET(request: Request) {
  const session = await getIronSession<Session>(request, new Response(), {
    cookieName: "sid",
    password: process.env.COOKIE_SECRET!,
  });
  return Response.json({ did: session.did });
}
