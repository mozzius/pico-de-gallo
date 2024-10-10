import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { SessionStore, StateStore } from "./db";

export const createClient = async () => {
  const url = 'https://pico.mozzius.dev'
  return new NodeOAuthClient({
    clientMetadata: {
      client_name: "Pico de Gallo",
      client_id: url
        ? `${url}/client-metadata.json`
        : `http://localhost?redirect_uri=${encodeURIComponent(`${url}/api/oauth/callback`)}`,
      client_uri: url,
      redirect_uris: [`${url}/api/oauth/callback`],
      scope: "atproto transition:generic",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      application_type: "web",
      token_endpoint_auth_method: "none",
      dpop_bound_access_tokens: true,
    },
    stateStore: new StateStore(),
    sessionStore: new SessionStore(),
  });
};

